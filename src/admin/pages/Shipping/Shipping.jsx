// pages/Shipping/Shipping.jsx
import React, { useState, useEffect } from 'react'
import { 
  Truck, 
  Plus,
  Edit,
  Trash2,
  Globe,
  Package,
  Clock
} from 'lucide-react'
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../../utils/firebase/config'
import DataTable from '../../components/common/DataTable/DataTable'
import Modal from '../../components/common/Modal/Modal'
import styles from './Shipping.module.css'

const Shipping = () => {
  const [zones, setZones] = useState([])
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showZoneModal, setShowZoneModal] = useState(false)
  const [showMethodModal, setShowMethodModal] = useState(false)

  useEffect(() => {
    fetchShippingData()
  }, [])

  const fetchShippingData = async () => {
    try {
      setLoading(true)
      
      // Fetch zones
      const zonesSnapshot = await getDocs(collection(db, 'shippingZones'))
      const zonesData = zonesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setZones(zonesData)
      
      // Fetch methods
      const methodsSnapshot = await getDocs(collection(db, 'shippingMethods'))
      const methodsData = methodsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMethods(methodsData)
      
    } catch (error) {
      console.error('Error fetching shipping data:', error)
    } finally {
      setLoading(false)
    }
  }

  const zoneColumns = [
    {
      key: 'name',
      label: 'Zone Name',
      render: (zone) => (
        <div className={styles.zoneInfo}>
          <Globe size={16} />
          <strong>{zone.name}</strong>
        </div>
      )
    },
    {
      key: 'regions',
      label: 'Regions',
      render: (zone) => (
        <div className={styles.regions}>
          {zone.regions?.slice(0, 3).map((region, idx) => (
            <span key={idx} className={styles.regionTag}>{region}</span>
          ))}
          {zone.regions?.length > 3 && (
            <span className={styles.moreRegions}>+{zone.regions.length - 3} more</span>
          )}
        </div>
      )
    },
    {
      key: 'methods',
      label: 'Methods',
      render: (zone) => (
        <div className={styles.zoneMethods}>
          {zone.methods?.map((method, idx) => (
            <span key={idx} className={styles.methodTag}>{method}</span>
          ))}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (zone) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={() => handleEditZone(zone)}
          >
            <Edit size={16} />
          </button>
          <button 
            className={`${styles.actionButton} ${styles.delete}`}
            onClick={() => handleDeleteZone(zone.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  const methodColumns = [
    {
      key: 'name',
      label: 'Method Name',
      render: (method) => (
        <div className={styles.methodInfo}>
          <Truck size={16} />
          <strong>{method.name}</strong>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (method) => (
        <div className={styles.methodDescription}>
          {method.description}
        </div>
      )
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (method) => (
        <div className={styles.cost}>
          ₹{method.cost?.toLocaleString()}
          {method.freeThreshold && (
            <div className={styles.freeThreshold}>
              Free above ₹{method.freeThreshold}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'deliveryTime',
      label: 'Delivery Time',
      render: (method) => (
        <div className={styles.deliveryTime}>
          <Clock size={14} />
          <span>{method.deliveryTime}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (method) => (
        <div className={`${styles.status} ${method.isActive ? styles.active : styles.inactive}`}>
          {method.isActive ? 'Active' : 'Inactive'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (method) => (
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={() => handleEditMethod(method)}
          >
            <Edit size={16} />
          </button>
          <button 
            className={`${styles.actionButton} ${styles.delete}`}
            onClick={() => handleDeleteMethod(method.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  const handleEditZone = (zone) => {
    console.log('Edit zone:', zone)
    setShowZoneModal(true)
  }

  const handleDeleteZone = async (zoneId) => {
    if (window.confirm('Are you sure you want to delete this shipping zone?')) {
      try {
        await deleteDoc(doc(db, 'shippingZones', zoneId))
        fetchShippingData()
      } catch (error) {
        console.error('Error deleting zone:', error)
      }
    }
  }

  const handleEditMethod = (method) => {
    console.log('Edit method:', method)
    setShowMethodModal(true)
  }

  const handleDeleteMethod = async (methodId) => {
    if (window.confirm('Are you sure you want to delete this shipping method?')) {
      try {
        await deleteDoc(doc(db, 'shippingMethods', methodId))
        fetchShippingData()
      } catch (error) {
        console.error('Error deleting method:', error)
      }
    }
  }

  return (
    <div className={styles.shipping}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shipping Settings</h1>
        <p className={styles.subtitle}>Configure shipping zones and methods</p>
      </div>

      {/* Shipping Zones */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shipping Zones</h2>
          <button 
            className={styles.addButton}
            onClick={() => setShowZoneModal(true)}
          >
            <Plus size={18} />
            Add Zone
          </button>
        </div>
        
        <div className={styles.tableSection}>
          <DataTable
            columns={zoneColumns}
            data={zones}
            loading={loading}
            emptyMessage="No shipping zones configured"
            keyExtractor={(zone) => zone.id}
          />
        </div>
      </div>

      {/* Shipping Methods */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shipping Methods</h2>
          <button 
            className={styles.addButton}
            onClick={() => setShowMethodModal(true)}
          >
            <Plus size={18} />
            Add Method
          </button>
        </div>
        
        <div className={styles.tableSection}>
          <DataTable
            columns={methodColumns}
            data={methods}
            loading={loading}
            emptyMessage="No shipping methods configured"
            keyExtractor={(method) => method.id}
          />
        </div>
      </div>

      {/* Modals */}
      {showZoneModal && (
        <Modal
          isOpen={showZoneModal}
          onClose={() => setShowZoneModal(false)}
          title="Add Shipping Zone"
          size="medium"
        >
          <div className={styles.modalContent}>
            {/* Zone form will be implemented here */}
            <p>Shipping zone form</p>
          </div>
        </Modal>
      )}

      {showMethodModal && (
        <Modal
          isOpen={showMethodModal}
          onClose={() => setShowMethodModal(false)}
          title="Add Shipping Method"
          size="medium"
        >
          <div className={styles.modalContent}>
            {/* Method form will be implemented here */}
            <p>Shipping method form</p>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Shipping