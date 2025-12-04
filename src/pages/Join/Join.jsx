// src/pages/Join/Join.jsx
import React from 'react'
import styles from './Join.module.css'

const Join = () => {
  const benefits = [
    "Free shipping on all orders",
    "Early access to sales",
    "Exclusive member-only products",
    "15% off your first order",
    "Birthday bonus gift",
    "Priority customer support"
  ]

  return (
    <div className={styles.joinPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Join AVR Crafts Plus</h1>
          <p className={styles.tagline}>Elevate your shopping experience with exclusive benefits</p>
        </div>
        
        <div className={styles.membershipTiers}>
          <div className={styles.tier}>
            <h2>Basic</h2>
            <p className={styles.price}>Free</p>
            <ul>
              <li>Access to shop</li>
              <li>Regular shipping</li>
              <li>Standard support</li>
            </ul>
            <button className={styles.signupBtn}>Current Plan</button>
          </div>
          
          <div className={`${styles.tier} ${styles.featured}`}>
            <div className={styles.badge}>Most Popular</div>
            <h2>Plus Member</h2>
            <p className={styles.price}>₹499/year</p>
            <ul>
              {benefits.map((benefit, index) => (
                <li key={index}>✓ {benefit}</li>
              ))}
            </ul>
            <button className={styles.signupBtn}>Upgrade Now</button>
          </div>
          
          <div className={styles.tier}>
            <h2>Premium</h2>
            <p className={styles.price}>₹999/year</p>
            <ul>
              <li>All Plus benefits</li>
              <li>Personal shopper</li>
              <li>VIP event access</li>
              <li>Quarterly gift box</li>
              <li>Unlimited returns</li>
            </ul>
            <button className={styles.signupBtn}>Choose Premium</button>
          </div>
        </div>
        
        <div className={styles.faq}>
          <h3>Frequently Asked Questions</h3>
          <div className={styles.faqItem}>
            <h4>Can I cancel anytime?</h4>
            <p>Yes, you can cancel your membership at any time.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Is there a trial period?</h4>
            <p>Yes, we offer a 14-day free trial for Plus membership.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Join