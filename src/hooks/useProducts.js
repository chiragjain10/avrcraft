// src/hooks/useProducts.js (Improved)
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        let productsQuery = query(
          collection(db, 'products'),
          where('isActive', '==', true)
        )

        // 🔹 Search functionality
        if (searchQuery && searchQuery.trim() !== '') {
          productsQuery = query(productsQuery, orderBy('name'))
        }

        // 🔹 Price range filter
        if (filters.priceRange) {
          productsQuery = query(
            productsQuery,
            where('price', '>=', Number(filters.priceRange[0])),
            where('price', '<=', Number(filters.priceRange[1])),
            orderBy('price')
          )
        } else {
          productsQuery = query(productsQuery, orderBy('createdAt', 'desc'))
        }

        // 🔹 Category & special category filters
        if (filters.category) {
          const cat = filters.category;
          if (cat.toLowerCase() === 'Bestsellers'.toLowerCase()) {
            productsQuery = query(productsQuery, where('isBestseller', '==', true));
          } else if (cat.toLowerCase() === 'Fiction'.toLowerCase()) {
            productsQuery = query(productsQuery, where('isFiction', '==', true));
          } else if (cat.toLowerCase() === 'Non-Fiction'.toLowerCase()) {
            productsQuery = query(productsQuery, where('isNonFiction', '==', true));
          } else if (cat.toLowerCase() === 'Childrens'.toLowerCase()) {
            productsQuery = query(productsQuery, where('isChildrens', '==', true));
          } else if (cat.toLowerCase() === 'Stationery'.toLowerCase()) {
            productsQuery = query(productsQuery, where('isStationery', '==', true));
          } else if (cat.toLowerCase() === 'Gifts'.toLowerCase()) {
            productsQuery = query(productsQuery, where('isGift', '==', true));
          } else {
            productsQuery = query(
              productsQuery,
              where('category', '==', cat)
            );
          }
        }

        // 🔹 Artisan filter
        if (filters.artisan) {
          productsQuery = query(
            productsQuery,
            where('artisan.name', '==', filters.artisan)
          )
        }

        // 🔹 Material filter
        if (filters.material) {
          productsQuery = query(
            productsQuery,
            where('material', '==', filters.material)
          )
        }

        const querySnapshot = await getDocs(productsQuery)
        let productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        if (searchQuery && searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase().trim()
          productsList = productsList.filter(product =>
            product.name?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.material?.toLowerCase().includes(query) ||
            product.artisan?.name?.toLowerCase().includes(query) ||
            product.tags?.some(tag => tag.toLowerCase().includes(query))
          )
        }

        // 🔹 Client-side availability filter
        if (filters.availability && filters.availability !== 'all') {
          productsList = productsList.filter(product => {
            if (filters.availability === 'in-stock') {
              return product.stock > 0
            } else if (filters.availability === 'out-of-stock') {
              return product.stock === 0
            }
            return true
          })
        }

        // 🔹 Client-side rating filter
        if (filters.rating && filters.rating > 0) {
          productsList = productsList.filter(
            product => (product.rating || 0) >= filters.rating
          )
        }

        setProducts(productsList)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products. Please try again.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters, searchQuery])

  return { products, loading, error }
}

// Additional hook for search suggestions
export const useSearchSuggestions = (searchQuery, limit = 5) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const productsQuery = query(
          collection(db, 'products'),
          where('isActive', '==', true),
          orderBy('name'),
          limit(10)
        )

        const querySnapshot = await getDocs(productsQuery)
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const queryLower = searchQuery.toLowerCase()
        const filtered = productsList
          .filter(product =>
            product.name?.toLowerCase().includes(queryLower) ||
            product.category?.toLowerCase().includes(queryLower)
          )
          .slice(0, limit)

        setSuggestions(filtered)
      } catch (error) {
        console.error('Error fetching search suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, limit])

  return { suggestions, loading }
}