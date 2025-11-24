import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import styles from './ProductFilters.module.css'

const ProductFilters = ({ filters, onFilterChange }) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    rating: true,
    availability: true
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Firebase se categories fetch karo
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('isActive', '==', true)
        )
        
        const querySnapshot = await getDocs(categoriesQuery)
        const categoriesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Agar koi categories nahi mile toh fallback data
        if (categoriesList.length === 0) {
          setCategories(getFallbackCategories())
        } else {
          setCategories(categoriesList)
        }

      } catch (error) {
        console.error('Firebase se categories fetch karne mein error:', error)
        setCategories(getFallbackCategories())
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fallback categories - Real AVR Crafts categories
  const getFallbackCategories = () => [
    { id: '1', name: 'Handicrafts', description: 'Traditional handcrafted items' },
    { id: '2', name: 'Books', description: 'Educational and literature books' },
    { id: '3', name: 'Ethnic Wears', description: 'Traditional clothing and accessories' }
  ]

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryChange = (categoryId) => {
    onFilterChange({
      ...filters,
      category: filters.category === categoryId ? '' : categoryId
    })
  }

  const handlePriceChange = (min, max) => {
    onFilterChange({
      ...filters,
      priceRange: [min, max]
    })
  }

  const handleRatingChange = (rating) => {
    onFilterChange({
      ...filters,
      rating: filters.rating === rating ? 0 : rating
    })
  }

  const handleAvailabilityChange = (availability) => {
    onFilterChange({
      ...filters,
      availability
    })
  }

  // Clear all filters
  const handleClearFilters = () => {
    onFilterChange({
      category: '',
      priceRange: [0, 100000],
      rating: 0,
      availability: 'all'
    })
  }

  return (
    <div className={styles.filters}>
      {/* Filters Header */}
      <div className={styles.filtersHeader}>
        <h3 className={styles.filtersTitle}>Filters</h3>
        <button 
          onClick={handleClearFilters}
          className={styles.clearFilters}
        >
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div className={styles.filterSection}>
        <button 
          className={styles.filterHeader}
          onClick={() => toggleSection('category')}
        >
          <span>Product Categories</span>
          {openSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {openSections.category && (
          <div className={styles.filterOptions}>
            {loading ? (
              <div className={styles.loading}>Loading categories...</div>
            ) : (
              categories.map(category => (
                <label key={category.id} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={filters.category === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className={styles.filterCheckbox}
                  />
                  <span className={styles.checkboxCustom}></span>
                  <span className={styles.optionLabel}>{category.name}</span>
                  {category.description && (
                    <span className={styles.optionDescription}>({category.description})</span>
                  )}
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className={styles.filterSection}>
        <button 
          className={styles.filterHeader}
          onClick={() => toggleSection('price')}
        >
          <span>Price Range (₹)</span>
          {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {openSections.price && (
          <div className={styles.filterOptions}>
            <div className={styles.priceRange}>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <label>Min</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceRange[0] || ''}
                    onChange={(e) => handlePriceChange(Number(e.target.value) || 0, filters.priceRange[1])}
                    className={styles.priceField}
                  />
                </div>
                <div className={styles.priceInput}>
                  <label>Max</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={filters.priceRange[1] || ''}
                    onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value) || 100000)}
                    className={styles.priceField}
                  />
                </div>
              </div>
              
              <div className={styles.pricePresets}>
                <button 
                  onClick={() => handlePriceChange(0, 500)}
                  className={`${styles.pricePreset} ${filters.priceRange[0] === 0 && filters.priceRange[1] === 500 ? styles.active : ''}`}
                >
                  Under ₹500
                </button>
                <button 
                  onClick={() => handlePriceChange(500, 2000)}
                  className={`${styles.pricePreset} ${filters.priceRange[0] === 500 && filters.priceRange[1] === 2000 ? styles.active : ''}`}
                >
                  ₹500 - ₹2,000
                </button>
                <button 
                  onClick={() => handlePriceChange(2000, 5000)}
                  className={`${styles.pricePreset} ${filters.priceRange[0] === 2000 && filters.priceRange[1] === 5000 ? styles.active : ''}`}
                >
                  ₹2,000 - ₹5,000
                </button>
                <button 
                  onClick={() => handlePriceChange(5000, 100000)}
                  className={`${styles.pricePreset} ${filters.priceRange[0] === 5000 && filters.priceRange[1] === 100000 ? styles.active : ''}`}
                >
                  Over ₹5,000
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className={styles.filterSection}>
        <button 
          className={styles.filterHeader}
          onClick={() => toggleSection('rating')}
        >
          <span>Customer Rating</span>
          {openSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {openSections.rating && (
          <div className={styles.filterOptions}>
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={filters.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className={styles.filterCheckbox}
                />
                <span className={styles.checkboxCustom}></span>
                <span className={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i}
                      className={i < rating ? styles.starFilled : styles.starEmpty}
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className={styles.ratingText}>& above</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className={styles.filterSection}>
        <button 
          className={styles.filterHeader}
          onClick={() => toggleSection('availability')}
        >
          <span>Availability</span>
          {openSections.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {openSections.availability && (
          <div className={styles.filterOptions}>
            <label className={styles.filterOption}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'all'}
                onChange={() => handleAvailabilityChange('all')}
                className={styles.filterRadio}
              />
              <span className={styles.radioCustom}></span>
              <span className={styles.optionLabel}>All Products</span>
            </label>
            <label className={styles.filterOption}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'in-stock'}
                onChange={() => handleAvailabilityChange('in-stock')}
                className={styles.filterRadio}
              />
              <span className={styles.radioCustom}></span>
              <span className={styles.optionLabel}>In Stock</span>
            </label>
            <label className={styles.filterOption}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'out-of-stock'}
                onChange={() => handleAvailabilityChange('out-of-stock')}
                className={styles.filterRadio}
              />
              <span className={styles.radioCustom}></span>
              <span className={styles.optionLabel}>Out of Stock</span>
            </label>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(filters.category || filters.rating > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 || filters.availability !== 'all') && (
        <div className={styles.activeFilters}>
          <h4>Active Filters:</h4>
          <div className={styles.activeFilterTags}>
            {filters.category && (
              <span className={styles.activeFilterTag}>
                Category: {categories.find(cat => cat.id === filters.category)?.name}
                <button onClick={() => handleCategoryChange('')}>×</button>
              </span>
            )}
            {filters.rating > 0 && (
              <span className={styles.activeFilterTag}>
                Rating: {filters.rating}+ stars
                <button onClick={() => handleRatingChange(0)}>×</button>
              </span>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
              <span className={styles.activeFilterTag}>
                Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                <button onClick={() => handlePriceChange(0, 100000)}>×</button>
              </span>
            )}
            {filters.availability !== 'all' && (
              <span className={styles.activeFilterTag}>
                {filters.availability === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                <button onClick={() => handleAvailabilityChange('all')}>×</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFilters