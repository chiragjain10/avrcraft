// src/pages/NonFiction/NonFiction.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../utils/firebase/config'
import styles from './NonFiction.module.css'

const NonFiction = () => {
  const [nonFictionBooks, setNonFictionBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNonFictionBooks = async () => {
      try {
        const q = query(collection(db, 'products'), where('isNonFiction', '==', true))
        const querySnapshot = await getDocs(q)
        const booksData = []
        querySnapshot.forEach((doc) => {
          booksData.push({ id: doc.id, ...doc.data() })
        })
        setNonFictionBooks(booksData)
      } catch (error) {
        console.error("Error fetching non-fiction books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNonFictionBooks()
  }, [])

  return (
    <div className={styles.nonFictionPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Non-Fiction</h1>
          <p className={styles.subtitle}>Discover knowledge, insights, and real stories</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading non-fiction books...</div>
        ) : (
          <div className={styles.booksGrid}>
            {nonFictionBooks.map(book => (
              <div key={book.id} className={styles.bookCard}>
                <Link to={`/product/${book.id}`}>
                  <div className={styles.imageContainer}>
                    {book.images?.[0] ? (
                      <img src={book.images[0]} alt={book.name} />
                    ) : (
                      <div className={styles.placeholder}>No Image</div>
                    )}
                  </div>
                  <div className={styles.bookInfo}>
                    <h3>{book.name}</h3>
                    <p className={styles.author}>by {book.author || 'Unknown Author'}</p>
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

export default NonFiction