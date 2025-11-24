import React, { useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import styles from './CategoryForm.module.css'

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      })
      setImage(category.imageUrl || '')
    }
  }, [category])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      // In a real app, you would upload to Firebase Storage
      // const imageUrl = await adminCategories.uploadImage(file, category?.id || 'temp')
      const imageUrl = URL.createObjectURL(file) // Temporary URL for demo
      setImage(imageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setImage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const categoryData = {
        ...formData,
        imageUrl: image
      }

      await onSave(categoryData)
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.categoryForm}>
      <div className={styles.formContent}>
        {/* Basic Information */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Category Information</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Category Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Enter category description (optional)"
              rows="3"
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span>Category is Active</span>
            </label>
          </div>
        </div>

        {/* Category Image */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Category Image</h3>
          
          <div className={styles.imageUpload}>
            {!image ? (
              <label className={styles.uploadLabel}>
                <Upload size={24} />
                <span>Upload Category Image</span>
                <p className={styles.uploadHint}>
                  Recommended size: 400x400px
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                  disabled={uploading}
                />
              </label>
            ) : (
              <div className={styles.imagePreview}>
                <div className={styles.imageContainer}>
                  <img src={image} alt="Category preview" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className={styles.removeImageButton}
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className={styles.imageHint}>
                  Click the X to remove the image
                </p>
              </div>
            )}
            {uploading && <span className={styles.uploadingText}>Uploading...</span>}
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
          {loading ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
        </button>
      </div>
    </form>
  )
}

export default CategoryForm