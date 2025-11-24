import React, { useState } from 'react'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Download
} from 'lucide-react'
import styles from './Charts.module.css'

const Charts = () => {
  const [activeTab, setActiveTab] = useState('sales')

  // Mock chart data
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [45000, 52000, 48000, 61000, 72000, 68000],
        color: 'var(--admin-primary)'
      },
      {
        label: 'Orders',
        data: [120, 150, 130, 180, 210, 190],
        color: 'var(--admin-accent)'
      }
    ]
  }

  const categoryData = [
    { label: 'Handicrafts', value: 45, color: 'var(--admin-primary)' },
    { label: 'Books', value: 25, color: 'var(--admin-success)' },
    { label: 'Ethnic Wears', value: 20, color: 'var(--admin-warning)' },
    { label: 'Others', value: 10, color: 'var(--admin-info)' }
  ]

  const renderBarChart = () => {
    const maxValue = Math.max(...salesData.datasets[0].data)
    
    return (
      <div className={styles.barChart}>
        <div className={styles.chartBars}>
          {salesData.labels.map((label, index) => (
            <div key={label} className={styles.barGroup}>
              <div className={styles.bars}>
                {/* Revenue Bar */}
                <div 
                  className={styles.bar}
                  style={{
                    height: `${(salesData.datasets[0].data[index] / maxValue) * 100}%`,
                    backgroundColor: salesData.datasets[0].color
                  }}
                  title={`Revenue: ₹${salesData.datasets[0].data[index].toLocaleString()}`}
                ></div>
                {/* Orders Bar */}
                <div 
                  className={styles.bar}
                  style={{
                    height: `${(salesData.datasets[1].data[index] / Math.max(...salesData.datasets[1].data)) * 100}%`,
                    backgroundColor: salesData.datasets[1].color
                  }}
                  title={`Orders: ${salesData.datasets[1].data[index]}`}
                ></div>
              </div>
              <span className={styles.barLabel}>{label}</span>
            </div>
          ))}
        </div>
        
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: salesData.datasets[0].color }}
            ></div>
            <span>{salesData.datasets[0].label}</span>
          </div>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: salesData.datasets[1].color }}
            ></div>
            <span>{salesData.datasets[1].label}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderPieChart = () => {
    const total = categoryData.reduce((sum, item) => sum + item.value, 0)
    
    return (
      <div className={styles.pieChart}>
        <div className={styles.pieChartVisual}>
          <div className={styles.pieChartSvg}>
            {categoryData.map((item, index) => {
              const percentage = (item.value / total) * 100
              const rotation = categoryData
                .slice(0, index)
                .reduce((sum, prevItem) => sum + (prevItem.value / total) * 360, 0)
              
              return (
                <div
                  key={item.label}
                  className={styles.pieSegment}
                  style={{
                    backgroundColor: item.color,
                    transform: `rotate(${rotation}deg)`,
                    clipPath: `conic-gradient(from 0deg at 50% 50%, ${item.color} 0% ${percentage}%, transparent ${percentage}% 100%)`
                  }}
                ></div>
              )
            })}
          </div>
        </div>
        
        <div className={styles.pieLegend}>
          {categoryData.map((item) => (
            <div key={item.label} className={styles.pieLegendItem}>
              <div 
                className={styles.pieLegendColor} 
                style={{ backgroundColor: item.color }}
              ></div>
              <div className={styles.pieLegendContent}>
                <span className={styles.pieLegendLabel}>{item.label}</span>
                <span className={styles.pieLegendValue}>{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStats = () => {
    const stats = [
      {
        label: 'Total Revenue',
        value: '₹3,42,000',
        change: '+18%',
        trend: 'up',
        icon: TrendingUp
      },
      {
        label: 'Average Order Value',
        value: '₹2,850',
        change: '+5%',
        trend: 'up',
        icon: TrendingUp
      },
      {
        label: 'Conversion Rate',
        value: '3.2%',
        change: '+0.4%',
        trend: 'up',
        icon: TrendingUp
      }
    ]

    return (
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className={styles.statItem}>
              <div className={styles.statIcon}>
                <IconComponent size={20} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
              <div className={styles.statChange}>
                <span className={styles.changeText}>{stat.change}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={styles.charts}>
      <div className={styles.chartsHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Analytics Overview</h3>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'sales' ? styles.active : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              <BarChart3 size={16} />
              Sales
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <PieChart size={16} />
              Categories
            </button>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <button className={styles.downloadButton}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className={styles.chartsContent}>
        {activeTab === 'sales' && (
          <>
            {renderBarChart()}
            {renderStats()}
          </>
        )}
        
        {activeTab === 'categories' && (
          <>
            {renderPieChart()}
            {renderStats()}
          </>
        )}
      </div>
    </div>
  )
}

export default Charts