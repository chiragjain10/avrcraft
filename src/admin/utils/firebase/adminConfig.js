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
import { db } from '../../../utils/firebase/config'
import cloudinaryService from '../../../utils/cloudinary'

// Products Management
export const adminProducts = {
  // Get all products
  getProducts: async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Ensure proper data types
        price: doc.data().price || 0,
        stock: doc.data().stock || 0,
        isActive: doc.data().isActive !== undefined ? doc.data().isActive : true
      }))
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  // Add new product
  addProduct: async (productData) => {
    try {
      const productWithTimestamp = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: productData.isActive !== undefined ? productData.isActive : true
      }
      const docRef = await addDoc(collection(db, 'products'), productWithTimestamp)
      return { id: docRef.id, ...productWithTimestamp }
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    try {
      const productRef = doc(db, 'products', productId)
      await updateDoc(productRef, {
        ...productData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId))
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  // Upload product image to Cloudinary
  uploadImage: async (file, productId) => {
    try {
      const folder = `avrcrafts/products/${productId || 'temp'}`
      const imageUrl = await cloudinaryService.uploadImage(file, folder)
      return imageUrl
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error)
      throw new Error('Failed to upload image: ' + error.message)
    }
  },

  // Upload multiple images
  uploadMultipleImages: async (files, productId) => {
    try {
      const folder = `avrcrafts/products/${productId || 'temp'}`
      const imageUrls = await cloudinaryService.uploadMultipleImages(files, folder)
      return imageUrls
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      throw new Error('Failed to upload images: ' + error.message)
    }
  }
}

// Categories Management
export const adminCategories = {
  getCategories: async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isActive: doc.data().isActive !== undefined ? doc.data().isActive : true
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    } 
  },

  addCategory: async (categoryData) => {
    try {
      let imageUrl = categoryData.image || ''
      
      // Upload category image to Cloudinary if new file is provided
      if (categoryData.imageFile) {
        const folder = 'avrcrafts/categories'
        imageUrl = await cloudinaryService.uploadImage(categoryData.imageFile, folder)
      }

      const categoryWithTimestamp = {
        name: categoryData.name,
        description: categoryData.description || '',
        image: imageUrl,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'categories'), categoryWithTimestamp)
      return { id: docRef.id, ...categoryWithTimestamp }
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      let updateData = { 
        name: categoryData.name,
        description: categoryData.description || '',
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        updatedAt: serverTimestamp()
      }
      
      // Upload new image if provided
      if (categoryData.imageFile) {
        const folder = 'avrcrafts/categories'
        const imageUrl = await cloudinaryService.uploadImage(categoryData.imageFile, folder)
        updateData.image = imageUrl
      } else if (categoryData.image) {
        // Keep existing image if no new file
        updateData.image = categoryData.image
      }

      const categoryRef = doc(db, 'categories', categoryId)
      await updateDoc(categoryRef, updateData)
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId))
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }
}

// Blogs Management
export const adminBlogs = {
  getBlogs: async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isActive: doc.data().isActive !== undefined ? doc.data().isActive : true
      }))
    } catch (error) {
      console.error('Error fetching blogs:', error)
      throw error
    }
  },

  addBlog: async (blogData) => {
    try {
      let imageUrl = blogData.image || ''
      
      // Upload blog image to Cloudinary if new file is provided
      if (blogData.imageFile) {
        const folder = 'avrcrafts/blogs'
        imageUrl = await cloudinaryService.uploadImage(blogData.imageFile, folder)
      }

      const blogWithTimestamp = {
        ...blogData,
        image: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: blogData.isActive !== undefined ? blogData.isActive : true,
        views: blogData.views || 0,
        likes: blogData.likes || 0
      }
      
      const docRef = await addDoc(collection(db, 'blogs'), blogWithTimestamp)
      return { id: docRef.id, ...blogWithTimestamp }
    } catch (error) {
      console.error('Error adding blog:', error)
      throw error
    }
  },

  updateBlog: async (blogId, blogData) => {
    try {
      let updateData = {
        ...blogData,
        updatedAt: serverTimestamp()
      }
      
      // Upload new image if provided
      if (blogData.imageFile) {
        const folder = 'avrcrafts/blogs'
        const imageUrl = await cloudinaryService.uploadImage(blogData.imageFile, folder)
        updateData.image = imageUrl
        delete updateData.imageFile // Remove the file object
      }

      const blogRef = doc(db, 'blogs', blogId)
      await updateDoc(blogRef, updateData)
    } catch (error) {
      console.error('Error updating blog:', error)
      throw error
    }
  },

  deleteBlog: async (blogId) => {
    try {
      await deleteDoc(doc(db, 'blogs', blogId))
    } catch (error) {
      console.error('Error deleting blog:', error)
      throw error
    }
  }
}