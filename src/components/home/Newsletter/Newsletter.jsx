import React, { useState } from 'react'
import { Mail, Phone, Check, Shield, Gift, Package, Users, Bell } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import styles from './Newsletter.module.css'

const Newsletter = () => {
  const [formData, setFormData] = useState({
    phone: '',
    countryCode: '+91'
  })
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'Australia' },
    { code: '+971', country: 'UAE' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    if (!formData.phone.trim()) {
      alert('Please enter your phone number')
      return
    }

    setIsLoading(true)

    try {
      // Firebase mein subscription save karo
      await addDoc(collection(db, 'newsletterSubscriptions'), {
        phoneNumber: formData.countryCode + formData.phone,
        countryCode: formData.countryCode,
        phone: formData.phone,
        status: 'active',
        discountSent: false,
        subscribedAt: serverTimestamp(),
        agreeToTerms: true
      })

      setIsSubscribed(true)
      setFormData({ phone: '', countryCode: '+91' })
      setAgreeToTerms(false)
      
    } catch (error) {
      console.error('Firebase subscription save error:', error)
      alert('Subscription failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Remove non-digits
    setFormData(prev => ({ ...prev, phone: value }))
  }

  if (isSubscribed) {
    return (
      <section className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <Check size={48} />
            </div>
            <h2 className={styles.successTitle}>Welcome to AVR Crafts!</h2>
            <p className={styles.successMessage}>
              Thank you for subscribing! You'll receive updates about our latest handcrafts, 
              books, and exclusive offers.
            </p>
            <div className={styles.successBenefits}>
              <div className={styles.benefit}>
                <Gift size={20} />
                <span>Exclusive offers and discounts</span>
              </div>
              <div className={styles.benefit}>
                <Package size={20} />
                <span>New product notifications</span>
              </div>
              <div className={styles.benefit}>
                <Users size={20} />
                <span>Artisan stories and updates</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSubscribed(false)}
              className={styles.subscribeAgainButton}
            >
              Subscribe Another Number
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.newsletter}>
      <div className={styles.container}>
        <div className={styles.newsletterContent}>
          {/* Left Side - Visual & Offer */}
          <div className={styles.offerSection}>
            <div className={styles.offerBadge}>
              <Gift size={20} />
              <span>Special Offer</span>
            </div>
            
            <h2 className={styles.offerTitle}>
              Stay Updated with
              <span className={styles.highlight}> AVR Crafts</span>
            </h2>
            
            <p className={styles.offerDescription}>
              Subscribe to get notifications about our latest handcrafts, books, 
              ethnic wears, and exclusive discounts delivered directly to you.
            </p>

            <div className={styles.offerFeatures}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Gift size={24} />
                </div>
                <div>
                  <h4>Exclusive Discounts</h4>
                  <p>Special offers for subscribers</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Bell size={24} />
                </div>
                <div>
                  <h4>Product Updates</h4>
                  <p>Get alerts on new arrivals</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Users size={24} />
                </div>
                <div>
                  <h4>Latest Collections</h4>
                  <p>First access to new products</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Subscription Form */}
          <div className={styles.formSection}>
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>Get Notifications</h3>
                <p className={styles.formSubtitle}>
                  Enter your phone number to receive updates
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.subscriptionForm}>
                {/* Country Code Selector */}
                <div className={styles.phoneInputGroup}>
                  <div className={styles.countryCodeSelector}>
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                      className={styles.countryCodeSelect}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} ({country.country})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.phoneInputWrapper}>
                    <Phone size={20} className={styles.phoneIcon} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Enter phone number"
                      className={styles.phoneInput}
                      maxLength={15}
                    />
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className={styles.termsAgreement}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxCustom}></span>
                    <span className={styles.termsText}>
                      I agree to receive promotional messages and updates from AVR Crafts. 
                      View our <a href="/privacy" className={styles.termsLink}>Privacy Policy</a> and 
                      <a href="/terms" className={styles.termsLink}> Terms of Service</a>.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isLoading || !agreeToTerms || !formData.phone.trim()}
                  className={styles.submitButton}
                >
                  {isLoading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Bell size={20} />
                      Subscribe Now
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className={styles.trustBadges}>
                  <div className={styles.trustItem}>
                    <Shield size={16} />
                    <span>Secure & Private</span>
                  </div>
                  <div className={styles.trustItem}>
                    <Check size={16} />
                    <span>No Spam</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter