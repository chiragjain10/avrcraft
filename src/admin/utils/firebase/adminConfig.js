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

// Customers Management
export const adminCustomers = {
  getCustomers: async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'customer'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw error
    }
  },

  updateCustomer: async (customerId, customerData) => {
    try {
      const customerRef = doc(db, 'users', customerId)
      await updateDoc(customerRef, {
        ...customerData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }
}

// Orders Management
export const adminOrders = {
  getOrders: async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  },

  deleteOrder: async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }
}

// Artisans Management
export const adminArtisans = {
  getArtisans: async () => {
    try {
      const q = query(collection(db, 'artisans'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching artisans:', error)
      throw error
    }
  },

  addArtisan: async (artisanData) => {
    try {
      const artisanWithTimestamp = {
        ...artisanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'artisans'), artisanWithTimestamp)
      return { id: docRef.id, ...artisanWithTimestamp }
    } catch (error) {
      console.error('Error adding artisan:', error)
      throw error
    }
  },

  updateArtisan: async (artisanId, artisanData) => {
    try {
      const artisanRef = doc(db, 'artisans', artisanId)
      await updateDoc(artisanRef, {
        ...artisanData,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating artisan:', error)
      throw error
    }
  },

  deleteArtisan: async (artisanId) => {
    try {
      await deleteDoc(doc(db, 'artisans', artisanId))
    } catch (error) {
      console.error('Error deleting artisan:', error)
      throw error
    }
  }
}

// Reviews Management
export const adminReviews = {
  getReviews: async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching reviews:', error)
      throw error
    }
  },

  updateReviewStatus: async (reviewId, isApproved) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId)
      await updateDoc(reviewRef, {
        isApproved,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  }
}

// Coupons Management
export const adminCoupons = {
  getCoupons: async () => {
    try {
      const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching coupons:', error)
      throw error
    }
  },

  addCoupon: async (couponData) => {
    try {
      const couponWithTimestamp = {
        ...couponData,
        usedCount: 0,
        totalDiscount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'coupons'), couponWithTimestamp)
      return { id: docRef.id, ...couponWithTimestamp }
    } catch (error) {
      console.error('Error adding coupon:', error)
      throw error
    }
  }
}

// Shipping Management
export const adminShipping = {
  getZones: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'shippingZones'))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching shipping zones:', error)
      throw error
    }
  },

  getMethods: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'shippingMethods'))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching shipping methods:', error)
      throw error
    }
  },

  // Export all products to JSON
  exportProducts: async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const products = [];

      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Create downloadable JSON file
      const jsonStr = JSON.stringify(products, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true, count: products.length };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  // Import products from JSON (with field mapping)
  importProducts: async (jsonData, fieldMapping = {}) => {
    try {
      const products = JSON.parse(jsonData);
      const batch = writeBatch(db);
      let importedCount = 0;
      let skippedCount = 0;

      console.log('Field mapping:', fieldMapping);
      console.log('Sample product from import:', products[0]);

      // Default field mapping (old project → new project)
      const defaultMapping = {
        'title': 'name',
        'description': 'description',
        'price': 'price',
        'stock': 'stock',
        'category': 'category',
        'images': 'images',
        'rating': 'rating',
        'featured': 'isHighlight',
        'trending': 'isBestseller',
        'productTypes': 'tags',
        'subcategory': 'subcategory'
      };

      // Merge custom mapping with defaults
      const finalMapping = { ...defaultMapping, ...fieldMapping };

      for (const oldProduct of products) {
        try {
          // Map old fields to new fields
          const newProduct = {};

          for (const [oldField, newField] of Object.entries(finalMapping)) {
            if (oldProduct[oldField] !== undefined) {
              // Special handling for specific fields
              if (newField === 'isHighlight') {
                newProduct[newField] = Boolean(oldProduct[oldField]);
              } else if (newField === 'isBestseller') {
                newProduct[newField] = Boolean(oldProduct[oldField]);
              } else if (newField === 'tags' && oldProduct[oldField]) {
                newProduct[newField] = Array.isArray(oldProduct[oldField])
                  ? oldProduct[oldField]
                  : [oldProduct[oldField]];
              } else {
                newProduct[newField] = oldProduct[oldField];
              }
            }
          }

          // Add default values for required fields
          if (!newProduct.name) newProduct.name = oldProduct.title || 'Untitled Product';
          if (!newProduct.category) newProduct.category = oldProduct.category || 'Uncategorized';
          if (!newProduct.stock && newProduct.stock !== 0) newProduct.stock = oldProduct.stock || 0;
          if (!newProduct.price) newProduct.price = oldProduct.price || 0;

          // Add default fields for new system
          newProduct.isActive = true;
          newProduct.createdAt = new Date().toISOString();
          newProduct.updatedAt = new Date().toISOString();

          // Create new document with same ID if exists, otherwise new ID
          const docId = oldProduct.id || `imported_${Date.now()}_${importedCount}`;
          const productRef = doc(db, 'products', docId);

          batch.set(productRef, newProduct);
          importedCount++;

          // Firestore batch limit: 500 operations
          if (importedCount % 400 === 0) {
            await batch.commit();
            // Start new batch
            // Note: We need to create a new batch
          }

        } catch (productError) {
          console.warn('Skipping product due to error:', productError);
          skippedCount++;
        }
      }

      // Commit remaining batch
      if (importedCount % 400 !== 0) {
        await batch.commit();
      }

      return {
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        total: products.length
      };

    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }
}