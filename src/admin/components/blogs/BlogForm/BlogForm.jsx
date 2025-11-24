import React, { useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import styles from './BlogForm.module.css'

const BlogForm = ({ blog, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    isActive: true,
    tags: []
  })
  const [featuredImage, setFeaturedImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        author: blog.author || '',
        isActive: blog.isActive !== undefined ? blog.isActive : true,
        tags: blog.tags || []
      })
      setFeaturedImage(blog.featuredImage || '')
    }
  }, [blog])

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
      const imageUrl = URL.createObjectURL(file) // Temporary URL for demo
      setFeaturedImage(imageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFeaturedImage('')
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
      const blogData = {
        ...formData,
        featuredImage: featuredImage
      }

      await onSave(blogData)
    } catch (error) {
      console.error('Error saving blog:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.blogForm}>
      <div className={styles.formGrid}>
        {/* Basic Information */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Blog Information</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Blog Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter blog post title"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Enter a short excerpt (optional)"
              rows="3"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Author</label>
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

        {/* Featured Image */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Featured Image</h3>
          
          <div className={styles.imageUpload}>
            {!featuredImage ? (
              <label className={styles.uploadLabel}>
                <Upload size={24} />
                <span>Upload Featured Image</span>
                <p className={styles.uploadHint}>
                  Recommended size: 1200x600px
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
                  <img src={featuredImage} alt="Featured preview" />
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

        {/* Blog Content */}
        <div className={`${styles.formSection} ${styles.fullWidth}`}>
          <h3 className={styles.sectionTitle}>Blog Content *</h3>
          
          <div className={styles.formGroup}>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className={styles.contentTextarea}
              placeholder="Write your blog post content here..."
              rows="12"
              required
            />
          </div>
        </div>

        {/* Tags & Settings */}
        <div className={`${styles.formSection} ${styles.fullWidth}`}>
          <h3 className={styles.sectionTitle}>Tags & Settings</h3>
          
          <div className={styles.formRow}>
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
                  Add
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
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span>Publish Blog Post</span>
              </label>
            </div>
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
          {loading ? 'Saving...' : blog ? 'Update Blog Post' : 'Publish Blog Post'}
        </button>
      </div>
    </form>
  )
}

export default BlogForm