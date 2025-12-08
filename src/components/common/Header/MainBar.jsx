import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { useAuth } from '../../../contexts/AuthContext'
import { useSearch } from '../../../contexts/SearchContext'
import styles from './Header.module.css'

const MainBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [debounced, setDebounced] = useState(localSearch)
  const { getProductQuantity } = useCart()
  const { user } = useAuth()
  const { searchQuery, setSearchQuery } = useSearch()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest(`.${styles.mobileMenuButton}`)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Track if the search was initiated by user input
  const isUserInputRef = useRef(false)

  // Sync incoming global search, but only if it's not from user input
  useEffect(() => {
    if (!isUserInputRef.current) {
      setLocalSearch(searchQuery || '')
    }
  }, [searchQuery])

  // debounce localSearch -> debounced
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(localSearch.trim())
      isUserInputRef.current = true
    }, 300)
    return () => clearTimeout(t)
  }, [localSearch])

  // auto navigate when debounced changes
  useEffect(() => {
    if (!debounced || !isUserInputRef.current) return
    
    setSearchQuery(debounced)
    navigate('/shop?search=' + encodeURIComponent(debounced), { replace: true })
    
    // Reset the flag after handling the update
    isUserInputRef.current = false
  }, [debounced, navigate, setSearchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const q = localSearch.trim()
    if (!q) return
    setSearchQuery(q)
    navigate('/shop?search=' + encodeURIComponent(q))
    setIsSearchOpen(false)
  }

  const handleSearchChange = (e) => setLocalSearch(e.target.value)

  const handleSearchToggle = () => {
    setIsSearchOpen(prev => {
      const next = !prev
      if (next) {
        setTimeout(() => inputRef.current?.focus(), 0)
      } else {
        setLocalSearch('')
        setSearchQuery('')
      }
      return next
    })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  // Book-specific mobile nav items
  const mobileNavItems = [
    { path: '/bestsellers', label: 'Bestsellers' },
    { path: '/fiction', label: 'Fiction' },
    { path: '/non-fiction', label: 'Non-Fiction' },
    { path: '/childrens', label: "Children's Books" },
    { path: '/stationery', label: 'Stationery' },
    { path: '/gifts', label: 'Gifts' },
    { path: '/admin', label: 'My Account' }
  ]

  return (
    <div className={styles.mainBar}>
      <div className={styles.mainBarContainer}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          AVR Crafts
        </Link>

        {/* Search area */}
        <div className={`${styles.searchContainer} ${isSearchOpen ? styles.active : ''}`}>
          <form
            onSubmit={handleSearchSubmit}
            className={styles.searchBar}
            role="search"
            aria-label="Site search"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search books, authors, categories..."
              className={styles.searchInput}
              value={localSearch}
              onChange={handleSearchChange}
              aria-label="Search books"
            />
            <button type="submit" className={styles.searchButton} aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          {/* Search Toggle for small screens */}
          <button
            className={styles.searchToggle}
            onClick={handleSearchToggle}
            aria-pressed={isSearchOpen}
            aria-label="Toggle search"
            title="Search"
          >
            {isSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {/* Right actions */}
        <div className={styles.mainBarActions}>
          <div className={styles.accountSection}>
            {user ? (
              <Link to="/admin" className={styles.accountLink}>
                <span className={styles.accountIcon} aria-hidden>👤</span>
                <span className={styles.accountText}>Hi, {user.displayName || user.email}</span>
              </Link>
            ) : (
              <Link to="/login" className={styles.accountLink}>
                <span className={styles.accountIcon} aria-hidden>👤</span>
                <span className={styles.accountText}>Sign In</span>
              </Link>
            )}
          </div>

          <Link to="/cart" className={styles.basketLink} aria-label="View cart">
            <ShoppingBag size={18} />
            <span className={styles.basketText}>CART</span>
            <span className={styles.basketCount}>({getProductQuantity()})</span>
          </Link>

          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Delivery Banner - Updated for UK */}
      <div className={styles.deliveryBanner}>
        Free delivery on orders over £30, otherwise £3.99
      </div>

      {/* Mobile nav - Fixed with ref and className */}
      <div 
        ref={mobileMenuRef}
        className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}
      >
        <nav className={styles.mobileNavInner} aria-label="Mobile menu">
          {mobileNavItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {/* Admin link for admin users */}
          {user && user.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`${styles.mobileNavLink} ${styles.adminLink}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Panel
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}

export default MainBar