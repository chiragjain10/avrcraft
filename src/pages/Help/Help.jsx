// src/pages/Help/Help.jsx
import React from 'react'
import styles from './Help.module.css'

const Help = () => {
  const faqs = [
    { question: "How do I place an order?", answer: "Simply browse our shop, add items to cart, and proceed to checkout." },
    { question: "What is your return policy?", answer: "We accept returns within 30 days of purchase with original tags." },
    { question: "How can I track my order?", answer: "Once shipped, you'll receive a tracking number via email." },
    { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide." },
  ]

  return (
    <div className={styles.helpPage}>
      <div className={styles.container}>
        <h1>Help Center</h1>
        <p className={styles.subtitle}>Find answers to frequently asked questions</p>
        
        <div className={styles.contactInfo}>
          <h2>Contact Us</h2>
          <p>Email: support@avrcrafts.com</p>
          <p>Phone: +91 12345 67890</p>
          <p>Hours: Mon-Fri, 9AM-6PM IST</p>
        </div>
        
        <div className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help