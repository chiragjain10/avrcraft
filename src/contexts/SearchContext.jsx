// src/contexts/SearchContext.jsx
import React, { createContext, useContext, useState, useMemo } from 'react'

const SearchContext = createContext()

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    priceRange: { min: 0, max: 100000 },
    rating: 0,
    artisan: '',
    material: '',
    availability: 'all',
    sortBy: 'newest'
  })
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  // Load recent searches from localStorage on component mount
  React.useEffect(() => {
    const savedSearches = localStorage.getItem('avrCrafts_recentSearches')
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Save recent searches to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('avrCrafts_recentSearches', JSON.stringify(recentSearches))
  }, [recentSearches])

  const addToRecentSearches = (query) => {
    if (!query.trim()) return
    
    const newSearch = {
      query: query.trim(),
      timestamp: new Date().toISOString()
    }
    
    setRecentSearches(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase())
      // Add to beginning and limit to 10 items
      return [newSearch, ...filtered].slice(0, 10)
    })
  }

  const removeFromRecentSearches = (query) => {
    setRecentSearches(prev => 
      prev.filter(item => item.query.toLowerCase() !== query.toLowerCase())
    )
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
  }

  const updateSearchQuery = (query) => {
    setSearchQuery(query)
    if (query.trim()) {
      addToRecentSearches(query)
    }
  }

  const updateSearchFilters = (newFilters) => {
    setSearchFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchFilters({
      category: '',
      priceRange: { min: 0, max: 100000 },
      rating: 0,
      artisan: '',
      material: '',
      availability: 'all',
      sortBy: 'newest'
    })
    setSearchResults([])
    setIsSearching(false)
  }

  const clearFilters = () => {
    setSearchFilters({
      category: '',
      priceRange: { min: 0, max: 100000 },
      rating: 0,
      artisan: '',
      material: '',
      availability: 'all',
      sortBy: 'newest'
    })
  }

  const hasActiveSearch = useMemo(() => {
    return searchQuery.trim() !== '' || 
           searchFilters.category !== '' || 
           searchFilters.artisan !== '' ||
           searchFilters.material !== '' ||
           searchFilters.availability !== 'all' ||
           searchFilters.rating > 0 ||
           searchFilters.priceRange.min > 0 ||
           searchFilters.priceRange.max < 100000
  }, [searchQuery, searchFilters])

  const activeFiltersCount = useMemo(() => {
    let count = searchQuery.trim() !== '' ? 1 : 0
    
    if (searchFilters.category !== '') count++
    if (searchFilters.artisan !== '') count++
    if (searchFilters.material !== '') count++
    if (searchFilters.availability !== 'all') count++
    if (searchFilters.rating > 0) count++
    if (searchFilters.priceRange.min > 0 || searchFilters.priceRange.max < 100000) count++
    
    return count
  }, [searchQuery, searchFilters])

  const value = useMemo(() => ({
    // State
    searchQuery,
    searchFilters,
    searchResults,
    isSearching,
    recentSearches,
    hasActiveSearch,
    activeFiltersCount,
    
    // Actions
    setSearchQuery: updateSearchQuery,
    setSearchFilters: updateSearchFilters,
    setSearchResults,
    setIsSearching,
    
    // Helper functions
    clearSearch,
    clearFilters,
    addToRecentSearches,
    removeFromRecentSearches,
    clearRecentSearches,
    
    // Filter specific actions
    setCategory: (category) => updateSearchFilters({ category }),
    setPriceRange: (priceRange) => updateSearchFilters({ priceRange }),
    setRating: (rating) => updateSearchFilters({ rating }),
    setArtisan: (artisan) => updateSearchFilters({ artisan }),
    setMaterial: (material) => updateSearchFilters({ material }),
    setAvailability: (availability) => updateSearchFilters({ availability }),
    setSortBy: (sortBy) => updateSearchFilters({ sortBy })
  }), [
    searchQuery,
    searchFilters,
    searchResults,
    isSearching,
    recentSearches,
    hasActiveSearch,
    activeFiltersCount
  ])

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}