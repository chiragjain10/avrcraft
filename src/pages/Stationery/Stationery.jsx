// src/pages/Stationery/Stationery.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../utils/firebase/config'
import styles from './Stationery.module.css'

const Stationery = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  const categories = [
    { id: 'all', name: 'All Stationery' },
    { id: 'writing', name: 'Writing Instruments' },
    { id: 'notebooks', name: 'Notebooks & Journals' },
    { id: 'desk', name: 'Desk Accessories' },
    { id: 'art', name: 'Art Supplies' },
    { id: 'gift', name: 'Stationery Gifts' }
  ]

  useEffect(() => {
    const fetchStationery = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'))
        const productsData = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (doc.data().isStationery) {
            productsData.push({ id: doc.id, ...data })
          }
        })
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error("Error fetching stationery:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStationery()
  }, [])

  const handleFilter = (categoryId) => {
    setActiveFilter(categoryId)
    if (categoryId === 'all') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product => 
        product.isStationery === categoryId || product.tags?.includes(categoryId)
      )
      setFilteredProducts(filtered)
    }
  }

  return (
    <div className={styles.stationeryPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Stationery</h1>
          <p className={styles.subtitle}>Beautiful writing instruments, journals, and desk essentials</p>
        </div>

        {/* Category Filter */}
        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.filterBtn} ${activeFilter === category.id ? styles.active : ''}`}
              onClick={() => handleFilter(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}>Loading stationery...</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.noProducts}>
            <p>No stationery products found in this category.</p>
            <button 
              className={styles.viewAllBtn}
              onClick={() => handleFilter('all')}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {filteredProducts.map(product => (
              <div key={product.id} className={styles.productCard}>
                <Link to={`/product/${product.id}`}>
                  <div className={styles.imageContainer}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className={styles.placeholder}>No Image</div>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{product.name}</h3>
                    <p className={styles.description}>
                      {product.description || 'Premium stationery item'}
                    </p>
                    {product.isStationery && (
                      <span className={styles.type}>{product.type}</span>
                    )}
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>£{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className={styles.originalPrice}>£{product.originalPrice}</span>
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

export default Stationery