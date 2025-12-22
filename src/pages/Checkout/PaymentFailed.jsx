// components/checkout/PaymentFailed.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import styles from './PaymentFailed.module.css'

const PaymentFailed = ({ errorMessage, orderId, onRetry }) => {
  return (
    <div className={styles.failedContainer}>
      <div className={styles.failedCard}>
        <div className={styles.failedHeader}>
          <div className={styles.failedIcon}>
            <AlertCircle size={48} />
          </div>
          <h1 className={styles.failedTitle}>Payment Failed</h1>
          <p className={styles.failedMessage}>
            {errorMessage || 'We couldn\'t process your payment.'}
          </p>
        </div>

        <div className={styles.errorDetails}>
          <p><strong>Order ID:</strong> {orderId || 'N/A'}</p>
          <p className={styles.note}>
            Don't worry! Your order has been saved. You can retry the payment.
          </p>
        </div>

        <div className={styles.possibleReasons}>
          <h3>Possible Reasons:</h3>
          <ul>
            <li>Insufficient funds in your account</li>
            <li>Card declined by your bank</li>
            <li>Incorrect card details entered</li>
            <li>Network connectivity issues</li>
            <li>Payment gateway timeout</li>
          </ul>
        </div>

        <div className={styles.actions}>
          {onRetry && (
            <button onClick={onRetry} className={styles.retryBtn}>
              <RefreshCw size={20} />
              Retry Payment
            </button>
          )}
          <Link to="/checkout" className={styles.changeMethodBtn}>
            Change Payment Method
          </Link>
          <Link to="/cart" className={styles.cartBtn}>
            Back to Cart
          </Link>
          <Link to="/" className={styles.homeBtn}>
            <Home size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailed