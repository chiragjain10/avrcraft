import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Package,
  Download,
  Calendar
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import StatsCard from '../../components/common/StatsCard/StatsCard'
import styles from './Analytics.module.css'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(false)
  const { stats } = useAdmin()

  const analyticsData = {
    totalRevenue: 342560,
    totalOrders: 1247,
    totalCustomers: 892,
    conversionRate: 3.2,
    averageOrderValue: 2850,
    pageViews: 8432
  }

  const revenueData = {
    '7d': [45000, 52000, 48000, 61000, 72000, 68000, 75000],
    '30d': [42000, 45000, 48000, 52000, 58000, 62000, 68000, 72000, 75000, 78000, 82000, 85000, 88000, 90000, 92000, 94000, 96000, 98000, 100000, 102000, 105000, 108000, 112000, 115000, 118000, 122000, 125000, 128000, 132000, 135000],
    '90d': Array(90).fill(0).map((_, i) => 30000 + (i * 1200))
  }

  const topProducts = [
    { name: 'Handmade Silk Saree', sales: 45, revenue: 225000 },
    { name: 'Traditional Madhubani Painting', sales: 32, revenue: 160000 },
    { name: 'Silver Filigree Necklace', sales: 28, revenue: 98000 },
    { name: 'Brass Temple Bell', sales: 25, revenue: 140000 },
    { name: 'Handcrafted Wooden Box', sales: 22, revenue: 66000 }
  ]

  const trafficSources = [
    { source: 'Direct', visitors: 1247, percentage: 45 },
    { source: 'Google Search', visitors: 892, percentage: 32 },
    { source: 'Social Media', visitors: 445, percentage: 16 },
    { source: 'Email Campaign', visitors: 223, percentage: 8 }
  ]

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${analyticsData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'success',
      change: '+18%',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: analyticsData.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'primary',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Customers',
      value: analyticsData.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'info',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Conversion Rate',
      value: `${analyticsData.conversionRate}%`,
      icon: TrendingUp,
      color: 'warning',
      change: '+0.4%',
      trend: 'up'
    }
  ]

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ]

  const renderRevenueChart = () => {
    const data = revenueData[timeRange]
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Revenue Overview</h3>
          <div className={styles.chartControls}>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={styles.timeRangeSelect}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <button className={styles.downloadButton}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        
        <div className={styles.chart}>
          <div className={styles.chartBars}>
            {data.map((value, index) => (
              <div key={index} className={styles.chartBarContainer}>
                <div 
                  className={styles.chartBar}
                  style={{
                    height: `${((value - minValue) / (maxValue - minValue)) * 100}%`
                  }}
                  title={`₹${value.toLocaleString()}`}
                ></div>
                <span className={styles.chartLabel}>
                  {timeRange === '7d' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index] : 
                   timeRange === '30d' ? (index % 5 === 0 ? `Day ${index + 1}` : '') :
                   index % 15 === 0 ? `Week ${Math.floor(index / 7) + 1}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.chartStats}>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Highest</span>
            <span className={styles.statValue}>₹{maxValue.toLocaleString()}</span>
          </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Average</span>
            <span className={styles.statValue}>
              ₹{Math.round(data.reduce((a, b) => a + b, 0) / data.length).toLocaleString()}
            </span>
          </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Lowest</span>
            <span className={styles.statValue}>₹{minValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderTopProducts = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Top Selling Products</h3>
      </div>
      
      <div className={styles.productsList}>
        {topProducts.map((product, index) => (
          <div key={product.name} className={styles.productItem}>
            <div className={styles.productRank}>
              <span className={styles.rankNumber}>{index + 1}</span>
            </div>
            
            <div className={styles.productInfo}>
              <h4 className={styles.productName}>{product.name}</h4>
              <div className={styles.productStats}>
                <span className={styles.salesCount}>{product.sales} sales</span>
                <span className={styles.revenue}>₹{product.revenue.toLocaleString()}</span>
              </div>
            </div>
            
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTrafficSources = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Traffic Sources</h3>
      </div>
      
      <div className={styles.trafficList}>
        {trafficSources.map(source => (
          <div key={source.source} className={styles.trafficItem}>
            <div className={styles.trafficInfo}>
              <span className={styles.sourceName}>{source.source}</span>
              <span className={styles.visitorCount}>{source.visitors} visitors</span>
            </div>
            
            <div className={styles.trafficProgress}>
              <div 
                className={styles.trafficBar}
                style={{ width: `${source.percentage}%` }}
              ></div>
            </div>
            
            <span className={styles.percentage}>{source.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMetrics = () => (
    <div className={styles.metricsGrid}>
      <div className={styles.metricCard}>
        <div className={styles.metricHeader}>
          <div className={styles.metricIcon}>
            <Eye size={20} />
          </div>
          <span className={styles.metricLabel}>Page Views</span>
        </div>
        <div className={styles.metricValue}>{analyticsData.pageViews.toLocaleString()}</div>
        <div className={styles.metricChange}>
          <TrendingUp size={16} />
          <span className={styles.positive}>+15% from last week</span>
        </div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricHeader}>
          <div className={styles.metricIcon}>
            <Package size={20} />
          </div>
          <span className={styles.metricLabel}>Products Sold</span>
        </div>
        <div className={styles.metricValue}>324</div>
        <div className={styles.metricChange}>
          <TrendingUp size={16} />
          <span className={styles.positive}>+22% from last month</span>
        </div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricHeader}>
          <div className={styles.metricIcon}>
            <DollarSign size={20} />
          </div>
          <span className={styles.metricLabel}>Average Order Value</span>
        </div>
        <div className={styles.metricValue}>₹{analyticsData.averageOrderValue.toLocaleString()}</div>
        <div className={styles.metricChange}>
          <TrendingUp size={16} />
          <span className={styles.positive}>+5% from last month</span>
        </div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricHeader}>
          <div className={styles.metricIcon}>
            <Calendar size={20} />
          </div>
          <span className={styles.metricLabel}>Returning Customers</span>
        </div>
        <div className={styles.metricValue}>68%</div>
        <div className={styles.metricChange}>
          <TrendingUp size={16} />
          <span className={styles.positive}>+8% from last quarter</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.analytics}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Analytics Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Track your store performance and customer insights
          </p>
        </div>
      </div>

      {/* Stats Overview */}
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

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column - Revenue Chart */}
        <div className={styles.chartSection}>
          {renderRevenueChart()}
        </div>

        {/* Right Column - Top Products */}
        <div className={styles.sidebarSection}>
          {renderTopProducts()}
        </div>
      </div>

      {/* Second Row */}
      <div className={styles.secondRow}>
        {/* Traffic Sources */}
        <div className={styles.trafficSection}>
          {renderTrafficSources()}
        </div>

        {/* Additional Metrics */}
        <div className={styles.metricsSection}>
          {renderMetrics()}
        </div>
      </div>
    </div>
  )
}

export default Analytics