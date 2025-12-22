// utils/firebase/firestore.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  increment // Yeh add karein
} from 'firebase/firestore'
import { db, auth } from './config'


export const createRazorpayOrderDirect = async (orderData) => {
  try {
    // Ensure amount is a valid number and convert to integer (paise)
    const amount = Math.round(Number(orderData.amount));
    
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount for Razorpay order');
    }

    // In a production environment, you would typically make an API call to your backend
    // which would then call the Razorpay API with your secret key
    // For client-side testing, we'll simulate a successful response
    const order = {
      id: `order_${Date.now()}`,
      amount: amount, // Amount in paise
      currency: orderData.currency || 'INR',
      receipt: orderData.receipt || `rcpt_${Date.now()}`,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
      amount_paid: 0,
      amount_due: amount,
      attempts: 0,
      notes: orderData.notes || {},
      created_at: Math.floor(Date.now() / 1000)
    };

    // In a real implementation, you would make an API call here:
    // const response = await fetch('/api/create-razorpay-order', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     amount: order.amount,
    //     currency: order.currency,
    //     receipt: order.receipt,
    //     notes: order.notes
    //   })
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.error || 'Failed to create order');
    // return { success: true, ...data };

    // For testing/development, return the simulated order
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create payment order' 
    };
  }
};

// Payment verification
export const verifyPaymentClientSide = async (paymentData, orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId)

    // Basic verification (Production mein server-side verification karein)
    const isValid = paymentData.razorpay_payment_id &&
      paymentData.razorpay_order_id &&
      paymentData.razorpay_signature

    if (isValid) {
      await updateDoc(orderRef, {
        paymentStatus: 'captured',
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpaySignature: paymentData.razorpay_signature,
        updatedAt: serverTimestamp(),
        status: 'confirmed'
      })

      return { success: true, verified: true }
    }

    return { success: false, verified: false, message: 'Invalid payment data' }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { success: false, verified: false }
  }
}

// Users Collection
export const createUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, userData)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserDocument = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { success: true, user: userSnap.data() }
    } else {
      return { success: false, error: 'User not found' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateUserDocument = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, updates)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Products Collection
export const getProducts = async (filters = {}) => {
  try {
    let productsQuery = collection(db, 'products')

    // Apply filters
    if (filters.category) {
      productsQuery = query(productsQuery, where('category', '==', filters.category))
    }

    if (filters.artisanId) {
      productsQuery = query(productsQuery, where('artisanId', '==', filters.artisanId))
    }

    if (filters.limit) {
      productsQuery = query(productsQuery, limit(filters.limit))
    }

    // Always order by creation date
    productsQuery = query(productsQuery, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(productsQuery)
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, products }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getProduct = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId)
    const productSnap = await getDoc(productRef)

    if (productSnap.exists()) {
      return { success: true, product: { id: productSnap.id, ...productSnap.data() } }
    } else {
      return { success: false, error: 'Product not found' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getTrendingProducts = async () => {
  try {
    const productsQuery = query(
      collection(db, 'products'),
      where('isTrending', '==', true),
      limit(8)
    )

    const querySnapshot = await getDocs(productsQuery)
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, products }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Categories Collection
export const getCategories = async () => {
  try {
    const categoriesQuery = query(collection(db, 'categories'), orderBy('order'))
    const querySnapshot = await getDocs(categoriesQuery)
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, categories }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Artisans Collection
export const getArtisans = async () => {
  try {
    const artisansQuery = query(collection(db, 'artisans'), orderBy('name'))
    const querySnapshot = await getDocs(artisansQuery)
    const artisans = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, artisans }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getArtisan = async (artisanId) => {
  try {
    const artisanRef = doc(db, 'artisans', artisanId)
    const artisanSnap = await getDoc(artisanRef)

    if (artisanSnap.exists()) {
      return { success: true, artisan: { id: artisanSnap.id, ...artisanSnap.data() } }
    } else {
      return { success: false, error: 'Artisan not found' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Helper function to clean data before saving to Firestore
const cleanFirestoreData = (data) => {
  if (data === null || data === undefined) return null;
  
  if (Array.isArray(data)) {
    return data.map(cleanFirestoreData).filter(Boolean);
  }
  
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      // Remove undefined values
      if (value === undefined) return acc;
      
      // Clean nested objects/arrays
      const cleanedValue = cleanFirestoreData(value);
      
      // Only add if the cleaned value is not null/undefined
      if (cleanedValue !== null && cleanedValue !== undefined) {
        acc[key] = cleanedValue;
      }
      
      return acc;
    }, {});
  }
  
  return data;
};

// Orders Collection
export const createOrder = async (orderData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Clean the order data
    const cleanedData = cleanFirestoreData({
      ...orderData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Only override orderNumber if not provided
      orderNumber: orderData.orderNumber || `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`
    });

    // Validate required fields
    const requiredFields = ['userId', 'items', 'shippingInfo', 'billingInfo', 'total'];
    const missingFields = requiredFields.filter(field => !cleanedData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Create order document with cleaned data
    const orderRef = await addDoc(collection(db, 'orders'), cleanedData);

    // Save order ID in user's orders subcollection
    const userOrderRef = doc(db, 'users', user.uid, 'orders', orderRef.id)
    await setDoc(userOrderRef, {
      orderId: orderRef.id,
      total: cleanedData.total,
      status: cleanedData.status,
      status: orderData.status,
      createdAt: serverTimestamp()
    })

    // Update product quantities
    for (const item of orderData.items) {
      const productRef = doc(db, 'products', item.productId || item.id)
      const productDoc = await getDoc(productRef)

      if (productDoc.exists()) {
        const currentStock = productDoc.data().stock || 0
        const newStock = Math.max(0, currentStock - (item.quantity || 1))

        await updateDoc(productRef, {
          stock: newStock,
          sold: increment(item.quantity || 1)
        })
      }
    }

    return {
      success: true,
      orderId: orderRef.id,
      orderNumber: orderData.orderNumber
    }

  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

// Update order payment status
export const updateOrderPayment = async (orderId, paymentData) => {
  try {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      ...paymentData,
      paymentDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating order payment:', error)
    throw error
  }
}

export const getUserOrders = async (userId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(ordersQuery)
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, orders }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Wishlist Collection
export const addToWishlist = async (userId, productId) => {
  try {
    const wishlistRef = doc(db, 'wishlists', `${userId}_${productId}`)
    await setDoc(wishlistRef, {
      userId,
      productId,
      addedAt: new Date()
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const removeFromWishlist = async (userId, productId) => {
  try {
    const wishlistRef = doc(db, 'wishlists', `${userId}_${productId}`)
    await deleteDoc(wishlistRef)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserWishlist = async (userId) => {
  try {
    const wishlistQuery = query(
      collection(db, 'wishlists'),
      where('userId', '==', userId)
    )

    const querySnapshot = await getDocs(wishlistQuery)
    const wishlistItems = querySnapshot.docs.map(doc => doc.data().productId)

    return { success: true, wishlist: wishlistItems }
  } catch (error) {
    return { success: false, error: error.message }
  }
}