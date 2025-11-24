import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  X,
  Plus,
  Minus
} from 'lucide-react'
import { adminProducts } from '../../../utils/firebase/adminConfig'
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
    isBestseller: false,
    isNew: false,
    isActive: true,
    tags: []
  })
  const [images, setImages] = useState([])
  const [newTag, setNewTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

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
        isBestseller: product.isBestseller || false,
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      for (const file of files) {
        // In a real app, you would upload to Firebase Storage
        // const imageUrl = await adminProducts.uploadImage(file, product?.id || 'temp')
        const imageUrl = URL.createObjectURL(file) // Temporary URL for demo
        setImages(prev => [...prev, imageUrl])
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
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
    setLoading(true)

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock),
        images: images
      }

      await onSave(productData)
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Handicrafts', 'Books', 'Ethnic Wears', 'Home Decor', 'Jewelry']

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
              onChange={handleInputChange}
              className={styles.select}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
              <label className={styles.label}>Price (₹) *</label>
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
              <label className={styles.label}>Original Price (₹)</label>
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
            {uploading && <span className={styles.uploadingText}>Uploading...</span>}
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
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags & Settings */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Tags & Settings</h3>
          
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
                name="isBestseller"
                checked={formData.isBestseller}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Mark as Bestseller</span>
            </label>

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
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm