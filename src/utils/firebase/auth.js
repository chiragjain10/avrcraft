import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from './config'
import { createUserDocument } from './firestore'

// Register new user
export const registerUser = async (userData) => {
  try {
    const { email, password, firstName, lastName, phone } = userData
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update user profile
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    })

    // Create user document in Firestore
    await createUserDocument(user.uid, {
      email,
      firstName,
      lastName,
      phone,
      displayName: `${firstName} ${lastName}`,
      createdAt: new Date(),
      role: 'customer'
    })

    return { success: true, user }
  } catch (error) {
    let errorMessage = 'Registration failed. Please try again.'
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered.'
        break
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.'
        break
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters.'
        break
      default:
        errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    let errorMessage = 'Login failed. Please try again.'
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email.'
        break
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password.'
        break
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.'
        break
      default:
        errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error) {
    let errorMessage = 'Password reset failed. Please try again.'
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email.'
        break
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.'
        break
      default:
        errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}

// Auth state observer
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser
}