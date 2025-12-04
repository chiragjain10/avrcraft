import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config' 
import styles from './Categories.module.css'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Query to get only active categories, ordered by name
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name', 'asc'))
        
        const querySnapshot = await getDocs(categoriesQuery)
        const categoriesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Category Data:', data); // Debug log
          return {
            id: doc.id,
            ...data,
            // Generate SEO-friendly path from category name
            path: `/${data.name.toLowerCase().replace(/\s+/g, '-')}`
          }
        })
        
        console.log('All Categories:', categoriesData); // Debug log
        setCategories(categoriesData)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Loading state
  if (loading) {
    return (
      <section className={styles.categories}>
        <div className={styles.container}>
          {/* Section Header - SHOP BY CATEGORIES */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>SHOP BY CATEGORIES</h2>
          </div>
          
          {/* Loading skeleton for cards */}
          <div className={styles.categoriesGrid}>
            {[...Array(12)].map((_, index) => (
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
  if (error) {
    return (
      <section className={styles.categories}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>SHOP BY CATEGORIES</h2>
          </div>
          
          <div className={styles.errorMessage}>
            <p>Unable to load categories. Please try again later.</p>
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <section className={styles.categories}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>SHOP BY CATEGORIES</h2>
          </div>
          
          <div className={styles.emptyMessage}>
            <p>No categories available at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.categories}>
      <div className={styles.container}>
        {/* Section Header - SHOP BY CATEGORIES */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>SHOP BY CATEGORIES</h2>
        </div>
        
        {/* Categories Grid - Screenshot style */}
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={category.path} 
              className={styles.categoryCard}
              title={category.description || `Browse ${category.name}`}
            >
              {/* Card Background Image - Using 'image' field from Firestore */}
              <div 
                className={styles.cardImage}
                style={{
                  backgroundImage: category.image 
                    ? `url("${category.image}")` 
                    : category.imageUrl
                    ? `url("${category.imageUrl}")`
                    : `linear-gradient(135deg, var(--admin-primary), var(--admin-accent))`
                }}
              >
                {/* Overlay Gradient */}
                <div className={styles.imageOverlay}></div>
                
                {/* Category Name */}
                <div className={styles.cardContent}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  {category.isNew && <span className={styles.newBadge}>New</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories