import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Helper function for consistent product formatting
const formatProductData = (doc) => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description || '',
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
    stock: Number(data.stock) || 0,
    rating: Number(data.rating) || 0,
    reviewCount: Number(data.reviewCount) || 0,
    isBestseller: Boolean(data.isBestseller),
    isNew: Boolean(data.isNew),
    isActive: Boolean(data.isActive),
    category: data.category || '',
    author: data.author || '',
    images: Array.isArray(data.images) ? data.images : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    format: data.format || 'paperback',
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    ...data // Keep all other fields
  }
}

export const productService = {
  // Get bestseller products - Fixed query
  getBestsellerProducts: async (count = 4) => {
    try {
      // IMPORTANT: You need to create a Firestore composite index for this query
      // Go to Firebase Console > Firestore > Indexes > Create Composite Index
      // Collection: products
      // Fields: isBestseller (Ascending), isActive (Ascending), createdAt (Descending)
      
      const productsQuery = query(
        collection(db, 'products'),
        where('isBestseller', '==', true),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      )
      
      const querySnapshot = await getDocs(productsQuery)
      const products = querySnapshot.docs.map(formatProductData)
      
      console.log(`Fetched ${products.length} bestseller products`)
      return products
    } catch (error) {
      console.error('Error fetching bestseller products:', error)
      
      // Fallback: Try simpler query without orderBy
      try {
        const fallbackQuery = query(
          collection(db, 'products'),
          where('isBestseller', '==', true),
          where('isActive', '==', true),
          limit(count)
        )
        
        const fallbackSnapshot = await getDocs(fallbackQuery)
        const fallbackProducts = fallbackSnapshot.docs.map(formatProductData)
        
        // Sort manually client-side
        fallbackProducts.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        
        console.log(`Using fallback for bestsellers: ${fallbackProducts.length} products`)
        return fallbackProducts
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        return [] // Return empty array instead of throwing
      }
    }
  },

  // Get new products
  getNewProducts: async (count = 4) => {
    try {
      // IMPORTANT: Create composite index for isNew, isActive, createdAt
      const productsQuery = query(
        collection(db, 'products'),
        where('isNew', '==', true),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      )
      
      const querySnapshot = await getDocs(productsQuery)
      const products = querySnapshot.docs.map(formatProductData)
      
      console.log(`Fetched ${products.length} new products`)
      return products
    } catch (error) {
      console.error('Error fetching new products:', error)
      
      // Fallback
      try {
        const fallbackQuery = query(
          collection(db, 'products'),
          where('isNew', '==', true),
          where('isActive', '==', true),
          limit(count)
        )
        
        const fallbackSnapshot = await getDocs(fallbackQuery)
        const fallbackProducts = fallbackSnapshot.docs.map(formatProductData)
        
        // Sort manually
        fallbackProducts.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        
        console.log(`Using fallback for new products: ${fallbackProducts.length} products`)
        return fallbackProducts
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        return []
      }
    }
  },

  // Get products by category
  getProductsByCategory: async (category, count = 8) => {
    try {
      if (!category) {
        console.error('No category provided')
        return []
      }
      
      // IMPORTANT: Create composite index for category, isActive, createdAt
      const productsQuery = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      )
      
      const querySnapshot = await getDocs(productsQuery)
      const products = querySnapshot.docs.map(formatProductData)
      
      console.log(`Fetched ${products.length} products for category: ${category}`)
      return products
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error)
      
      // Fallback without orderBy
      try {
        const fallbackQuery = query(
          collection(db, 'products'),
          where('category', '==', category),
          where('isActive', '==', true),
          limit(count)
        )
        
        const fallbackSnapshot = await getDocs(fallbackQuery)
        const fallbackProducts = fallbackSnapshot.docs.map(formatProductData)
        
        // Sort manually
        fallbackProducts.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        
        console.log(`Using fallback for category ${category}: ${fallbackProducts.length} products`)
        return fallbackProducts
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        return []
      }
    }
  },

  // Get all active products
  getAllProducts: async (limitCount = 50) => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(productsQuery)
      const products = querySnapshot.docs.map(formatProductData)
      
      console.log(`Fetched ${products.length} active products`)
      return products
    } catch (error) {
      console.error('Error fetching all products:', error)
      
      // Fallback without orderBy
      try {
        const fallbackQuery = query(
          collection(db, 'products'),
          where('isActive', '==', true),
          limit(limitCount)
        )
        
        const fallbackSnapshot = await getDocs(fallbackQuery)
        const fallbackProducts = fallbackSnapshot.docs.map(formatProductData)
        
        console.log(`Using fallback for all products: ${fallbackProducts.length} products`)
        return fallbackProducts
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        return []
      }
    }
  },

  // Search products by name or author
  searchProducts: async (searchTerm, limitCount = 20) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return this.getAllProducts(limitCount)
      }
      
      // Get all products and filter client-side (Firestore doesn't support full-text search)
      const allProducts = await this.getAllProducts(100) // Get more for searching
      
      const searchLower = searchTerm.toLowerCase().trim()
      const filteredProducts = allProducts.filter(product => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.author.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      })
      
      console.log(`Found ${filteredProducts.length} products for search: "${searchTerm}"`)
      return filteredProducts.slice(0, limitCount)
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }
}