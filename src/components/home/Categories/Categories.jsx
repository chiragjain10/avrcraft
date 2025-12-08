import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import styles from './Categories.module.css'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        // Query to get only active categories
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('isActive', '==', true),
          orderBy('name', 'asc')
        )

        const querySnapshot = await getDocs(categoriesQuery)
        const categoriesData = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || data.categoryName || 'Unnamed Category',
            description: data.description || '',
            image: data.image || data.imageUrl || data.coverImage || '',
            isNew: data.isNew || false,
            isActive: data.isActive || true,
            slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
            productCount: data.productCount || 0
          }
        })
        
        console.log('Loaded categories:', categoriesData)
        setCategories(categoriesData)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories. Please try again later.')
        // Fallback categories
        setCategories([
          { id: 'crime', name: 'Crime & Thriller', image: '', isNew: true },
          { id: 'self-help', name: 'Self-Help', image: '', isNew: false },
          { id: 'childrens', name: 'Children', image: '', isNew: true },
          { id: 'poetry', name: 'Poetry', image: '', isNew: false },
          { id: 'trading', name: 'Trading', image: '', isNew: true },
          { id: 'health', name: 'Health', image: '', isNew: false },
          { id: 'wealth', name: 'Wealth', image: '', isNew: false },
          { id: 'hindi', name: 'Hindi', image: '', isNew: false },
          { id: 'spirituality', name: 'Spirituality', image: '', isNew: true },
          { id: 'romance', name: 'Romance', image: '', isNew: false },
          { id: 'business', name: 'Business', image: '', isNew: false },
          { id: 'fiction', name: 'Fiction', image: '', isNew: true }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Handle category click
  const handleCategoryClick = (categoryId, categoryName) => {
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-')
    navigate(`/shop?category=${categoryId}&categoryName=${slug}`)
  }

  // Loading state
  if (loading) {
    return (
      <section className={styles.categories}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>SHOP BY CATEGORIES</h2>
          </div>

          <div className={styles.categoriesGrid}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={styles.categoryCardLoading}>
                <div className={styles.imageSkeleton}></div>
                <div className={styles.titleSkeleton}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error && categories.length === 0) {
    return (
      <section className={styles.categories}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>SHOP BY CATEGORIES</h2>
          </div>

          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.categories}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>SHOP BY CATEGORIES</h2>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <div
              key={category.id}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(category.id, category.name)}
              title={category.description || `Browse ${category.name}`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleCategoryClick(category.id, category.name)}
            >
              <div
                className={styles.cardImage}
                style={{
                  backgroundImage: category.image
                    ? `url("${category.image}")`
                    : `linear-gradient(135deg, var(--admin-primary), var(--admin-accent))`
                }}
              >
                <div className={styles.imageOverlay}></div>
                <div className={styles.cardContent}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  {category.isNew && <span className={styles.newBadge}>New</span>}
                  {category.productCount > 0 && (
                    <span className={styles.productCount}>{category.productCount} products</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories