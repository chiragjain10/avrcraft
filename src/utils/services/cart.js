// src/utils/services/cart.js
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const cartService = {
  // Get user's cart
  getCart: async (userId) => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        return cartSnap.data();
      } else {
        // Create a new cart if it doesn't exist
        const newCart = {
          userId,
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(cartRef, newCart);
        return newCart;
      }
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  },

  // Add item to cart or update quantity if already exists
  addToCart: async (userId, product, quantity = 1) => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/images/placeholder.jpg',
        quantity: quantity,
        inStock: product.stock || 0,
        addedAt: serverTimestamp()
      };

      if (!cartSnap.exists()) {
        // Create new cart with the item
        const newCart = {
          userId,
          items: [cartItem],
          total: product.price * quantity,
          itemCount: quantity,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(cartRef, newCart);
        return newCart;
      } else {
        // Check if item already exists in cart
        const cartData = cartSnap.data();
        const existingItemIndex = cartData.items.findIndex(
          item => item.productId === product.id
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...cartData.items];
          const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity
          };
          
          const total = updatedItems.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
          );
          
          await updateDoc(cartRef, {
            items: updatedItems,
            total,
            itemCount: cartData.itemCount + quantity,
            updatedAt: serverTimestamp()
          });
          
          return { ...cartData, items: updatedItems, total, itemCount: cartData.itemCount + quantity };
        } else {
          // Add new item to cart
          const updatedItems = [...cartData.items, cartItem];
          const total = cartData.total + (product.price * quantity);
          
          await updateDoc(cartRef, {
            items: arrayUnion(cartItem),
            total,
            itemCount: cartData.itemCount + quantity,
            updatedAt: serverTimestamp()
          });
          
          return { ...cartData, items: updatedItems, total, itemCount: cartData.itemCount + quantity };
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (userId, productId, quantity) => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (!cartSnap.exists()) {
        throw new Error('Cart not found');
      }
      
      const cartData = cartSnap.data();
      const itemIndex = cartData.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      
      const updatedItems = [...cartData.items];
      const item = updatedItems[itemIndex];
      const quantityDiff = quantity - item.quantity;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        updatedItems.splice(itemIndex, 1);
      } else {
        // Update item quantity
        updatedItems[itemIndex] = {
          ...item,
          quantity: quantity,
          updatedAt: serverTimestamp()
        };
      }
      
      const total = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );
      
      await updateDoc(cartRef, {
        items: updatedItems,
        total,
        itemCount: cartData.itemCount + quantityDiff,
        updatedAt: serverTimestamp()
      });
      
      return { ...cartData, items: updatedItems, total, itemCount: cartData.itemCount + quantityDiff };
      
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (userId, productId) => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (!cartSnap.exists()) {
        return { items: [], total: 0, itemCount: 0 };
      }
      
      const cartData = cartSnap.data();
      const itemToRemove = cartData.items.find(item => item.productId === productId);
      
      if (!itemToRemove) {
        return cartData; // Item not found, return current cart
      }
      
      const updatedItems = cartData.items.filter(item => item.productId !== productId);
      const total = cartData.total - (itemToRemove.price * itemToRemove.quantity);
      
      await updateDoc(cartRef, {
        items: updatedItems,
        total,
        itemCount: cartData.itemCount - itemToRemove.quantity,
        updatedAt: serverTimestamp()
      });
      
      return { ...cartData, items: updatedItems, total, itemCount: cartData.itemCount - itemToRemove.quantity };
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async (userId) => {
    try {
      const cartRef = doc(db, 'carts', userId);
      await updateDoc(cartRef, {
        items: [],
        total: 0,
        itemCount: 0,
        updatedAt: serverTimestamp()
      });
      
      return { items: [], total: 0, itemCount: 0, userId };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
  
  // Get cart item count (for cart icon badge)
  getCartItemCount: async (userId) => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        return cartSnap.data().itemCount || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }
};