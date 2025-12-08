// src/pages/Wishlist/Wishlist.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../../contexts/WishlistContext'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { Trash2, ShoppingCart } from 'lucide-react'
import styles from './Wishlist.module.css'

const Wishlist = () => {
  const { items: wishlistItems, removeFromWishlist, loading } = useWishlist()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = (item) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/wishlist' } })
      return
    }
    
    addToCart(item)
    alert(`${item.name} added to cart!`)
  }

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Failed to remove item from wishlist')
    }
  }

  if (loading) {
    return (
      <div className={styles.wishlistPage}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading your wishlist...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wishlistPage}>
      <div className={styles.container}>
        <h1>My Wishlist</h1>
        
        {!wishlistItems || wishlistItems.length === 0 ? (
          <div className={styles.emptyWishlist}>
            <div className={styles.emptyIcon}>❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love by clicking the heart icon</p>
            <Link to="/shop" className={styles.shopButton}>Continue Shopping</Link>
          </div>
        ) : (
          <>
            <p className={styles.itemCount}>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</p>
            <div className={styles.wishlistGrid}>
              {wishlistItems.map(item => (
                <div key={item.id} className={styles.wishlistItem}>
                  <div className={styles.imageContainer}>
                    <Link to={`/product/${item.id}`}>
                      <img 
                        src={item.imageUrl || item.images?.[0] || '/placeholder-book.jpg'} 
                        alt={item.name} 
                        onError={(e) => {
                          e.target.src = '/placeholder-book.jpg'
                        }}
                      />
                    </Link>
                    <button 
                      className={styles.removeBtn}
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className={styles.itemInfo}>
                    <Link to={`/product/${item.id}`} className={styles.itemTitle}>
                      <h3>{item.name}</h3>
                    </Link>
                    
                    {item.author && (
                      <p className={styles.author}>By {item.author}</p>
                    )}
                    
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>₹{item.price?.toLocaleString()}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className={styles.originalPrice}>₹{item.originalPrice?.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {item.rating && (
                      <div className={styles.rating}>
                        <div className={styles.stars}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(item.rating) ? styles.filledStar : styles.emptyStar}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className={styles.ratingValue}>{item.rating}</span>
                      </div>
                    )}
                    
                    <div className={styles.actions}>
                      {item.stock > 0 ? (
                        <>
                          <button 
                            className={styles.addToCart}
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </button>
                          <Link 
                            to={`/product/${item.id}`}
                            className={styles.viewDetails}
                          >
                            View Details
                          </Link>
                        </>
                      ) : (
                        <button className={styles.outOfStock} disabled>
                          Out of Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.wishlistActions}>
              <button 
                className={styles.clearAllBtn}
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                    wishlistItems.forEach(item => removeFromWishlist(item.id))
                  }
                }}
                disabled={wishlistItems.length === 0}
              >
                Clear All
              </button>
              <Link to="/shop" className={styles.continueShopping}>
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Wishlist