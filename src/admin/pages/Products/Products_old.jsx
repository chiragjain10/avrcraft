// src/pages/Products/Products.jsx (Updated)
import React, { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  Download,
  Upload,
  Check,
  X
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import { adminProducts, adminCategories } from '../../utils/firebase/adminConfig'
import DataTable from '../../components/common/DataTable/DataTable'
import Modal from '../../components/common/Modal/Modal'
import ProductForm from '../../components/products/ProductForm/ProductForm'
import { mapOldProductsToNew, validateProduct } from '../../utils/dataMapper'
import styles from './Products_old.module.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [bulkAction, setBulkAction] = useState('')

  // Import/Export states
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState('')
  const [importSummary, setImportSummary] = useState({ total: 0, success: 0, failed: 0 })

  const fileInputRef = useRef(null)
  const { addNotification } = useAdmin()

  // Fetch products
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const productsData = await adminProducts.getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching products:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load products'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoryData = await adminCategories.getCategories()
      setCategory(categoryData)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // 📤 **EXPORT FUNCTION**
  const handleExport = async () => {
    try {
      setLoading(true)

      // Create CSV content
      const headers = ['Name', 'Description', 'Category', 'Price', 'Stock', 'Author', 'Tags', 'Status']
      const rows = products.map(product => [
        `"${product.name || ''}"`,
        `"${product.description || ''}"`,
        `"${product.category || ''}"`,
        product.price || 0,
        product.stock || 0,
        `"${product.author || ''}"`,
        `"${(product.tags || []).join(', ')}"`,
        product.isActive ? 'Active' : 'Inactive'
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addNotification({
        type: 'success',
        message: `Exported ${products.length} products successfully`
      })

    } catch (error) {
      console.error('Export error:', error)
      addNotification({
        type: 'error',
        message: 'Failed to export products'
      })
    } finally {
      setLoading(false)
    }
  }

  // 📥 **IMPORT FUNCTION**
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      addNotification({
        type: 'error',
        message: 'Please select a JSON file'
      })
      return
    }

    setImportModalOpen(true)
    setImportStatus('Reading file...')
    setImportProgress(10)

    try {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)

          if (!Array.isArray(jsonData)) {
            throw new Error('JSON file should contain an array of products')
          }

          setImportStatus('Mapping data to new format...')
          setImportProgress(30)

          // Map old data to new format
          const mappedProducts = mapOldProductsToNew(jsonData)

          setImportStatus(`Importing ${mappedProducts.length} products...`)
          setImportProgress(50)

          // Import products in batches
          const results = await importProductsBatch(mappedProducts)

          setImportSummary(results)
          setImportProgress(100)
          setImportStatus('Import completed!')

          // Refresh products list
          await fetchProducts()

        } catch (error) {
          console.error('Import error:', error)
          setImportStatus(`Error: ${error.message}`)
        }
      }

      reader.readAsText(file)

    } catch (error) {
      console.error('File reading error:', error)
      setImportStatus(`Error: ${error.message}`)
    }

    // Reset file input
    event.target.value = ''
  }

  // Batch import function
  const importProductsBatch = async (products) => {
    const BATCH_SIZE = 10
    const results = { total: products.length, success: 0, failed: 0 }

    // Get all existing products first
    const existingProducts = await adminProducts.getProducts()

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE)

      const batchPromises = batch.map(async (product, index) => {
        try {
          // Validate product
          if (!validateProduct(product)) {
            results.failed++
            return { success: false, error: 'Invalid product data' }
          }

          // Find existing product by name in the database
          const existingProduct = existingProducts.find(p => p.name === product.name)

          if (existingProduct && existingProduct.id) {
            // Update existing product
            await adminProducts.updateProduct(existingProduct.id, {
              ...product,
              // Preserve the original ID and timestamps
              id: existingProduct.id,
              createdAt: existingProduct.createdAt,
              updatedAt: new Date().toISOString()
            })
          } else {
            // Add new product
            await adminProducts.addProduct(product)
          }

          results.success++
          return { success: true }
        } catch (error) {
          console.error(`Failed to import product: ${product.name || 'Unknown'}`, error)
          results.failed++
          return {
            success: false,
            error: error.message,
            productName: product.name || 'Unknown'
          }
        }
      })

      await Promise.all(batchPromises)
    }

    return results
  }

  const closeImportModal = () => {
    setImportModalOpen(false)
    setImportProgress(0)
    setImportStatus('')
    setImportSummary({ total: 0, success: 0, failed: 0 })
  }

  // ... (rest of your existing functions remain the same)
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.author?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = ['all', ...new Set(category.map(p => p.name).filter(Boolean))]

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      await adminProducts.deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
      addNotification({
        type: 'success',
        message: 'Product deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      addNotification({
        type: 'error',
        message: 'Failed to delete product'
      })
    }
  }

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        await adminProducts.updateProduct(editingProduct.id, productData)
        setProducts(products.map(p =>
          p.id === editingProduct.id ? { ...p, ...productData } : p
        ))
        addNotification({
          type: 'success',
          message: 'Product updated successfully'
        })
      } else {
        // Add new product
        const newProduct = await adminProducts.addProduct(productData)
        setProducts([newProduct, ...products])
        addNotification({
          type: 'success',
          message: 'Product added successfully'
        })
      }
      setShowModal(false)
    } catch (error) {
      console.error('Error saving product:', error)
      addNotification({
        type: 'error',
        message: `Failed to ${editingProduct ? 'update' : 'add'} product`
      })
    }
  }

  const columns = [
    // ... (your existing columns remain the same)
    {
      key: 'select',
      label: '',
      render: (product) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(product.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts([...selectedProducts, product.id])
            } else {
              setSelectedProducts(selectedProducts.filter(id => id !== product.id))
            }
          }}
        />
      ),
      width: '50px'
    },
    {
      key: 'image',
      label: 'Image',
      render: (product) => (
        <div className={styles.productImage}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className={styles.imagePlaceholder}>No Image</div>
          )}
        </div>
      ),
      width: '80px'
    },
    {
      key: 'name',
      label: 'Product Name',
      render: (product) => (
        <div className={styles.productInfo}>
          <h4 className={styles.productName}>{product.name}</h4>
          {product.author && (
            <p className={styles.productAuthor}>By {product.author}</p>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      render: (product) => (
        <span className={styles.categoryTag}>{product.category}</span>
      ),
      sortable: true
    },
    {
      key: 'price',
      label: 'Price',
      render: (product) => (
        <div className={styles.priceInfo}>
          <span className={styles.currentPrice}>₹{product.price?.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>₹{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product) => (
        <span className={`${styles.stockStatus} ${product.stock > 10 ? styles.inStock :
            product.stock > 0 ? styles.lowStock :
              styles.outOfStock
          }`}>
          {product.stock || 0}
        </span>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (product) => (
        <span className={`${styles.status} ${product.isActive ? styles.active : styles.inactive
          }`}>
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product) => (
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => handleEditProduct(product)}
            title="Edit product"
          >
            <Edit3 size={16} />
          </button>
          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => handleDeleteProduct(product.id)}
            title="Delete product"
          >
            <Trash2 size={16} />
          </button>
          <button
            className={styles.actionButton}
            title="View details"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
      width: '120px'
    }
  ]

  return (
    <div className={styles.products}>
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileSelect}
      />

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Products Management</h1>
          <p className={styles.pageSubtitle}>
            Manage your products, inventory, and pricing
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            onClick={handleExport}
            disabled={loading || products.length === 0}
          >
            <Download size={18} />
            Export
          </button>
          <button
            className={styles.secondaryButton}
            onClick={handleImportClick}
            disabled={loading}
          >
            <Upload size={18} />
            Import
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleAddProduct}
            disabled={loading}
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* ... (rest of your JSX remains the same) */}

      {/* Import Progress Modal */}
      {importModalOpen && (
        <Modal
          isOpen={importModalOpen}
          onClose={closeImportModal}
          title="Importing Products"
          size="medium"
        >
          <div className={styles.importModal}>
            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${importProgress}%` }}
              />
            </div>

            {/* Status Text */}
            <div className={styles.importStatus}>
              <p>{importStatus}</p>
              {importProgress > 0 && (
                <p className={styles.progressText}>
                  {importProgress}% complete
                </p>
              )}
            </div>

            {/* Summary when complete */}
            {importProgress === 100 && (
              <div className={styles.importSummary}>
                <div className={styles.summaryItem}>
                  <Check size={20} className={styles.successIcon} />
                  <span>{importSummary.success} products imported successfully</span>
                </div>
                {importSummary.failed > 0 && (
                  <div className={styles.summaryItem}>
                    <X size={20} className={styles.errorIcon} />
                    <span>{importSummary.failed} products failed to import</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className={styles.importActions}>
              {importProgress === 100 ? (
                <button
                  className={styles.primaryButton}
                  onClick={closeImportModal}
                >
                  Done
                </button>
              ) : (
                <button
                  className={styles.secondaryButton}
                  onClick={closeImportModal}
                >
                  Cancel Import
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Products