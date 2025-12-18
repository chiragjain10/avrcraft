import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Filter, Grid, List, X, Search, ChevronDown } from 'lucide-react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
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
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const { searchQuery, setSearchQuery } = useSearch()

  // Initialize filters from URL
  const initialFilters = useMemo(() => {
    const category = searchParams.get('category') || ''
    const minPrice = Number(searchParams.get('minPrice'))
    const maxPrice = Number(searchParams.get('maxPrice'))
    
    return {
      category: category,
      priceRange: [
        !isNaN(minPrice) && minPrice >= 0 ? minPrice : 0,
        !isNaN(maxPrice) && maxPrice > 0 ? maxPrice : 1000
      ],
      rating: Number(searchParams.get('rating')) || 0,
      author: searchParams.get('author') || '',
      availability: searchParams.get('availability') || 'all',
      format: searchParams.get('format') || '',
      tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : []
    }
  }, [searchParams])

  const [filters, setFilters] = useState(initialFilters)
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        
        // First try with orderBy
        try {
          const categoriesQuery = query(
            collection(db, 'categories'),
            where('isActive', '==', true),
            orderBy('name', 'asc'),
            limit(20)
          )

          const querySnapshot = await getDocs(categoriesQuery)
          const categoriesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || doc.data().categoryName || 'Unnamed Category',
            ...doc.data()
          }))
          setCategories(categoriesData)
        } catch (orderError) {
          console.warn('Could not fetch categories with orderBy, trying without:', orderError)
          
          // Fallback without orderBy
          const fallbackQuery = query(
            collection(db, 'categories'),
            where('isActive', '==', true),
            limit(20)
          )
          
          const fallbackSnapshot = await getDocs(fallbackQuery)
          const fallbackData = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || doc.data().categoryName || 'Unnamed Category',
            ...doc.data()
          }))
          
          // Sort manually
          fallbackData.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          console.log('Fetched categories (fallback):', fallbackData)
          setCategories(fallbackData)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback categories
        const fallbackCategories = [
          { id: 'biographies', name: 'Biographies' },
          { id: 'crime', name: 'Crime & Thriller' },
          { id: 'self-help', name: 'Self-Help' },
          { id: 'childrens', name: 'Children' },
          { id: 'poetry', name: 'Poetry' },
          { id: 'trading', name: 'Trading' },
          { id: 'health', name: 'Health' },
          { id: 'wealth', name: 'Wealth' },
          { id: 'hindi', name: 'Hindi' },
          { id: 'spirituality', name: 'Spirituality' },
          { id: 'romance', name: 'Romance' },
          { id: 'business', name: 'Business' },
          { id: 'fiction', name: 'Fiction' }
        ]
        setCategories(fallbackCategories)
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
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','))
    if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0])
    if (filters.priceRange[1] < 1000) params.set('maxPrice', filters.priceRange[1])
    if (filters.rating > 0) params.set('rating', filters.rating)
    if (filters.availability !== 'all') params.set('availability', filters.availability)
    if (sortBy !== 'newest') params.set('sort', sortBy)

    // Update URL without page reload
    const newSearch = params.toString()
    if (window.location.search !== `?${newSearch}`) {
      navigate({ search: newSearch }, { replace: true })
    }
  }, [searchQuery, filters, sortBy, navigate])

  // Fetch products with filters
  const { products = [], loading: productsLoading, error: productsError } = useProducts(filters, searchQuery)

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    // Close mobile filters on change
    if (window.innerWidth <= 768) {
      setShowFilters(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setIsSortOpen(false)
  }

  const clearAllFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 1000],
      rating: 0,
      author: '',
      availability: 'all',
      format: '',
      tags: []
    })
    setSearchQuery('')
    setSortBy('newest')
  }

  // Sort products
  const sortedProducts = useMemo(() => {
    if (!products || products.length === 0) return []

    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0)
        case 'price-high':
          return (b.price || 0) - (a.price || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'popular':
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0)
        case 'newest':
        default:
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
      }
    })
    
    return sorted
  }, [products, sortBy])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery && searchQuery.trim()) count++
    if (filters.category) count++
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) count++
    if (filters.rating > 0) count++
    if (filters.author) count++
    if (filters.format) count++
    if (filters.availability !== 'all') count++
    if (filters.tags.length > 0) count++
    return count
  }, [filters, searchQuery])

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name A-Z' }
  ]

  // Get category name for display
  const getCategoryName = (categoryId) => {
    if (!categoryId) return ''
    
    // First, check if it's already a display name
    if (categoryId.includes(' ')) return categoryId
    
    // Look for category in fetched categories
    const category = categories.find(cat => {
      if (!cat) return false
      return cat.id === categoryId || 
             cat.name === categoryId || 
             cat.categoryName === categoryId
    })
    
    if (category) {
      return category.name || category.categoryName || categoryId
    }
    
    // Format the ID for display
    return categoryId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // Get current category name from URL
  const currentCategoryName = useMemo(() => {
    if (filters.category) {
      const name = getCategoryName(filters.category)
      return name
    }
    return null
  }, [filters.category, categories])

  const isLoading = productsLoading || isLoadingCategories

  return (
    <div className={styles.shop}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              {searchQuery && searchQuery.trim() 
                ? `Search: "${searchQuery}"`
                : currentCategoryName
                  ? `${currentCategoryName} Books`
                  : 'Book Collection'
              }
            </h1>
            <p className={styles.subtitle}>
              {isLoading 
                ? 'Loading...' 
                : searchQuery && searchQuery.trim()
                  ? `Found ${sortedProducts.length} book${sortedProducts.length !== 1 ? 's' : ''} matching your search`
                  : currentCategoryName
                    ? `Browse our collection of ${currentCategoryName.toLowerCase()} books`
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

          {/* Sort Dropdown for Mobile */}
          <div className={styles.sortDropdown}>
            <button
              className={styles.sortButton}
              onClick={() => setIsSortOpen(!isSortOpen)}
              type="button"
            >
              <span>Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
              <ChevronDown size={16} className={`${styles.sortArrow} ${isSortOpen ? styles.open : ''}`} />
            </button>

            {isSortOpen && (
              <div className={styles.sortMenu}>
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`${styles.sortOption} ${sortBy === option.value ? styles.active : ''}`}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
                  {isLoading ? '...' : sortedProducts.length} {sortedProducts.length === 1 ? 'book' : 'books'} found
                </span>
              </div>

              <div className={styles.rightControls}>
                {/* Desktop Sort */}
                <div className={styles.desktopSort}>
                  <span className={styles.sortLabel}>Sort by:</span>
                  <div className={styles.sortSelect}>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className={styles.sortSelectInput}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className={styles.selectArrow} />
                  </div>
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
                  {searchQuery && searchQuery.trim() && (
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
                      Category: {getCategoryName(filters.category)}
                      <button
                        onClick={() => handleFilterChange({ ...filters, category: '' })}
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                    <span className={styles.filterTag}>
                      Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                      <button
                        onClick={() => handleFilterChange({ ...filters, priceRange: [0, 1000] })}
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {filters.rating > 0 && (
                    <span className={styles.filterTag}>
                      {filters.rating}+ Stars
                      <button
                        onClick={() => handleFilterChange({ ...filters, rating: 0 })}
                        className={styles.removeTag}
                        type="button"
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
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {filters.format && (
                    <span className={styles.filterTag}>
                      Format: {filters.format.charAt(0).toUpperCase() + filters.format.slice(1)}
                      <button
                        onClick={() => handleFilterChange({ ...filters, format: '' })}
                        className={styles.removeTag}
                        type="button"
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
                        className={styles.removeTag}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}

                  {filters.tags.length > 0 && (
                    <span className={styles.filterTag}>
                      Tags: {filters.tags.join(', ')}
                      <button
                        onClick={() => handleFilterChange({ ...filters, tags: [] })}
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
                  <p>{productsError.message || 'Failed to load products. Please try again.'}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className={styles.retryBtn}
                    type="button"
                  >
                    Try Again
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className={styles.empty}>
                  <Search size={64} className={styles.emptyIcon} />
                  <h3>No books found</h3>
                  <p>
                    {searchQuery && searchQuery.trim()
                      ? `No books found for "${searchQuery}". Try different keywords or clear search.`
                      : 'Try adjusting your filters or search criteria'}
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className={styles.clearBtn}
                    type="button"
                  >
                    {searchQuery && searchQuery.trim() ? 'Clear Search' : 'Clear All Filters'}
                  </button>
                </div>
              ) : (
                <ProductGrid
                  products={sortedProducts}
                  viewMode={viewMode}
                  categories={categories}
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