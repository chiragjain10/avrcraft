import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Heart, Loader2 } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import styles from './CartItem.module.css';

const CartItem = ({ item, onUpdate, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const { updateCartItem, removeFromCart } = useCart();

  // Update local quantity when item prop changes
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > (item.inStock || 10)) return;
    
    try {
      setIsUpdating(true);
      setQuantity(newQuantity);
      
      // Update in Firebase
      await updateCartItem(item.productId || item.id, newQuantity);
      
      // Notify parent component
      if (onUpdate) onUpdate(item.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert quantity on error
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await removeFromCart(item.productId || item.id);
      
      // Notify parent component
      if (onRemove) onRemove(item.id);
    } catch (error) {
      console.error('Error removing item:', error);
      setIsRemoving(false);
    }
  };

  const moveToWishlist = async () => {
    // TODO: Implement wishlist functionality with Firebase
    console.log('Move to wishlist:', item);
    await handleRemove();
  };

  return (
    <div className={styles.cartItem}>
      {/* Product Image */}
      <Link to={`/product/${item.id}`} className={styles.itemImage}>
        <div className={styles.imagePlaceholder}></div>
      </Link>

      {/* Product Details */}
      <div className={styles.itemDetails}>
        <Link to={`/product/${item.id}`} className={styles.itemName}>
          {item.name}
        </Link>
        
        {item.artisan && (
          <div className={styles.artisanInfo}>
            By {item.artisan.name}
          </div>
        )}

        <div className={styles.itemAttributes}>
          {item.material && (
            <span className={styles.attribute}>Material: {item.material}</span>
          )}
          {item.dimensions && (
            <span className={styles.attribute}>Size: {item.dimensions}</span>
          )}
        </div>

        <div className={styles.itemPrice}>
          ₹{(item.price * item.quantity).toLocaleString()}
        </div>

        <div className={styles.itemActions}>
          <button 
            onClick={moveToWishlist}
            className={styles.wishlistAction}
            disabled={isUpdating}
          >
            <Heart size={16} />
            Save for later
          </button>
          <button 
            onClick={handleRemove}
            className={styles.removeAction}
            disabled={isUpdating}
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className={styles.quantitySection}>
        <div className={styles.quantitySelector}>
          <button 
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            className={styles.quantityButton}
          >
            <Minus size={16} />
          </button>
          <span className={styles.quantityValue}>{item.quantity}</span>
          <button 
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= 10 || isUpdating}
            className={styles.quantityButton}
          >
            <Plus size={16} />
          </button>
        </div>
        <div className={styles.unitPrice}>
          ₹{item.price.toLocaleString()} each
        </div>
      </div>
    </div>
  )
}

export default CartItem