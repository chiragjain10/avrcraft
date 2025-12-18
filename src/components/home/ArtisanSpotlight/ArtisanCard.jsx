import React from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, ArrowRight  } from 'lucide-react'
import styles from './ArtisanSpotlight.module.css'

const ArtisanCard = ({ artisan }) => {
  return (
    <div className={styles.artisanCard}>
      {/* Card Image */}
      <div className={styles.cardImage}>
        <div 
          className={styles.imagePlaceholder}
          style={{
            backgroundImage: artisan.imageUrl ? `url(${artisan.imageUrl})` : 'none',
            backgroundColor: artisan.imageUrl ? 'transparent' : '#f0f0f0'
          }}
        >
          {!artisan.imageUrl && <div className={styles.imageFallback}>AP</div>}
        </div>
        
        {/* Rating Badge */}
        <div className={styles.ratingBadge}>
          <Star size={14} />
          <span>{artisan.rating || '4.5'}</span>
        </div>
      </div>
      
      {/* Card Content */}
      <div className={styles.cardContent}>
        <div className={styles.contentHeader}>
          <h3 className={styles.artisanName}>{artisan.name}</h3>
          <div className={styles.artisanLocation}>
            <MapPin size={14} />
            <span>{artisan.location}</span>
          </div>
        </div>
        
        <div className={styles.artisanCraft}>
          <span className={styles.craftTitle}>{artisan.craft}</span>
          <span className={styles.experience}>
            <Clock size={12} />
            {artisan.experience || '10+ years'}
          </span>
        </div>
        
        {artisan.specialty && (
          <p className={styles.artisanSpecialty}>
            <strong>Specialty:</strong> {artisan.specialty}
          </p>
        )}
        
        {artisan.story && (
          <p className={styles.artisanStory}>
            {artisan.story.length > 100 ? `${artisan.story.substring(0, 100)}...` : artisan.story}
          </p>
        )}
        
        {/* Products Count */}
        {artisan.productsCount && (
          <div className={styles.productsCount}>
            <span>{artisan.productsCount}+ Products</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <Link to={`/artisans/${artisan.id}`} className={styles.viewProfileLink}>
          View Profile
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default ArtisanCard