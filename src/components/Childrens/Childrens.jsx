import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../utils/firebase/config';
import ProductCard from './ProductCard';
import styles from './Childrens.module.css';

const ChildrensProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bestseller products from Firebase
  useEffect(() => {
    const fetchChildrensProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Firebase query for bestseller products
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('isChildrens', '==', true),
          limit(8)
        );

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const productsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(productsData);
        } else {
          // Fallback: get any products if no childrens found
          const allProductsQuery = query(productsRef, limit(8));
          const allProductsSnapshot = await getDocs(allProductsQuery);
          const allProductsData = allProductsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(allProductsData);
        }
        
      } catch (err) {
        console.error('Error fetching childrens products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildrensProducts();
  }, []);

  if (loading) {
    return (
      <section className={styles.trending}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Childrens</h2>
            <Link to="/shop" className={styles.viewAll}>
              View all
            </Link>
          </div>
          <div className={styles.productsGrid}>
            {[...Array(8)].map((_, index) => (
              <div key={index} className={styles.productCardLoading}>
                <div className={styles.cardImageLoading}></div>
                <div className={styles.cardContentLoading}>
                  <div className={styles.titleLoading}></div>
                  <div className={styles.authorLoading}></div>
                  <div className={styles.priceLoading}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.trending}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Childrens</h2>
            <Link to="/shop" className={styles.viewAll}>
              View all
            </Link>
          </div>
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.trending}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Childrens</h2>
          <Link to="/shop" className={styles.viewAll}>
            View all
          </Link>
        </div>

        <div className={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChildrensProducts;