import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import styles from './Hero.module.css'

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}>
        <div className={styles.heroOverlay}></div>
      </div>
      
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <div className={styles.badge}>
            <span className={styles.badgeText}>AMAZING DISCOUNTS ON HANDICRAFTS TODAY!</span>
          </div>
          
          <h1 className={styles.heroTitle}>
            AVR Crafts LLP
            <span className={styles.highlight}> Explore Unique Handcrafts and Clothing</span>
          </h1>
          
          <p className={styles.heroDescription}>
            Discover our unique handcrafts and catering collection featuring traditional 
            artisan products, ethnic wears, and exclusive books.
          </p>
          
          <div className={styles.heroActions}>
            <Link to="/shop" className={styles.primaryButton}>
              Start Shopping
              <ArrowRight size={20} />
            </Link>
            
            <Link to="/about" className={styles.secondaryButton}>
              <Play size={20} />
              Discover More
            </Link>
          </div>
          
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>150+</span>
              <span className={styles.statLabel}>Customer favorites</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>15+</span>
              <span className={styles.statLabel}>Trusted by many</span>
            </div>
          </div>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.floatingCard}>
            <div className={styles.cardContent}>
              <span className={styles.cardBadge}>BESTSELLER</span>
              <h3 className={styles.cardTitle}>Stop Letting Everything Affect You</h3>
              <p className={styles.cardText}>₹12.00</p>
            </div>
          </div>
          
          <div className={styles.productShowcase}>
            <div className={styles.showcaseItem}>
              <div className={styles.itemImage}></div>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>The Banerji Protocols</span>
                <span className={styles.itemPrice}>₹35.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero