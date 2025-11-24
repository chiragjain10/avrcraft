import React from 'react'
import styles from './Button.module.css'

const SecondaryButton = ({ 
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
      className={`${styles.secondaryButton} ${className} ${loading ? styles.loading : ''}`}
      {...props}
    >
      {loading && <div className={styles.spinner}></div>}
      {children}
    </button>
  )
}

export default SecondaryButton