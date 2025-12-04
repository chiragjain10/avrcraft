// components/admin/artisans/AdminArtisans.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  MapPin,
  Filter,
  Download,
  Award,
  Users,
  AlertCircle
} from 'lucide-react'
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import styles from './AdminArtisans.module.css'

const AdminArtisans = () => {
  const [artisans, setArtisans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, active, featured

  useEffect(() => {
    fetchArtisans()
  }, [])

  const fetchArtisans = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, 'artisans'))
      const artisansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setArtisans(artisansData)
    } catch (error) {
      console.error('Error fetching artisans:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteArtisan = async (id) => {
    if (window.confirm('Are you sure you want to delete this artisan?')) {
      try {
        await deleteDoc(doc(db, 'artisans', id))
        setArtisans(artisans.filter(artisan => artisan.id !== id))
      } catch (error) {
        console.error('Error deleting artisan:', error)
      }
    }
  }

  const toggleFeatured = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'artisans', id), {
        isFeatured: !currentStatus
      })
      fetchArtisans()
    } catch (error) {
      console.error('Error updating artisan:', error)
    }
  }

  const toggleActive = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'artisans', id), {
        isActive: !currentStatus
      })
      fetchArtisans()
    } catch (error) {
      console.error('Error updating artisan:', error)
    }
  }

  const filteredArtisans = artisans.filter(artisan => {
    const matchesSearch = 
      artisan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.craft?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'active') return matchesSearch && artisan.isActive
    if (filter === 'featured') return matchesSearch && artisan.isFeatured
    return matchesSearch
  })

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading artisans...</p>
      </div>
    )
  }

  return (
    <div className={styles.adminArtisans}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Manage Artisans</h1>
          <p className={styles.subtitle}>View and manage all artisan profiles</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/artisans/create" className={styles.createButton}>
            <Plus size={18} />
            Add New Artisan
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search artisans by name, craft, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            <Users size={16} />
            All ({artisans.length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            <Eye size={16} />
            Active ({artisans.filter(a => a.isActive).length})
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'featured' ? styles.active : ''}`}
            onClick={() => setFilter('featured')}
          >
            <Award size={16} />
            Featured ({artisans.filter(a => a.isFeatured).length})
          </button>
          
          <button className={styles.exportBtn}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Artisans Table */}
      <div className={styles.artisansTable}>
        {filteredArtisans.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} />
            <h3>No artisans found</h3>
            <p>{searchTerm ? 'Try a different search term' : 'Add your first artisan to get started'}</p>
            <Link to="/admin/artisans/create" className={styles.emptyButton}>
              <Plus size={18} />
              Add New Artisan
            </Link>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Artisan</th>
                  <th>Craft & Location</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtisans.map((artisan) => (
                  <tr key={artisan.id}>
                    <td>
                      <div className={styles.artisanInfo}>
                        <div className={styles.avatar}>
                          {artisan.name?.charAt(0)}
                        </div>
                        <div>
                          <div className={styles.name}>{artisan.name}</div>
                          <div className={styles.email}>{artisan.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.craftInfo}>
                        <div className={styles.craft}>{artisan.craft}</div>
                        <div className={styles.location}>
                          <MapPin size={12} />
                          {artisan.location}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.statusGroup}>
                        <button
                          className={`${styles.statusBtn} ${artisan.isActive ? styles.active : styles.inactive}`}
                          onClick={() => toggleActive(artisan.id, artisan.isActive)}
                        >
                          {artisan.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          className={`${styles.featuredBtn} ${artisan.isFeatured ? styles.featured : ''}`}
                          onClick={() => toggleFeatured(artisan.id, artisan.isFeatured)}
                        >
                          <Award size={12} />
                          {artisan.isFeatured ? 'Featured' : 'Feature'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.rating}>
                        <Star size={14} fill="#fbbf24" />
                        <span>{artisan.rating || '4.5'}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.productsCount}>
                        {artisan.productsCount || 0} products
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link 
                          to={`/artisans/${artisan.id}`} 
                          className={styles.actionBtn}
                          target="_blank"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          to={`/admin/artisans/${artisan.id}/edit`} 
                          className={`${styles.actionBtn} ${styles.edit}`}
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => deleteArtisan(artisan.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={styles.statsSummary}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{artisans.length}</div>
            <div className={styles.statLabel}>Total Artisans</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Award size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {artisans.filter(a => a.isFeatured).length}
            </div>
            <div className={styles.statLabel}>Featured</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Eye size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {artisans.filter(a => a.isActive).length}
            </div>
            <div className={styles.statLabel}>Active</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Star size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {artisans.reduce((sum, a) => sum + (a.rating || 0), 0) / Math.max(artisans.length, 1)}
            </div>
            <div className={styles.statLabel}>Avg Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminArtisans