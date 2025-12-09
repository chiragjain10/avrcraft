import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebase/config';
import styles from './ProductFilters.module.css';

const ProductFilters = ({ categories = [], filters, onFilterChange }) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    author: false,
    price: false,
    rating: false,
    format: false,
    availability: false
  });
  const [authors, setAuthors] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);

  // Fetch authors from products
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoadingAuthors(true);
        const productsQuery = collection(db, 'products');
        const querySnapshot = await getDocs(productsQuery);

        const authorMap = new Map();
        querySnapshot.docs.forEach(doc => {
          const product = doc.data();
          if (product.author && product.isActive !== false) {
            const authorName = product.author.trim();
            if (authorName) {
              const count = authorMap.get(authorName) || 0;
              authorMap.set(authorName, count + 1);
            }
          }
        });

        const authorsData = Array.from(authorMap.entries())
          .map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            count
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setAuthors(authorsData);
      } catch (error) {
        console.error('Error fetching authors:', error);
        setAuthors([]);
      } finally {
        setLoadingAuthors(false);
      }
    };

    fetchAuthors();
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    console.log('Category changed to:', categoryId);
    onFilterChange({
      ...filters,
      category: categoryId
    });
  };

  const handleAuthorChange = (author) => {
    onFilterChange({
      ...filters,
      author: filters.author === author ? '' : author
    });
  };

  const handlePriceChange = (min, max) => {
    onFilterChange({
      ...filters,
      priceRange: [min, max]
    });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({
      ...filters,
      rating: filters.rating === rating ? 0 : rating
    });
  };

  const handleFormatChange = (format) => {
    onFilterChange({
      ...filters,
      format: filters.format === format ? '' : format
    });
  };

  const handleAvailabilityChange = (availability) => {
    onFilterChange({
      ...filters,
      availability: filters.availability === availability ? 'all' : availability
    });
  };

  const handleSpecialFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    })
  }

  return (
    <div className={styles.filters}>
      {/* Categories Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('category')}
          type="button"
        >
          <span className={styles.sectionTitle}>Product Categories</span>
          {openSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {openSections.category && (
          <div className={styles.sectionContent}>
            {/* All Categories option */}
            <label className={styles.option}>
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => handleCategoryChange('')}
                className={styles.radio}
              />
              <span className={styles.customRadio}></span>
              <span className={styles.optionText}>All Categories</span>
            </label>

            {/* Individual categories */}
            {categories.map(category => {
              const categoryId = category.id || category.name;
              const categoryName = category.name || category.categoryName || 'Unnamed Category';

              return (
                <label key={categoryId} className={styles.option}>
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === categoryId || filters.category === categoryName}
                    onChange={() => handleCategoryChange(categoryId)}
                    className={styles.radio}
                  />
                  <span className={styles.customRadio}></span>
                  <span className={styles.optionText}>
                    {categoryName}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Authors Section - FIXED */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('author')}
          type="button"
        >
          <span className={styles.sectionTitle}>Authors</span>
          {openSections.author ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.author && (
          <div className={styles.sectionContent}>
            {loadingAuthors ? (
              <div className={styles.loading}>Loading authors...</div>
            ) : authors.length === 0 ? (
              <div className={styles.noData}>No authors found</div>
            ) : (
              <>
                {/* "All Authors" option */}
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="author"
                    checked={!filters.author}
                    onChange={() => handleAuthorChange('')}
                    className={styles.radio}
                  />
                  <span className={styles.customRadio}></span>
                  <span className={styles.optionText}>All Authors</span>
                </label>

                {/* Individual authors */}
                {authors.slice(0, 10).map(author => (
                  <label key={author.id} className={styles.option}>
                    <input
                      type="radio"
                      name="author"
                      checked={filters.author === author.name}
                      onChange={() => handleAuthorChange(author.name)}
                      className={styles.radio}
                    />
                    <span className={styles.customRadio}></span>
                    <span className={styles.optionText}>{author.name}</span>
                    <span className={styles.count}>({author.count})</span>
                  </label>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('price')}
          type="button"
        >
          <span className={styles.sectionTitle}>Price Range (₹)</span>
          {openSections.price ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.price && (
          <div className={styles.sectionContent}>
            <div className={styles.priceInputs}>
              <div className={styles.priceInput}>
                <label>Min</label>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
                  min="0"
                  max="1000"
                  className={styles.priceField}
                />
              </div>
              <div className={styles.priceInput}>
                <label>Max</label>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
                  min="0"
                  max="1000"
                  className={styles.priceField}
                />
              </div>
            </div>

            <div className={styles.pricePresets}>
              <button
                onClick={() => handlePriceChange(0, 200)}
                className={`${styles.preset} ${filters.priceRange[0] === 0 && filters.priceRange[1] === 200 ? styles.active : ''}`}
                type="button"
              >
                Under ₹200
              </button>
              <button
                onClick={() => handlePriceChange(200, 500)}
                className={`${styles.preset} ${filters.priceRange[0] === 200 && filters.priceRange[1] === 500 ? styles.active : ''}`}
                type="button"
              >
                ₹200 - ₹500
              </button>
              <button
                onClick={() => handlePriceChange(500, 1000)}
                className={`${styles.preset} ${filters.priceRange[0] === 500 && filters.priceRange[1] === 1000 ? styles.active : ''}`}
                type="button"
              >
                ₹500 - ₹1000
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rating Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('rating')}
          type="button"
        >
          <span className={styles.sectionTitle}>Customer Rating</span>
          {openSections.rating ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.rating && (
          <div className={styles.sectionContent}>
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className={styles.option}>
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className={styles.radio}
                />
                <span className={styles.customRadio}></span>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < rating ? styles.starFilled : styles.starEmpty}
                      fill={i < rating ? "#2c3e50" : "none"}
                    />
                  ))}
                </div>
                <span className={styles.ratingText}>& above</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Format Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('format')}
          type="button"
        >
          <span className={styles.sectionTitle}>Format</span>
          {openSections.format ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.format && (
          <div className={styles.sectionContent}>
            {/* "All Formats" option */}
            <label className={styles.option}>
              <input
                type="radio"
                name="format"
                checked={!filters.format}
                onChange={() => handleFormatChange('')}
                className={styles.radio}
              />
              <span className={styles.customRadio}></span>
              <span className={styles.optionText}>All Formats</span>
            </label>

            {['Paperback', 'Hardcover', 'Ebook', 'Audiobook'].map(format => (
              <label key={format} className={styles.option}>
                <input
                  type="radio"
                  name="format"
                  checked={filters.format === format.toLowerCase()}
                  onChange={() => handleFormatChange(format.toLowerCase())}
                  className={styles.radio}
                />
                <span className={styles.customRadio}></span>
                <span className={styles.optionText}>{format}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('availability')}
          type="button"
        >
          <span className={styles.sectionTitle}>Availability</span>
          {openSections.availability ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {openSections.availability && (
          <div className={styles.sectionContent}>
            <label className={styles.option}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'all'}
                onChange={() => handleAvailabilityChange('all')}
                className={styles.radio}
              />
              <span className={styles.customRadio}></span>
              <span className={styles.optionText}>All Books</span>
            </label>
            <label className={styles.option}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'in-stock'}
                onChange={() => handleAvailabilityChange('in-stock')}
                className={styles.radio}
              />
              <span className={styles.customRadio}></span>
              <span className={styles.optionText}>In Stock</span>
            </label>
            <label className={styles.option}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'out-of-stock'}
                onChange={() => handleAvailabilityChange('out-of-stock')}
                className={styles.radio}
              />
              <span className={styles.customRadio}></span>
              <span className={styles.optionText}>Out of Stock</span>
            </label>
          </div>
        )}
      </div>

      {/* Special Filters Section */}
      <div className={styles.section}>
        <button
          className={styles.sectionHeader}
          onClick={() => toggleSection('special')}
          type="button"
        >
          <span className={styles.sectionTitle}>Special Collections</span>
          {openSections.special ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {openSections.special && (
          <div className={styles.sectionContent}>
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={filters.isBestseller || false}
                onChange={(e) => handleSpecialFilterChange('isBestseller', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.customCheckbox}></span>
              <span className={styles.optionText}>Bestsellers Only</span>
            </label>

            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={filters.isFiction || false}
                onChange={(e) => handleSpecialFilterChange('isFiction', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.customCheckbox}></span>
              <span className={styles.optionText}>Fiction Books</span>
            </label>

            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={filters.isNonFiction || false}
                onChange={(e) => handleSpecialFilterChange('isNonFiction', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.customCheckbox}></span>
              <span className={styles.optionText}>Non-Fiction Books</span>
            </label>

            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={filters.isChildrenBook || false}
                onChange={(e) => handleSpecialFilterChange('isChildrenBook', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.customCheckbox}></span>
              <span className={styles.optionText}>Children's Books</span>
            </label>

            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={filters.isStationary || false}
                onChange={(e) => handleSpecialFilterChange('isStationary', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.customCheckbox}></span>
              <span className={styles.optionText}>Stationary</span>
            </label>

            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={filters.isGift || false}
                onChange={(e) => handleSpecialFilterChange('isGift', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.customCheckbox}></span>
              <span className={styles.optionText}>Gifts</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductFilters