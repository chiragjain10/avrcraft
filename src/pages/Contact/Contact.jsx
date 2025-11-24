import React, { useState } from 'react'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  User,
  ArrowRight
} from 'lucide-react'
import styles from './Contact.module.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: ['hello@avrcraft.com', 'support@avrcraft.com'],
      description: 'We\'ll respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 98765 43211'],
      description: 'Mon-Sat, 10AM-7PM IST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Artisan Street', 'Craft District, Mumbai', 'India - 400001'],
      description: 'Showroom open daily'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Monday - Saturday: 10AM - 7PM', 'Sunday: 11AM - 5PM'],
      description: 'Indian Standard Time'
    }
  ]

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'wholesale', label: 'Wholesale & Bulk Orders' },
    { value: 'artisan', label: 'Artisan Partnership' },
    { value: 'custom', label: 'Custom Order' },
    { value: 'support', label: 'Customer Support' },
    { value: 'collaboration', label: 'Collaboration' }
  ]

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className={styles.contact}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <Send size={48} />
          </div>
          <h1>Message Sent Successfully!</h1>
          <p>
            Thank you for reaching out to AVR Craft. We've received your message and 
            will get back to you within 24 hours.
          </p>
          <div className={styles.successActions}>
            <button 
              onClick={() => setIsSubmitted(false)}
              className={styles.sendAnother}
            >
              Send Another Message
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className={styles.backHome}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.contact}>
      {/* Header */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Get In Touch</h1>
            <p className={styles.heroDescription}>
              Have questions about our artisan collections or interested in partnering with us? 
              We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.contactLayout}>
          {/* Contact Information */}
          <div className={styles.contactInfo}>
            <div className={styles.infoHeader}>
              <MessageCircle size={32} />
              <h2>Let's Start a Conversation</h2>
              <p>Choose the best way to reach us based on your needs</p>
            </div>

            <div className={styles.infoGrid}>
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <div key={index} className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                      <IconComponent size={24} />
                    </div>
                    <div className={styles.infoContent}>
                      <h3>{info.title}</h3>
                      <div className={styles.infoDetails}>
                        {info.details.map((detail, detailIndex) => (
                          <span key={detailIndex}>{detail}</span>
                        ))}
                      </div>
                      <p className={styles.infoDescription}>{info.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Links */}
            <div className={styles.quickLinks}>
              <h3>Quick Help</h3>
              <div className={styles.links}>
                <a href="/faq" className={styles.link}>FAQ</a>
                <a href="/shipping" className={styles.link}>Shipping Info</a>
                <a href="/returns" className={styles.link}>Returns & Exchanges</a>
                <a href="/wholesale" className={styles.link}>Wholesale Inquiries</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.contactForm}>
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h2>Send us a Message</h2>
                <p>Fill out the form below and we'll get back to you soon</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <div className={styles.inputWrapper}>
                      <User size={20} className={styles.inputIcon} />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.formInput}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
                    <div className={styles.inputWrapper}>
                      <Mail size={20} className={styles.inputIcon} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.formInput}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <div className={styles.inputWrapper}>
                      <Phone size={20} className={styles.inputIcon} />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={styles.formInput}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="inquiryType">Inquiry Type *</label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className={styles.formSelect}
                    disabled={isSubmitting}
                  >
                    {inquiryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={styles.formTextarea}
                    required
                    disabled={isSubmitting}
                    placeholder="Tell us about your inquiry, custom requirements, or how we can help you..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner}></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className={styles.mapSection}>
          <div className={styles.mapContainer}>
            <div className={styles.mapPlaceholder}>
              <MapPin size={48} />
              <h3>Our Showroom Location</h3>
              <p>123 Artisan Street, Craft District, Mumbai, India - 400001</p>
              <button className={styles.directionsButton}>
                Get Directions
              </button>
            </div>
          </div>
          
          <div className={styles.locationInfo}>
            <h3>Visit Our Showroom</h3>
            <p>
              Experience our artisan collections in person at our Mumbai showroom. 
              See the craftsmanship up close and get personalized recommendations 
              from our craft experts.
            </p>
            <div className={styles.locationDetails}>
              <div className={styles.detail}>
                <strong>Address</strong>
                <span>123 Artisan Street, Craft District</span>
                <span>Mumbai, India - 400001</span>
              </div>
              <div className={styles.detail}>
                <strong>Hours</strong>
                <span>Monday - Saturday: 10AM - 7PM</span>
                <span>Sunday: 11AM - 5PM</span>
              </div>
              <div className={styles.detail}>
                <strong>Contact</strong>
                <span>+91 98765 43210</span>
                <span>showroom@avrcraft.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact