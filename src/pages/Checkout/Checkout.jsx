// Checkout.jsx - Simplified version without Firebase Functions
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Lock,
  Check,
  MapPin,
  AlertCircle
} from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { createOrder, createRazorpayOrderDirect, verifyPaymentClientSide } from '../../utils/firebase/firestore'
import styles from './Checkout.module.css'

const Checkout = () => {
  const { items = [], clearCart, getCartSummary, itemCount } = useCart()
  const { user, userData, loading: authLoading } = useAuth() || {}
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: user?.email || userData?.email || '',
    phone: userData?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'razorpay' // Default to Razorpay
  })

  // Set loading state based on auth loading
  React.useEffect(() => {
    if (!authLoading) {
      setIsLoading(false)
    }
  }, [authLoading])

  // Derived numeric values
  const subtotal = Number(getCartSummary() || 0)
  const shippingCost = subtotal > 5000 ? 0 : 200
  const tax = Number((subtotal * 0.18) || 0)
  const orderTotal = Number(subtotal + shippingCost + tax)

  const totalItems = useMemo(() => {
    if (typeof itemCount === 'number' && itemCount >= 0) return itemCount
    return items.reduce((s, it) => s + (Number(it.quantity || 0)), 0)
  }, [itemCount, items])

  // Form handlers
  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
    if (billingInfo.sameAsShipping && field !== 'email' && field !== 'phone') {
      setBillingInfo(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleBillingChange = (field, value) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }))
  }

  // Validation functions
  const validateStep1 = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode']
    return required.every(f => String(shippingInfo[f] || '').trim().length > 0)
  }

  const validateStep2 = () => {
    if (billingInfo.sameAsShipping) return true
    const required = ['firstName', 'lastName', 'address', 'city', 'state', 'pincode']
    return required.every(f => String(billingInfo[f] || '').trim().length > 0)
  }

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2)
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3)
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      script.onerror = () => {
        setPaymentError('Failed to load payment gateway')
        setIsProcessing(false)
      }
      document.body.appendChild(script)
    })
  }

  // Helper function to clean and validate order data
  const prepareOrderData = (paymentMethod) => {
    // Ensure all required fields have values and clean the data
    const cleanData = (data) => {
      if (!data) return {};
      return Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});
    };

    const cleanShippingInfo = {
      firstName: shippingInfo.firstName || '',
      lastName: shippingInfo.lastName || '',
      email: shippingInfo.email || '',
      phone: shippingInfo.phone || '',
      address: shippingInfo.address || '',
      city: shippingInfo.city || '',
      state: shippingInfo.state || '',
      pincode: shippingInfo.pincode || '',
      country: shippingInfo.country || 'India',
      ...cleanData(shippingInfo)
    };

    const cleanBillingInfo = billingInfo.sameAsShipping 
      ? cleanShippingInfo 
      : {
          firstName: billingInfo.firstName || '',
          lastName: billingInfo.lastName || '',
          email: billingInfo.email || '',
          phone: billingInfo.phone || '',
          address: billingInfo.address || '',
          city: billingInfo.city || '',
          state: billingInfo.state || '',
          pincode: billingInfo.pincode || '',
          country: billingInfo.country || 'India',
          ...cleanData(billingInfo)
        };

    return {
      userId: user?.uid || '',
      items: items.map(i => ({
        productId: i.productId || i.id || '',
        name: i.name || 'Unnamed Product',
        price: Number(i.price || 0),
        quantity: Math.max(1, Number(i.quantity || 1)),
        imageUrl: i.imageUrl || i.coverImage || '',
        ...cleanData(i)
      })),
      shippingInfo: cleanShippingInfo,
      billingInfo: cleanBillingInfo,
      paymentInfo: {
        method: paymentMethod,
        status: 'pending',
        ...(paymentMethod === 'cod' ? { codFee: 50 } : {})
      },
      subtotal: Number(subtotal || 0),
      shipping: Number(shippingCost || 0),
      tax: Number(tax || 0),
      total: paymentMethod === 'cod' 
        ? Number(orderTotal || 0) + 50 
        : Number(orderTotal || 0),
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      orderDate: new Date().toISOString(),
      orderNumber: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Process Razorpay Payment (Client-side only)
  const processRazorpayPayment = async () => {
    if (!user?.uid) {
      alert('Please sign in to place the order')
      navigate('/login?redirect=checkout')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // 1. Create order in Firestore first
      const orderData = prepareOrderData('razorpay')

      const orderResult = await createOrder(orderData)
      if (!orderResult?.success) {
        throw new Error('Failed to create order')
      }

      const dbOrderId = orderResult.orderId

      // 2. Create Razorpay Order (Client-side simulation)
      // Convert amount to paise and ensure it's an integer
      const amountInPaise = Math.round(Number(orderTotal) * 100);
      
      const razorpayResult = await createRazorpayOrderDirect({
        amount: amountInPaise,  // Amount in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        payment_capture: 1, // Auto-capture payment
        notes: {
          orderId: dbOrderId,
          userId: user.uid,
          orderNumber: orderData.orderNumber
        }
      })

      if (!razorpayResult?.success) {
        throw new Error('Failed to create payment order')
      }

      const { orderId: razorpayOrderId, amount: razorpayAmount } = razorpayResult

      // 3. Load Razorpay script
      await loadRazorpayScript()

      // 4. Open Razorpay Checkout
      const options = {
        key: 'rzp_live_RbM4EwDqfoiR3S', // Your Razorpay key
        amount: razorpayAmount,
        currency: 'INR',
        name: 'Avr Crafts',
        description: `Order #${orderData.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          // Handle successful payment
          try {
            const verificationResult = await verifyPaymentClientSide(response, dbOrderId)
            
            if (verificationResult.verified) {
              setOrderId(dbOrderId)
              setOrderSuccess(true)
              clearCart()
            } else {
              setPaymentError('Payment verification failed')
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError)
            setPaymentError('Payment completed but verification failed')
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment cancelled')
            setIsProcessing(false)
          }
        },
        notes: {
          orderId: dbOrderId,
          orderNumber: orderData.orderNumber
        },
        prefill: {
          name: `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim(),
          email: shippingInfo.email || '',
          contact: shippingInfo.phone || ''
        },
        theme: {
          color: '#3498db'
        }
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.open()

    } catch (error) {
      console.error('Payment error:', error)
      setPaymentError(error.message || 'Payment processing failed')
      setIsProcessing(false)
    }
  }

  // Handle COD Payment
  const processCODPayment = async () => {
    setIsProcessing(true)
    
    try {
      const orderData = prepareOrderData('cod')

      const result = await createOrder(orderData)

      if (result?.success) {
        setOrderId(result.orderId)
        setOrderSuccess(true)
        clearCart()
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('COD order error:', error)
      setPaymentError('Failed to place COD order')
    } finally {
      setIsProcessing(false)
    }
  }

  // Main payment handler
  const handlePayment = async () => {
    if (paymentInfo.method === 'cod') {
      await processCODPayment()
    } else {
      await processRazorpayPayment()
    }
  }

  // Loading states
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your information...</p>
      </div>
    )
  }

  if (!user) {
    navigate('/login?redirect=checkout')
    return null
  }

  if ((items?.length || 0) === 0 && !orderSuccess) {
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

  // Order success screen
  if (orderSuccess) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.successState}>
          <div className={styles.successIcon}><Check size={48} /></div>
          <h1 className={styles.successTitle}>Order Confirmed!</h1>
          <p className={styles.successMessage}>
            Thank you for your purchase. Your order #{orderId} has been confirmed.
          </p>

          <div className={styles.orderDetails}>
            <div className={styles.detailItem}>
              <strong>Total Amount:</strong>
              <span>₹{orderTotal.toLocaleString()}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Shipping Address:</strong>
              <span>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Payment Method:</strong>
              <span className={styles.paymentMethodBadge}>
                {paymentInfo.method === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
              </span>
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
              <ArrowLeft size={20} /> Back to Cart
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
        {/* Error Message Display */}
        {paymentError && (
          <div className={styles.errorAlert}>
            <AlertCircle size={20} />
            <span>{paymentError}</span>
            <button onClick={() => setPaymentError(null)} className={styles.closeError}>
              ×
            </button>
          </div>
        )}

        <div className={styles.checkoutLayout}>
          {/* Form column */}
          <div className={styles.checkoutForm}>
            {/* Step 1 - Shipping */}
            {currentStep === 1 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}><Truck size={24} /></div>
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
                  <button 
                    onClick={nextStep} 
                    className={styles.nextButton} 
                    disabled={!validateStep1()}
                  >
                    Continue to Billing
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 - Billing */}
            {currentStep === 2 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}><MapPin size={24} /></div>
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
                  <button onClick={prevStep} className={styles.backButton}>Back</button>
                  <button 
                    onClick={nextStep} 
                    className={styles.nextButton} 
                    disabled={!validateStep2()}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Payment */}
            {currentStep === 3 && (
              <div className={styles.formStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}><CreditCard size={24} /></div>
                  <div>
                    <h2>Payment Method</h2>
                    <p>Choose your preferred payment option</p>
                  </div>
                </div>

                <div className={styles.paymentMethods}>
                  <label className={styles.paymentMethod}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentInfo.method === 'razorpay'}
                      onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    <div className={styles.methodContent}>
                      <div className={styles.razorpayLogo}>Razorpay</div>
                      <div>
                        <span>Secure Online Payment</span>
                        <span className={styles.methodSubtitle}>Cards, UPI, Net Banking, Wallets</span>
                      </div>
                    </div>
                  </label>

                  <label className={styles.paymentMethod}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentInfo.method === 'cod'}
                      onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    <div className={styles.methodContent}>
                      <Truck size={20} />
                      <div>
                        <span>Cash on Delivery</span>
                        <span className={styles.methodSubtitle}>₹50 additional charge</span>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentInfo.method === 'cod' && (
                  <div className={styles.codNotice}>
                    <div className={styles.codIcon}>💵</div>
                    <div className={styles.codContent}>
                      <h4>Cash on Delivery</h4>
                      <p>Pay ₹{orderTotal + 50} when your order is delivered.</p>
                    </div>
                  </div>
                )}

                <div className={styles.paymentSecurity}>
                  <div className={styles.secureBadge}>
                    <Shield size={16} />
                    <span>100% Secure Payment</span>
                  </div>
                </div>

                <div className={styles.stepActions}>
                  <button onClick={prevStep} className={styles.backButton}>Back</button>
                  <button
                    onClick={handlePayment}
                    className={styles.payButton}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className={styles.spinner}></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        {paymentInfo.method === 'cod' ? 'Place Order' : 'Pay Now'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary column */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>

              <div className={styles.itemsList}>
                {items.map(item => (
                  <div key={item.productId || item.id} className={styles.summaryItem}>
                    <div className={styles.itemImage}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className={styles.imagePlaceholder}></div>
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQuantity}>Qty: {Number(item.quantity || 0)}</span>
                    </div>
                    <span className={styles.itemPrice}>
                      ₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.summaryTotals}>
                <div className={styles.totalRow}>
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
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
                  <strong>
                    ₹{(orderTotal + (paymentInfo.method === 'cod' ? 50 : 0)).toLocaleString()}
                  </strong>
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