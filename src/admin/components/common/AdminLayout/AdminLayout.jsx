import React from 'react'
import { useAdmin } from '../../../contexts/AdminContext'
import AdminSidebar from '../AdminSidebar/AdminSidebar'
import AdminHeader from '../AdminHeader/AdminHeader'
import styles from './AdminLayout.module.css'

const AdminLayout = ({ children }) => {
  const { isAdmin, loading, sidebarOpen } = useAdmin()

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Checking admin access...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      
      <div className={`${styles.mainContent} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
        <AdminHeader />
        
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout