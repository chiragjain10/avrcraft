// src/pages/Shop/Shop.jsx (Updated for Books Store)
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, X, Search } from 'lucide-react'
import ProductGrid from '../../components/products/ProductGrid/ProductGrid'
import ProductFilters from '../../components/products/ProductFilters/ProductFilters'
import { useProducts } from '../../hooks/useProducts'
import { useSearch } from '../../contexts/SearchContext'
import styles from './Shop.module.css'

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const { searchQuery, setSearchQuery } = useSearch()

  // Initialize filters from URL
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: [0, 1000], // Books range
    rating: 0,
    author: searchParams.get('author') || '',
    availability: 'all',
    format: '' // Paperback, Hardcover, etc.
  })

  const [sortBy, setSortBy] = useState('newest')

  // Sync with URL
  useEffect(() => {
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    
    if (category) {
      setFilters(prev => ({ ...prev, category }))
    }
    
    if (author) {
      setFilters(prev => ({ ...prev, author }))
    }
    
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams, setSearchQuery])

  // Use products with filters and search query
  const { products, loading, error } = useProducts(filters, searchQuery)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    
    // Update URL parameters
    const params = new URLSearchParams()
    if (newFilters.category) {
      params.set('category', newFilters.category)
    }
    if (newFilters.author) {
      params.set('author', newFilters.author)
    }
    if (searchQuery) {
      params.set('search', searchQuery)
    }
    setSearchParams(params)
  }

  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value
    setSearchQuery(newSearchQuery)
    
    // Update URL with search parameter
    const params = new URLSearchParams()
    if (filters.category) {
      params.set('category', filters.category)
    }
    if (filters.author) {
      params.set('author', filters.author)
    }
    if (newSearchQuery) {
      params.set('search', newSearchQuery)
    }
    setSearchParams(params)
  }

  const clearSearch = () => {
    setSearchQuery('')
    const params = new URLSearchParams()
    if (filters.category) {
      params.set('category', filters.category)
    }
    if (filters.author) {
      params.set('author', filters.author)
    }
    setSearchParams(params)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const clearAllFilters = () => {
    const newFilters = {
      category: '',
      priceRange: [0, 1000],
      rating: 0,
      author: '',
      availability: 'all',
      format: ''
    }
    setFilters(newFilters)
    setSearchQuery('')
    setSearchParams({})
  }

  const sortProducts = (products) => {
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price)
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'name':
        return [...products].sort((a, b) => a.name.localeCompare(b.name))
      case 'popular':
        return [...products].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
      case 'newest':
      default:
        return [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
  }

  const sortedProducts = sortProducts(products)

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') {
      return value[0] !== 0 || value[1] !== 1000
    }
    if (key === 'rating') return value !== 0
    return value !== '' && value !== 'all'
  }).length + (searchQuery ? 1 : 0)

  return (
    <div className={styles.shop}>
      {/* Header */}
      <div className={styles.shopHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.shopTitle}>
                {searchQuery ? `Search: "${searchQuery}"` : 'Book Collection'}
              </h1>
              <p className={styles.shopSubtitle}>
                {searchQuery 
                  ? `Found ${sortedProducts.length} books matching your search`
                  : 'Discover amazing books from bestselling authors'
                }
              </p>
            </div>
            <div className={styles.headerStats}>
              <span className={styles.productCount}>
                {loading ? '...' : sortedProducts.length} Books
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className={styles.shopSearch}>
            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search books, authors, categories..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button onClick={clearSearch} className={styles.clearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.shopLayout}>
          {/* Sidebar Filters */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h3>Filters</h3>
              <button 
                onClick={() => setShowFilters(false)}
                className={styles.closeFilters}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            
            <ProductFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            
            <div className={styles.filterActions}>
              <button 
                onClick={clearAllFilters}
                className={styles.clearFilters}
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <button 
                  onClick={() => setShowFilters(true)}
                  className={styles.filterToggle}
                  aria-label="Open filters"
                >
                  <Filter size={20} />
                  <span className={styles.filterText}>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className={styles.filterBadge}>{activeFiltersCount}</span>
                  )}
                </button>

                <div className={styles.viewToggle}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                    aria-label="Grid view"
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                    aria-label="List view"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              <div className={styles.toolbarRight}>
                <div className={styles.sortGroup}>
                  <label htmlFor="sort" className={styles.sortLabel}>Sort by:</label>
                  <select 
                    id="sort"
                    value={sortBy}
                    onChange={handleSortChange}
                    className={styles.sortSelect}
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className={styles.activeFilters}>
                <div className={styles.activeFiltersHeader}>
                  <span>Active Filters:</span>
                  <button 
                    onClick={clearAllFilters}
                    className={styles.clearAll}
                  >
                    Clear All
                  </button>
                </div>
                
                <div className={styles.activeFilterTags}>
                  {/* Search Query Tag */}
                  {searchQuery && (
                    <span className={styles.filterTag}>
                      Search: "{searchQuery}"
                      <button 
                        onClick={clearSearch}
                        className={styles.removeFilter}
                        aria-label="Remove search"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {filters.category && (
                    <span className={styles.filterTag}>
                      Category: {filters.category}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, category: '' })}
                        className={styles.removeFilter}
                        aria-label={`Remove ${filters.category} category`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                    <span className={styles.filterTag}>
                      Price: £{filters.priceRange[0]} - £{filters.priceRange[1]}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, priceRange: [0, 1000] })}
                        className={styles.removeFilter}
                        aria-label="Remove price filter"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {filters.rating > 0 && (
                    <span className={styles.filterTag}>
                      Rating: {filters.rating}+ Stars
                      <button 
                        onClick={() => handleFilterChange({ ...filters, rating: 0 })}
                        className={styles.removeFilter}
                        aria-label="Remove rating filter"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {filters.author && (
                    <span className={styles.filterTag}>
                      Author: {filters.author}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, author: '' })}
                        className={styles.removeFilter}
                        aria-label={`Remove ${filters.author} author`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {filters.format && (
                    <span className={styles.filterTag}>
                      Format: {filters.format}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, format: '' })}
                        className={styles.removeFilter}
                        aria-label={`Remove ${filters.format} format`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {filters.availability !== 'all' && (
                    <span className={styles.filterTag}>
                      {filters.availability === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, availability: 'all' })}
                        className={styles.removeFilter}
                        aria-label="Remove availability filter"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className={styles.productsSection}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>
                    {searchQuery ? 'Searching books...' : 'Loading books...'}
                  </p>
                </div>
              ) : error ? (
                <div className={styles.errorState}>
                  <h3>Unable to load books</h3>
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className={styles.retryButton}
                  >
                    Try Again
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIllustration}>
                    <Search size={64} />
                  </div>
                  <h3>No books found</h3>
                  <p>
                    {searchQuery 
                      ? `No books found for "${searchQuery}". Try different keywords or clear search.`
                      : 'Try adjusting your filters or search criteria'
                    }
                  </p>
                  <button 
                    onClick={clearAllFilters}
                    className={styles.clearFiltersButton}
                  >
                    {searchQuery ? 'Clear Search' : 'Clear All Filters'}
                  </button>
                </div>
              ) : (
                <ProductGrid 
                  products={sortedProducts}
                  viewMode={viewMode}
                />
              )}
            </div>

            {/* Results Info */}
            {!loading && sortedProducts.length > 0 && (
              <div className={styles.resultsInfo}>
                <p>
                  Showing {sortedProducts.length} books
                  {searchQuery && ` for "${searchQuery}"`}
                  {activeFiltersCount > 0 && ` (with ${activeFiltersCount} active filters)`}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setShowFilters(false)}
          aria-hidden="true"
        ></div>
      )}
    </div>
  )
}

export default Shop