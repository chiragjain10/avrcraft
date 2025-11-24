import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../utils/firebase/config'

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      if (!filters) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let productsQuery = query(
          collection(db, 'products'),
          where('isActive', '==', true)
        )

        // 🔹 Price range ho to Firestore pe
        if (filters.priceRange) {
          productsQuery = query(
            productsQuery,
            where('price', '>=', Number(filters.priceRange[0])),
            where('price', '<=', Number(filters.priceRange[1])),
            orderBy('price') // range field par hi orderBy
          )
        } else {
          // 🔹 Default sort
          productsQuery = query(productsQuery, orderBy('createdAt', 'desc'))
        }

        if (filters.category) {
          productsQuery = query(
            productsQuery,
            where('category', '==', filters.category)
          )
        }

        if (filters.isBestseller) {
          productsQuery = query(
            productsQuery,
            where('isBestseller', '==', true)
          )
        }

        const querySnapshot = await getDocs(productsQuery)
        let productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // 🔹 Client-side filters

        // availability
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

        // rating (client-side)
        if (filters.rating && filters.rating > 0) {
          productsList = productsList.filter(
            product => (product.rating || 0) >= filters.rating
          )
        }

        setProducts(productsList)
      } catch (err) {
        setError('Failed to load products')
        console.error('Error fetching products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  return { products, loading, error }
}
