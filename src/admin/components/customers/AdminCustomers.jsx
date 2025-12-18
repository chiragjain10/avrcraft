// components/admin/customers/AdminCustomers.jsx
import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Download,
  Filter,
  Users 
} from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import DataTable from '../common/DataTable/DataTable'
import styles from './AdminCustomers.module.css'

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, 'users'))
      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCustomers(customersData)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'active') return matchesSearch && (customer.isActive !== false)
    return matchesSearch
  })

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (customer) => (
        <div className={styles.customerInfo}>
          <div className={styles.customerAvatar}>
            {customer.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className={styles.customerName}>{customer.displayName || 'No Name'}</div>
            <div className={styles.customerId}>ID: {customer.id.substring(0, 8)}...</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (customer) => (
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <Mail size={14} />
            <span>{customer.email || 'No email'}</span>
          </div>
          {customer.phone && (
            <div className={styles.contactItem}>
              <Phone size={14} />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'orders',
      label: 'Orders',
      render: (customer) => (
        <div className={styles.ordersInfo}>
          <div className={styles.ordersCount}>{customer.totalOrders || 0}</div>
          <div className={styles.ordersLabel}>orders</div>
        </div>
      )
    },
    {
      key: 'spent',
      label: 'Total Spent',
      render: (customer) => (
        <div className={styles.spentAmount}>
          ₹{customer.totalSpent?.toLocaleString() || '0'}
        </div>
      )
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (customer) => (
        <div className={styles.joinedDate}>
          <Calendar size={14} />
          <span>{customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
        </div>
      )
    }
  ]

  return (
    <div className={styles.adminCustomers}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>Manage and view all customer information</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportButton}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({customers.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({customers.filter(c => c.isActive !== false).length})
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{customers.length}</div>
            <div className={styles.statLabel}>Total Customers</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {customers.filter(c => c.totalOrders > 0).length}
            </div>
            <div className={styles.statLabel}>Active Shoppers</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <DataTable
          columns={columns}
          data={filteredCustomers}
          loading={loading}
          emptyMessage="No customers found"
          keyExtractor={(customer) => customer.id}
        />
      </div>
    </div>
  )
}

export default AdminCustomers