import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  onSnapshot,
  doc,
  setDoc
} from 'firebase/firestore'
import { db } from '../../utils/firebase/config'

const AdminContext = createContext()

// Initial state
const initialState = {
  user: null,
  isAdmin: false,
  loading: true,
  stats: {
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalBlogs: 0,
    recentOrders: []
  },
  notifications: [],
  sidebarOpen: true
}

// Reducer function
const adminReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    
    case 'SET_ADMIN_USER':
      return {
        ...state,
        user: action.payload.user,
        isAdmin: action.payload.isAdmin,
        loading: false
      }
    
    case 'SET_STATS':
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload
        }
      }
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 4)]
      }
    
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      }
    
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      }
    
    case 'SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.payload
      }
    
    default:
      return state
  }
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState)
  const { user } = useAuth()

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        dispatch({ type: 'SET_ADMIN_USER', payload: { user: null, isAdmin: false } })
        return
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        // Check if user has admin role in Firestore
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('uid', '==', user.uid))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data()
          
          // Check for admin role
          const isAdmin = userData.role === 'admin' || 
                         userData.isAdmin === true || 
                         user.email === "admin@avrcraft.com" // Default admin email
          
          console.log('User data:', userData)
          console.log('Is admin:', isAdmin)
          
          dispatch({ 
            type: 'SET_ADMIN_USER', 
            payload: { user: { ...user, ...userData }, isAdmin } 
          })

          // If user document exists but no role, set default role
          if (!userData.role) {
            await setDoc(doc(db, 'users', user.uid), {
              ...userData,
              role: 'customer'
            }, { merge: true })
          }
        } else {
          // Create user document if doesn't exist
          console.log('No user document found, creating one...')
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            role: user.email === "admin@avrcraft.com" ? 'admin' : 'customer',
            createdAt: new Date()
          }
          
          await setDoc(doc(db, 'users', user.uid), userData)
          
          const isAdmin = user.email === "admin@avrcraft.com"
          dispatch({ 
            type: 'SET_ADMIN_USER', 
            payload: { user: { ...user, ...userData }, isAdmin } 
          })
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        // For development, allow access
        const isAdmin = user.email === "admin@avrcraft.com"
        dispatch({ type: 'SET_ADMIN_USER', payload: { user: user, isAdmin } })
      }
    }

    checkAdminStatus()
  }, [user])

  // Fetch real-time stats
  useEffect(() => {
    if (!state.isAdmin) return

    const fetchStats = async () => {
      try {
        // Products count
        const productsQuery = query(collection(db, 'products'))
        const productsSnapshot = await getDocs(productsQuery)
        
        // Categories count
        const categoriesQuery = query(collection(db, 'categories'))
        const categoriesSnapshot = await getDocs(categoriesQuery)
        
        // Blogs count
        const blogsQuery = query(collection(db, 'blogs'))
        const blogsSnapshot = await getDocs(blogsQuery)
        
        // Recent orders
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        const ordersSnapshot = await getDocs(ordersQuery)
        const recentOrders = ordersSnapshot.docs.slice(0, 5).map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        dispatch({
          type: 'SET_STATS',
          payload: {
            totalProducts: productsSnapshot.size,
            totalCategories: categoriesSnapshot.size,
            totalBlogs: blogsSnapshot.size,
            totalOrders: ordersSnapshot.size,
            recentOrders
          }
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()

    // Real-time listener for orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const recentOrders = snapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      dispatch({
        type: 'SET_STATS',
        payload: { recentOrders, totalOrders: snapshot.size }
      })
    })

    return () => unsubscribe()
  }, [state.isAdmin])

  // Add notification
  const addNotification = (notification) => {
    const id = Date.now().toString()
    const notificationWithId = {
      id,
      timestamp: new Date(),
      ...notification
    }
    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationWithId })
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'CLEAR_NOTIFICATION', payload: id })
    }, 5000)
  }

  // Clear notification
  const clearNotification = (id) => {
    dispatch({ type: 'CLEAR_NOTIFICATION', payload: id })
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  // Set sidebar
  const setSidebar = (isOpen) => {
    dispatch({ type: 'SET_SIDEBAR', payload: isOpen })
  }

  const value = {
    ...state,
    addNotification,
    clearNotification,
    toggleSidebar,
    setSidebar
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}