import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import styles from './Categories.module.css'

const CategoryCard = ({ category }) => {
  const IconComponent = category.icon

  return (
    <Link to={category.path} className={styles.categoryCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <IconComponent size={24} />
        </div>
        <span className={styles.itemsCount}>{category.itemsCount || '0 Products'}</span>
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.categoryName}>{category.name}</h3>
        <p className={styles.categoryDescription}>{category.description}</p>
      </div>
      
      <div className={styles.cardFooter}>
        <span className={styles.shopLink}>
          Shop Now
          <ArrowRight size={16} />
        </span>
      </div>
      
      <div className={styles.cardHoverEffect}></div>
    </Link>
  )
}

export default CategoryCard