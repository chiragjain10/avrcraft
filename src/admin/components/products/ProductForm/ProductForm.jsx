import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  X,
  Plus
} from 'lucide-react'
import { adminProducts, adminCategories } from '../../../utils/firebase/adminConfig'
import styles from './ProductForm.module.css'

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    author: '',
    
    // Navigation-specific flags
    isBestseller: false,
    isFiction: false,
    isNonFiction: false,
    isChildrens: false,
    isStationery: false,
    isGift: false,
    isChristmas: false,
    isHighlight: false,
    isGame: false,
    
    isNew: false,
    isActive: true,
    tags: []
  })
  
  const [images, setImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [newTag, setNewTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const categoriesList = await adminCategories.getCategories()
        setCategories(categoriesList)
      } catch (error) {
        console.error('Error fetching categories:', error)
        alert('Failed to load categories')
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        stock: product.stock || '',
        author: product.author || '',
        
        // Navigation flags
        isBestseller: product.isBestseller || false,
        isFiction: product.isFiction || product.category === 'Fiction' || false,
        isNonFiction: product.isNonFiction || product.category === 'Non-Fiction' || false,
        isChildrens: product.isChildrens || product.category === "Children's" || false,
        isStationery: product.isStationery || product.category === 'Stationery' || false,
        isGift: product.isGift || product.category === 'Gifts' || false,
        isChristmas: product.isChristmas || false,
        isHighlight: product.isHighlight || false,
        isGame: product.isGame || false,
        
        isNew: product.isNew || false,
        isActive: product.isActive !== undefined ? product.isActive : true,
        tags: product.tags || []
      })
      setImages(product.images || [])
    }
  }, [product])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle category change - auto-set navigation flags
  const handleCategoryChange = (e) => {
    const category = e.target.value
    setFormData(prev => ({
      ...prev,
      category,
      // Auto-set flags based on category
      isFiction: category === 'Fiction' || prev.isFiction,
      isNonFiction: category === 'Non-Fiction' || prev.isNonFiction,
      isChildrens: category === "Children's" || prev.isChildrens,
      isStationery: category === 'Stationery' || prev.isStationery,
      isGift: category === 'Gifts' || prev.isGift
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      setImageFiles(prev => [...prev, ...files])
      
      const tempUrls = files.map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...tempUrls])
    } catch (error) {
      console.error('Error processing images:', error)
      alert('Failed to process images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      let uploadedImageUrls = [...images.filter(img => img.startsWith('http'))]

      if (imageFiles.length > 0) {
        setUploading(true)
        const productId = product?.id || 'temp'
        const newImageUrls = await adminProducts.uploadMultipleImages(imageFiles, productId)
        uploadedImageUrls = [...uploadedImageUrls, ...newImageUrls]
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock),
        author: formData.author || '',
        
        // Navigation flags
        isBestseller: formData.isBestseller,
        isFiction: formData.isFiction,
        isNonFiction: formData.isNonFiction,
        isChildrens: formData.isChildrens,
        isStationery: formData.isStationery,
        isGift: formData.isGift,
        isChristmas: formData.isChristmas,
        isHighlight: formData.isHighlight,
        isGame: formData.isGame,
        
        isNew: formData.isNew,
        isActive: formData.isActive,
        tags: formData.tags,
        images: uploadedImageUrls
      }

      await onSave(productData)
    } catch (error) {
      console.error('Error saving product:', error)
      alert(error.message || 'Failed to save product')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.productForm}>
      <div className={styles.formGrid}>
        {/* Basic Information */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Enter product description"
              rows="4"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className={styles.select}
              required
              disabled={categoriesLoading}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesLoading && (
              <span className={styles.loadingText}>Loading categories...</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Author (for books)</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter author name"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Pricing & Inventory</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price (£) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Original Price (£)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Stock Quantity *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        {/* Images */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Product Images</h3>
          
          <div className={styles.imageUpload}>
            <label className={styles.uploadLabel}>
              <Upload size={20} />
              <span>Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
                disabled={uploading}
              />
            </label>
            {uploading && <span className={styles.uploadingText}>Uploading to Cloudinary...</span>}
          </div>

          {images.length > 0 && (
            <div className={styles.imagePreview}>
              {images.map((image, index) => (
                <div key={index} className={styles.imageItem}>
                  <img src={image} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeImageButton}
                    disabled={uploading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation & Category Flags */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Navigation Categories</h3>
          
          <div className={styles.navigationFlags}>
            <div className={styles.flagsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isBestseller"
                  checked={formData.isBestseller}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Bestseller</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isFiction"
                  checked={formData.isFiction}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Fiction</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isNonFiction"
                  checked={formData.isNonFiction}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Non-Fiction</span>
              </label>
            </div>

            <div className={styles.flagsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isChildrens"
                  checked={formData.isChildrens}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Children's Books</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isStationery"
                  checked={formData.isStationery}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Stationery</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isGift"
                  checked={formData.isGift}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Gifts</span>
              </label>
            </div>

            <div className={styles.flagsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isChristmas"
                  checked={formData.isChristmas}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Christmas</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isHighlight"
                  checked={formData.isHighlight}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Highlights</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isGame"
                  checked={formData.isGame}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.flagLabel}>Games</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tags & Additional Settings */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Tags & Additional Settings</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagInput}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className={styles.input}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className={styles.addTagButton}
                disabled={!newTag.trim()}
              >
                <Plus size={16} />
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className={styles.tagsList}>
                {formData.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={styles.removeTagButton}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Mark as New</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Product is Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={loading || uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={loading || uploading || categoriesLoading}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm