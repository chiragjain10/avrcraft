// src/pages/Bestsellers/Bestsellers.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../utils/firebase/config'
import styles from './Bestsellers.module.css'

const Bestsellers = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'))
        const booksData = []
        querySnapshot.forEach((doc) => {
          if (doc.data().isBestseller) {
            booksData.push({ id: doc.id, ...doc.data() })
          }
        })
        setBooks(booksData)
      } catch (error) {
        console.error("Error fetching bestsellers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBestsellers()
  }, [])

  return (
    <div className={styles.bestsellersPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Bestsellers</h1>
          <p className={styles.subtitle}>Discover our most popular books loved by readers</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading bestsellers...</div>
        ) : (
          <div className={styles.booksGrid}>
            {books.map(book => (
              <div key={book.id} className={styles.bookCard}>
                <Link to={`/product/${book.id}`}>
                  <div className={styles.imageContainer}>
                    {book.images?.[0] ? (
                      <img src={book.images[0]} alt={book.name} />
                    ) : (
                      <div className={styles.placeholder}>No Image</div>
                    )}
                    {book.isBestseller && (
                      <span className={styles.bestsellerBadge}>Bestseller</span>
                    )}
                  </div>
                  <div className={styles.bookInfo}>
                    <h3>{book.name}</h3>
                    <p className={styles.author}>by {book.author || 'Unknown Author'}</p>
                    <p className={styles.category}>{book.category}</p>
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>£{book.price}</span>
                      {book.originalPrice && book.originalPrice > book.price && (
                        <span className={styles.originalPrice}>£{book.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <button className={styles.addToCartBtn}>Add to Cart</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bestsellers