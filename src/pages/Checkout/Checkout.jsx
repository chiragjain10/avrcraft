import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Shield, 
  Lock, 
  Check,
  MapPin,
  User,
  Phone,
  Mail
} from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { createOrder } from '../../utils/firebase/firestore'
import styles from './Checkout.module.css'

const Checkout = () => {
  const { items, clearCart, getCartTotal, getCartItemsCount } = useCart()
  const { user, userData } = useAuth()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: user?.email || '',
    phone: userData?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    upiId: ''
  })

  // Calculations
  const shippingCost = getCartTotal() > 5000 ? 0 : 200
  const tax = getCartTotal() * 0.18
  const orderTotal = getCartTotal() + shippingCost + tax

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }))

    if (billingInfo.sameAsShipping && field !== 'email' && field !== 'phone') {
      setBillingInfo(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleBillingChange = (field, value) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateStep1 = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode']
    return requiredFields.every(field => shippingInfo[field]?.trim())
  }

  const validateStep2 = () => {
    if (billingInfo.sameAsShipping) return true
    
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'pincode']
    return requiredFields.every(field => billingInfo[field]?.trim())
  }

  const validateStep3 = () => {
    if (paymentInfo.method === 'card') {
      return paymentInfo.cardNumber?.length === 16 &&
             paymentInfo.expiryDate?.length === 5 &&
             paymentInfo.cvv?.length === 3 &&
             paymentInfo.nameOnCard?.trim()
    } else if (paymentInfo.method === 'upi') {
      return paymentInfo.upiId?.includes('@')
    } else if (paymentInfo.method === 'cod') {
      return true
    }
    return false
  }

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const processPayment = async () => {
    if (!validateStep3()) {
      alert('Please fill in all payment details correctly')
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Create order in database
      const orderData = {
        userId: user.uid,
        items: items,
        shippingInfo,
        billingInfo: billingInfo.sameAsShipping ? shippingInfo : billingInfo,
        paymentInfo: {
          method: paymentInfo.method,
          // Don't store sensitive payment data in real app
          lastFour: paymentInfo.method === 'card' ? paymentInfo.cardNumber.slice(-4) : null
        },
        subtotal: getCartTotal(),
        shipping: shippingCost,
        tax: tax,
        total: orderTotal,
        status: 'confirmed',
        orderDate: new Date()
      }

      const result = await createOrder(orderData)
      
      if (result.success) {
        setOrderId(result.orderId)
        setOrderSuccess(true)
        clearCart()
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.emptyCart}>
          <h2>Your cart is empty</h2>
          <p>Add some beautiful artisan products to your cart before checkout.</p>
          <button onClick={() => navigate('/shop')} className={styles.continueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <Check size={48} />
          </div>
          <h1 className={styles.successTitle}>Order Confirmed!</h1>
          <p className={styles.successMessage}>
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </p>
          
          <div className={styles.orderDetails}>
            <div className={styles.detailItem}>
              <strong>Order ID:</strong>
              <span>{orderId}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Total Amount:</strong>
              <span>₹{orderTotal.toLocaleString()}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Shipping Address:</strong>
              <span>
                {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}
              </span>
            </div>
          </div>

          <div className={styles.nextSteps}>
            <h3>What's Next?</h3>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Order Processing</strong>
                  <span>We'll prepare your items with care</span>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Artisan Handoff</strong>
                  <span>Master artisans will craft your order</span>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Quality Check</strong>
                  <span>Each piece undergoes quality inspection</span>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Shipping</strong>
                  <span>Carefully packaged and shipped to you</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.successActions}>
            <button onClick={() => navigate('/orders')} className={styles.viewOrders}>
              View My Orders
            </button>
            <button onClick={() => navigate('/shop')} className={styles.continueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <button onClick={() => navigate('/cart')} className={styles.backButton}>
              <ArrowLeft size={20} />
              Back to Cart
            </button>
            <h1 className={styles.checkoutTitle}>Checkout</h1>
            <div className={styles.stepsIndicator}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>1</div>
                <span>Shipping</span>
              </div>
              <div className={styles.stepConnector}></div>
              <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>2</div>
                <span>Billing</span>
              </div>
              <div className={styles.stepConnector}></div>
              <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>3</div>
                <span>Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.checkoutLayout}>
          {/* Checkout Form */}
          <div className={styles.checkoutForm}>
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <h2>Shipping Information</h2>
                    <p>Where should we deliver your order?</p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleShippingChange('firstName', e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleShippingChange('lastName', e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroupFull}>
                    <label>Street Address *</label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      className={styles.formInput}
                      placeholder="House number, street name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>City *</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>State *</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => handleShippingChange('state', e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      value={shippingInfo.pincode}
                      onChange={(e) => handleShippingChange('pincode', e.target.value)}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.stepActions}>
                  <button onClick={nextStep} className={styles.nextButton} disabled={!validateStep1()}>
                    Continue to Billing
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Billing Information */}
            {currentStep === 2 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2>Billing Information</h2>
                    <p>Where should we send the invoice?</p>
                  </div>
                </div>

                <div className={styles.sameAsShipping}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={billingInfo.sameAsShipping}
                      onChange={(e) => handleBillingChange('sameAsShipping', e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxCustom}></span>
                    <span>Same as shipping address</span>
                  </label>
                </div>

                {!billingInfo.sameAsShipping && (
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>First Name *</label>
                      <input
                        type="text"
                        value={billingInfo.firstName}
                        onChange={(e) => handleBillingChange('firstName', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Last Name *</label>
                      <input
                        type="text"
                        value={billingInfo.lastName}
                        onChange={(e) => handleBillingChange('lastName', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Street Address *</label>
                      <input
                        type="text"
                        value={billingInfo.address}
                        onChange={(e) => handleBillingChange('address', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>City *</label>
                      <input
                        type="text"
                        value={billingInfo.city}
                        onChange={(e) => handleBillingChange('city', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>State *</label>
                      <input
                        type="text"
                        value={billingInfo.state}
                        onChange={(e) => handleBillingChange('state', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>PIN Code *</label>
                      <input
                        type="text"
                        value={billingInfo.pincode}
                        onChange={(e) => handleBillingChange('pincode', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.stepActions}>
                  <button onClick={prevStep} className={styles.backButton}>
                    Back
                  </button>
                  <button onClick={nextStep} className={styles.nextButton} disabled={!validateStep2()}>
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Information */}
            {currentStep === 3 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h2>Payment Method</h2>
                    <p>How would you like to pay?</p>
                  </div>
                </div>

                <div className={styles.paymentMethods}>
                  <label className={styles.paymentMethod}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentInfo.method === 'card'}
                      onChange={(e) => handlePaymentChange('method', e.target.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    <div className={styles.methodContent}>
                      <CreditCard size={20} />
                      <span>Credit/Debit Card</span>
                    </div>
                  </label>

                  <label className={styles.paymentMethod}>
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentInfo.method === 'upi'}
                      onChange={(e) => handlePaymentChange('method', e.target.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    <div className={styles.methodContent}>
                      <div className={styles.upiIcon}>UPI</div>
                      <span>UPI Payment</span>
                    </div>
                  </label>

                  <label className={styles.paymentMethod}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentInfo.method === 'cod'}
                      onChange={(e) => handlePaymentChange('method', e.target.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    <div className={styles.methodContent}>
                      <Truck size={20} />
                      <span>Cash on Delivery</span>
                    </div>
                  </label>
                </div>

                {paymentInfo.method === 'card' && (
                  <div className={styles.cardForm}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroupFull}>
                        <label>Card Number *</label>
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => handlePaymentChange('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                          className={styles.formInput}
                          placeholder="1234 5678 9012 3456"
                          maxLength={16}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Expiry Date *</label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => handlePaymentChange('expiryDate', e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5))}
                          className={styles.formInput}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>CVV *</label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                          className={styles.formInput}
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                      <div className={styles.formGroupFull}>
                        <label>Name on Card *</label>
                        <input
                          type="text"
                          value={paymentInfo.nameOnCard}
                          onChange={(e) => handlePaymentChange('nameOnCard', e.target.value)}
                          className={styles.formInput}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentInfo.method === 'upi' && (
                  <div className={styles.upiForm}>
                    <div className={styles.formGroupFull}>
                      <label>UPI ID *</label>
                      <input
                        type="text"
                        value={paymentInfo.upiId}
                        onChange={(e) => handlePaymentChange('upiId', e.target.value)}
                        className={styles.formInput}
                        placeholder="yourname@upi"
                      />
                    </div>
                  </div>
                )}

                {paymentInfo.method === 'cod' && (
                  <div className={styles.codNotice}>
                    <div className={styles.codIcon}>💵</div>
                    <div className={styles.codContent}>
                      <h4>Cash on Delivery</h4>
                      <p>Pay when your order is delivered. Additional ₹50 processing fee applies.</p>
                    </div>
                  </div>
                )}

                <div className={styles.stepActions}>
                  <button onClick={prevStep} className={styles.backButton}>
                    Back
                  </button>
                  <button 
                    onClick={processPayment}
                    className={styles.payButton}
                    disabled={isProcessing || !validateStep3()}
                  >
                    {isProcessing ? (
                      <>
                        <div className={styles.spinner}></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        Pay ₹{orderTotal.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>

                <div className={styles.securityNotice}>
                  <Shield size={16} />
                  <span>Your payment is secure and encrypted</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.itemImage}>
                      <div className={styles.imagePlaceholder}></div>
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQuantity}>Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className={styles.summaryTotals}>
                <div className={styles.totalRow}>
                  <span>Subtotal ({getCartItemsCount()} items)</span>
                  <span>₹{getCartTotal().toLocaleString()}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                {paymentInfo.method === 'cod' && (
                  <div className={styles.totalRow}>
                    <span>COD Fee</span>
                    <span>₹50</span>
                  </div>
                )}
                <div className={styles.totalDivider}></div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <strong>Total</strong>
                  <strong>₹{(orderTotal + (paymentInfo.method === 'cod' ? 50 : 0)).toLocaleString()}</strong>
                </div>
              </div>

              <div className={styles.trustBadges}>
                <div className={styles.trustItem}>
                  <Shield size={20} />
                  <span>Secure Payment</span>
                </div>
                <div className={styles.trustItem}>
                  <Truck size={20} />
                  <span>Free Shipping over ₹5,000</span>
                </div>
                <div className={styles.trustItem}>
                  <Check size={20} />
                  <span>Authenticity Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout