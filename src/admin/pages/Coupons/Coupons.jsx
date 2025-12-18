// pages/Coupons/Coupons.jsx
import React, { useState, useEffect } from 'react'
import { 
  Tag, 
  Plus, 
  Calendar,
  Percent,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react'
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import DataTable from '../../components/common/DataTable/DataTable'
import Modal from '../../components/common/Modal/Modal'
import styles from './Coupons.module.css'

const Coupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, 'coupons'))
      const couponsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCoupons(couponsData)
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'code',
      label: 'Coupon Code',
      render: (coupon) => (
        <div className={styles.couponCode}>
          <Tag size={16} />
          <strong>{coupon.code}</strong>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (coupon) => (
        <div className={styles.couponDescription}>
          <div>{coupon.description}</div>
          {coupon.minPurchase && (
            <div className={styles.minPurchase}>
              Min purchase: ₹{coupon.minPurchase}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (coupon) => (
        <div className={styles.discount}>
          {coupon.discountType === 'percentage' ? (
            <>
              <Percent size={16} />
              <span>{coupon.discountValue}% OFF</span>
            </>
          ) : (
            <>
              <span>₹{coupon.discountValue} OFF</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'validity',
      label: 'Validity',
      render: (coupon) => (
        <div className={styles.validity}>
          <Calendar size={14} />
          <span>
            {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : 'Always'} - 
            {coupon.validTo ? new Date(coupon.validTo).toLocaleDateString() : 'Always'}
          </span>
        </div>
      )
    },
    {
      key: 'usage',
      label: 'Usage',
      render: (coupon) => (
        <div className={styles.usage}>
          <div className={styles.usageCount}>
            {coupon.usedCount || 0} / {coupon.maxUsage || '∞'} used
          </div>
          <div className={styles.usageAmount}>
            ₹{coupon.totalDiscount || 0} saved
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (coupon) => (
        <div className={`${styles.status} ${coupon.isActive ? styles.active : styles.inactive}`}>
          {coupon.isActive ? (
            <>
              <CheckCircle size={14} />
              <span>Active</span>
            </>
          ) : (
            <>
              <XCircle size={14} />
              <span>Inactive</span>
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <div className={styles.coupons}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Coupons & Discounts</h1>
          <p className={styles.subtitle}>Manage discount codes and promotions</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.createButton}
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Create Coupon
          </button>
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search coupons by code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Tag size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{coupons.length}</div>
            <div className={styles.statLabel}>Total Coupons</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {coupons.filter(c => c.isActive).length}
            </div>
            <div className={styles.statLabel}>Active</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Percent size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              ₹{coupons.reduce((sum, c) => sum + (c.totalDiscount || 0), 0)}
            </div>
            <div className={styles.statLabel}>Total Savings</div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <DataTable
          columns={columns}
          data={coupons}
          loading={loading}
          emptyMessage="No coupons found. Create your first coupon to get started."
          keyExtractor={(coupon) => coupon.id}
        />
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create New Coupon"
          size="medium"
        >
          <div className={styles.couponForm}>
            {/* Coupon form implementation */}
            <p>Coupon form will be implemented here</p>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Coupons