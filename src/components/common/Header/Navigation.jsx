import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Header.module.css'

const navigationItems = [
  { id: 'bestsellers', name: 'BESTSELLERS', path: '/bestsellers' },
  { id: 'fiction', name: 'FICTION', path: '/fiction' },
  { id: 'non-fiction', name: 'NON-FICTION', path: '/non-fiction' },
  { id: 'childrens', name: "CHILDREN'S BOOKS", path: '/childrens' },
  { id: 'stationery', name: 'STATIONERY', path: '/stationery' },
  { id: 'gifts', name: 'GIFTS', path: '/gifts' }
]

const Navigation = () => {
  const location = useLocation()

  const isActiveLink = (path) => location.pathname.startsWith(path)

  return (
    <nav className={styles.navigation} aria-label="Main navigation">
      <div className={styles.navContainer}>
        {navigationItems.map(item => (
          <div key={item.id} className={styles.navItem}>
            <Link
              to={item.path}
              className={`${styles.navLink} ${isActiveLink(item.path) ? styles.active : ''}`}
            >
              {item.name}
            </Link>
          </div>
        ))}
      </div>
    </nav>
  )
}

export default Navigation