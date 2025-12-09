// src/hooks/useProducts.js (Updated)
import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit 
} from 'firebase/firestore'
import { db } from '../utils/firebase/config'

export const useProducts = (filters = {}, searchQuery = '') => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true)
      )

      console.log('Filters in useProducts:', filters)
      console.log('Search query:', searchQuery)

      // 🔹 Category filter (MULTIPLE WAYS TO HANDLE)
      if (filters.category && filters.category.trim() !== '') {
        console.log('Filtering by category:', filters.category)
        // Try different field names
        productsQuery = query(
          productsQuery,
          where('category', '==', filters.category)
        )
      }

      // 🔹 Price range filter (apply as separate query)
      if (filters.priceRange && Array.isArray(filters.priceRange)) {
        productsQuery = query(
          productsQuery,
          where('price', '>=', Number(filters.priceRange[0]) || 0),
          where('price', '<=', Number(filters.priceRange[1]) || 10000)
        )
      }

      const querySnapshot = await getDocs(productsQuery)
      let productsList = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || data.productName || '',
          author: data.author || '',
          description: data.description || '',
          price: Number(data.price) || 0,
          originalPrice: Number(data.originalPrice) || null,
          stock: Number(data.stock) || 0,
          rating: Number(data.rating) || 0,
          reviewCount: Number(data.reviewCount) || 0,
          isNew: Boolean(data.isNew),
          isBestseller: Boolean(data.isBestseller),
          category: data.category || data.categoryId || data.categoryName || '',
          images: Array.isArray(data.images) ? data.images : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt || null,
          format: data.format || 'paperback',
          isActive: Boolean(data.isActive),
          // Additional fields for filtering
          isFiction: Boolean(data.isFiction),
          isNonFiction: Boolean(data.isNonFiction),
          isChildrenBook: Boolean(data.isChildrenBook),
          isStationary: Boolean(data.isStationary),
          isGift: Boolean(data.isGift),
          ...data
        }
      })

      console.log('Raw products count:', productsList.length)

      // 🔹 CLIENT-SIDE FILTERING (for complex queries)
      if (filters.category && filters.category.trim() !== '') {
        productsList = productsList.filter(product => {
          // Match multiple possible category fields
          const categoryMatch = 
            product.category === filters.category ||
            product.categoryId === filters.category ||
            product.categoryName === filters.category ||
            (product.category && product.category.toLowerCase() === filters.category.toLowerCase()) ||
            (product.categoryId && product.categoryId.toLowerCase() === filters.category.toLowerCase())
          
          return categoryMatch
        })
        console.log('After category filter:', productsList.length)
      }

      // 🔹 Bestseller filter
      if (filters.isBestseller) {
        productsList = productsList.filter(product => product.isBestseller === true)
      }

      // 🔹 Fiction filter
      if (filters.isFiction) {
        productsList = productsList.filter(product => product.isFiction === true)
      }

      // 🔹 Non-Fiction filter
      if (filters.isNonFiction) {
        productsList = productsList.filter(product => product.isNonFiction === true)
      }

      // 🔹 Children's Books filter
      if (filters.isChildrenBook) {
        productsList = productsList.filter(product => product.isChildrenBook === true)
      }

      // 🔹 Stationary filter
      if (filters.isStationary) {
        productsList = productsList.filter(product => product.isStationary === true)
      }

      // 🔹 Gifts filter
      if (filters.isGift) {
        productsList = productsList.filter(product => product.isGift === true)
      }

      // 🔹 Search functionality
      if (searchQuery && searchQuery.trim() !== '') {
        const queryLower = searchQuery.toLowerCase().trim()
        productsList = productsList.filter(product => {
          return (
            product.name?.toLowerCase().includes(queryLower) ||
            product.author?.toLowerCase().includes(queryLower) ||
            product.description?.toLowerCase().includes(queryLower) ||
            product.category?.toLowerCase().includes(queryLower) ||
            product.tags?.some(tag => tag.toLowerCase().includes(queryLower))
          )
        })
        console.log('After search filter:', productsList.length)
      }

      // 🔹 Rating filter
      if (filters.rating && filters.rating > 0) {
        productsList = productsList.filter(product => 
          (product.rating || 0) >= filters.rating
        )
      }

      // 🔹 Format filter
      if (filters.format && filters.format.trim() !== '') {
        productsList = productsList.filter(product => 
          product.format?.toLowerCase() === filters.format.toLowerCase()
        )
      }

      // 🔹 Author filter
      if (filters.author && filters.author.trim() !== '') {
        productsList = productsList.filter(product => 
          product.author?.toLowerCase() === filters.author.toLowerCase()
        )
      }

      // 🔹 Availability filter
      if (filters.availability && filters.availability !== 'all') {
        productsList = productsList.filter(product => {
          if (filters.availability === 'in-stock') {
            return product.stock > 0
          } else if (filters.availability === 'out-of-stock') {
            return product.stock <= 0
          }
          return true
        })
      }

      // 🔹 Tags filter
      if (filters.tags && filters.tags.length > 0) {
        productsList = productsList.filter(product => {
          if (!product.tags || !Array.isArray(product.tags)) return false
          return filters.tags.some(tag => 
            product.tags.includes(tag)
          )
        })
      }

      console.log('Final products count:', productsList.length)
      setProducts(productsList)

    } catch (err) {
      console.error('Error fetching products:', err)
      setError({
        message: 'Failed to load products. Please try again.',
        details: err.message
      })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}