import React, { useState } from 'react'
import { ZoomIn, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import styles from './ProductGallery.module.css'

const ProductGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  // Firebase se aayi hui images use karo, agar empty hai toh fallback
  const displayImages = images.length > 0 ? images : [
    '/images/products/placeholder.jpg'
  ]

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const handleImageHover = (e) => {
    if (!isZoomed) return

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  // Agar koi image nahi hai toh placeholder show karo
  if (displayImages.length === 0) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImageContainer}>
          <div className={styles.noImage}>
            <ImageIcon size={48} className={styles.noImageIcon} />
            <p>No image available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.gallery}>
      {/* Main Image */}
      <div className={styles.mainImageContainer}>
        <div 
          className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
          onMouseMove={handleImageHover}
          onMouseLeave={() => setIsZoomed(false)}
        >
          {displayImages[selectedImage] ? (
            <img
              src={displayImages[selectedImage]}
              alt={`Product view ${selectedImage + 1}`}
              className={styles.mainImageElement}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <ImageIcon size={32} />
              <span>Image not available</span>
            </div>
          )}
          
          {/* Navigation Arrows - Only show if multiple images */}
          {displayImages.length > 1 && (
            <>
              <button 
                onClick={prevImage} 
                className={styles.navButton} 
                style={{ left: '1rem' }}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextImage} 
                className={styles.navButton} 
                style={{ right: '1rem' }}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Zoom Button - Only show if image is available */}
          {displayImages[selectedImage] && (
            <button 
              onClick={toggleZoom} 
              className={styles.zoomButton}
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            >
              <ZoomIn size={20} />
            </button>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className={styles.imageCounter}>
              {selectedImage + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Zoomed View Overlay */}
        {isZoomed && displayImages[selectedImage] && (
          <div className={styles.zoomOverlay}>
            <div className={styles.zoomedImageContainer}>
              <img
                src={displayImages[selectedImage]}
                alt={`Zoomed product view ${selectedImage + 1}`}
                className={styles.zoomedImage}
                style={{
                  transform: `translate(-${zoomPosition.x}%, -${zoomPosition.y}%) scale(2)`
                }}
              />
            </div>
            <button 
              onClick={toggleZoom}
              className={styles.closeZoomButton}
              aria-label="Close zoom"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - Only show if multiple images */}
      {displayImages.length > 1 && (
        <div className={styles.thumbnailGallery}>
          {displayImages.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
              onClick={() => setSelectedImage(index)}
              aria-label={`View image ${index + 1}`}
            >
              {image ? (
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={styles.thumbnailImage}
                  loading="lazy"
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <ImageIcon size={16} />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Touch Controls */}
      <div className={styles.mobileControls}>
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className={styles.mobileNavButton}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage} 
              className={styles.mobileNavButton}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ProductGallery