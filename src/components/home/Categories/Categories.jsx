import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Book, Shirt, Palette } from 'lucide-react'
import CategoryCard from './CategoryCard'
import styles from './Categories.module.css'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Static categories based on your real website (can be replaced with API call)
  const staticCategories = [
    {
      id: 1,
      name: 'Handicrafts',
      description: 'Explore unique ways of that items for your team',
      icon: Palette,
      image: '/images/categories/handicrafts.jpg',
      path: '/shop?category=handicrafts',
      items: '150+ Products'
    },
    {
      id: 2,
      name: 'Books',
      description: 'Explore Books and find giving literature',
      icon: Book,
      image: '/images/categories/books.jpg',
      path: '/shop?category=books',
      items: '50+ Titles'
    },
    {
      id: 3,
      name: 'Ethnic Wears',
      description: 'Shop our exclusive collection of artisan products',
      icon: Shirt,
      image: '/images/categories/ethnic-wears.jpg',
      path: '/shop?category=ethnic-wears',
      items: '200+ Products'
    }
  ]

  // Simulate backend fetch - Replace this with actual API call
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/categories')
        // const data = await response.json()
        // setCategories(data)
        
        // For now using static data from real website
        setCategories(staticCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories(staticCategories) // Fallback to static data
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className={styles.categories}>
        <div className={styles.container}>
          <div className={styles.loading}>
            Loading categories...
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.categories}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Product Categories</h2>
          <p className={styles.sectionSubtitle}>
            Discover our exclusive range of handcrafted products and collections
          </p>
        </div>
        
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        
        <div className={styles.viewAll}>
          <Link to="/shop" className={styles.viewAllButton}>
            Explore All Products
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Categories