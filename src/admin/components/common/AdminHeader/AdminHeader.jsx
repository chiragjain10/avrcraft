import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AdminHeader.module.css';

const AdminHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  const { toggleSidebar, sidebarOpen, notifications, clearNotification } = useAdmin();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Set initial dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search query when changing routes
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Debounced search function
  const handleSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        // Implement search functionality based on current route
        const path = location.pathname.toLowerCase();
        
        if (path.includes('products')) {
          // Search products
          console.log('Searching products for:', query);
        } else if (path.includes('orders')) {
          // Search orders
          console.log('Searching orders for:', query);
        } else if (path.includes('users')) {
          // Search users
          console.log('Searching users for:', query);
        }
      }
    }, 500);
  }, [location.pathname]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const clearAllNotifications = () => {
    notifications.forEach(notification => {
      clearNotification(notification.id);
    });
  };

  const navigateToProfile = () => {
    navigate('/admin/profile');
    setShowUserMenu(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button 
          onClick={toggleSidebar}
          className={styles.menuButton}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu size={20} />
        </button>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }} 
          className={styles.searchForm}
        >
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={
                location.pathname.includes('products') ? "Search products..." :
                location.pathname.includes('orders') ? "Search orders..." :
                location.pathname.includes('users') ? "Search users..." :
                "Search..."
              }
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
              aria-label="Search"
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
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className={styles.notificationsContainer} ref={notificationsRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={styles.notificationButton}
            aria-label={`${notifications.length} unread notifications`}
            aria-expanded={showNotifications}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className={styles.notificationBadge} aria-hidden="true">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              className={styles.notificationsDropdown}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="notifications-button"
            >
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className={styles.clearAllButton}
                    aria-label="Clear all notifications"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className={styles.notificationsList}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`${styles.notificationItem} ${notification.read ? '' : styles.unread}`}
                      role="menuitem"
                    >
                      <div className={styles.notificationContent}>
                        <p className={styles.notificationMessage}>
                          {notification.message}
                        </p>
                        <span className={styles.notificationTime}>
                          {new Date(notification.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className={styles.notificationClose}
                        aria-label={`Dismiss notification: ${notification.message}`}
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
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className={styles.userButton}
            aria-label="User menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className={styles.userAvatar}>
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  width={32}
                  height={32}
                />
              ) : (
                <User size={20} />
              )}
            </div>
            <span className={styles.userName}>
              {user?.displayName || 'Admin User'}
            </span>
          </button>

          {showUserMenu && (
            <div 
              className={styles.userDropdown}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
            >
              <div className={styles.userInfo}>
                <div className={styles.userAvatarLarge}>
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'}
                      width={48}
                      height={48}
                    />
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
                <button 
                  onClick={navigateToProfile}
                  className={styles.menuItem}
                  role="menuitem"
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </button>
                
                <button 
                  onClick={toggleDarkMode}
                  className={styles.menuItem}
                  role="menuitem"
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>Switch to {darkMode ? 'Light' : 'Dark'} Mode</span>
                </button>
                
                <hr className={styles.divider} />
                
                <button 
                  onClick={handleLogout}
                  className={`${styles.menuItem} ${styles.logoutItem}`}
                  role="menuitem"
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
  );
};

export default React.memo(AdminHeader);