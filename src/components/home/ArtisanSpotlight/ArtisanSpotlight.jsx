import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import ArtisanCard from './ArtisanCard'
import styles from './ArtisanSpotlight.module.css'

const ArtisanSpotlight = () => {
  const [featuredArtisans, setFeaturedArtisans] = useState([])
  const [loading, setLoading] = useState(true)

  // Firebase se featured artisans fetch karo
  useEffect(() => {
    const fetchFeaturedArtisans = async () => {
      try {
        setLoading(true)
        
        const artisansQuery = query(
          collection(db, 'artisans'),
          where('isActive', '==', true),
          where('isFeatured', '==', true),
          orderBy('rating', 'desc'),
          limit(4)
        )

        const querySnapshot = await getDocs(artisansQuery)
        const artisansList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setFeaturedArtisans(artisansList)

      } catch (error) {
        console.error('Firebase se artisans fetch karne mein error:', error)
        setFeaturedArtisans([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedArtisans()
  }, [])

  if (loading) {
    return (
      <section className={styles.artisanSpotlight}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <span>Loading...</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.artisanSpotlight}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.sectionTitle}>
              Gallery
            </h2>
            <p className={styles.sectionSubtitle}>
              Explore our unique handcrafts and catering collection
            </p>
          </div>
          
          {featuredArtisans.length > 0 && (
            <Link to="/artisans" className={styles.viewAllLink}>
              View All
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {/* Featured Artisans Grid */}
        {featuredArtisans.length > 0 ? (
          <div className={styles.artisansGrid}>
            {featuredArtisans.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No featured artisans available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default ArtisanSpotlight