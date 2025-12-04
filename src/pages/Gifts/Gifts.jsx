// src/pages/Gifts/Gifts.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../utils/firebase/config'
import styles from './Gifts.module.css'

const Gifts = () => {
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [giftSets, setGiftSets] = useState([])

  // Mock gift sets (since these might not be in Firebase)
  const mockGiftSets = [
    {
      id: 'gift-set-1',
      name: 'Book Lover\'s Bundle',
      description: 'Perfect gift for avid readers',
      items: [
        { name: 'Bestseller Novel', price: '£12.99', image: 'https://via.placeholder.com/60' },
        { name: 'Leather Bookmark', price: '£8.99', image: 'https://via.placeholder.com/60' },
        { name: 'Reading Journal', price: '£14.99', image: 'https://via.placeholder.com/60' }
      ],
      totalPrice: '£32.99',
      savings: '£3.98'
    },
    {
      id: 'gift-set-2',
      name: 'Writer\'s Companion Set',
      description: 'Everything a writer needs',
      items: [
        { name: 'Premium Fountain Pen', price: '£24.99', image: 'https://via.placeholder.com/60' },
        { name: 'Leather Journal', price: '£18.99', image: 'https://via.placeholder.com/60' },
        { name: 'Ink Bottle Set', price: '£12.99', image: 'https://via.placeholder.com/60' }
      ],
      totalPrice: '£49.99',
      savings: '£6.98'
    }
  ]

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'))
        const giftsData = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (doc.data().isGift) {
            giftsData.push({ id: doc.id, ...data })
          }
        })
        setGifts(giftsData)
        setGiftSets(mockGiftSets) // Set mock gift sets
      } catch (error) {
        console.error("Error fetching gifts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [])

  const getGiftBadge = (product) => {
    if (product.isBestseller) return 'Bestseller Gift'
    if (product.tags?.includes('new')) return 'New Arrival'
    if (product.price > 50) return 'Premium Gift'
    return 'Perfect Gift'
  }

  return (
    <div className={styles.giftsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gifts</h1>
          <p className={styles.subtitle}>Thoughtful gifts for book lovers and stationery enthusiasts</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading gifts...</div>
        ) : gifts.length === 0 ? (
          <div className={styles.noGifts}>
            <p>No gifts found at the moment.</p>
            <Link to="/shop" className={styles.shopLink}>Browse Shop</Link>
          </div>
        ) : (
          <>
            <div className={styles.giftsGrid}>
              {gifts.map(gift => (
                <div key={gift.id} className={styles.giftCard}>
                  <Link to={`/product/${gift.id}`}>
                    <div className={styles.imageContainer}>
                      {gift.images?.[0] ? (
                        <img src={gift.images[0]} alt={gift.name} />
                      ) : (
                        <div className={styles.placeholder}>Gift Item</div>
                      )}
                      <span className={styles.giftBadge}>{getGiftBadge(gift)}</span>
                    </div>
                    <div className={styles.giftInfo}>
                      <h3>{gift.name}</h3>
                      <p className={styles.description}>
                        {gift.description || 'A perfect gift for any occasion'}
                      </p>
                      {gift.recipient && (
                        <p className={styles.recipient}>Perfect for: {gift.recipient}</p>
                      )}
                      <div className={styles.priceContainer}>
                        <span className={styles.price}>£{gift.price}</span>
                        {gift.originalPrice && gift.originalPrice > gift.price && (
                          <span className={styles.originalPrice}>£{gift.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button className={styles.addToCartBtn}>Add to Cart</button>
                </div>
              ))}
            </div>

            {/* Gift Sets Section */}
            <div className={styles.giftSetsSection}>
              <h2>Curated Gift Sets</h2>
              <div className={styles.giftSetsGrid}>
                {giftSets.map(giftSet => (
                  <div key={giftSet.id} className={styles.giftSetCard}>
                    <div className={styles.giftSetHeader}>
                      <h3>{giftSet.name}</h3>
                      <p>{giftSet.description}</p>
                    </div>
                    <div className={styles.giftSetContent}>
                      {giftSet.items.map((item, index) => (
                        <div key={index} className={styles.giftSetItem}>
                          <img src={item.image} alt={item.name} />
                          <div className={styles.giftSetItemInfo}>
                            <h4>{item.name}</h4>
                            <p>{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.giftSetPrice}>
                      <p>Set Price: <span className={styles.price}>£{giftSet.totalPrice}</span></p>
                      {giftSet.savings && <p>Save {giftSet.savings}</p>}
                      <button className={styles.giftSetBtn}>Add Gift Set to Cart</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Guide */}
            <div className={styles.giftGuide}>
              <h3>Gift Giving Made Easy</h3>
              <div className={styles.giftTips}>
                <div className={styles.tip}>
                  <h4>🎁 Gift Wrapping</h4>
                  <p>All gifts come with complimentary gift wrapping and a personalized message.</p>
                </div>
                <div className={styles.tip}>
                  <h4>🚚 Free Delivery</h4>
                  <p>Free delivery on all gift orders over £30.</p>
                </div>
                <div className={styles.tip}>
                  <h4>📦 Gift Messages</h4>
                  <p>Add a personal message during checkout for a special touch.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Gifts