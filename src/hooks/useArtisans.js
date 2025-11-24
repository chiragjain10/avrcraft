import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../utils/firebase/config'

export const useArtisans = () => {
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArtisans = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const artisansQuery = query(
          collection(db, 'artisans'),
          where('isActive', '==', true),
          orderBy('name', 'asc')
        )

        const querySnapshot = await getDocs(artisansQuery)
        const artisansList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setArtisans(artisansList)
      } catch (err) {
        setError('Failed to load artisans')
        console.error('Error fetching artisans:', err)
        setArtisans([])
      } finally {
        setLoading(false)
      }
    }

    fetchArtisans()
  }, [])

  return { artisans, loading, error }
}