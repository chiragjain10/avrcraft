import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Generic API response handler
const handleResponse = async (operation) => {
  try {
    const result = await operation()
    return { success: true, data: result }
  } catch (error) {
    console.error('API Error:', error)
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred'
    }
  }
}

// Generic document operations
export const api = {
  // Create document
  create: (collectionName, data) => 
    handleResponse(() => addDoc(collection(db, collectionName), data)),

  // Read single document
  get: (collectionName, id) => 
    handleResponse(async () => {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      throw new Error('Document not found')
    }),

  // Read multiple documents
  getAll: (collectionName, constraints = []) => 
    handleResponse(async () => {
      let q = collection(db, collectionName)
      
      // Apply constraints
      constraints.forEach(constraint => {
        q = query(q, ...constraint)
      })
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }),

  // Update document
  update: (collectionName, id, data) => 
    handleResponse(() => {
      const docRef = doc(db, collectionName, id)
      return updateDoc(docRef, data)
    }),

  // Delete document
  delete: (collectionName, id) => 
    handleResponse(() => {
      const docRef = doc(db, collectionName, id)
      return deleteDoc(docRef)
    }),

  // Batch operations
  batch: {
    create: async (operations) => {
      const batch = writeBatch(db)
      
      operations.forEach(operation => {
        const docRef = doc(collection(db, operation.collection))
        batch.set(docRef, operation.data)
      })
      
      return handleResponse(() => batch.commit())
    },

    update: async (operations) => {
      const batch = writeBatch(db)
      
      operations.forEach(operation => {
        const docRef = doc(db, operation.collection, operation.id)
        batch.update(docRef, operation.data)
      })
      
      return handleResponse(() => batch.commit())
    },

    delete: async (operations) => {
      const batch = writeBatch(db)
      
      operations.forEach(operation => {
        const docRef = doc(db, operation.collection, operation.id)
        batch.delete(docRef)
      })
      
      return handleResponse(() => batch.commit())
    }
  }
}

// Query builders
export const queryBuilder = {
  where: (field, operator, value) => [where(field, operator, value)],
  orderBy: (field, direction = 'asc') => [orderBy(field, direction)],
  limit: (count) => [limit(count)],
  startAfter: (document) => [startAfter(document)]
}

// Pagination helper
export const paginate = async (collectionName, pageSize = 10, lastDoc = null, constraints = []) => {
  let q = collection(db, collectionName)
  
  // Apply constraints
  constraints.forEach(constraint => {
    q = query(q, ...constraint)
  })
  
  // Apply pagination
  if (lastDoc) {
    q = query(q, startAfter(lastDoc), limit(pageSize))
  } else {
    q = query(q, limit(pageSize))
  }
  
  const querySnapshot = await getDocs(q)
  const documents = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  
  return {
    documents,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
    hasMore: querySnapshot.docs.length === pageSize
  }
}