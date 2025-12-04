// src/pages/Childrens/Childrens.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../utils/firebase/config'
import styles from './Childrens.module.css'

const Childrens = () => {
  const [childrensBooks, setChildrensBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChildrensBooks = async () => {
      try {
        const q = query(collection(db, 'products'), where('isChildrens', '==', true))
        const querySnapshot = await getDocs(q)
        const booksData = []
        querySnapshot.forEach((doc) => {
          booksData.push({ id: doc.id, ...doc.data() })
        })
        setChildrensBooks(booksData)
      } catch (error) {
        console.error("Error fetching children's books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChildrensBooks()
  }, [])

  return (
    <div className={styles.childrensPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Children's Books</h1>
          <p className={styles.subtitle}>Wonderful stories for young readers</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading children's books...</div>
        ) : (
          <div className={styles.booksGrid}>
            {childrensBooks.map(book => (
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

export default Childrens