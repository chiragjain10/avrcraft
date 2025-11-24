import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '../utils/firebase/config'

export const useFirebase = (collectionName, filters = {}, singleDocId = null) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        if (singleDocId) {
          // Fetch single document
          const docRef = doc(db, collectionName, singleDocId)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            setData([{ id: docSnap.id, ...docSnap.data() }])
          } else {
            setData([])
          }
        } else {
          // Fetch collection with filters
          let dataQuery = query(collection(db, collectionName))
          
          // Apply filters
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              dataQuery = query(dataQuery, where(key, '==', value))
            }
          })

          const querySnapshot = await getDocs(dataQuery)
          const dataList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))

          setData(dataList)
        }
      } catch (err) {
        setError(`Failed to load ${collectionName}`)
        console.error(`Error fetching ${collectionName}:`, err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionName, JSON.stringify(filters), singleDocId])

  return { data, loading, error }
}