import { api, queryBuilder, paginate } from './api'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Collection reference
const productsCollection = collection(db, 'products')

// Product service
export const productService = {
  // Get all products with optional filters and pagination
  getProducts: async (filters = {}, lastVisible = null, itemsPerPage = 10) => {
    try {
      // Basic active filter
      let q = query(
        productsCollection,
        where('isActive', '==', true)
      )

      // 🔹 Price range filter (Firestore side)
      if (filters.minPrice || filters.maxPrice) {
        if (filters.minPrice) {
          q = query(q, where('price', '>=', Number(filters.minPrice)))
        }
        if (filters.maxPrice) {
          q = query(q, where('price', '<=', Number(filters.maxPrice)))
        }

        // Range filter hai to price pe orderBy required
        q = query(q, orderBy('price', 'asc'))
      } else {
        // Default sorting
        q = query(q, orderBy('createdAt', 'desc'))
      }

      // 🔹 Category filter
      if (filters.category) {
        q = query(q, where('categoryId', '==', filters.category))
      }

      // 🔹 Artisan filter
      if (filters.artisanId) {
        q = query(q, where('artisanId', '==', filters.artisanId))
      }

      // 🔹 Featured filter
      if (filters.isFeatured) {
        q = query(q, where('isFeatured', '==', true))
      }

      // 🔹 Eco-friendly filter
      if (filters.isEcoFriendly) {
        q = query(q, where('isEcoFriendly', '==', true))
      }

      // 🔹 Pagination
      if (lastVisible) {
        q = query(q, startAfter(lastVisible))
      }

      q = query(q, limit(itemsPerPage))

      const querySnapshot = await getDocs(q)

      // Last visible doc for pagination
      const lastVisibleDoc =
        querySnapshot.docs[querySnapshot.docs.length - 1] || null

      // Map docs
      let products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // 🔹 Rating filter (client-side to avoid multiple range filters in Firestore)
      if (filters.rating) {
        const minRating = Number(filters.rating)
        products = products.filter(p => (p.rating || 0) >= minRating)
      }

      return {
        products,
        lastVisible: lastVisibleDoc,
        hasMore: products.length === itemsPerPage
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  // Get single product by ID
  getProduct: async (id) => {
    try {
      const docRef = doc(db, 'products', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      }
      return null
    } catch (error) {
      console.error('Error getting product:', error)
      throw error
    }
  },

  // Get trending products
  getTrendingProducts: async (limitCount = 8) => {
    try {
      const q = query(
        productsCollection,
        where('isTrending', '==', true),
        orderBy('trendingScore', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)

      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return products
    } catch (error) {
      console.error('Error getting trending products:', error)
      throw error
    }
  },

  // Get featured products (existing api/queryBuilder flow)
  getFeaturedProducts: async (limitVal = 6) => {
    const constraints = [
      ...queryBuilder.where('isFeatured', '==', true),
      ...queryBuilder.orderBy('featuredOrder', 'asc'),
      ...queryBuilder.limit(limitVal)
    ]

    return await api.getAll('products', constraints)
  },

  // Get products by artisan
  getProductsByArtisan: async (artisanId) => {
    const constraints = [
      ...queryBuilder.where('artisanId', '==', artisanId),
      ...queryBuilder.orderBy('createdAt', 'desc')
    ]

    return await api.getAll('products', constraints)
  },

  // Get related products
  getRelatedProducts: async (productId, category, limitVal = 4) => {
    const constraints = [
      ...queryBuilder.where('category', '==', category),
      ...queryBuilder.where('id', '!=', productId),
      ...queryBuilder.orderBy('rating', 'desc'),
      ...queryBuilder.limit(limitVal)
    ]

    return await api.getAll('products', constraints)
  },

  // Search products
  searchProducts: async (searchTerm, filters = {}) => {
    // Pehle filters ke saath products lao
    const { products } = await productService.getProducts(filters)

    if (!searchTerm) {
      return {
        success: true,
        data: products
      }
    }

    const lower = searchTerm.toLowerCase()

    const searchResults = products.filter(product =>
      (product.name || '').toLowerCase().includes(lower) ||
      (product.description || '').toLowerCase().includes(lower) ||
      (product.material || '').toLowerCase().includes(lower) ||
      (product.tags &&
        product.tags.some(tag =>
          (tag || '').toLowerCase().includes(lower)
        ))
    )

    return {
      success: true,
      data: searchResults
    }
  },

  // Update product stock
  updateStock: async (productId, newStock) => {
    return await api.update('products', productId, {
      stock: newStock,
      updatedAt: new Date()
    })
  },

  // Update product rating
  updateRating: async (productId, newRating, newReviewCount) => {
    return await api.update('products', productId, {
      rating: newRating,
      reviewCount: newReviewCount,
      updatedAt: new Date()
    })
  },

  // Get product categories
  getCategories: async () => {
    return await api.getAll('categories', [
      ...queryBuilder.orderBy('order', 'asc')
    ])
  },

  // Get bestseller products
  async getBestsellerProducts(limitCount = 4) {
    try {
      const q = query(
        productsCollection,
        where('isActive', '==', true),
        where('isBestseller', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching bestseller products:', error)
      return []
    }
  }
}

// Product review service
export const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId) => {
    const constraints = [
      ...queryBuilder.where('productId', '==', productId),
      ...queryBuilder.orderBy('createdAt', 'desc')
    ]

    return await api.getAll('reviews', constraints)
  },

  // Add a review
  addReview: async (reviewData) => {
    const review = {
      ...reviewData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return await api.create('reviews', review)
  },

  // Update a review
  updateReview: async (reviewId, updates) => {
    return await api.update('reviews', reviewId, {
      ...updates,
      updatedAt: new Date()
    })
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    return await api.delete('reviews', reviewId)
  }
}
