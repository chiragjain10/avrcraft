import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import styles from './TrendingProducts.module.css';

const ProductCard = ({ product }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const isProductInWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Handle login redirect if needed
      return;
    }

    try {
      setIsAddingToCart(true);
      
      const cartItem = {
        id: product.id,
        name: product.title || product.name,
        price: product.currentPrice || product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.coverImage || product.imageUrl || product.images?.[0],
        quantity: 1,
        author: product.author,
        category: product.category,
        addedAt: new Date().toISOString()
      };

      await addToCart(cartItem);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Handle login redirect if needed
      return;
    }

    try {
      setIsWishlistLoading(true);
      
      if (isProductInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist({
          id: product.id,
          name: product.title || product.name,
          price: product.currentPrice || product.price,
          originalPrice: product.originalPrice,
          imageUrl: product.images[0] || product.imageUrl,
          author: product.author,
          category: product.category,
          addedAt: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Format price with ₹ symbol
  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹0';
    
    // Remove decimal if .00
    const formattedPrice = price.toFixed(2);
    const priceWithoutDecimal = formattedPrice.endsWith('.00') 
      ? formattedPrice.slice(0, -3) 
      : formattedPrice;
    
    return `₹${priceWithoutDecimal}`;
  };

  // Calculate discount percentage
  const discount = product.originalPrice && product.currentPrice 
    ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
    : 0;

  // Calculate amount saved
  const amountSaved = product.originalPrice && product.currentPrice 
    ? product.originalPrice - product.currentPrice
    : 0;

  return (
    <div className={styles.productCard}>
      <Link to={`/product/${product.id}`} className={styles.productLink}>
        <div className={styles.cardImage}>
          {product.images[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.title || product.name}
              className={styles.productImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>No Image</span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button 
            className={`${styles.wishlistButton} ${isProductInWishlist ? styles.inWishlist : ''}`}
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              size={20} 
              fill={isProductInWishlist ? "currentColor" : "none"}
            />
          </button>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className={styles.discountBadge}>
              {discount}% OFF
            </div>
          )}
        </div>
        
        <div className={styles.cardContent}>
          <h3 className={styles.productTitle}>
            {product.title || product.name}
          </h3>
          
          <p className={styles.productAuthor}>
            {product.author}
          </p>

          {/* Rating Stars */}
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < (product.rating || 4) ? "#ffd700" : "#e5e5e5"}
                  strokeWidth={i < (product.rating || 4) ? 0 : 1}
                />
              ))}
            </div>
            <span className={styles.ratingText}>({product.reviewCount || 24})</span>
          </div>

          <div className={styles.productPricing}>
            {product.originalPrice && product.originalPrice > product.currentPrice ? (
              <>
                <div className={styles.priceRow}>
                  <span className={styles.currentPrice}>
                    {formatPrice(product.currentPrice)}
                  </span>
                  <span className={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>
                <div className={styles.saveAmount}>
                  Save {formatPrice(amountSaved)}
                </div>
              </>
            ) : (
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>
                  {formatPrice(product.currentPrice || product.price)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Outside link */}
      <button 
        className={`${styles.addToCartButton} ${isAddingToCart ? styles.loading : ''}`}
        onClick={handleAddToCart}
        disabled={isAddingToCart}
      >
        {isAddingToCart ? 'Adding...' : (
          <>
            <ShoppingCart size={18} />
            Add to Basket
          </>
        )}
      </button>
    </div>
  );
};

export default ProductCard;