// pages/Orders/Orders.js
import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  ShoppingCart,
  Download
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import DataTable from '../../components/common/DataTable/DataTable'
import styles from './Orders.module.css'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { addNotification } = useAdmin()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const ordersRef = collection(db, 'orders')
      const q = query(ordersRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure proper date format
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      }))
      
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load orders'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className={styles.completed} />
      case 'processing':
        return <Clock size={16} className={styles.processing} />
      case 'shipped':
        return <Truck size={16} className={styles.shipped} />
      case 'pending':
        return <Clock size={16} className={styles.pending} />
      case 'cancelled':
        return <XCircle size={16} className={styles.cancelled} />
      default:
        return <Clock size={16} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return styles.completed
      case 'processing':
        return styles.processing
      case 'shipped':
        return styles.shipped
      case 'pending':
        return styles.pending
      case 'cancelled':
        return styles.cancelled
      default:
        return styles.pending
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (order) => (
        <div className={styles.orderId}>
          <strong>{order.orderId || order.id.substring(0, 8)}</strong>
          <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order) => (
        <div className={styles.customerInfo}>
          <strong>{order.customerName || 'Customer'}</strong>
          <span className={styles.customerEmail}>{order.customerEmail || order.customerEmail}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'items',
      label: 'Items',
      render: (order) => (
        <span className={styles.itemsCount}>
          {order.items?.length || order.totalItems || 0} items
        </span>
      ),
      sortable: true
    },
    {
      key: 'total',
      label: 'Total',
      render: (order) => (
        <div className={styles.totalAmount}>
          <DollarSign size={14} />
          <span>₹{(order.totalAmount || order.total || 0).toLocaleString()}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => (
        <div className={`${styles.status} ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}</span>
        </div>
      )
    },
    {
      key: 'shipping',
      label: 'Shipping',
      render: (order) => (
        <span className={styles.shippingAddress}>
          {order.shippingAddress?.city || 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            title="View order details"
            onClick={() => handleViewOrder(order)}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
      width: '80px'
    }
  ]

  const handleViewOrder = (order) => {
    // Will implement order details modal
    console.log('View order:', order.id)
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <div className={styles.orders}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Orders Management</h1>
          <p className={styles.pageSubtitle}>
            Manage customer orders and track order status
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportButton}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders by ID, customer, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusFilter}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsSummary}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ShoppingCart size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{orders.length}</div>
            <div className={styles.statLabel}>Total Orders</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <div className={styles.statLabel}>Completed</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Truck size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {orders.filter(o => o.status === 'shipped').length}
            </div>
            <div className={styles.statLabel}>Shipped</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.tableSection}>
        <DataTable
          columns={columns}
          data={filteredOrders}
          loading={loading}
          emptyMessage="No orders found. Orders will appear here when customers place orders."
          keyExtractor={(order) => order.id}
        />
      </div>
    </div>
  )
}

export default Orders