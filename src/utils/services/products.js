import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore'
import { db } from '../firebase/config'

export const productService = {
  // Get bestseller products
  getBestsellerProducts: async (count = 4) => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('isBestseller', '==', true),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      )
      
      const querySnapshot = await getDocs(productsQuery)
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure proper data types
        price: doc.data().price || 0,
        originalPrice: doc.data().originalPrice || null,
        stock: doc.data().stock || 0,
        rating: doc.data().rating || 0,
        reviewCount: doc.data().reviewCount || 0,
        isBestseller: doc.data().isBestseller || false,
        isNew: doc.data().isNew || false
      }))
      
      return products
    } catch (error) {
      console.error('Error fetching bestseller products:', error)
      throw error
    }
  },

  // Get new products
  getNewProducts: async (count = 4) => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('isNew', '==', true),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      )
      
      const querySnapshot = await getDocs(productsQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching new products:', error)
      throw error
    }
  },

  // Get products by category
  getProductsByCategory: async (category, count = 8) => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      )
      
      const querySnapshot = await getDocs(productsQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  },

  // Get all active products
  getAllProducts: async () => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(productsQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching all products:', error)
      throw error
    }
  }
}