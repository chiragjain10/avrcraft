import React, { useState } from 'react'
import { Star, Heart, ShoppingCart, Loader2 } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { useAuth } from '../../../contexts/AuthContext'
import { useWishlist } from '../../../contexts/WishlistContext'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import styles from './TrendingProducts.module.css'

const ProductCard = ({ product }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const navigate = useNavigate()

  const isProductInWishlist = isInWishlist(product.id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      navigate('/login', { state: { from: `/product/${product.id}` } })
      return
    }

    try {
      setIsAddingToCart(true)
      
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl || product.images?.[0],
        stock: product.stock || 10,
        quantity: 1,
        category: product.category,
        author: product.author,
        addedAt: new Date().toISOString()
      }

      await addToCart(cartItem)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      navigate('/login', { state: { from: `/product/${product.id}` } })
      return
    }

    try {
      setIsWishlistLoading(true)
      
      if (isProductInWishlist) {
        await removeFromWishlist(product.id)
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          imageUrl: product.imageUrl || product.images?.[0],
          category: product.category,
          author: product.author,
          rating: product.rating,
          addedAt: new Date().toISOString()
        })
      }
      
    } catch (error) {
      console.error('Error updating wishlist:', error)
      alert('Failed to update wishlist. Please try again.')
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const handleProductClick = () => {
    navigate(`/product/${product.id}`)
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price not available'
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Calculate discount if original price is available
  const discount = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const isOutOfStock = product.stock === 0

  return (
    <div className={styles.productCard} onClick={handleProductClick}>
      <div className={styles.cardImage}>
        {/* Firebase image URL use karo */}
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className={styles.productImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>No Image</span>
          </div>
        )}
        
        {/* Badges - Firebase flags ke according */}
        <div className={styles.cardBadges}>
          {product.isBestseller && <span className={styles.bestsellerBadge}>BESTSELLER</span>}
          {product.isNew && <span className={styles.newBadge}>New</span>}
          {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
          {isOutOfStock && <span className={styles.outOfStockBadge}>Out of Stock</span>}
        </div>
        
        {/* Actions */}
        <div className={styles.cardActions}>
          <button 
            className={`${styles.wishlistButton} ${isProductInWishlist ? styles.inWishlist : ''}`}
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <Loader2 size={18} className={styles.spinner} />
            ) : (
              <Heart 
                size={18} 
                fill={isProductInWishlist ? "currentColor" : "none"}
              />
            )}
          </button>
          
          <button 
            className={styles.cartButton} 
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock}
          >
            {isAddingToCart ? (
              <Loader2 size={18} className={styles.spinner} />
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          {product.author && (
            <p className={styles.authorName}>By {product.author}</p>
          )}
          {product.description && (
            <p className={styles.productDescription}>
              {product.description.length > 80 
                ? `${product.description.substring(0, 80)}...` 
                : product.description
              }
            </p>
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
        
        <div className={styles.productPricing}>
          <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className={styles.stockStatus}>
            {isOutOfStock ? (
              <span className={styles.outOfStockText}>Out of Stock</span>
            ) : product.stock < 10 ? (
              <span className={styles.lowStockText}>Only {product.stock} left</span>
            ) : (
              <span className={styles.inStockText}>In Stock</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard