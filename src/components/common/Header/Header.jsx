import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { useAuth } from '../../../contexts/AuthContext'
import Navbar from './Navbar'
import styles from './Header.module.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getCartItemsCount } = useCart()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>AVR Craft</span>
          <span className={styles.logoSubtitle}>Artisan Excellence</span>
        </Link>

        {/* Navigation */}
        <Navbar />

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.actionBtn} title="Search">
            <Search size={20} />
          </button>
          
          <button className={styles.actionBtn} title="Wishlist">
            <Heart size={20} />
            <span className={styles.cartBadge}>3</span>
          </button>
          
          {user ? (
            <div className={styles.userDropdown}>
              <button className={styles.actionBtn} title="Account">
                <User size={20} />
              </button>
              <div className={styles.userMenu}>
                <span className={styles.userGreeting}>Hello, {user.name}</span>
                <Link to="/profile" className={styles.userMenuItem}>Profile</Link>
                <Link to="/orders" className={styles.userMenuItem}>My Orders</Link>
                <button onClick={handleLogout} className={styles.userMenuItem}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className={styles.actionBtn} title="Login">
              <User size={20} />
            </Link>
          )}
          
          <Link to="/cart" className={styles.actionBtn} title="Cart">
            <ShoppingCart size={20} />
            <span className={styles.cartBadge}>{getCartItemsCount()}</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <Navbar />
            <div className={styles.mobileActions}>
              {user ? (
                <>
                  <span className={styles.mobileUser}>Welcome, {user.name}</span>
                  <Link to="/profile" className={styles.mobileNavLink}>Profile</Link>
                  <Link to="/orders" className={styles.mobileNavLink}>My Orders</Link>
                  <button onClick={handleLogout} className={styles.mobileNavLink}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={styles.mobileNavLink}>Login</Link>
                  <Link to="/register" className={styles.mobileNavLink}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header