import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react'
import ProductGrid from '../../components/products/ProductGrid/ProductGrid'
import ProductFilters from '../../components/products/ProductFilters/ProductFilters'
import { useProducts } from '../../hooks/useProducts'
import styles from './Shop.module.css'

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: [0, 100000],
    rating: 0,
    artisan: '',
    material: '',
    availability: 'all'
  })

  const [sortBy, setSortBy] = useState('newest')

  // Update filters when URL parameters change
  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setFilters(prev => ({ ...prev, category }))
    }
  }, [searchParams])

  const { products, loading, error } = useProducts(filters)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    
    // Update URL parameters
    const params = new URLSearchParams()
    if (newFilters.category) {
      params.set('category', newFilters.category)
    }
    setSearchParams(params)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const clearAllFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 100000],
      rating: 0,
      artisan: '',
      material: '',
      availability: 'all'
    })
    setSearchParams({})
  }

  const sortProducts = (products) => {
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price)
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating)
      case 'name':
        return [...products].sort((a, b) => a.name.localeCompare(b.name))
      case 'newest':
      default:
        return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }

  const sortedProducts = sortProducts(products)

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) {
      return value[0] !== 0 || value[1] !== 100000
    }
    return value !== '' && value !== 'all' && value !== 0
  }).length

  return (
    <div className={styles.shop}>
      {/* Header */}
      <div className={styles.shopHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.shopTitle}>Artisan Collection</h1>
              <p className={styles.shopSubtitle}>
                Discover handcrafted treasures from master artisans across India
              </p>
            </div>
            <div className={styles.headerStats}>
              <span className={styles.productCount}>
                {loading ? '...' : sortedProducts.length} Products
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.shopLayout}>
          {/* Sidebar Filters - Desktop */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h3>Filters</h3>
              <button 
                onClick={() => setShowFilters(false)}
                className={styles.closeFilters}
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
                >
                  <Filter size={20} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className={styles.filterBadge}>{activeFiltersCount}</span>
                  )}
                </button>

                <div className={styles.viewToggle}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
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
                  {filters.category && (
                    <span className={styles.filterTag}>
                      Category: {filters.category}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, category: '' })}
                        className={styles.removeFilter}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
                    <span className={styles.filterTag}>
                      Price: ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, priceRange: [0, 100000] })}
                        className={styles.removeFilter}
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
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {filters.artisan && (
                    <span className={styles.filterTag}>
                      Artisan: {filters.artisan}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, artisan: '' })}
                        className={styles.removeFilter}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  
                  {filters.material && (
                    <span className={styles.filterTag}>
                      Material: {filters.material}
                      <button 
                        onClick={() => handleFilterChange({ ...filters, material: '' })}
                        className={styles.removeFilter}
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
                  <p>Loading artisan products...</p>
                </div>
              ) : error ? (
                <div className={styles.errorState}>
                  <h3>Unable to load products</h3>
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
                    <SlidersHorizontal size={64} />
                  </div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                  <button 
                    onClick={clearAllFilters}
                    className={styles.clearFiltersButton}
                  >
                    Clear All Filters
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
                  Showing {sortedProducts.length} of {products.length} products
                  {activeFiltersCount > 0 && ` (filtered from ${products.length} total)`}
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
        ></div>
      )}
    </div>
  )
}

export default Shop