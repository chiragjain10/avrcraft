import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  FileText, 
  ShoppingCart, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAdmin } from '../../../contexts/AdminContext'
import styles from './AdminSidebar.module.css'

const AdminSidebar = () => {
  const { sidebarOpen, toggleSidebar } = useAdmin()
  const location = useLocation()

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/admin/products',
      icon: Package,
      label: 'Products',
      exact: false
    },
    {
      path: '/admin/categories',
      icon: FolderOpen,
      label: 'Categories',
      exact: false
    },
    {
      path: '/admin/blogs',
      icon: FileText,
      label: 'Blogs',
      exact: false
    },
    {
      path: '/admin/orders',
      icon: ShoppingCart,
      label: 'Orders',
      exact: false
    },
    {
      path: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics',
      exact: false
    },
    {
      path: '/admin/settings',
      icon: Settings,
      label: 'Settings',
      exact: false
    }
  ]

  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.collapsed}`}>
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        {sidebarOpen && (
          <div className={styles.logo}>
            <div className={styles.logoIcon}>AC</div>
            <span className={styles.logoText}>AVR Crafts Admin</span>
          </div>
        )}
        
        <button 
          onClick={toggleSidebar}
          className={styles.toggleButton}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
            
            return (
              <li key={item.path} className={styles.menuItem}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `${styles.menuLink} ${isActive ? styles.active : ''}`
                  }
                  end={item.exact}
                >
                  <div className={styles.menuIcon}>
                    <IconComponent size={20} />
                  </div>
                  {sidebarOpen && (
                    <span className={styles.menuLabel}>{item.label}</span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      {sidebarOpen && (
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <span>AD</span>
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>Admin User</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          </div>
          
          <NavLink to="/" className={styles.backToSite}>
            ← Back to Site
          </NavLink>
        </div>
      )}
    </aside>
  )
}

export default AdminSidebar