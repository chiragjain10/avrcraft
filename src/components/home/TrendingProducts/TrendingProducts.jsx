import React, { useState, useEffect } from 'react';
import { BookOpen, Truck, RefreshCw, Award } from 'lucide-react';
import { productService } from '../../../utils/services/products';
import ProductCard from './ProductCard';
import styles from './TrendingProducts.module.css';
import LoadingSpinner from '../../common/Loading/LoadingSpinner';

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bestseller products using product service
  useEffect(() => {
    const fetchBestsellerProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use product service to get bestseller products
        const bestsellerProducts = await productService.getBestsellerProducts(4);
        
        if (bestsellerProducts && bestsellerProducts.length > 0) {
          setProducts(bestsellerProducts);
        } else {
          setProducts(getFallbackProducts());
        }
      } catch (err) {
        console.error('Error fetching bestseller products:', err);
        setError('Failed to load products. Please try again later.');
        setProducts(getFallbackProducts());
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellerProducts();
  }, []);

  // Fallback products - Real website ke bestsellers from your screenshots
  const getFallbackProducts = () => [
    {
      id: '1',
      name: 'Stop Letting Everything Affect You',
      price: 12.00,
      originalPrice: 15.00,
      rating: 4.5,
      reviewCount: 128,
      imageUrl: '/images/products/stop-letting.jpg',
      isBestseller: true,
      isNew: false,
      author: 'Self Help Author',
      description: 'Learn to build emotional resilience'
    },
    {
      id: '2',
      name: 'The Banerji Protocols',
      price: 35.00,
      originalPrice: 42.00,
      rating: 4.8,
      reviewCount: 89,
      imageUrl: '/images/products/banerji-protocols.jpg',
      isBestseller: true,
      isNew: false,
      author: 'Stanley | Honey Beard',
      description: 'Forward by renowned authors'
    },
    {
      id: '3',
      name: 'Adult Children of Emotionally Immature Parents',
      price: 18.99,
      originalPrice: 24.99,
      rating: 4.7,
      reviewCount: 256,
      imageUrl: '/images/products/emotionally-immature.jpg',
      isBestseller: true,
      isNew: false,
      author: 'Psychology Expert',
      description: 'How to heal from distant, rejecting, or self-involved parents'
    },
    {
      id: '4',
      name: 'The Mental Game of Trading',
      price: 18.99,
      originalPrice: 22.99,
      rating: 4.6,
      reviewCount: 167,
      imageUrl: '/images/products/mental-game-trading.jpg',
      isBestseller: true,
      isNew: false,
      author: 'Trading Expert',
      description: 'Master the psychology of successful trading'
    }
  ]

  if (loading) {
    return (
      <section className={styles.trending}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading bestseller products...</div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.trending}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.sectionTitle}>BESTSELLER</h2>
            <p className={styles.sectionSubtitle}>
              Featured products loved by our customers
            </p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>4.7</span>
              <span className={styles.statLabel}>Average Rating</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>1K+</span>
              <span className={styles.statLabel}>Happy Readers</span>
            </div>
          </div>
        </div>

        <div className={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className={styles.trustBadges}>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <BookOpen size={20} />
            </div>
            <span>Quality Books</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <Truck size={20} />
            </div>
            <span>Free Shipping</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <RefreshCw size={20} />
            </div>
            <span>Easy Returns</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustIcon}>
              <Award size={20} />
            </div>
            <span>Bestseller Quality</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrendingProducts