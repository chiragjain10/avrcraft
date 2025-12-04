// components/admin/artisans/CreateArtisan.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X,
  AlertCircle
} from 'lucide-react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import styles from './CreateArtisan.module.css'

const CreateArtisan = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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
    createdAt: new Date().toISOString()
  })

  const [techniqueInput, setTechniqueInput] = useState('')
  const [awardInput, setAwardInput] = useState('')

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

    setLoading(true)
    try {
      const artisanData = {
        ...formData,
        updatedAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'artisans'), artisanData)
      navigate('/admin/artisans')
    } catch (error) {
      console.error('Error creating artisan:', error)
      setErrors({ submit: 'Failed to create artisan. Please try again.' })
    } finally {
      setLoading(false)
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

  return (
    <div className={styles.createArtisan}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/admin/artisans')}>
          <ArrowLeft size={18} />
          Back to Artisans
        </button>
        <h1 className={styles.title}>Add New Artisan</h1>
        <p className={styles.subtitle}>Fill in the details to create a new artisan profile</p>
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
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Artisan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateArtisan