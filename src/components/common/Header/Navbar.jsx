import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import styles from './Header.module.css'

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const location = useLocation()

  const categories = [
    { name: 'Traditional Paintings', path: '/shop?category=paintings' },
    { name: 'Handmade Jewelry', path: '/shop?category=jewelry' },
    { name: 'Spiritual Decor', path: '/shop?category=decor' },
    { name: 'Home & Living', path: '/shop?category=home' },
  ]

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className={styles.nav}>
      <Link 
        to="/" 
        className={`${styles.navLink} ${isActiveLink('/') ? styles.active : ''}`}
      >
        Home
      </Link>
      
      {/* Shop with Dropdown */}
      <div 
        className={styles.dropdown}
        onMouseEnter={() => setActiveDropdown('shop')}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <button className={`${styles.navLink} ${styles.dropdownToggle} ${isActiveLink('/shop') ? styles.active : ''}`}>
          Shop <ChevronDown size={16} />
        </button>
        
        {activeDropdown === 'shop' && (
          <div className={styles.dropdownMenu}>
            <Link to="/shop" className={styles.dropdownItem}>
              All Products
            </Link>
            <div className={styles.dropdownDivider}></div>
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={category.path} 
                className={styles.dropdownItem}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link 
        to="/about" 
        className={`${styles.navLink} ${isActiveLink('/about') ? styles.active : ''}`}
      >
        About
      </Link>
      
      <Link 
        to="/contact" 
        className={`${styles.navLink} ${isActiveLink('/contact') ? styles.active : ''}`}
      >
        Contact
      </Link>

      {/* Artisan Collections */}
      <div 
        className={styles.dropdown}
        onMouseEnter={() => setActiveDropdown('artisan')}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <button className={`${styles.navLink} ${styles.dropdownToggle}`}>
          Artisan Collections <ChevronDown size={16} />
        </button>
        
        {activeDropdown === 'artisan' && (
          <div className={styles.dropdownMenu}>
            <Link to="/artisans" className={styles.dropdownItem}>
              Featured Artisans
            </Link>
            <Link to="/techniques" className={styles.dropdownItem}>
              Traditional Techniques
            </Link>
            <div className={styles.dropdownDivider}></div>
            <span className={styles.dropdownLabel}>Eco-friendly Textiles</span>
            <Link to="/collections/3d" className={styles.dropdownItem}>
              3D Collections
            </Link>
            <Link to="/collections/winners" className={styles.dropdownItem}>
              Award Winners
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar