// src/contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { cartService } from '../utils/services/cart'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null
      }

    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemCount: action.payload.itemCount || 0,
        loading: false,
        error: null
      }

    // kept these action names but they reuse SET_CART shape to avoid duplication
    case 'ADD_TO_CART_SUCCESS':
    case 'UPDATE_CART_SUCCESS':
    case 'REMOVE_FROM_CART_SUCCESS':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemCount: action.payload.itemCount || 0,
        loading: false,
        error: null
      }

    case 'CLEAR_CART_SUCCESS':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
        loading: false,
        error: null
      }

    default:
      return state
  }
}

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { user } = useAuth()

  // Load cart from Firebase when user logs in
  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      // If user logs out, clear the cart
      dispatch({ type: 'CLEAR_CART_SUCCESS' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Load cart from Firebase
  const loadCart = useCallback(async () => {
    if (!user) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cartData = await cartService.getCart(user.uid)
      dispatch({ type: 'SET_CART', payload: cartData })
      return cartData
    } catch (error) {
      console.error('Error loading cart:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load cart'
      })
      return null
    }
  }, [user])

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please login to add items to cart'
      })
      throw new Error('User not authenticated')
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // Check if product is in stock (if stock provided)
      if (product.stock !== undefined && product.stock < quantity) {
        const message = `Only ${product.stock} items left in stock`
        dispatch({ type: 'SET_ERROR', payload: message })
        throw new Error(message)
      }

      const updatedCart = await cartService.addToCart(
        user.uid,
        product,
        quantity
      )

      // Ensure shape is normalized
      dispatch({ type: 'ADD_TO_CART_SUCCESS', payload: updatedCart })
      return updatedCart
    } catch (error) {
      console.error('Error adding to cart:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to add item to cart'
      })
      throw error
    }
  }

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (!user) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please login to update cart'
      })
      throw new Error('User not authenticated')
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        const removed = await removeFromCart(productId)
        return removed
      }

      const updatedCart = await cartService.updateCartItem(
        user.uid,
        productId,
        quantity
      )

      dispatch({ type: 'UPDATE_CART_SUCCESS', payload: updatedCart })
      return updatedCart
    } catch (error) {
      console.error('Error updating cart item:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to update item quantity'
      })
      throw error
    }
  }

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!user) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please login to remove items from cart'
      })
      throw new Error('User not authenticated')
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedCart = await cartService.removeFromCart(user.uid, productId)
      dispatch({ type: 'REMOVE_FROM_CART_SUCCESS', payload: updatedCart })
      return updatedCart
    } catch (error) {
      console.error('Error removing from cart:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to remove item from cart'
      })
      throw error
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    if (!user) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please login to clear cart'
      })
      throw new Error('User not authenticated')
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cleared = await cartService.clearCart(user.uid)
      dispatch({ type: 'CLEAR_CART_SUCCESS' })
      return cleared
    } catch (error) {
      console.error('Error clearing cart:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to clear cart'
      })
      throw error
    }
  }

  // Get cart subtotal (number) — compatible with CartPage usage
  const getCartSummary = () => {
    const subtotal = state.items.reduce(
      (total, item) => total + (Number(item.price || 0) * Number(item.quantity || 0)),
      0
    )
    return subtotal
  }

  // Get a full summary object (optional)
  const getCartSummaryObject = () => {
    const subtotal = getCartSummary()
    const shipping = subtotal > 500 ? 0 : 40
    const total = subtotal + shipping
    return { subtotal, shipping, total, itemCount: state.itemCount }
  }

  // getProductQuantity: if productId is provided returns that product's qty,
  // if not provided returns the whole cart itemCount (used by CartPage)
  const getProductQuantity = (productId) => {
    if (!productId) return state.itemCount
    const item = state.items.find(i => i.productId === productId)
    return item ? item.quantity : 0
  }

  const isInCart = (productId) => {
    return state.items.some(item => item.productId === productId)
  }

  const value = {
    // State
    items: state.items,
    total: state.total,
    itemCount: state.itemCount,
    loading: state.loading,
    error: state.error,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,

    // Helpers (backwards compatible)
    getCartSummary, // returns number (subtotal)
    getCartSummaryObject, // returns full object if needed
    isInCart,
    getProductQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
