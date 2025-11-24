import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../utils/firebase/config'

export const useTrendingProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const productsQuery = query(
          collection(db, 'products'),
          where('isActive', '==', true),
          where('isBestseller', '==', true),
          orderBy('rating', 'desc'),
          limit(8)
        )

        const querySnapshot = await getDocs(productsQuery)
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // If no bestsellers found, get top-rated products
        if (productsList.length === 0) {
          const fallbackQuery = query(
            collection(db, 'products'),
            where('isActive', '==', true),
            orderBy('rating', 'desc'),
            limit(8)
          )
          const fallbackSnapshot = await getDocs(fallbackQuery)
          const fallbackProducts = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setProducts(fallbackProducts)
        } else {
          setProducts(productsList)
        }
      } catch (err) {
        setError('Failed to load trending products')
        console.error('Error fetching trending products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingProducts()
  }, [])

  return { products, loading, error }
}