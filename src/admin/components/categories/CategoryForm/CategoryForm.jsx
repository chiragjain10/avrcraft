import React, { useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import { adminCategories } from '../../../utils/firebase/adminConfig'
import styles from './CategoryForm.module.css'

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState(null) // Store actual file for upload
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      })
      setImage(category.image || category.imageUrl || '')
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
      // Store file for later upload to Cloudinary
      setImageFile(file)
      
      // Create temporary URL for preview
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setImage('')
    setImageFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a category name')
      return
    }

    setLoading(true)

    try {
      let categoryData = { ...formData }

      // If new image is selected, upload to Cloudinary
      if (imageFile) {
        setUploading(true)
        // Pass the file to adminCategories which will handle Cloudinary upload
        categoryData.imageFile = imageFile
      } else if (image) {
        // If existing image (URL), keep it
        categoryData.image = image
      }

      await onSave(categoryData)
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    } finally {
      setLoading(false)
      setUploading(false)
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
                    disabled={uploading}
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className={styles.imageHint}>
                  Click the X to remove the image
                </p>
              </div>
            )}
            {uploading && <span className={styles.uploadingText}>Uploading to Cloudinary...</span>}
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
          disabled={loading || uploading}
        >
          {loading ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
        </button>
      </div>
    </form>
  )
}

export default CategoryForm