import React from 'react'
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  User,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAdmin } from '../../../contexts/AdminContext'
import styles from './RecentActivity.module.css'

const RecentActivity = () => {
  const { stats } = useAdmin()

  // Mock activity data (in real app, this would come from Firebase)
  const activities = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      description: 'Order #ORD-0012 for ₹4,500',
      user: 'Rajesh Kumar',
      time: '2 minutes ago',
      icon: ShoppingCart,
      status: 'success'
    },
    {
      id: 2,
      type: 'product',
      title: 'Product Added',
      description: 'New product "Handmade Silk Saree" added',
      user: 'Admin User',
      time: '1 hour ago',
      icon: Package,
      status: 'info'
    },
    {
      id: 3,
      type: 'blog',
      title: 'Blog Published',
      description: 'New blog post "Traditional Crafts of India" published',
      user: 'Admin User',
      time: '3 hours ago',
      icon: FileText,
      status: 'success'
    },
    {
      id: 4,
      type: 'user',
      title: 'New User Registered',
      description: 'Priya Sharma registered as new customer',
      user: 'System',
      time: '5 hours ago',
      icon: User,
      status: 'info'
    },
    {
      id: 5,
      type: 'order',
      title: 'Order Shipped',
      description: 'Order #ORD-0010 has been shipped',
      user: 'Admin User',
      time: '1 day ago',
      icon: CheckCircle,
      status: 'success'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className={styles.success} />
      case 'warning':
        return <Clock size={16} className={styles.warning} />
      case 'error':
        return <AlertCircle size={16} className={styles.error} />
      default:
        return <CheckCircle size={16} className={styles.info} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return styles.success
      case 'warning':
        return styles.warning
      case 'error':
        return styles.error
      default:
        return styles.info
    }
  }

  return (
    <div className={styles.recentActivity}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Activity</h3>
        <button className={styles.viewAllButton}>View All</button>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity) => {
          const IconComponent = activity.icon
          return (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <IconComponent size={18} />
              </div>
              
              <div className={styles.activityContent}>
                <div className={styles.activityHeader}>
                  <h4 className={styles.activityTitle}>{activity.title}</h4>
                  <div className={`${styles.statusIndicator} ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
                
                <p className={styles.activityDescription}>{activity.description}</p>
                
                <div className={styles.activityMeta}>
                  <span className={styles.activityUser}>By {activity.user}</span>
                  <span className={styles.activityTime}>{activity.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <div className={styles.recentOrders}>
          <h4 className={styles.ordersTitle}>Recent Orders</h4>
          <div className={styles.ordersList}>
            {stats.recentOrders.slice(0, 3).map((order) => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderId}>{order.id}</span>
                  <span className={styles.orderAmount}>₹{order.totalAmount?.toLocaleString()}</span>
                </div>
                <div className={styles.orderMeta}>
                  <span className={styles.orderStatus}>{order.status}</span>
                  <span className={styles.orderDate}>
                    {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RecentActivity