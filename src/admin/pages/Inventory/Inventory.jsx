// pages/Inventory/Inventory.jsx
import React, { useState, useEffect } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingDown,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import DataTable from '../../components/common/DataTable/DataTable'
import styles from './Inventory.module.css'

const Inventory = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState(10)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, 'products'))
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'error' }
    if (stock <= lowStockThreshold) return { label: 'Low Stock', color: 'warning' }
    return { label: 'In Stock', color: 'success' }
  }

  const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold && p.stock > 0)
  const outOfStockProducts = products.filter(p => p.stock <= 0)

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (product) => (
        <div className={styles.productInfo}>
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
          )}
          <div>
            <div className={styles.productName}>{product.name}</div>
            <div className={styles.productSku}>SKU: {product.sku || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (product) => (
        <span className={styles.category}>{product.category}</span>
      )
    },
    {
      key: 'stock',
      label: 'Current Stock',
      render: (product) => {
        const status = getStockStatus(product.stock)
        return (
          <div className={`${styles.stock} ${styles[status.color]}`}>
            <span className={styles.stockQuantity}>{product.stock || 0}</span>
            <span className={styles.stockLabel}>{status.label}</span>
          </div>
        )
      }
    },
    {
      key: 'price',
      label: 'Price',
      render: (product) => (
        <div className={styles.price}>₹{product.price?.toLocaleString()}</div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product) => (
        <button 
          className={styles.updateButton}
          onClick={() => handleUpdateStock(product)}
        >
          Update Stock
        </button>
      )
    }
  ]

  const handleUpdateStock = (product) => {
    const newStock = prompt(`Update stock for ${product.name}:`, product.stock)
    if (newStock !== null && !isNaN(newStock)) {
      // Update stock in Firebase
      console.log('Update stock:', product.id, newStock)
    }
  }

  return (
    <div className={styles.inventory}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventory Management</h1>
        <p className={styles.subtitle}>Track and manage product stock levels</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Package size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{products.length}</div>
            <div className={styles.statLabel}>Total Products</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statIcon}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{lowStockProducts.length}</div>
            <div className={styles.statLabel}>Low Stock</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.error}`}>
          <div className={styles.statIcon}>
            <TrendingDown size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{outOfStockProducts.length}</div>
            <div className={styles.statLabel}>Out of Stock</div>
          </div>
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.thresholdControl}>
          <label>Low Stock Threshold:</label>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
            min="1"
            className={styles.thresholdInput}
          />
        </div>
      </div>

      <div className={styles.tableSection}>
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found"
          keyExtractor={(product) => product.id}
        />
      </div>
    </div>
  )
}

export default Inventory