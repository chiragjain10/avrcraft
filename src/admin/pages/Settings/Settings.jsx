// pages/Settings/Settings.jsx
import React, { useState } from 'react'
import { 
  Save,
  Upload,
  Globe,
  Mail,
  CreditCard,
  Bell,
  Shield
} from 'lucide-react'
import styles from './Settings.module.css'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Save settings logic
    setTimeout(() => {
      setLoading(false)
      alert('Settings saved successfully!')
    }, 1000)
  }

  const renderGeneralSettings = () => (
    <div className={styles.settingsSection}>
      <h3 className={styles.sectionTitle}>Store Information</h3>
      <div className={styles.formGroup}>
        <label className={styles.label}>Store Name</label>
        <input type="text" className={styles.input} defaultValue="AVR Crafts" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Store Description</label>
        <textarea className={styles.textarea} rows={3} defaultValue="Handmade crafts and artisan products" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Store Logo</label>
        <div className={styles.fileUpload}>
          <Upload size={20} />
          <span>Upload Logo</span>
          <input type="file" accept="image/*" />
        </div>
      </div>
    </div>
  )

  const renderEmailSettings = () => (
    <div className={styles.settingsSection}>
      <h3 className={styles.sectionTitle}>Email Settings</h3>
      <div className={styles.formGroup}>
        <label className={styles.label}>SMTP Host</label>
        <input type="text" className={styles.input} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>SMTP Port</label>
        <input type="number" className={styles.input} />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Email Address</label>
        <input type="email" className={styles.input} />
      </div>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className={styles.settingsSection}>
      <h3 className={styles.sectionTitle}>Payment Methods</h3>
      <div className={styles.checkboxGroup}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" defaultChecked />
          <span>Razorpay</span>
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" defaultChecked />
          <span>Cash on Delivery</span>
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" />
          <span>PayPal</span>
        </label>
      </div>
    </div>
  )

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure your store settings</p>
      </div>

      <div className={styles.settingsContainer}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <form onSubmit={handleSubmit} className={styles.settingsContent}>
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'email' && renderEmailSettings()}
          {activeTab === 'payment' && renderPaymentSettings()}
          {activeTab === 'notifications' && <div>Notifications settings</div>}
          {activeTab === 'security' && <div>Security settings</div>}

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings