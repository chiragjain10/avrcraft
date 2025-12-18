// pages/Reviews/Reviews.jsx
import React, { useState, useEffect } from 'react'
import { 
  Star, 
  User, 
  Package,
  Check,
  X,
  Search
} from 'lucide-react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import DataTable from '../../components/common/DataTable/DataTable'
import styles from './Reviews.module.css'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, 'reviews'))
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            fill={star <= rating ? "#fbbf24" : "#e5e7eb"} 
            color={star <= rating ? "#fbbf24" : "#e5e7eb"}
          />
        ))}
        <span className={styles.ratingValue}>({rating})</span>
      </div>
    )
  }

  const columns = [
    {
      key: 'review',
      label: 'Review',
      render: (review) => (
        <div className={styles.reviewContent}>
          <div className={styles.reviewText}>{review.comment}</div>
          {renderStars(review.rating)}
        </div>
      )
    },
    {
      key: 'product',
      label: 'Product',
      render: (review) => (
        <div className={styles.productInfo}>
          <Package size={14} />
          <span>{review.productName || 'Unknown Product'}</span>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (review) => (
        <div className={styles.customerInfo}>
          <User size={14} />
          <span>{review.customerName || 'Anonymous'}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (review) => (
        <div className={styles.date}>
          {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (review) => (
        <div className={`${styles.status} ${review.isApproved ? styles.approved : styles.pending}`}>
          {review.isApproved ? 'Approved' : 'Pending'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (review) => (
        <div className={styles.actions}>
          <button 
            className={`${styles.actionButton} ${styles.approve}`}
            onClick={() => handleApprove(review.id)}
            disabled={review.isApproved}
          >
            <Check size={16} />
          </button>
          <button 
            className={`${styles.actionButton} ${styles.reject}`}
            onClick={() => handleReject(review.id)}
          >
            <X size={16} />
          </button>
        </div>
      )
    }
  ]

  const handleApprove = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        isApproved: true,
        updatedAt: new Date()
      })
      fetchReviews()
    } catch (error) {
      console.error('Error approving review:', error)
    }
  }

  const handleReject = async (reviewId) => {
    if (window.confirm('Are you sure you want to reject this review?')) {
      try {
        await updateDoc(doc(db, 'reviews', reviewId), {
          isApproved: false,
          updatedAt: new Date()
        })
        fetchReviews()
      } catch (error) {
        console.error('Error rejecting review:', error)
      }
    }
  }

  return (
    <div className={styles.reviews}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customer Reviews</h1>
        <p className={styles.subtitle}>Manage and moderate product reviews</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Star size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{reviews.length}</div>
            <div className={styles.statLabel}>Total Reviews</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Check size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {reviews.filter(r => r.isApproved).length}
            </div>
            <div className={styles.statLabel}>Approved</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <X size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {reviews.filter(r => !r.isApproved).length}
            </div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableSection}>
        <DataTable
          columns={columns}
          data={reviews}
          loading={loading}
          emptyMessage="No reviews found"
          keyExtractor={(review) => review.id}
        />
      </div>
    </div>
  )
}

export default Reviews