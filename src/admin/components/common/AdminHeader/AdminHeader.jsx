import React, { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Menu,
  Sun,
  Moon
} from 'lucide-react'
import { useAdmin } from '../../../contexts/AdminContext'
import { useAuth } from '../../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import styles from './AdminHeader.module.css'

const AdminHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  
  const { toggleSidebar, sidebarOpen, notifications, clearNotification } = useAdmin()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const notificationsRef = useRef(null)
  const userMenuRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // Implement dark mode logic
    document.body.classList.toggle('dark-mode')
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button 
          onClick={toggleSidebar}
          className={styles.menuButton}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products, orders, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </form>
      </div>

      <div className={styles.headerRight}>
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className={styles.themeButton}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className={styles.notificationsContainer} ref={notificationsRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={styles.notificationButton}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className={styles.notificationBadge}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationsDropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => notifications.forEach(notif => clearNotification(notif.id))}
                    className={styles.clearAllButton}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className={styles.notificationsList}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className={styles.notificationItem}>
                      <div className={styles.notificationContent}>
                        <p className={styles.notificationMessage}>
                          {notification.message}
                        </p>
                        <span className={styles.notificationTime}>
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => clearNotification(notification.id)}
                        className={styles.notificationClose}
                        aria-label="Dismiss notification"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.noNotifications}>
                    <Bell size={32} />
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className={styles.userMenuContainer} ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={styles.userButton}
            aria-label="User menu"
          >
            <div className={styles.userAvatar}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} />
              ) : (
                <User size={20} />
              )}
            </div>
            <span className={styles.userName}>
              {user?.displayName || 'Admin User'}
            </span>
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatarLarge}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userNameLarge}>
                    {user?.displayName || 'Admin User'}
                  </span>
                  <span className={styles.userEmail}>
                    {user?.email || 'admin@avrcrafts.com'}
                  </span>
                </div>
              </div>
              
              <div className={styles.dropdownMenu}>
                <button className={styles.menuItem}>
                  <User size={16} />
                  <span>Profile Settings</span>
                </button>
                
                <button className={styles.menuItem}>
                  <Sun size={16} />
                  <span>Appearance</span>
                </button>
                
                <hr className={styles.divider} />
                
                <button 
                  onClick={handleLogout}
                  className={`${styles.menuItem} ${styles.logoutItem}`}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader