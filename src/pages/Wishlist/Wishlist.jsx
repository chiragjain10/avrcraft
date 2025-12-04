// src/pages/Wishlist/Wishlist.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../../contexts/WishlistContext'
import styles from './Wishlist.module.css'

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist()

  if (loading) {
    return <div className={styles.loading}>Loading your wishlist...</div>
  }

  if (!wishlistItems) {
    return <div className={styles.emptyWishlist}>Unable to load wishlist</div>
  }

  return (
    <div className={styles.wishlistPage}>
      <div className={styles.container}>
        <h1>My Wishlist</h1>
        
        {wishlistItems.length === 0 ? (
          <div className={styles.emptyWishlist}>
            <p>Your wishlist is empty</p>
            <Link to="/shop" className={styles.shopButton}>Continue Shopping</Link>
          </div>
        ) : (
          <>
            <p className={styles.itemCount}>{wishlistItems.length} items</p>
            <div className={styles.wishlistGrid}>
              {wishlistItems.map(item => (
                <div key={item.id} className={styles.wishlistItem}>
                  <div className={styles.imageContainer}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    <p className={styles.price}>₹{item.price}</p>
                    <div className={styles.actions}>
                      <button className={styles.addToCart}>Add to Cart</button>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Wishlist