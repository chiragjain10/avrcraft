import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Award, MapPin, Users, Clock, ArrowRight, Leaf, Zap, BookOpen } from 'lucide-react'
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
        
        // Firebase query for featured artisans
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

        // Agar koi artisans nahi mile toh fallback data
        if (artisansList.length === 0) {
          setFeaturedArtisans(getFallbackArtisans())
        } else {
          setFeaturedArtisans(artisansList)
        }

      } catch (error) {
        console.error('Firebase se artisans fetch karne mein error:', error)
        setFeaturedArtisans(getFallbackArtisans())
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedArtisans()
  }, [])

  // Fallback artisans data
  const getFallbackArtisans = () => [
    {
      id: '1',
      name: 'Rajesh Kumar',
      location: 'Varanasi, Uttar Pradesh',
      craft: 'Banarasi Silk Weaving',
      experience: '25 years',
      specialty: 'Traditional Silk Sarees',
      rating: 4.9,
      productsCount: 150,
      imageUrl: '/images/artisans/rajesh.jpg',
      story: 'Third-generation weaver preserving ancient Banarasi silk techniques',
      awards: ['National Craft Award 2022', 'Heritage Weaver Recognition'],
      techniques: ['Kadhwa', 'Jangla', 'Tanchoi'],
      isFeatured: true,
      isActive: true
    },
    {
      id: '2',
      name: 'Priya Sharma',
      location: 'Madhubani, Bihar',
      craft: 'Madhubani Painting',
      experience: '15 years',
      specialty: 'Mythological Art',
      rating: 4.8,
      productsCount: 89,
      imageUrl: '/images/artisans/priya.jpg',
      story: 'Reviving traditional Mithila art with contemporary themes',
      awards: ['Women Artisan Excellence'],
      techniques: ['Bharni', 'Kachni'],
      isEcoFriendly: true,
      isActive: true
    }
  ]

  const artisanStats = [
    { icon: Users, number: '150+', label: 'Happy Customers' },
    { icon: MapPin, number: '15+', label: 'Trusted by many' },
    { icon: Clock, number: '50+', label: 'Quality Products' },
    { icon: Award, number: '100+', label: '5 Star Ratings' }
  ]

  if (loading) {
    return (
      <section className={styles.artisanSpotlight}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading featured artisans...</div>
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
            <div className={styles.sectionBadge}>
              <Award size={16} />
              <span>Featured Artisans</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Gallery
            </h2>
            <p className={styles.sectionSubtitle}>
              Explore our unique handcrafts and catering collection
            </p>
          </div>
          
          <Link to="/artisans" className={styles.viewAllLink}>
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Artisan Statistics */}
        <div className={styles.artisanStats}>
          {artisanStats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statIcon}>
                <stat.icon size={24} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Artisans Grid */}
        <div className={styles.artisansGrid}>
          {featuredArtisans.map((artisan) => (
            <ArtisanCard key={artisan.id} artisan={artisan} />
          ))}
        </div>

        {/* Craft Heritage Section */}
        <div className={styles.heritageSection}>
          <div className={styles.heritageContent}>
            <h3 className={styles.heritageTitle}>
              HANDICRAFT
            </h3>
            <p className={styles.heritageDescription}>
              Discover the beauty of traditional craftsmanship combined with modern design. 
              Each piece in our collection represents hours of dedicated work by skilled artisans 
              who preserve India's rich cultural heritage.
            </p>
            <div className={styles.heritageFeatures}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Leaf size={20} />
                </div>
                <span>Eco-friendly Materials</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Zap size={20} />
                </div>
                <span>Fast Shipping</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <BookOpen size={20} />
                </div>
                <span>Quality Assurance</span>
              </div>
            </div>
          </div>
          
          <div className={styles.heritageVisual}>
            <div className={styles.craftTimeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <span className={styles.timelineText}>Traditional Techniques</span>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <span className={styles.timelineText}>Skilled Artisans</span>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <span className={styles.timelineText}>Quality Products</span>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <span className={styles.timelineText}>Customer Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ArtisanSpotlight