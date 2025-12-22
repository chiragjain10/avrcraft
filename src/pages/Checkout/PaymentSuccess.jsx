// components/checkout/PaymentSuccess.jsx
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, Package, Truck, CheckCircle, Home, Download } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../utils/firebase/config'
import styles from './PaymentSuccess.module.css'

const PaymentSuccess = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const orderId = queryParams.get('order_id')
  const [orderData, setOrderData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId) {
        try {
          const orderDoc = await getDoc(doc(db, 'orders', orderId))
          if (orderDoc.exists()) {
            setOrderData(orderDoc.data())
          }
        } catch (error) {
          console.error('Error fetching order:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const downloadInvoice = () => {
    // Generate PDF invoice logic
    const invoiceData = {
      orderId,
      date: new Date().toLocaleDateString(),
      items: orderData?.items || [],
      total: orderData?.total || 0,
      shippingAddress: orderData?.shippingInfo || {}
    }
    
    // Create and download PDF
    alert('Invoice generation would go here')
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading order details...</p>
      </div>
    )
  }

  return (
    <div className={styles.successContainer}>
      <div className={styles.successCard}>
        <div className={styles.successHeader}>
          <div className={styles.successIcon}>
            <Check size={48} />
          </div>
          <h1 className={styles.successTitle}>Payment Successful!</h1>
          <p className={styles.successMessage}>
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <div className={styles.orderDetails}>
          <div className={styles.detailCard}>
            <h3>Order Details</h3>
            <div className={styles.detailItem}>
              <strong>Order ID:</strong>
              <span>{orderId}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Order Date:</strong>
              <span>{new Date(orderData?.orderDate).toLocaleDateString()}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Total Amount:</strong>
              <span className={styles.amount}>₹{orderData?.total?.toLocaleString()}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Payment Method:</strong>
              <span className={styles.paymentMethod}>
                {orderData?.paymentInfo?.method === 'razorpay' ? 'Razorpay' : 'COD'}
              </span>
            </div>
          </div>

          <div className={styles.detailCard}>
            <h3>Shipping Information</h3>
            <div className={styles.address}>
              <p><strong>{orderData?.shippingInfo?.firstName} {orderData?.shippingInfo?.lastName}</strong></p>
              <p>{orderData?.shippingInfo?.address}</p>
              <p>{orderData?.shippingInfo?.city}, {orderData?.shippingInfo?.state}</p>
              <p>PIN: {orderData?.shippingInfo?.pincode}</p>
              <p>Phone: {orderData?.shippingInfo?.phone}</p>
            </div>
          </div>
        </div>

        <div className={styles.nextSteps}>
          <h3>What Happens Next?</h3>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}><Package size={24} /></div>
              <div className={styles.stepContent}>
                <strong>Order Processing</strong>
                <span>We'll prepare your items within 24 hours</span>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}><Truck size={24} /></div>
              <div className={styles.stepContent}>
                <strong>Shipment</strong>
                <span>Your order will be shipped in 2-3 business days</span>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}><CheckCircle size={24} /></div>
              <div className={styles.stepContent}>
                <strong>Delivery</strong>
                <span>Estimated delivery: 5-7 business days</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={downloadInvoice} className={styles.invoiceBtn}>
            <Download size={20} />
            Download Invoice
          </button>
          <Link to={`/orders/${orderId}`} className={styles.viewOrderBtn}>
            View Order Details
          </Link>
          <Link to="/shop" className={styles.continueBtn}>
            Continue Shopping
          </Link>
        </div>

        <div className={styles.support}>
          <p>Need help? Contact our support:</p>
          <p className={styles.contact}>
            📞 +91-XXXXXXXXXX | ✉️ support@avrcrafts.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess