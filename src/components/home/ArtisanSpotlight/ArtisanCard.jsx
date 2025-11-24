import React from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Award, Leaf, ArrowRight, Clock, Trophy } from 'lucide-react'
import styles from './ArtisanSpotlight.module.css'

const ArtisanCard = ({ artisan }) => {
  return (
    <div className={styles.artisanCard}>
      {/* Card Header with Image */}
      <div className={styles.cardHeader}>
        <div className={styles.artisanImage}>
          <div className={styles.imagePlaceholder}></div>
          
          {/* Badges */}
          <div className={styles.artisanBadges}>
            {artisan.isFeatured && (
              <span className={styles.featuredBadge}>
                <Award size={12} />
                Featured
              </span>
            )}
            {artisan.isEcoFriendly && (
              <span className={styles.ecoBadge}>
                <Leaf size={12} />
                Eco
              </span>
            )}
            {artisan.isBestRated && (
              <span className={styles.ratedBadge}>
                <Star size={12} />
                Top Rated
              </span>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={styles.stat}>
            <Star className={styles.starIcon} size={14} />
            <span>{artisan.rating}</span>
          </div>
          <div className={styles.stat}>
            <span>{artisan.productsCount}+</span>
            <span>Products</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.artisanName}>{artisan.name}</h3>
        
        <div className={styles.artisanLocation}>
          <MapPin size={14} />
          <span>{artisan.location}</span>
        </div>
        
        <div className={styles.artisanCraft}>
          <span className={styles.craftTitle}>{artisan.craft}</span>
          <span className={styles.experience}>
            <Clock size={12} />
            {artisan.experience} experience
          </span>
        </div>
        
        <p className={styles.artisanSpecialty}>
          Specializes in: <strong>{artisan.specialty}</strong>
        </p>
        
        <p className={styles.artisanStory}>
          {artisan.story}
        </p>

        {/* Techniques */}
        <div className={styles.techniques}>
          <span className={styles.techniquesLabel}>Techniques:</span>
          <div className={styles.techniqueTags}>
            {artisan.techniques.map((technique, index) => (
              <span key={index} className={styles.techniqueTag}>
                {technique}
              </span>
            ))}
          </div>
        </div>

        {/* Awards */}
        {artisan.awards && artisan.awards.length > 0 && (
          <div className={styles.awards}>
            <span className={styles.awardsLabel}>
              <Trophy size={12} />
              Awards:
            </span>
            <div className={styles.awardList}>
              {artisan.awards.map((award, index) => (
                <span key={index} className={styles.awardItem}>
                  <Award size={12} />
                  {award}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <Link to={`/artisans/${artisan.id}`} className={styles.viewProfileLink}>
          View Full Profile
          <ArrowRight size={16} />
        </Link>
        <Link to={`/shop?artisan=${artisan.id}`} className={styles.viewProductsLink}>
          View Products
        </Link>
      </div>
    </div>
  )
}

export default ArtisanCard