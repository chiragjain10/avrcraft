import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Heart, ShoppingCart, Eye, Clock, MapPin } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { useAuth } from '../../../contexts/AuthContext'
import styles from './ProductGrid.module.css'

const ProductGrid = ({ products, viewMode = 'grid' }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      // In a real app, you might show a login modal
      alert('Please login to add items to cart')
      return
    }
    
    addToCart(product)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getTimeAgo = (date) => {
    if (!date) return ''
    const now = new Date()
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return `${Math.floor(diffInHours / 168)}w ago`
  }

  if (viewMode === 'list') {
    return (
      <div className={styles.listView}>
        {products.map((product) => (
          <ProductListItem 
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            formatPrice={formatPrice}
            getTimeAgo={getTimeAgo}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.gridView}>
      {products.map((product) => (
        <ProductGridItem 
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          formatPrice={formatPrice}
          getTimeAgo={getTimeAgo}
        />
      ))}
    </div>
  )
}

// Grid View Item Component - Updated for Firebase data structure
const ProductGridItem = ({ product, onAddToCart, formatPrice, getTimeAgo }) => {
  const discount = product.originalPrice ? 
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0

  return (
    <div className={styles.gridItem}>
      <Link to={`/product/${product.id}`} className={styles.productLink}>
        {/* Product Image */}
        <div className={styles.productImage}>
          <div className={styles.imageContainer}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className={styles.productImage}
                loading="lazy"
              />
            ) : (
              <div className={styles.imagePlaceholder}></div>
            )}
            
            {/* Badges - Firebase flags ke according */}
            <div className={styles.imageBadges}>
              {product.isNew && <span className={styles.newBadge}>New</span>}
              {product.isBestseller && <span className={styles.bestsellerBadge}>BESTSELLER</span>}
              {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <button className={styles.quickAction}>
                <Eye size={18} />
              </button>
              <button className={styles.quickAction}>
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <div className={styles.productHeader}>
            <h3 className={styles.productName}>{product.name}</h3>
            {product.author && (
              <div className={styles.authorInfo}>
                <span>By {product.author}</span>
              </div>
            )}
            {product.artisan && (
              <div className={styles.artisanInfo}>
                <MapPin size={12} />
                <span>By {product.artisan}</span>
              </div>
            )}
          </div>

          {/* Rating - Agar Firebase mein hai toh show karo */}
          {product.rating && (
            <div className={styles.productRating}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? styles.filledStar : styles.emptyStar}
                    fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className={styles.ratingValue}>{product.rating}</span>
              {product.reviewCount && (
                <span className={styles.reviewCount}>({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className={styles.productDescription}>
              {product.description.substring(0, 80)}...
            </p>
          )}

          {/* Pricing */}
          <div className={styles.productPricing}>
            <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Additional Info */}
          <div className={styles.productMeta}>
            {product.createdAt && (
              <div className={styles.metaItem}>
                <Clock size={12} />
                <span>{getTimeAgo(product.createdAt)}</span>
              </div>
            )}
            {product.stock !== undefined && (
              <div className={`${styles.stockStatus} ${product.stock > 10 ? styles.inStock : product.stock > 0 ? styles.lowStock : styles.outOfStock}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <button 
        onClick={(e) => onAddToCart(product, e)}
        className={styles.addToCartButton}
        disabled={product.stock === 0}
      >
        <ShoppingCart size={18} />
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}

// List View Item Component - Updated for Firebase data structure
const ProductListItem = ({ product, onAddToCart, formatPrice, getTimeAgo }) => {
  const discount = product.originalPrice ? 
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0

  return (
    <div className={styles.listItem}>
      <Link to={`/product/${product.id}`} className={styles.listItemLink}>
        {/* Product Image */}
        <div className={styles.listImage}>
          <div className={styles.imageContainer}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className={styles.productImage}
                loading="lazy"
              />
            ) : (
              <div className={styles.imagePlaceholder}></div>
            )}
            
            {/* Badges */}
            <div className={styles.imageBadges}>
              {product.isNew && <span className={styles.newBadge}>New</span>}
              {product.isBestseller && <span className={styles.bestsellerBadge}>BESTSELLER</span>}
              {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className={styles.listDetails}>
          <div className={styles.listHeader}>
            <h3 className={styles.productName}>{product.name}</h3>
            {product.author && (
              <div className={styles.authorInfo}>
                <span>By {product.author}</span>
              </div>
            )}
            {product.artisan && (
              <div className={styles.artisanInfo}>
                <MapPin size={12} />
                <span>By {product.artisan}</span>
              </div>
            )}
          </div>

          {/* Rating and Reviews */}
          {product.rating && (
            <div className={styles.listRating}>
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? styles.filledStar : styles.emptyStar}
                    fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className={styles.ratingValue}>{product.rating}</span>
              {product.reviewCount && (
                <span className={styles.reviewCount}>({product.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {/* Full Description */}
          {product.description && (
            <p className={styles.listDescription}>
              {product.description}
            </p>
          )}

          {/* Features */}
          {product.tags && product.tags.length > 0 && (
            <div className={styles.featureList}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.featureTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta Information */}
          <div className={styles.listMeta}>
            {product.category && (
              <div className={styles.metaItem}>
                <strong>Category:</strong> {product.category}
              </div>
            )}
            {product.createdAt && (
              <div className={styles.metaItem}>
                <Clock size={12} />
                <span>Added {getTimeAgo(product.createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing and Actions */}
        <div className={styles.listActions}>
          <div className={styles.listPricing}>
            <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            )}
            {discount > 0 && (
              <span className={styles.discountAmount}>Save {formatPrice(product.originalPrice - product.price)}</span>
            )}
          </div>

          <div className={styles.stockInfo}>
            {product.stock !== undefined && (
              <div className={`${styles.stockStatus} ${product.stock > 10 ? styles.inStock : product.stock > 0 ? styles.lowStock : styles.outOfStock}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button 
              onClick={(e) => onAddToCart(product, e)}
              className={styles.addToCartButton}
              disabled={product.stock === 0}
            >
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className={styles.wishlistButton}>
              <Heart size={18} />
            </button>
            <button className={styles.quickViewButton}>
              <Eye size={18} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductGrid