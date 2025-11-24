// src/admin/utils/firebase/adminConfig.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../../../utils/firebase/config'

// Products Management
export const adminProducts = {
  // Get all products
  getProducts: async () => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Add new product
  addProduct: async (productData) => {
    const productWithTimestamp = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    }
    const docRef = await addDoc(collection(db, 'products'), productWithTimestamp)
    return { id: docRef.id, ...productWithTimestamp }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    const productRef = doc(db, 'products', productId)
    await updateDoc(productRef, {
      ...productData,
      updatedAt: serverTimestamp()
    })
  },

  // Delete product
  deleteProduct: async (productId) => {
    await deleteDoc(doc(db, 'products', productId))
  },

  // Upload product image
  uploadImage: async (file, productId) => {
    const storageRef = ref(storage, `products/${productId}/${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  }
}

// Categories Management
export const adminCategories = {
  getCategories: async () => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  addCategory: async (categoryData) => {
    const categoryWithTimestamp = {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    }
    const docRef = await addDoc(collection(db, 'categories'), categoryWithTimestamp)
    return { id: docRef.id, ...categoryWithTimestamp }
  },

  updateCategory: async (categoryId, categoryData) => {
    const categoryRef = doc(db, 'categories', categoryId)
    await updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: serverTimestamp()
    })
  },

  deleteCategory: async (categoryId) => {
    await deleteDoc(doc(db, 'categories', categoryId))
  }
}

// Blogs Management
export const adminBlogs = {
  getBlogs: async () => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  addBlog: async (blogData) => {
    const blogWithTimestamp = {
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      views: 0,
      likes: 0
    }
    const docRef = await addDoc(collection(db, 'blogs'), blogWithTimestamp)
    return { id: docRef.id, ...blogWithTimestamp }
  },

  updateBlog: async (blogId, blogData) => {
    const blogRef = doc(db, 'blogs', blogId)
    await updateDoc(blogRef, {
      ...blogData,
      updatedAt: serverTimestamp()
    })
  },

  deleteBlog: async (blogId) => {
    await deleteDoc(doc(db, 'blogs', blogId))
  }
}