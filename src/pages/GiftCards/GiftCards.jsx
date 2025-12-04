// src/pages/GiftCards/GiftCards.jsx
import React, { useState } from 'react'
import styles from './GiftCards.module.css'

const GiftCards = () => {
  const [selectedAmount, setSelectedAmount] = useState(500)

  const amounts = [500, 1000, 2000, 5000, 10000]

  return (
    <div className={styles.giftCardsPage}>
      <div className={styles.container}>
        <h1>Gift Cards</h1>
        <p className={styles.subtitle}>The perfect gift for any occasion</p>
        
        <div className={styles.giftCardSection}>
          <div className={styles.cardPreview}>
            <div className={styles.giftCard}>
              <div className={styles.cardHeader}>
                <h3>AVR Crafts Gift Card</h3>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.amount}>₹{selectedAmount}</p>
                <p>Valid for all products on AVR Crafts</p>
                <p>No expiration date</p>
              </div>
            </div>
          </div>
          
          <div className={styles.purchaseSection}>
            <h2>Select Amount</h2>
            <div className={styles.amountOptions}>
              {amounts.map(amount => (
                <button
                  key={amount}
                  className={`${styles.amountBtn} ${selectedAmount === amount ? styles.selected : ''}`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  ₹{amount}
                </button>
              ))}
              <div className={styles.customAmount}>
                <input 
                  type="number" 
                  placeholder="Custom amount" 
                  min="100"
                  onChange={(e) => setSelectedAmount(parseInt(e.target.value) || 500)}
                />
              </div>
            </div>
            
            <div className={styles.recipientInfo}>
              <h3>Recipient Details</h3>
              <input type="email" placeholder="Recipient's email" />
              <textarea placeholder="Personal message (optional)" rows="3" />
            </div>
            
            <button className={styles.buyButton}>Buy Gift Card for ₹{selectedAmount}</button>
            
            <div className={styles.terms}>
              <p>• Gift cards are delivered via email within 2 hours</p>
              <p>• Can be used for any purchase on AVR Crafts</p>
              <p>• No expiry date</p>
              <p>• Non-refundable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GiftCards