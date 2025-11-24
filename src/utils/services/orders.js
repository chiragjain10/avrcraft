import { api, queryBuilder } from './api'

// Order service
export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    const order = {
      ...orderData,
      status: 'pending',
      orderNumber: generateOrderNumber(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    return await api.create('orders', order)
  },

  // Get order by ID
  getOrder: async (orderId) => {
    return await api.get('orders', orderId)
  },

  // Get user's orders
  getUserOrders: async (userId) => {
    const constraints = [
      ...queryBuilder.where('userId', '==', userId),
      ...queryBuilder.orderBy('createdAt', 'desc')
    ]
    
    return await api.getAll('orders', constraints)
  },

  // Update order status
  updateOrderStatus: async (orderId, status, notes = '') => {
    const updates = {
      status,
      updatedAt: new Date()
    }
    
    if (notes) {
      updates.notes = notes
    }
    
    if (status === 'shipped') {
      updates.shippedAt = new Date()
    } else if (status === 'delivered') {
      updates.deliveredAt = new Date()
    }
    
    return await api.update('orders', orderId, updates)
  },

  // Cancel order
  cancelOrder: async (orderId, reason = '') => {
    return await orderService.updateOrderStatus(
      orderId, 
      'cancelled', 
      reason || 'Order cancelled by user'
    )
  },

  // Add tracking information
  addTracking: async (orderId, trackingNumber, carrier) => {
    return await api.update('orders', orderId, {
      trackingNumber,
      carrier,
      status: 'shipped',
      shippedAt: new Date(),
      updatedAt: new Date()
    })
  },

  // Get order statistics
  getOrderStats: async (userId = null) => {
    const constraints = []
    
    if (userId) {
      constraints.push(...queryBuilder.where('userId', '==', userId))
    }
    
    const allOrders = await api.getAll('orders', constraints)
    
    if (!allOrders.success) return allOrders
    
    const orders = allOrders.data
    const totalOrders = orders.length
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0)
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})
    
    return {
      success: true,
      data: {
        totalOrders,
        totalAmount,
        statusCounts,
        averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0
      }
    }
  }
}

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `AVR${timestamp}${random}`
}

// Order item service
export const orderItemService = {
  // Get items for an order
  getOrderItems: async (orderId) => {
    const constraints = [
      ...queryBuilder.where('orderId', '==', orderId)
    ]
    
    return await api.getAll('orderItems', constraints)
  },

  // Create order items (batch)
  createOrderItems: async (orderId, items) => {
    const operations = items.map(item => ({
      collection: 'orderItems',
      data: {
        orderId,
        productId: item.id,
        productName: item.name,
        productPrice: item.price,
        quantity: item.quantity,
        artisanId: item.artisan?.id,
        artisanName: item.artisan?.name,
        createdAt: new Date()
      }
    }))
    
    return await api.batch.create(operations)
  }
}

// Payment service
export const paymentService = {
  // Create payment record
  createPayment: async (paymentData) => {
    const payment = {
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    return await api.create('payments', payment)
  },

  // Update payment status
  updatePaymentStatus: async (paymentId, status, transactionId = null) => {
    const updates = {
      status,
      updatedAt: new Date()
    }
    
    if (transactionId) {
      updates.transactionId = transactionId
    }
    
    return await api.update('payments', paymentId, updates)
  },

  // Get payment by order ID
  getPaymentByOrder: async (orderId) => {
    const constraints = [
      ...queryBuilder.where('orderId', '==', orderId)
    ]
    
    const payments = await api.getAll('payments', constraints)
    
    if (payments.success && payments.data.length > 0) {
      return { success: true, data: payments.data[0] }
    }
    
    return { success: false, error: 'Payment not found' }
  }
}