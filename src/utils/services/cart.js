// src/utils/services/cart.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'

export const cartService = {
  // Get user's cart from Firebase
  getCart: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const cartRef = doc(db, 'carts', userId)
      const cartSnap = await getDoc(cartRef)

      if (cartSnap.exists()) {
        const cartData = cartSnap.data()
        return {
          items: cartData.items || [],
          total: cartData.total || 0,
          itemCount: cartData.itemCount || 0,
          userId: cartData.userId || userId,
          createdAt: cartData.createdAt,
          updatedAt: cartData.updatedAt
        }
      } else {
        // Create a new cart if it doesn't exist
        const newCart = {
          userId,
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        await setDoc(cartRef, newCart)
        // Return plain values (timestamps will be serverValue on Firestore)
        return {
          ...newCart,
          createdAt: new Date().toISOString(), // client-friendly fallback
          updatedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error getting cart:', error)
      throw new Error('Failed to load cart')
    }
  },

  // Add item to cart
  addToCart: async (userId, product, quantity = 1) => {
    try {
      if (!userId || !product || !product.id) {
        throw new Error('Invalid parameters')
      }

      const cartRef = doc(db, 'carts', userId)
      const cartSnap = await getDoc(cartRef)

      const cartItem = {
        productId: product.id,
        name: product.name,
        price: Number(product.price || 0),
        originalPrice: Number(product.originalPrice || product.price || 0),
        image: product.images?.[0] || product.imageUrl || '/images/placeholder.jpg',
        quantity: Number(quantity),
        stock: product.stock || 0,
        category: product.category,
        author: product.author,
        addedAt: new Date().toISOString()
      }

      if (!cartSnap.exists()) {
        // Create new cart with the item
        const newCart = {
          userId,
          items: [cartItem],
          total: cartItem.price * cartItem.quantity,
          itemCount: cartItem.quantity,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        await setDoc(cartRef, newCart)
        return {
          items: newCart.items,
          total: newCart.total,
          itemCount: newCart.itemCount,
          userId
        }
      } else {
        const cartData = cartSnap.data()
        const safeItems = Array.isArray(cartData.items) ? cartData.items : []
        const existingItemIndex = safeItems.findIndex(
          item => item.productId === product.id
        )

        let updatedItems

        if (existingItemIndex >= 0) {
          updatedItems = safeItems.map((item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  quantity: (Number(item.quantity) || 0) + Number(quantity),
                  addedAt: new Date().toISOString()
                }
              : item
          )
        } else {
          updatedItems = [...safeItems, cartItem]
        }

        // Calculate new totals
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
          0
        )
        const newItemCount = updatedItems.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )

        // Update cart in Firebase
        await updateDoc(cartRef, {
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount,
          updatedAt: serverTimestamp()
        })

        return {
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount,
          userId
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw new Error(error.message || 'Failed to add item to cart')
    }
  },

  // Update cart item quantity
  updateCartItem: async (userId, productId, quantity) => {
    try {
      if (!userId || !productId) {
        throw new Error('User ID and Product ID are required')
      }

      if (quantity < 0) {
        throw new Error('Quantity cannot be negative')
      }

      const cartRef = doc(db, 'carts', userId)
      const cartSnap = await getDoc(cartRef)

      if (!cartSnap.exists()) {
        throw new Error('Cart not found')
      }

      const cartData = cartSnap.data()
      const safeItems = Array.isArray(cartData.items) ? cartData.items : []
      const itemIndex = safeItems.findIndex(item => item.productId === productId)

      if (itemIndex === -1) {
        throw new Error('Item not found in cart')
      }

      let updatedItems

      if (quantity === 0) {
        // Remove item if quantity is 0
        updatedItems = safeItems.filter(item => item.productId !== productId)
      } else {
        // Update item quantity
        updatedItems = safeItems.map((item, index) =>
          index === itemIndex
            ? { ...item, quantity: Number(quantity) }
            : item
        )
      }

      // Calculate new totals
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
        0
      )
      const newItemCount = updatedItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      )

      await updateDoc(cartRef, {
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
        updatedAt: serverTimestamp()
      })

      return {
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
        userId
      }

    } catch (error) {
      console.error('Error updating cart item:', error)
      throw new Error(error.message || 'Failed to update cart item')
    }
  },

  // Remove item from cart
  removeFromCart: async (userId, productId) => {
    try {
      if (!userId || !productId) {
        throw new Error('User ID and Product ID are required')
      }

      const cartRef = doc(db, 'carts', userId)
      const cartSnap = await getDoc(cartRef)

      if (!cartSnap.exists()) {
        return { items: [], total: 0, itemCount: 0, userId }
      }

      const cartData = cartSnap.data()
      const safeItems = Array.isArray(cartData.items) ? cartData.items : []
      const itemToRemove = safeItems.find(item => item.productId === productId)

      if (!itemToRemove) {
        return {
          items: safeItems,
          total: cartData.total || 0,
          itemCount: cartData.itemCount || 0,
          userId
        }
      }

      const updatedItems = safeItems.filter(item => item.productId !== productId)
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
        0
      )
      const newItemCount = updatedItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      )

      await updateDoc(cartRef, {
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
        updatedAt: serverTimestamp()
      })

      return {
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
        userId
      }

    } catch (error) {
      console.error('Error removing from cart:', error)
      throw new Error(error.message || 'Failed to remove item from cart')
    }
  },

  // Clear cart (safe: will create or update)
  clearCart: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const cartRef = doc(db, 'carts', userId)

      // Use setDoc with merge so it won't fail if doc doesn't exist
      await setDoc(cartRef, {
        items: [],
        total: 0,
        itemCount: 0,
        updatedAt: serverTimestamp()
      }, { merge: true })

      return { items: [], total: 0, itemCount: 0, userId }
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw new Error('Failed to clear cart')
    }
  },

  // Get cart item count (for cart icon badge)
  getCartItemCount: async (userId) => {
    try {
      if (!userId) return 0

      const cartRef = doc(db, 'carts', userId)
      const cartSnap = await getDoc(cartRef)

      if (cartSnap.exists()) {
        const data = cartSnap.data()
        return data.itemCount || 0
      }
      return 0
    } catch (error) {
      console.error('Error getting cart item count:', error)
      return 0
    }
  },

  // Sync local cart with Firebase after login
  syncCart: async (userId, localCartItems) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      if (!localCartItems || localCartItems.length === 0) {
        return await cartService.getCart(userId)
      }

      const cartRef = doc(db, 'carts', userId)
      const cartSnap = await getDoc(cartRef)

      if (!cartSnap.exists()) {
        // Create new cart with local items
        const total = localCartItems.reduce(
          (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
          0
        )
        const itemCount = localCartItems.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )

        const newCart = {
          userId,
          items: localCartItems,
          total,
          itemCount,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        await setDoc(cartRef, newCart)
        return { items: localCartItems, total, itemCount, userId }
      } else {
        // Merge local cart with existing Firebase cart
        const cartData = cartSnap.data()
        const mergedItems = Array.isArray(cartData.items) ? [...cartData.items] : []

        localCartItems.forEach(localItem => {
          const existingIndex = mergedItems.findIndex(
            item => item.productId === localItem.productId
          )

          if (existingIndex >= 0) {
            // Update quantity if item exists
            mergedItems[existingIndex].quantity = (Number(mergedItems[existingIndex].quantity) || 0) + Number(localItem.quantity || 0)
          } else {
            mergedItems.push(localItem)
          }
        })

        const total = mergedItems.reduce(
          (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
          0
        )
        const itemCount = mergedItems.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )

        await updateDoc(cartRef, {
          items: mergedItems,
          total,
          itemCount,
          updatedAt: serverTimestamp()
        })

        return { items: mergedItems, total, itemCount, userId }
      }
    } catch (error) {
      console.error('Error syncing cart:', error)
      throw new Error('Failed to sync cart')
    }
  }
}
