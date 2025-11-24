import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../utils/firebase/config'

const WishlistContext = createContext()

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload,
        loading: false
      }
    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    default:
      return state
  }
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    loading: false
  })
  const { user } = useAuth()

  // Load wishlist from Firebase
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        dispatch({ type: 'SET_WISHLIST', payload: [] })
        return
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const q = query(
          collection(db, 'wishlists'),
          where('userId', '==', user.uid)
        )
        const querySnapshot = await getDocs(q)
        const wishlistItems = querySnapshot.docs.map(doc => doc.data().product)
        dispatch({ type: 'SET_WISHLIST', payload: wishlistItems })
      } catch (error) {
        console.error('Error loading wishlist:', error)
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadWishlist()
  }, [user])

  const addToWishlist = async (product) => {
    if (!user) return

    try {
      const wishlistItem = {
        userId: user.uid,
        product: product,
        addedAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'wishlists', `${user.uid}_${product.id}`), wishlistItem)
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product })
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      throw error
    }
  }

  const removeFromWishlist = async (productId) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, 'wishlists', `${user.uid}_${productId}`))
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId })
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      throw error
    }
  }

  const isInWishlist = (productId) => {
    return state.items.some(item => item.id === productId)
  }

  const value = {
    items: state.items,
    loading: state.loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}