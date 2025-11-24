import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  FolderOpen,
  Search
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import { adminCategories } from '../../utils/firebase/adminConfig'
import DataTable from '../../components/common/DataTable/DataTable'
import Modal from '../../components/common/Modal/Modal'
import CategoryForm from '../../components/categories/CategoryForm/CategoryForm'
import styles from './Categories.module.css'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const { addNotification } = useAdmin()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await adminCategories.getCategories()
      setCategories(categoriesData)
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

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowModal(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return

    try {
      await adminCategories.deleteCategory(categoryId)
      setCategories(categories.filter(c => c.id !== categoryId))
      addNotification({
        type: 'success',
        message: 'Category deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      addNotification({
        type: 'error',
        message: 'Failed to delete category'
      })
    }
  }

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        // Update existing category
        await adminCategories.updateCategory(editingCategory.id, categoryData)
        setCategories(categories.map(c => 
          c.id === editingCategory.id ? { ...c, ...categoryData } : c
        ))
        addNotification({
          type: 'success',
          message: 'Category updated successfully'
        })
      } else {
        // Add new category
        const newCategory = await adminCategories.addCategory(categoryData)
        setCategories([newCategory, ...categories])
        addNotification({
          type: 'success',
          message: 'Category added successfully'
        })
      }
      setShowModal(false)
    } catch (error) {
      console.error('Error saving category:', error)
      addNotification({
        type: 'error',
        message: `Failed to ${editingCategory ? 'update' : 'add'} category`
      })
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Category Name',
      render: (category) => (
        <div className={styles.categoryInfo}>
          <div className={styles.categoryIcon}>
            <FolderOpen size={20} />
          </div>
          <div>
            <h4 className={styles.categoryName}>{category.name}</h4>
            {category.description && (
              <p className={styles.categoryDescription}>{category.description}</p>
            )}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'productCount',
      label: 'Products',
      render: (category) => (
        <span className={styles.productCount}>{category.productCount || 0}</span>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (category) => (
        <span className={`${styles.status} ${
          category.isActive ? styles.active : styles.inactive
        }`}>
          {category.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (category) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={() => handleEditCategory(category)}
            title="Edit category"
          >
            <Edit3 size={16} />
          </button>
          <button 
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={() => handleDeleteCategory(category.id)}
            title="Delete category"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '100px'
    }
  ]

  return (
    <div className={styles.categories}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Categories Management</h1>
          <p className={styles.pageSubtitle}>
            Organize your products into categories for better management
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.primaryButton}
            onClick={handleAddCategory}
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className={styles.tableSection}>
        <DataTable
          columns={columns}
          data={filteredCategories}
          loading={loading}
          emptyMessage="No categories found. Add your first category to get started."
          keyExtractor={(category) => category.id}
        />
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          size="medium"
        >
          <CategoryForm
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Categories