import React from 'react'
import { X, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import CartItem from '../CartItem/CartItem'
import styles from './CartSidebar.module.css'

const CartSidebar = ({ isOpen, onClose }) => {
  const { items, getCartTotal, getCartItemsCount, clearCart } = useCart()

  const handleCheckout = () => {
    onClose()
    // Navigate to checkout page
    window.location.href = '/checkout'
  }

  const handleContinueShopping = () => {
    onClose()
    window.location.href = '/shop'
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sidebar}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <ShoppingCart size={24} />
              <div>
                <h2>Your Cart</h2>
                <span className={styles.itemCount}>
                  {getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className={styles.cartContent}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingCart size={48} />
              <h3>Your cart is empty</h3>
              <p>Add some beautiful artisan products to get started</p>
              <button onClick={handleContinueShopping} className={styles.continueShopping}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Cart Actions */}
              <div className={styles.cartActions}>
                <button onClick={clearCart} className={styles.clearCart}>
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>₹{getCartTotal().toLocaleString()}</span>
              </div>
              <p className={styles.shippingNote}>
                Shipping & taxes calculated at checkout
              </p>
            </div>

            <button onClick={handleCheckout} className={styles.checkoutButton}>
              Proceed to Checkout
              <ArrowRight size={20} />
            </button>

            <button onClick={handleContinueShopping} className={styles.continueButton}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSidebar