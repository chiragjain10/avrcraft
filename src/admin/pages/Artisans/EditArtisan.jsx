// components/admin/artisans/EditArtisan.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  X,
  AlertCircle,
  Loader
} from 'lucide-react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import styles from './CreateArtisan.module.css'

const EditArtisan = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    craft: '',
    specialty: '',
    experience: '',
    story: '',
    imageUrl: '',
    rating: 4.5,
    productsCount: 0,
    techniques: [],
    awards: [],
    isActive: true,
    isFeatured: false,
    isEcoFriendly: false,
  })

  const [techniqueInput, setTechniqueInput] = useState('')
  const [awardInput, setAwardInput] = useState('')

  useEffect(() => {
    fetchArtisan()
  }, [id])

  const fetchArtisan = async () => {
    try {
      setLoading(true)
      const docRef = doc(db, 'artisans', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          craft: data.craft || '',
          specialty: data.specialty || '',
          experience: data.experience || '',
          story: data.story || '',
          imageUrl: data.imageUrl || '',
          rating: data.rating || 4.5,
          productsCount: data.productsCount || 0,
          techniques: data.techniques || [],
          awards: data.awards || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
          isFeatured: data.isFeatured || false,
          isEcoFriendly: data.isEcoFriendly || false,
        })
      } else {
        navigate('/admin/artisans')
      }
    } catch (error) {
      console.error('Error fetching artisan:', error)
      setErrors({ fetch: 'Failed to load artisan data.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    const validationErrors = {}
    if (!formData.name.trim()) validationErrors.name = 'Name is required'
    if (!formData.craft.trim()) validationErrors.craft = 'Craft is required'
    if (!formData.location.trim()) validationErrors.location = 'Location is required'
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const artisanData = {
        ...formData,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(doc(db, 'artisans', id), artisanData)
      navigate('/admin/artisans')
    } catch (error) {
      console.error('Error updating artisan:', error)
      setErrors({ submit: 'Failed to update artisan. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const addTechnique = () => {
    if (techniqueInput.trim()) {
      setFormData({
        ...formData,
        techniques: [...formData.techniques, techniqueInput.trim()]
      })
      setTechniqueInput('')
    }
  }

  const removeTechnique = (index) => {
    setFormData({
      ...formData,
      techniques: formData.techniques.filter((_, i) => i !== index)
    })
  }

  const addAward = () => {
    if (awardInput.trim()) {
      setFormData({
        ...formData,
        awards: [...formData.awards, awardInput.trim()]
      })
      setAwardInput('')
    }
  }

  const removeAward = (index) => {
    setFormData({
      ...formData,
      awards: formData.awards.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading artisan data...</p>
      </div>
    )
  }

  return (
    <div className={styles.createEditArtisan}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/admin/artisans')}>
          <ArrowLeft size={18} />
          Back to Artisans
        </button>
        <h1 className={styles.title}>Edit Artisan</h1>
        <p className={styles.subtitle}>Update the details for {formData.name}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.submit && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            {errors.submit}
          </div>
        )}

        <div className={styles.formGrid}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Artisan Name *
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`${styles.input} ${errors.name ? styles.error : ''}`}
                  placeholder="Enter artisan's full name"
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </label>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email Address
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={styles.input}
                    placeholder="artisan@example.com"
                  />
                </label>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Phone Number
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={styles.input}
                    placeholder="+91 1234567890"
                  />
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Location *
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className={`${styles.input} ${errors.location ? styles.error : ''}`}
                  placeholder="City, State"
                />
                {errors.location && <span className={styles.errorText}>{errors.location}</span>}
              </label>
            </div>
          </div>

          {/* Craft Details */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Craft Details</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Craft / Art Form *
                <input
                  type="text"
                  value={formData.craft}
                  onChange={(e) => setFormData({...formData, craft: e.target.value})}
                  className={`${styles.input} ${errors.craft ? styles.error : ''}`}
                  placeholder="e.g., Banarasi Silk Weaving, Madhubani Painting"
                />
                {errors.craft && <span className={styles.errorText}>{errors.craft}</span>}
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Specialty
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  className={styles.input}
                  placeholder="e.g., Traditional Silk Sarees, Mythological Art"
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Years of Experience
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className={styles.input}
                  placeholder="e.g., 25 years"
                />
              </label>
            </div>

            {/* Techniques */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Techniques</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  value={techniqueInput}
                  onChange={(e) => setTechniqueInput(e.target.value)}
                  className={styles.input}
                  placeholder="Add a technique and press Enter"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnique())}
                />
                <button 
                  type="button" 
                  className={styles.addTagButton}
                  onClick={addTechnique}
                >
                  Add
                </button>
              </div>
              <div className={styles.tags}>
                {formData.techniques.map((technique, index) => (
                  <span key={index} className={styles.tag}>
                    {technique}
                    <button 
                      type="button"
                      className={styles.removeTag}
                      onClick={() => removeTechnique(index)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Awards & Recognition</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  value={awardInput}
                  onChange={(e) => setAwardInput(e.target.value)}
                  className={styles.input}
                  placeholder="Add an award and press Enter"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAward())}
                />
                <button 
                  type="button" 
                  className={styles.addTagButton}
                  onClick={addAward}
                >
                  Add
                </button>
              </div>
              <div className={styles.tags}>
                {formData.awards.map((award, index) => (
                  <span key={index} className={styles.tag}>
                    {award}
                    <button 
                      type="button"
                      className={styles.removeTag}
                      onClick={() => removeAward(index)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Image & Story */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Image & Story</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Profile Image URL
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className={styles.input}
                  placeholder="https://example.com/image.jpg"
                />
              </label>
              {formData.imageUrl && (
                <div className={styles.imagePreview}>
                  <img src={formData.imageUrl} alt="Preview" />
                  <span>Current Image Preview</span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Artisan's Story
                <textarea
                  value={formData.story}
                  onChange={(e) => setFormData({...formData, story: e.target.value})}
                  className={styles.textarea}
                  placeholder="Tell the artisan's story, their journey, and what makes their craft special..."
                  rows={6}
                />
              </label>
            </div>
          </div>

          {/* Settings */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Settings</h2>
            <div className={styles.settingsGrid}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className={styles.checkbox}
                />
                Active Artisan
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className={styles.checkbox}
                />
                Featured Artisan
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isEcoFriendly}
                  onChange={(e) => setFormData({...formData, isEcoFriendly: e.target.checked})}
                  className={styles.checkbox}
                />
                Eco-Friendly Practices
              </label>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Rating (1-5)
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                    className={styles.input}
                  />
                </label>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Products Count
                  <input
                    type="number"
                    min="0"
                    value={formData.productsCount}
                    onChange={(e) => setFormData({...formData, productsCount: parseInt(e.target.value)})}
                    className={styles.input}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => navigate('/admin/artisans')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className={styles.spinner}></div>
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Update Artisan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditArtisan