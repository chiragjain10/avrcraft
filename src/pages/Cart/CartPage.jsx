import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Heart, 
  Shield, 
  Truck,
  ArrowLeft
} from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import styles from './CartPage.module.css'

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemsCount } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    
    setIsUpdating(true)
    updateQuantity(productId, newQuantity)
    
    // Simulate API call delay
    setTimeout(() => setIsUpdating(false), 300)
  }

  const handleRemoveItem = (productId) => {
    removeFromCart(productId)
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    
    if (items.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    navigate('/checkout')
  }

  const continueShopping = () => {
    navigate('/shop')
  }

  const shippingCost = getCartTotal() > 5000 ? 0 : 200
  const tax = getCartTotal() * 0.18 // 18% GST
  const orderTotal = getCartTotal() + shippingCost + tax

  if (!isAuthenticated) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.authRequired}>
          <div className={styles.authIllustration}>
            <ShoppingCart size={64} />
          </div>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your shopping cart and manage your items.</p>
          <div className={styles.authActions}>
            <Link to="/login" className={styles.loginButton}>
              Sign In
            </Link>
            <Link to="/register" className={styles.registerButton}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.emptyCart}>
          <div className={styles.emptyIllustration}>
            <ShoppingCart size={80} />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Discover our artisan collections and add some beautiful crafts to your cart.</p>
          <div className={styles.emptyActions}>
            <button onClick={continueShopping} className={styles.continueShopping}>
              Continue Shopping
            </button>
            <Link to="/categories" className={styles.browseCategories}>
              Browse Categories
            </Link>
          </div>
          
          {/* Recently Viewed Suggestions */}
          <div className={styles.suggestions}>
            <h3>You Might Like</h3>
            <div className={styles.suggestionGrid}>
              {/* These would be actual product suggestions in a real app */}
              <div className={styles.suggestionItem}>
                <div className={styles.suggestionImage}></div>
                <div className={styles.suggestionInfo}>
                  <span className={styles.suggestionName}>Handwoven Silk Saree</span>
                  <span className={styles.suggestionPrice}>₹39,999</span>
                </div>
              </div>
              <div className={styles.suggestionItem}>
                <div className={styles.suggestionImage}></div>
                <div className={styles.suggestionInfo}>
                  <span className={styles.suggestionName}>Silver Filigree Necklace</span>
                  <span className={styles.suggestionPrice}>₹34,445</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className={styles.cartTitle}>Shopping Cart</h1>
            <span className={styles.itemCount}>({getCartItemsCount()} items)</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.cartLayout}>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            <div className={styles.itemsHeader}>
              <h2>Cart Items</h2>
              <button onClick={handleClearCart} className={styles.clearCart}>
                <Trash2 size={16} />
                Clear Cart
              </button>
            </div>

            <div className={styles.itemsList}>
              {items.map((item) => (
                <CartItem 
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  isUpdating={isUpdating}
                />
              ))}
            </div>

            {/* Trust Features */}
            <div className={styles.trustFeatures}>
              <div className={styles.trustItem}>
                <Shield size={24} />
                <div>
                  <strong>Authenticity Guaranteed</strong>
                  <span>Direct from master artisans</span>
                </div>
              </div>
              <div className={styles.trustItem}>
                <Truck size={24} />
                <div>
                  <strong>Free Shipping</strong>
                  <span>On orders over ₹5,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Subtotal ({getCartItemsCount()} items)</span>
                  <span>₹{getCartTotal().toLocaleString()}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className={styles.freeShipping}>FREE</span>
                    ) : (
                      `₹${shippingCost}`
                    )}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <strong>Order Total</strong>
                  <strong>₹{orderTotal.toLocaleString()}</strong>
                </div>
              </div>

              {/* Promo Code */}
              <div className={styles.promoSection}>
                <div className={styles.promoInput}>
                  <input 
                    type="text" 
                    placeholder="Enter promo code"
                    className={styles.promoField}
                  />
                  <button className={styles.applyPromo}>Apply</button>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={proceedToCheckout}
                className={styles.checkoutButton}
                disabled={isUpdating}
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>

              {/* Security Notice */}
              <div className={styles.securityNotice}>
                <Shield size={16} />
                <span>Secure checkout · SSL encrypted</span>
              </div>

              {/* Continue Shopping */}
              <button onClick={continueShopping} className={styles.continueButton}>
                Continue Shopping
              </button>
            </div>

            {/* Savings Notice */}
            {shippingCost > 0 && (
              <div className={styles.savingsNotice}>
                <div className={styles.savingsIcon}>🎁</div>
                <div className={styles.savingsText}>
                  <strong>Add ₹{(5000 - getCartTotal()).toLocaleString()} more</strong>
                  <span>to get FREE shipping!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Cart Item Component
const CartItem = ({ item, onQuantityChange, onRemove, isUpdating }) => {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    // Simulate API call delay
    setTimeout(() => {
      onRemove(item.id)
      setIsRemoving(false)
    }, 300)
  }

  const moveToWishlist = () => {
    // In a real app, this would add to wishlist
    alert(`Moved ${item.name} to wishlist`)
    onRemove(item.id)
  }

  return (
    <div className={`${styles.cartItem} ${isRemoving ? styles.removing : ''}`}>
      <div className={styles.itemImage}>
        <div className={styles.imagePlaceholder}></div>
      </div>

      <div className={styles.itemDetails}>
        <div className={styles.itemHeader}>
          <h3 className={styles.itemName}>{item.name}</h3>
          <span className={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
        </div>

        {item.artisan && (
          <div className={styles.artisanInfo}>
            <span>By {item.artisan.name}</span>
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
            disabled={isUpdating || isRemoving}
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>

      <div className={styles.quantitySection}>
        <div className={styles.quantitySelector}>
          <button 
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            className={styles.quantityButton}
          >
            <Minus size={16} />
          </button>
          <span className={styles.quantityValue}>{item.quantity}</span>
          <button 
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
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

export default CartPage