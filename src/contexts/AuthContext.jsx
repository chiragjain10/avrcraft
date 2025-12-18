import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthChange, 
  loginUser as firebaseLogin, 
  registerUser as firebaseRegister,
  logoutUser as firebaseLogout,
  resetPassword as firebaseResetPassword,
  getCurrentUser
} from '../utils/firebase/auth'
import { getUserDocument } from '../utils/firebase/firestore'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setLoading(true)
      setError(null)

        if (firebaseUser) {
        const userResult = await getUserDocument(firebaseUser.uid)        
        if (userResult.success) {
          setUser(firebaseUser)
          setUserData(userResult.user)
        } else {
          setError(userResult.error)
          setUser(null)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    
    const result = await firebaseLogin(email, password)
    
    if (result.success) {
      setUser(result.user)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const register = async (userData) => {
    setLoading(true)
    setError(null)
    
    const result = await firebaseRegister(userData)
    
    if (result.success) {
      setUser(result.user)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    
    const result = await firebaseLogout()
    
    if (result.success) {
      setUser(null)
      setUserData(null)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const resetPassword = async (email) => {
    setLoading(true)
    setError(null)
    
    const result = await firebaseResetPassword(email)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
    return result
  }

  const clearError = () => {
    setError(null)
  }

  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, error: 'No user logged in' }
    
    setLoading(true)
    setError(null)
    
    setUserData(prev => ({ ...prev, ...updates }))
    
    setLoading(false)
    return { success: true }
  }

  const value = {
    user,
    userData,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    loading,
    error,
    clearError,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}