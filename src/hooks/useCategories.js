import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../utils/firebase/config'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('isActive', '==', true),
          orderBy('name', 'asc')
        )

        const querySnapshot = await getDocs(categoriesQuery)
        const categoriesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setCategories(categoriesList)
      } catch (err) {
        setError('Failed to load categories')
        console.error('Error fetching categories:', err)
        // Fallback categories
        setCategories([
          { id: '1', name: 'Handicrafts', description: 'Traditional handcrafted items' },
          { id: '2', name: 'Books', description: 'Educational and literature books' },
          { id: '3', name: 'Ethnic Wears', description: 'Traditional clothing and accessories' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}