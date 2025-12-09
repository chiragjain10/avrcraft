import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Filter, Grid, List, X, Search, ChevronDown } from 'lucide-react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import ProductGrid from '../../components/products/ProductGrid/ProductGrid'
import ProductFilters from '../../components/products/ProductFilters/ProductFilters'
import { useProducts } from '../../hooks/useProducts'
import { useSearch } from '../../contexts/SearchContext'
import { db } from '../../utils/firebase/config'
import styles from './Shop.module.css'

const Shop = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const { searchQuery, setSearchQuery } = useSearch()

  // Initialize filters from URL
  const initialFilters = useMemo(() => ({
    category: searchParams.get('category') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 1000,
    rating: Number(searchParams.get('rating')) || 0,
    author: searchParams.get('author') || '',
    availability: searchParams.get('availability') || 'all',
    format: searchParams.get('format') || '',
    isBestseller: searchParams.get('bestseller') === 'true',
    isFiction: searchParams.get('fiction') === 'true',
    isNonFiction: searchParams.get('nonfiction') === 'true',
    isChildrens: searchParams.get('childrens') === 'true',
    isStationery: searchParams.get('stationery') === 'true',
    isGift: searchParams.get('gift') === 'true'
  }), [searchParams])

  const [filters, setFilters] = useState(initialFilters)
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('isActive', '==', true)
        )
        
        const querySnapshot = await getDocs(categoriesQuery)
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Sort alphabetically
        categoriesData.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Sync URL params with state
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchQuery) params.set('search', searchQuery)
    if (filters.category) params.set('category', filters.category)
    if (filters.author) params.set('author', filters.author)
    if (filters.format) params.set('format', filters.format)
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice < 1000) params.set('maxPrice', filters.maxPrice)
    if (filters.rating > 0) params.set('rating', filters.rating)
    if (filters.availability !== 'all') params.set('availability', filters.availability)
    if (filters.isBestseller) params.set('bestseller', 'true')
    if (filters.isFiction) params.set('fiction', 'true')
    if (filters.isNonFiction) params.set('nonfiction', 'true')
    if (filters.isChildrens) params.set('childrens', 'true')
    if (filters.isStationery) params.set('stationery', 'true')
    if (filters.isGift) params.set('gift', 'true')
    if (sortBy !== 'newest') params.set('sort', sortBy)

    // Update URL without page reload
    const newSearch = params.toString()
    if (window.location.search !== `?${newSearch}`) {
      navigate({ search: newSearch }, { replace: true })
    }
  }, [searchQuery, filters, sortBy, navigate])

  // Fetch products with filters
  const { products = [], loading: productsLoading, error: productsError } = 
    useProducts(filters, searchQuery, sortBy)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    if (window.innerWidth <= 768) {
      setShowFilters(false)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const handleSortChange = (value) => {
    setSortBy(value)
  }

  const clearAllFilters = () => {
    setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      rating: 0,
      author: '',
      availability: 'all',
      format: '',
      isBestseller: false,
      isFiction: false,
      isNonFiction: false,
      isChildrens: false,
      isStationery: false,
      isGift: false
    })
    setSearchQuery('')
    setSortBy('newest')
  }

  // Get current category name for display
  const currentCategoryName = useMemo(() => {
    if (filters.category) {
      const category = categories.find(cat => 
        cat.id === filters.category || cat.name === filters.category
      )
      return category ? category.name : filters.category
    }
    return null
  }, [filters.category, categories])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (filters.category) count++
    if (filters.minPrice > 0 || filters.maxPrice < 1000) count++
    if (filters.rating > 0) count++
    if (filters.author) count++
    if (filters.format) count++
    if (filters.availability !== 'all') count++
    if (filters.isBestseller) count++
    if (filters.isFiction) count++
    if (filters.isNonFiction) count++
    if (filters.isChildrens) count++
    if (filters.isStationery) count++
    if (filters.isGift) count++
    return count
  }, [filters, searchQuery])

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ]

  const isLoading = productsLoading || isLoadingCategories

  return (
    <div className={styles.shop}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              {searchQuery 
                ? `Search: "${searchQuery}"`
                : currentCategoryName
                  ? `${currentCategoryName}`
                  : 'All Books'
              }
            </h1>
            <p className={styles.subtitle}>
              {isLoading 
                ? 'Loading...' 
                : searchQuery
                  ? `Found ${products.length} book${products.length !== 1 ? 's' : ''}`
                  : currentCategoryName
                    ? `${products.length} books available`
                    : 'Discover amazing books from bestselling authors'
              }
            </p>
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search books, authors, categories..."
                value={searchQuery}
                onChange={handleSearch}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className={styles.clearSearch}
                  aria-label="Clear search"
                  type="button"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* Mobile Filter Button */}
        <div className={styles.mobileControls}>
          <button
            className={styles.mobileFilterBtn}
            onClick={() => setShowFilters(true)}
            type="button"
          >
            <Filter size={20} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className={styles.filterCount}>{activeFiltersCount}</span>
            )}
          </button>
        </div>

        <div className={styles.content}>
          {/* Sidebar Filters */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.show : ''}`}>
            <div className={styles.sidebarHeader}>
              <h2>Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className={styles.closeBtn}
                aria-label="Close filters"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.filterContent}>
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
              />

              <div className={styles.filterActions}>
                <button
                  onClick={clearAllFilters}
                  className={styles.clearAllBtn}
                  disabled={activeFiltersCount === 0}
                  type="button"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.main}>
            {/* Desktop Controls */}
            <div className={styles.controls}>
              <div className={styles.leftControls}>
                <div className={styles.viewToggle}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                    aria-label="Grid view"
                    type="button"
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                    aria-label="List view"
                    type="button"
                  >
                    <List size={20} />
                  </button>
                </div>

                <span className={styles.resultCount}>
                  {isLoading ? '...' : products.length} {products.length === 1 ? 'book' : 'books'} found
                </span>
              </div>

              <div className={styles.rightControls}>
                {/* Desktop Sort */}
                <div className={styles.desktopSort}>
                  <span className={styles.sortLabel}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className={styles.sortSelect}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className={styles.activeFilters}>
                <div className={styles.activeFiltersHeader}>
                  <h3>Active Filters:</h3>
                  <button
                    onClick={clearAllFilters}
                    className={styles.clearAllSmall}
                    type="button"
                  >
                    Clear All
                  </button>
                </div>

                <div className={styles.filterTags}>
                  {searchQuery && (
                    <span className={styles.filterTag}>
                      Search: "{searchQuery}"
                      <button
                        onClick={clearSearch}
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {filters.category && (
                    <span className={styles.filterTag}>
                      Category: {currentCategoryName}
                      <button
                        onClick={() => handleFilterChange({ ...filters, category: '' })}
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {filters.isBestseller && (
                    <span className={styles.filterTag}>
                      Bestseller
                      <button
                        onClick={() => handleFilterChange({ ...filters, isBestseller: false })}
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {filters.isFiction && (
                    <span className={styles.filterTag}>
                      Fiction
                      <button
                        onClick={() => handleFilterChange({ ...filters, isFiction: false })}
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {filters.isNonFiction && (
                    <span className={styles.filterTag}>
                      Non-Fiction
                      <button
                        onClick={() => handleFilterChange({ ...filters, isNonFiction: false })}
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {filters.isChildrens && (
                    <span className={styles.filterTag}>
                      Children's Books
                      <button
                        onClick={() => handleFilterChange({ ...filters, isChildrens: false })}
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Products Display */}
            <div className={styles.productsContainer}>
              {isLoading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p>Loading books...</p>
                </div>
              ) : productsError ? (
                <div className={styles.error}>
                  <h3>Unable to load books</h3>
                  <p>Failed to load products. Please try again.</p>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.empty}>
                  <Search size={64} className={styles.emptyIcon} />
                  <h3>No books found</h3>
                  <p>
                    {searchQuery
                      ? `No books found for "${searchQuery}". Try different keywords.`
                      : 'Try adjusting your filters or search criteria'}
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className={styles.clearBtn}
                    type="button"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <ProductGrid
                  products={products}
                  viewMode={viewMode}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className={styles.overlay}
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}

export default Shop