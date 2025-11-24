import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Award, 
  Users, 
  Heart, 
  Shield, 
  Star,
  MapPin,
  Clock,
  BookOpen,
  ShoppingBag,
  Shirt
} from 'lucide-react'
import styles from './About.module.css'

const About = () => {
  const stats = [
    { icon: Users, number: '150+', label: 'Customer Favorites' },
    { icon: Award, number: '15+', label: 'Trusted by Many' },
    { icon: BookOpen, number: '50+', label: 'Book Titles' },
    { icon: ShoppingBag, number: '200+', label: 'Handicraft Products' }
  ]

  const values = [
    {
      icon: BookOpen,
      title: 'Quality Literature',
      description: 'We offer carefully selected books that inspire, educate, and entertain readers of all ages.'
    },
    {
      icon: ShoppingBag,
      title: 'Unique Handicrafts',
      description: 'Discover authentic handcrafted items that showcase traditional craftsmanship and modern design.'
    },
    {
      icon: Shirt,
      title: 'Ethnic Fashion',
      description: 'Traditional clothing and accessories that celebrate Indian culture and heritage.'
    },
    {
      icon: Shield,
      title: 'Customer Satisfaction',
      description: 'Dedicated to providing excellent service and building lasting relationships with our customers.'
    }
  ]

  const services = [
    {
      icon: BookOpen,
      title: 'Book Collections',
      description: 'Wide range of books including bestsellers, self-help, fiction, and educational literature',
      items: ['Bestsellers', 'Self-help', 'Fiction', 'Educational']
    },
    {
      icon: ShoppingBag,
      title: 'Handicrafts',
      description: 'Traditional and contemporary handcrafted items for home and personal use',
      items: ['Home Decor', 'Traditional Art', 'Gift Items', 'Collectibles']
    },
    {
      icon: Shirt,
      title: 'Ethnic Wears',
      description: 'Authentic traditional clothing and accessories for all occasions',
      items: ['Traditional Wear', 'Accessories', 'Festive Collection', 'Daily Wear']
    }
  ]

  return (
    <div className={styles.about}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                About AVR Crafts
              </h1>
              <p className={styles.heroDescription}>
                Discover unique handicrafts and stylish clothing at AVR Crafts, your
                go-to online store for quality handmade items and books. We bring you
                the finest collection of traditional and contemporary products that
                celebrate Indian craftsmanship and literature.
              </p>
              <div className={styles.heroActions}>
                <Link to="/shop" className={styles.primaryButton}>
                  Shop Now
                </Link>
                <Link to="/contact" className={styles.secondaryButton}>
                  Contact Us
                </Link>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualGrid}>
                <div className={styles.gridItem}></div>
                <div className={styles.gridItem}></div>
                <div className={styles.gridItem}></div>
                <div className={styles.gridItem}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className={styles.statItem}>
                  <div className={styles.statIcon}>
                    <IconComponent size={32} />
                  </div>
                  <div className={styles.statContent}>
                    <span className={styles.statNumber}>{stat.number}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.story}>
        <div className={styles.container}>
          <div className={styles.storyContent}>
            <div className={styles.storyText}>
              <h2>Our Story</h2>
              <p>
                AVR Crafts LLP was established with a vision to bring quality books and 
                authentic handicrafts to customers worldwide. We understand the importance 
                of good literature and the beauty of handcrafted items in enriching lives 
                and preserving cultural heritage.
              </p>
              <p>
                Our journey began with a simple idea: to create a platform where readers 
                can find their next favorite book and where art lovers can discover 
                unique handicrafts that tell a story. Today, we serve thousands of 
                satisfied customers across the globe.
              </p>
              <div className={styles.storyFeatures}>
                <div className={styles.feature}>
                  <BookOpen size={20} />
                  <span>Quality Books Selection</span>
                </div>
                <div className={styles.feature}>
                  <ShoppingBag size={20} />
                  <span>Authentic Handicrafts</span>
                </div>
                <div className={styles.feature}>
                  <Shirt size={20} />
                  <span>Traditional Ethnic Wears</span>
                </div>
              </div>
            </div>
            <div className={styles.storyVisual}>
              <div className={styles.missionBox}>
                <h3>Our Mission</h3>
                <p>
                  To provide customers with access to quality books and authentic handicrafts 
                  while supporting local artisans and promoting reading culture.
                </p>
                <div className={styles.missionPoints}>
                  <div className={styles.missionPoint}>
                    <Star size={16} />
                    <span>Quality Products</span>
                  </div>
                  <div className={styles.missionPoint}>
                    <Heart size={16} />
                    <span>Customer First</span>
                  </div>
                  <div className={styles.missionPoint}>
                    <Award size={16} />
                    <span>Excellence in Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>What We Offer</h2>
            <p>Discover our diverse range of products and services</p>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <div key={index} className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>
                    <IconComponent size={40} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className={styles.serviceItems}>
                    {service.items.map((item, itemIndex) => (
                      <span key={itemIndex} className={styles.serviceItem}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.values}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Why Choose AVR Crafts?</h2>
            <p>We are committed to excellence in everything we do</p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueIcon}>
                    <IconComponent size={32} />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={styles.gallery}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Gallery</h2>
            <p>Explore our unique handcrafts and catering collection</p>
          </div>
          <div className={styles.galleryGrid}>
            <div className={styles.galleryItem}>
              <div className={styles.galleryImage}></div>
              <div className={styles.galleryContent}>
                <h4>HANDICRAFT</h4>
                <p>Traditional and modern handcrafted items</p>
              </div>
            </div>
            <div className={styles.galleryItem}>
              <div className={styles.galleryImage}></div>
              <div className={styles.galleryContent}>
                <h4>BOOKS</h4>
                <p>Wide selection of literature and educational books</p>
              </div>
            </div>
            <div className={styles.galleryItem}>
              <div className={styles.galleryImage}></div>
              <div className={styles.galleryContent}>
                <h4>ETHNIC WEARS</h4>
                <p>Traditional clothing and accessories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Start Your Journey With Us</h2>
            <p>
              Explore our collections and discover the perfect books and handicrafts 
              that match your style and interests. Join thousands of satisfied customers 
              who trust AVR Crafts for quality and authenticity.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/shop" className={styles.ctaButton}>
                Start Shopping
              </Link>
              <Link to="/contact" className={styles.ctaSecondary}>
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About