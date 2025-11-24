import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import styles from './StatsCard.module.css'

const StatsCard = ({ title, value, icon: Icon, color, change, trend }) => {
  return (
    <div className={`${styles.statsCard} ${styles[color]}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <Icon size={24} />
        </div>
        <div className={styles.changeIndicator}>
          {trend === 'up' ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span className={styles.changeText}>{change}</span>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.cardValue}>{value}</h3>
        <p className={styles.cardTitle}>{title}</p>
      </div>
      
      <div className={styles.cardBackground}></div>
    </div>
  )
}

export default StatsCard