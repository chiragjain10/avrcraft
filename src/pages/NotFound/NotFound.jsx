// src/pages/NotFound/NotFound.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

const NotFound = () => {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.errorCode}>404</h1>
          <h2 className={styles.title}>Page Not Found</h2>
          <p className={styles.message}>
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          <div className={styles.actions}>
            <Link to="/" className={styles.homeButton}>Go to Homepage</Link>
            <Link to="/shop" className={styles.shopButton}>Browse Shop</Link>
          </div>
          <div className={styles.searchHelp}>
            <p>Or try searching for what you need:</p>
            <form className={styles.searchForm}>
              <input type="text" placeholder="Search products..." />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound