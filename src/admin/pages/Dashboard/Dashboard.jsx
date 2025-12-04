import { 
  Package, 
  FolderOpen, 
  FileText, 
  ShoppingCart, 
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Users as ArtisansIcon,
  Award,
  Palette
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import StatsCard from '../../components/common/StatsCard/StatsCard'
import RecentActivity from '../../components/dashboard/RecentActivity/RecentActivity'
import Charts from '../../components/dashboard/Charts/Charts'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { stats } = useAdmin()

  // Dashboard stats mein artisans add karein
  const updatedStats = {
    ...stats,
    totalArtisans: stats.totalArtisans || 0,
    featuredArtisans: stats.featuredArtisans || 0,
    activeArtisans: stats.activeArtisans || 0
  }

  const statCards = [
    {
      title: 'Total Products',
      value: updatedStats.totalProducts || 0,
      icon: Package,
      color: 'primary',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Categories',
      value: updatedStats.totalCategories || 0,
      icon: FolderOpen,
      color: 'success',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: updatedStats.totalOrders || 0,
      icon: ShoppingCart,
      color: 'warning',
      change: '+23%',
      trend: 'up'
    },
    {
      title: 'Total Artisans',
      value: updatedStats.totalArtisans || 0,
      icon: ArtisansIcon,
      color: 'info',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Featured Artisans',
      value: updatedStats.featuredArtisans || 0,
      icon: Award,
      color: 'purple',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Active Artisans',
      value: updatedStats.activeArtisans || 0,
      icon: Users,
      color: 'orange',
      change: '+10%',
      trend: 'up'
    }
  ]

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Create a new product listing',
      icon: Package,
      path: '/admin/products?action=create',
      color: 'primary'
    },
    {
      title: 'Manage Artisans',
      description: 'Add or edit artisan profiles',
      icon: ArtisansIcon,
      path: '/admin/artisans',
      color: 'info'
    },
    {
      title: 'Add New Artisan',
      description: 'Create new artisan profile',
      icon: Users,
      path: '/admin/artisans/create',
      color: 'success'
    },
    {
      title: 'Manage Categories',
      description: 'Add or edit product categories',
      icon: FolderOpen,
      path: '/admin/categories',
      color: 'success'
    },
    {
      title: 'Write Blog Post',
      description: 'Create new blog content',
      icon: FileText,
      path: '/admin/blogs?action=create',
      color: 'info'
    },
    {
      title: 'View Analytics',
      description: 'Check sales and traffic reports',
      icon: TrendingUp,
      path: '/admin/analytics',
      color: 'warning'
    }
  ]

  return (
    <div className={styles.dashboard}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryButton}>
            <TrendingUp size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid - 6 cards in 3x2 layout */}
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            change={card.change}
            trend={card.trend}
          />
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className={styles.contentGrid}>
        {/* Left Column - Charts */}
        <div className={styles.chartsSection}>
          <Charts />
        </div>

        {/* Right Column - Recent Activity */}
        <div className={styles.activitySection}>
          <RecentActivity />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.path}
              className={`${styles.quickActionCard} ${styles[action.color]}`}
            >
              <div className={styles.actionIcon}>
                <action.icon size={24} />
              </div>
              <div className={styles.actionContent}>
                <h3 className={styles.actionTitle}>{action.title}</h3>
                <p className={styles.actionDescription}>{action.description}</p>
              </div>
              <div className={styles.actionArrow}>
                →
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon}>
              <Users size={20} />
            </div>
            <span className={styles.metricLabel}>Total Visitors</span>
          </div>
          <div className={styles.metricValue}>1,247</div>
          <div className={styles.metricChange}>
            <TrendingUp size={16} />
            <span className={styles.positive}>+15% from last week</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon}>
              <DollarSign size={20} />
            </div>
            <span className={styles.metricLabel}>Revenue</span>
          </div>
          <div className={styles.metricValue}>₹84,560</div>
          <div className={styles.metricChange}>
            <TrendingUp size={16} />
            <span className={styles.positive}>+22% from last month</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={styles.metricIcon}>
              <Palette size={20} />
            </div>
            <span className={styles.metricLabel}>Artisan Crafts</span>
          </div>
          <div className={styles.metricValue}>15+</div>
          <div className={styles.metricChange}>
            <TrendingUp size={16} />
            <span className={styles.positive}>5 new crafts added</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard