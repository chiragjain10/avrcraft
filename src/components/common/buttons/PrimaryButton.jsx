import React from 'react'
import styles from './Button.module.css'

const PrimaryButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.primaryButton} ${className} ${loading ? styles.loading : ''}`}
      {...props}
    >
      {loading && <div className={styles.spinner}></div>}
      {children}
    </button>
  )
}

export default PrimaryButton