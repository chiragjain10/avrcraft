import React, { useState } from 'react'
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
  const [activeDropdown, setActiveDropdown] = useState(null)
  const location = useLocation()

  const isActiveLink = (path) => location.pathname === path

  return (
    <nav className={styles.navigation} aria-label="Secondary navigation">
      <div className={styles.navContainer}>
        {navigationItems.map(item => (
          <div
            key={item.id}
            className={styles.navItem}
            onMouseEnter={() => setActiveDropdown(item.id)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link
              to={item.path}
              className={`${styles.navLink} ${isActiveLink(item.path) ? styles.active : ''}`}
            >
              {item.name}
            </Link>

            {activeDropdown === item.id && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownContent}>
                  <Link to={`${item.path}/featured`} className={styles.dropdownLink}>Featured</Link>
                  <Link to={`${item.path}/new`} className={styles.dropdownLink}>New Releases</Link>
                  <Link to={`${item.path}/bestsellers`} className={styles.dropdownLink}>Bestsellers</Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}

export default Navigation
