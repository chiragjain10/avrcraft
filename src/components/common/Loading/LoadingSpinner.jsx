import React from 'react'
import styles from './LoadingSpinner.module.css'

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary',
  text = 'Loading...' 
}) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]} ${styles[color]}`}>
        <div className={styles.spinnerCircle}></div>
      </div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  )
}

export const PageLoader = () => (
  <div className={styles.pageLoader}>
    <LoadingSpinner size="large" text="Loading AVR Craft..." />
  </div>
)

export const InlineLoader = () => (
  <div className={styles.inlineLoader}>
    <LoadingSpinner size="small" text="" />
  </div>
)

export default LoadingSpinner