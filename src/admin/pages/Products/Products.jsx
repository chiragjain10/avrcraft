import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  Download,
  Upload
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import { adminProducts, adminCategories } from '../../utils/firebase/adminConfig'
import DataTable from '../../components/common/DataTable/DataTable'
import Modal from '../../components/common/Modal/Modal'
import ProductForm from '../../components/products/ProductForm/ProductForm'
import styles from './Products.module.css'

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

  const { addNotification } = useAdmin()

  // Fetch products
  useEffect(() => {
    fetchProducts(),
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
      setLoading(true)
      const categoryData = await adminCategories.getCategories()
      setCategory(categoryData)
    } catch (error) {
      console.error('Error fetching categories:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load categories'
      })
    } finally {
      setLoading(false)
    }
  }

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

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return

    try {
      // Implement bulk actions (delete, activate, deactivate)
      if (bulkAction === 'delete') {
        if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return
        
        for (const productId of selectedProducts) {
          await adminProducts.deleteProduct(productId)
        }
        setProducts(products.filter(p => !selectedProducts.includes(p.id)))
        addNotification({
          type: 'success',
          message: `${selectedProducts.length} products deleted successfully`
        })
      }
      
      setSelectedProducts([])
      setBulkAction('')
    } catch (error) {
      console.error('Error performing bulk action:', error)
      addNotification({
        type: 'error',
        message: 'Failed to perform bulk action'
      })
    }
  }

  const columns = [
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
        <span className={`${styles.stockStatus} ${
          product.stock > 10 ? styles.inStock : 
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
        <span className={`${styles.status} ${
          product.isActive ? styles.active : styles.inactive
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
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Products Management</h1>
          <p className={styles.pageSubtitle}>
            Manage your products, inventory, and pricing
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton}>
            <Download size={18} />
            Export
          </button>
          <button className={styles.secondaryButton}>
            <Upload size={18} />
            Import
          </button>
          <button 
            className={styles.primaryButton}
            onClick={handleAddProduct}
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products by name, description, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categoryFilter}
          >
            <option value="all">All Categories</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {selectedProducts.length > 0 && (
            <div className={styles.bulkActions}>
              <select 
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className={styles.bulkSelect}
              >
                <option value="">Bulk Actions</option>
                <option value="delete">Delete Selected</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
              </select>
              <button 
                onClick={handleBulkAction}
                className={styles.bulkActionButton}
                disabled={!bulkAction}
              >
                Apply
              </button>
              <span className={styles.selectedCount}>
                {selectedProducts.length} selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className={styles.tableSection}>
        <DataTable
          columns={columns}
          data={filteredProducts}
          loading={loading}
          emptyMessage="No products found. Add your first product to get started."
          keyExtractor={(product) => product.id}
        />
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          size="large"
        >
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Products