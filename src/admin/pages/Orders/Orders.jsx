import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
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
      // Mock orders data - in real app, fetch from Firebase
      const mockOrders = [
        {
          id: 'ORD-0012',
          customer: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          total: 4500,
          status: 'completed',
          items: 3,
          createdAt: new Date('2024-01-15'),
          shippingAddress: 'Mumbai, Maharashtra'
        },
        {
          id: 'ORD-0011',
          customer: 'Priya Sharma',
          email: 'priya@example.com',
          total: 3200,
          status: 'processing',
          items: 2,
          createdAt: new Date('2024-01-14'),
          shippingAddress: 'Delhi, NCR'
        },
        {
          id: 'ORD-0010',
          customer: 'Amit Patel',
          email: 'amit@example.com',
          total: 8900,
          status: 'shipped',
          items: 5,
          createdAt: new Date('2024-01-13'),
          shippingAddress: 'Bangalore, Karnataka'
        },
        {
          id: 'ORD-0009',
          customer: 'Sunita Reddy',
          email: 'sunita@example.com',
          total: 2100,
          status: 'pending',
          items: 1,
          createdAt: new Date('2024-01-12'),
          shippingAddress: 'Hyderabad, Telangana'
        },
        {
          id: 'ORD-0008',
          customer: 'Vikram Singh',
          email: 'vikram@example.com',
          total: 6700,
          status: 'cancelled',
          items: 4,
          createdAt: new Date('2024-01-11'),
          shippingAddress: 'Pune, Maharashtra'
        }
      ]
      setOrders(mockOrders)
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
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
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
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (order) => (
        <div className={styles.orderId}>
          <strong>{order.id}</strong>
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
          <strong>{order.customer}</strong>
          <span className={styles.customerEmail}>{order.email}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'items',
      label: 'Items',
      render: (order) => (
        <span className={styles.itemsCount}>{order.items} items</span>
      ),
      sortable: true
    },
    {
      key: 'total',
      label: 'Total',
      render: (order) => (
        <div className={styles.totalAmount}>
          <DollarSign size={14} />
          <span>₹{order.total.toLocaleString()}</span>
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
          <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        </div>
      )
    },
    {
      key: 'shipping',
      label: 'Shipping',
      render: (order) => (
        <span className={styles.shippingAddress}>{order.shippingAddress}</span>
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
          >
            <Eye size={16} />
          </button>
        </div>
      ),
      width: '80px'
    }
  ]

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