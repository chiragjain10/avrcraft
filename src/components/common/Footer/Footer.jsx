import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footerMain}>
          {/* Company Info */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>AVR Craft</h3>
            <p className={styles.footerDescription}>
              Premium artisan crafts with eco-friendly materials and traditional techniques. 
              Celebrating heritage while embracing sustainability.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Shop</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/shop" className={styles.footerLink}>All Products</Link></li>
              <li><Link to="/shop?category=paintings" className={styles.footerLink}>Traditional Paintings</Link></li>
              <li><Link to="/shop?category=jewelry" className={styles.footerLink}>Handmade Jewelry</Link></li>
              <li><Link to="/shop?category=decor" className={styles.footerLink}>Spiritual Decor</Link></li>
              <li><Link to="/shop?category=home" className={styles.footerLink}>Home & Living</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Company</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/about" className={styles.footerLink}>About Us</Link></li>
              <li><Link to="/artisans" className={styles.footerLink}>Our Artisans</Link></li>
              <li><Link to="/sustainability" className={styles.footerLink}>Sustainability</Link></li>
              <li><Link to="/blog" className={styles.footerLink}>Blog</Link></li>
              <li><Link to="/careers" className={styles.footerLink}>Careers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Support</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/contact" className={styles.footerLink}>Contact Us</Link></li>
              <li><Link to="/shipping" className={styles.footerLink}>Shipping Info</Link></li>
              <li><Link to="/returns" className={styles.footerLink}>Returns</Link></li>
              <li><Link to="/faq" className={styles.footerLink}>FAQ</Link></li>
              <li><Link to="/privacy" className={styles.footerLink}>Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>Contact</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>123 Artisan Street, Craft District<br />Mumbai, India 400001</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>hello@avrcraft.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className={styles.newsletter}>
          <div className={styles.newsletterContent}>
            <h4 className={styles.newsletterTitle}>Stay Updated</h4>
            <p className={styles.newsletterText}>
              Subscribe to get updates on new collections and artisan stories
            </p>
            <form className={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Enter your email"
                className={styles.newsletterInput}
                required
              />
              <button type="submit" className={styles.newsletterButton}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            <p className={styles.copyright}>
              © 2024 AVR Craft. All rights reserved. Crafted with ❤️ for artisan excellence.
            </p>
            <div className={styles.paymentMethods}>
              <span className={styles.paymentText}>We accept:</span>
              <div className={styles.paymentIcons}>
                {/* Payment icons would go here */}
                <span className={styles.paymentIcon}>Visa</span>
                <span className={styles.paymentIcon}>MasterCard</span>
                <span className={styles.paymentIcon}>PayPal</span>
                <span className={styles.paymentIcon}>UPI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer