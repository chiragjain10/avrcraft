import React, { useState, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { Star, Heart, ShoppingCart, Eye, Clock } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { useAuth } from '../../../contexts/AuthContext'
import { useWishlist } from '../../../contexts/WishlistContext'
import styles from './ProductGrid.module.css'

// Memoized components for better performance
const ProductGrid = ({ products = [], viewMode = 'grid', categories = [] }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Memoized handlers
  const handleAddToCart = useCallback((product, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }

    if (product && addToCart) {
      addToCart(product)
    }
  }, [isAuthenticated, addToCart])

  const handleWishlist = useCallback(async (product, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!isAuthenticated) {
      alert('Please login to add items to wishlist')
      return
    }

    try {
      if (isInWishlist && isInWishlist(product?.id)) {
        await removeFromWishlist(product.id)
      } else {
        await addToWishlist(product)
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      alert('Failed to update wishlist')
    }
  }, [isAuthenticated, isInWishlist, addToWishlist, removeFromWishlist])

  const handleQuickView = useCallback((product, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setQuickViewProduct(product)
    // Here you can implement quick view modal
    console.log('Quick view:', product?.name)
  }, [])

  const formatPrice = useCallback((price) => {
    if (!price && price !== 0) return '₹0'
    const numPrice = Number(price)
    if (isNaN(numPrice)) return '₹0'
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numPrice)
  }, [])

  const getTimeAgo = useCallback((date) => {
    if (!date) return ''
    try {
      const now = new Date()
      const productDate = new Date(date)
      if (isNaN(productDate.getTime())) return ''
      
      const diffInHours = Math.floor((now - productDate) / (1000 * 60 * 60))

      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours}h ago`
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
      return `${Math.floor(diffInHours / 168)}w ago`
    } catch (error) {
      console.error('Error calculating time ago:', error)
      return ''
    }
  }, [])

  // Show category name instead of ID
  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return ''
    
    // First check if categories is an array
    if (!Array.isArray(categories)) {
      console.warn('Categories is not an array:', categories)
      return String(categoryId).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    const category = categories.find(cat => {
      if (!cat) return false
      return cat.id === categoryId || cat.name === categoryId || cat.categoryName === categoryId
    })
    
    return category ? 
      (category.name || category.categoryName || String(categoryId)) : 
      String(categoryId).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }, [categories])

  // Safe product check
  const safeProducts = Array.isArray(products) ? products : []

  if (viewMode === 'list') {
    return (
      <div className={styles.listView}>
        {safeProducts.length === 0 ? (
          <div className={styles.noProducts}>
            <p>No products found</p>
          </div>
        ) : (
          safeProducts.map((product) => {
            if (!product || !product.id) {
              console.warn('Invalid product:', product)
              return null
            }
            
            return (
              <ProductListItem
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onWishlist={handleWishlist}
                onQuickView={handleQuickView}
                isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                formatPrice={formatPrice}
                getTimeAgo={getTimeAgo}
                getCategoryName={getCategoryName}
              />
            )
          }).filter(Boolean)
        )}
      </div>
    )
  }

  return (
    <div className={styles.gridView}>
      {safeProducts.length === 0 ? (
        <div className={styles.noProducts}>
          <p>No products found</p>
        </div>
      ) : (
        safeProducts.map((product) => {
          if (!product || !product.id) {
            console.warn('Invalid product:', product)
            return null
          }
          
          return (
            <ProductGridItem
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onWishlist={handleWishlist}
              onQuickView={handleQuickView}
              isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
              formatPrice={formatPrice}
              getTimeAgo={getTimeAgo}
              getCategoryName={getCategoryName}
            />
          )
        }).filter(Boolean)
      )}
    </div>
  )
}

ProductGrid.displayName = 'ProductGrid'

// Grid View Item Component
const ProductGridItem = memo(({ 
  product = {}, 
  onAddToCart, 
  onWishlist, 
  onQuickView,
  isInWishlist = false, 
  formatPrice, 
  getTimeAgo, 
  getCategoryName 
}) => {
  // Safe product data
  const safeProduct = {
    id: product?.id || '',
    name: product?.name || 'Unnamed Product',
    author: product?.author || '',
    description: product?.description || '',
    price: Number(product?.price) || 0,
    originalPrice: product?.originalPrice ? Number(product.originalPrice) : null,
    stock: Number(product?.stock) || 0,
    rating: Number(product?.rating) || 0,
    reviewCount: Number(product?.reviewCount) || 0,
    isNew: Boolean(product?.isNew),
    isBestseller: Boolean(product?.isBestseller),
    isActive: Boolean(product?.isActive),
    category: product?.category || '',
    images: Array.isArray(product?.images) ? product.images : [],
    tags: Array.isArray(product?.tags) ? product.tags : [],
    createdAt: product?.createdAt || null,
    format: product?.format || 'paperback'
  }

  const discount = safeProduct.originalPrice && safeProduct.originalPrice > safeProduct.price ?
    Math.round(((safeProduct.originalPrice - safeProduct.price) / safeProduct.originalPrice) * 100) : 0

  const handleAddToCartClick = (e) => {
    if (onAddToCart) {
      onAddToCart(safeProduct, e)
    }
  }

  const handleWishlistClick = (e) => {
    if (onWishlist) {
      onWishlist(safeProduct, e)
    }
  }

  const handleQuickViewClick = (e) => {
    if (onQuickView) {
      onQuickView(safeProduct, e)
    }
  }

  return (
    <div className={styles.gridItem}>
      <Link to={`/product/${safeProduct.id}`} className={styles.productLink}>
        {/* Product Image */}
        <div className={styles.imageWrapper}>
          <div className={styles.imageContainer}>
            {safeProduct.images && safeProduct.images[0] ? (
              <>
                <img
                  src={safeProduct.images[0]}
                  alt={safeProduct.name}
                  className={styles.productImage}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const placeholder = e.target.parentElement?.querySelector(`.${styles.imagePlaceholder}`)
                    if (placeholder) {
                      placeholder.style.display = 'flex'
                    }
                  }}
                />
                <div className={`${styles.imagePlaceholder} ${styles.hidden}`}>
                  <span className={styles.placeholderText}>
                    {safeProduct.name ? safeProduct.name.charAt(0).toUpperCase() : 'B'}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.imagePlaceholder}>
                <span className={styles.placeholderText}>
                  {safeProduct.name ? safeProduct.name.charAt(0).toUpperCase() : 'B'}
                </span>
              </div>
            )}

            {/* Badges */}
            <div className={styles.imageBadges}>
              {safeProduct.isNew && <span className={styles.newBadge}>New</span>}
              {safeProduct.isBestseller && <span className={styles.bestsellerBadge}>Bestseller</span>}
              {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
              {safeProduct.category && (
                <span className={styles.categoryBadge}>
                  {getCategoryName ? getCategoryName(safeProduct.category) : safeProduct.category}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <button
                className={styles.quickAction}
                onClick={handleQuickViewClick}
                aria-label={`Quick view ${safeProduct.name}`}
                type="button"
              >
                <Eye size={18} />
              </button>
              <button
                className={`${styles.quickAction} ${isInWishlist ? styles.activeWishlist : ''}`}
                onClick={handleWishlistClick}
                aria-label={isInWishlist ? `Remove ${safeProduct.name} from wishlist` : `Add ${safeProduct.name} to wishlist`}
                type="button"
              >
                {isInWishlist ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <div className={styles.productHeader}>
            <h3 className={styles.productName}>{safeProduct.name}</h3>
            {safeProduct.author && (
              <div className={styles.authorInfo}>
                <span>By {safeProduct.author}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {safeProduct.description && (
            <div className={styles.productDescriptionContainer}>
              <p
                className={styles.productDescription}
                title={typeof safeProduct.description === 'string' ? 
                  safeProduct.description.replace(/<[^>]*>/g, '') : 
                  'Product description'}
              >
                {typeof safeProduct.description === 'string' ? 
                  safeProduct.description.replace(/<[^>]*>/g, '').substring(0, 100) + 
                  (safeProduct.description.length > 100 ? '...' : '') : 
                  'Product description'}
              </p>
            </div>
          )}

          {/* Pricing */}
          <div className={styles.productPricing}>
            <span className={styles.currentPrice}>
              {formatPrice ? formatPrice(safeProduct.price) : `₹${safeProduct.price}`}
            </span>
            {safeProduct.originalPrice && safeProduct.originalPrice > safeProduct.price && (
              <span className={styles.originalPrice}>
                {formatPrice ? formatPrice(safeProduct.originalPrice) : `₹${safeProduct.originalPrice}`}
              </span>
            )}
            {discount > 0 && (
              <span className={styles.discountText}>
                Save {formatPrice ? formatPrice(safeProduct.originalPrice - safeProduct.price) : 
                `₹${safeProduct.originalPrice - safeProduct.price}`}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCartClick}
        className={`${styles.addToCartButton} ${safeProduct.stock === 0 ? styles.disabled : ''}`}
        disabled={safeProduct.stock === 0}
        aria-label={`Add ${safeProduct.name} to cart`}
        type="button"
      >
        <ShoppingCart size={18} />
        {safeProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
})

ProductGridItem.displayName = 'ProductGridItem'

// List View Item Component
const ProductListItem = memo(({ 
  product = {}, 
  onAddToCart, 
  onWishlist, 
  onQuickView,
  isInWishlist = false, 
  formatPrice, 
  getTimeAgo, 
  getCategoryName 
}) => {
  // Safe product data
  const safeProduct = {
    id: product?.id || '',
    name: product?.name || 'Unnamed Product',
    author: product?.author || '',
    description: product?.description || '',
    price: Number(product?.price) || 0,
    originalPrice: product?.originalPrice ? Number(product.originalPrice) : null,
    stock: Number(product?.stock) || 0,
    rating: Number(product?.rating) || 0,
    reviewCount: Number(product?.reviewCount) || 0,
    isNew: Boolean(product?.isNew),
    isBestseller: Boolean(product?.isBestseller),
    isActive: Boolean(product?.isActive),
    category: product?.category || '',
    images: Array.isArray(product?.images) ? product.images : [],
    tags: Array.isArray(product?.tags) ? product.tags : [],
    createdAt: product?.createdAt || null,
    format: product?.format || 'paperback'
  }

  const discount = safeProduct.originalPrice && safeProduct.originalPrice > safeProduct.price ?
    Math.round(((safeProduct.originalPrice - safeProduct.price) / safeProduct.originalPrice) * 100) : 0

  const handleAddToCartClick = (e) => {
    if (onAddToCart) {
      onAddToCart(safeProduct, e)
    }
  }

  const handleWishlistClick = (e) => {
    if (onWishlist) {
      onWishlist(safeProduct, e)
    }
  }

  const handleQuickViewClick = (e) => {
    if (onQuickView) {
      onQuickView(safeProduct, e)
    }
  }

  return (
    <div className={styles.listItem}>
      <div className={styles.listItemContent}>
        {/* Product Image */}
        <Link to={`/product/${safeProduct.id}`} className={styles.listImageLink}>
          <div className={styles.listImage}>
            <div className={styles.imageContainer}>
              {safeProduct.images && safeProduct.images[0] ? (
                <>
                  <img
                    src={safeProduct.images[0]}
                    alt={safeProduct.name}
                    className={styles.productImage}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const placeholder = e.target.parentElement?.querySelector(`.${styles.imagePlaceholder}`)
                      if (placeholder) {
                        placeholder.style.display = 'flex'
                      }
                    }}
                  />
                  <div className={`${styles.imagePlaceholder} ${styles.hidden}`}>
                    <span className={styles.placeholderText}>
                      {safeProduct.name ? safeProduct.name.charAt(0).toUpperCase() : 'B'}
                    </span>
                  </div>
                </>
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span className={styles.placeholderText}>
                    {safeProduct.name ? safeProduct.name.charAt(0).toUpperCase() : 'B'}
                  </span>
                </div>
              )}

              {/* Badges */}
              <div className={styles.imageBadges}>
                {safeProduct.isNew && <span className={styles.newBadge}>New</span>}
                {safeProduct.isBestseller && <span className={styles.bestsellerBadge}>Bestseller</span>}
                {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
              </div>
            </div>
          </div>
        </Link>

        {/* Product Details */}
        <div className={styles.listDetails}>
          <div className={styles.listHeader}>
            <Link to={`/product/${safeProduct.id}`} className={styles.productNameLink}>
              <h3 className={styles.productName}>{safeProduct.name}</h3>
            </Link>
            {safeProduct.author && (
              <div className={styles.authorInfo}>
                <span>By {safeProduct.author}</span>
              </div>
            )}
            {safeProduct.category && (
              <div className={styles.categoryInfo}>
                <span className={styles.categoryTag}>
                  {getCategoryName ? getCategoryName(safeProduct.category) : safeProduct.category}
                </span>
              </div>
            )}
          </div>

          {/* Rating and Reviews */}
          {safeProduct.rating && safeProduct.rating > 0 && (
            <div className={styles.listRating}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`list-star-${safeProduct.id}-${i}`}
                    size={14}
                    className={i < Math.floor(safeProduct.rating) ? styles.filledStar : styles.emptyStar}
                    fill={i < Math.floor(safeProduct.rating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className={styles.ratingValue}>{safeProduct.rating.toFixed(1)}</span>
              {safeProduct.reviewCount && safeProduct.reviewCount > 0 && (
                <span className={styles.reviewCount}>({safeProduct.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {/* Description */}
          {safeProduct.description && (
            <p 
              className={styles.listDescription} 
              title={typeof safeProduct.description === 'string' ? safeProduct.description : 'Product description'}
            >
              {typeof safeProduct.description === 'string' ? 
                safeProduct.description.substring(0, 150) + 
                (safeProduct.description.length > 150 ? '...' : '') : 
                'Product description'}
            </p>
          )}

          {/* Tags */}
          {safeProduct.tags && safeProduct.tags.length > 0 && (
            <div className={styles.featureList}>
              {safeProduct.tags.slice(0, 3).map((tag, index) => (
                <span key={`tag-${safeProduct.id}-${index}-${tag}`} className={styles.featureTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta Information */}
          <div className={styles.listMeta}>
            {safeProduct.createdAt && (
              <div className={styles.metaItem}>
                <Clock size={12} />
                <span>Added {getTimeAgo ? getTimeAgo(safeProduct.createdAt) : ''}</span>
              </div>
            )}
            {safeProduct.stock !== undefined && (
              <div className={`${styles.stockStatus} ${
                safeProduct.stock > 10 ? styles.inStock : 
                safeProduct.stock > 0 ? styles.lowStock : 
                styles.outOfStock
              }`}>
                {safeProduct.stock > 10 ? 'In Stock' : 
                 safeProduct.stock > 0 ? `${safeProduct.stock} left` : 
                 'Out of Stock'}
              </div>
            )}
          </div>
        </div>

        {/* Pricing and Actions */}
        <div className={styles.listActions}>
          <div className={styles.listPricing}>
            <span className={styles.currentPrice}>
              {formatPrice ? formatPrice(safeProduct.price) : `₹${safeProduct.price}`}
            </span>
            {safeProduct.originalPrice && safeProduct.originalPrice > safeProduct.price && (
              <>
                <span className={styles.originalPrice}>
                  {formatPrice ? formatPrice(safeProduct.originalPrice) : `₹${safeProduct.originalPrice}`}
                </span>
                <span className={styles.discountAmount}>
                  Save {formatPrice ? formatPrice(safeProduct.originalPrice - safeProduct.price) : 
                  `₹${safeProduct.originalPrice - safeProduct.price}`}
                </span>
              </>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              onClick={handleAddToCartClick}
              className={`${styles.addToCartButton} ${safeProduct.stock === 0 ? styles.disabled : ''}`}
              disabled={safeProduct.stock === 0}
              aria-label={`Add ${safeProduct.name} to cart`}
              type="button"
            >
              <ShoppingCart size={18} />
              {safeProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlistClick}
              className={`${styles.wishlistButton} ${isInWishlist ? styles.activeWishlist : ''}`}
              aria-label={isInWishlist ? `Remove ${safeProduct.name} from wishlist` : `Add ${safeProduct.name} to wishlist`}
              type="button"
            >
              {isInWishlist ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}
            </button>
            <button 
              className={styles.quickViewButton}
              onClick={handleQuickViewClick}
              aria-label={`Quick view ${safeProduct.name}`}
              type="button"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

ProductListItem.displayName = 'ProductListItem'

export default ProductGrid