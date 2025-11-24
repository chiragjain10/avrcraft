import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore'
import { db } from './config'

// Users Collection
export const createUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, userData)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserDocument = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return { success: true, user: userSnap.data() }
    } else {
      return { success: false, error: 'User not found' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateUserDocument = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, updates)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Products Collection
export const getProducts = async (filters = {}) => {
  try {
    let productsQuery = collection(db, 'products')
    
    // Apply filters
    if (filters.category) {
      productsQuery = query(productsQuery, where('category', '==', filters.category))
    }
    
    if (filters.artisanId) {
      productsQuery = query(productsQuery, where('artisanId', '==', filters.artisanId))
    }
    
    if (filters.limit) {
      productsQuery = query(productsQuery, limit(filters.limit))
    }
    
    // Always order by creation date
    productsQuery = query(productsQuery, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(productsQuery)
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, products }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getProduct = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId)
    const productSnap = await getDoc(productRef)
    
    if (productSnap.exists()) {
      return { success: true, product: { id: productSnap.id, ...productSnap.data() } }
    } else {
      return { success: false, error: 'Product not found' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getTrendingProducts = async () => {
  try {
    const productsQuery = query(
      collection(db, 'products'),
      where('isTrending', '==', true),
      limit(8)
    )
    
    const querySnapshot = await getDocs(productsQuery)
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, products }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Categories Collection
export const getCategories = async () => {
  try {
    const categoriesQuery = query(collection(db, 'categories'), orderBy('order'))
    const querySnapshot = await getDocs(categoriesQuery)
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, categories }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Artisans Collection
export const getArtisans = async () => {
  try {
    const artisansQuery = query(collection(db, 'artisans'), orderBy('name'))
    const querySnapshot = await getDocs(artisansQuery)
    const artisans = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, artisans }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getArtisan = async (artisanId) => {
  try {
    const artisanRef = doc(db, 'artisans', artisanId)
    const artisanSnap = await getDoc(artisanRef)
    
    if (artisanSnap.exists()) {
      return { success: true, artisan: { id: artisanSnap.id, ...artisanSnap.data() } }
    } else {
      return { success: false, error: 'Artisan not found' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Orders Collection
export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, 'orders')
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: new Date(),
      status: 'pending'
    })
    
    return { success: true, orderId: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserOrders = async (userId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(ordersQuery)
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, orders }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Wishlist Collection
export const addToWishlist = async (userId, productId) => {
  try {
    const wishlistRef = doc(db, 'wishlists', `${userId}_${productId}`)
    await setDoc(wishlistRef, {
      userId,
      productId,
      addedAt: new Date()
    })
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const removeFromWishlist = async (userId, productId) => {
  try {
    const wishlistRef = doc(db, 'wishlists', `${userId}_${productId}`)
    await deleteDoc(wishlistRef)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserWishlist = async (userId) => {
  try {
    const wishlistQuery = query(
      collection(db, 'wishlists'),
      where('userId', '==', userId)
    )
    
    const querySnapshot = await getDocs(wishlistQuery)
    const wishlistItems = querySnapshot.docs.map(doc => doc.data().productId)
    
    return { success: true, wishlist: wishlistItems }
  } catch (error) {
    return { success: false, error: error.message }
  }
}