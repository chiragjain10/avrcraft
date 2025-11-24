import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  ArrowLeft,
  Plus,
  Minus,
  Share2,
  Check,
  BookOpen,
  User,
  Calendar
} from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../utils/firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import styles from './ProductDetailPage.module.css'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        if (!id) {
          setError('Product ID not found')
          return
        }

        // Fetch product from Firebase
        const docRef = doc(db, 'products', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() })
        } else {
          setError('Product not found')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product Not Found</h2>
        <p>{error || 'The product you are looking for does not exist.'}</p>
        <Link to="/shop" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Shop
        </Link>
      </div>
    )
  }

  const discount = product.originalPrice ? 
    Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0

  // Use actual images from Firebase or fallback
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl].filter(Boolean)

  return (
    <div className={styles.productDetail}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to="/shop" className={styles.breadcrumbLink}>Shop</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </div>
      </nav>

      <div className={styles.container}>
        <div className={styles.productLayout}>
          {/* Product Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              {productImages.length > 0 ? (
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.name}
                  className={styles.productImage}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <BookOpen size={48} />
                  <span>No Image Available</span>
                </div>
              )}
              
              {/* Badges */}
              <div className={styles.imageBadges}>
                {product.isBestseller && <span className={styles.bestsellerBadge}>BESTSELLER</span>}
                {product.isNew && <span className={styles.newBadge}>New</span>}
                {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className={styles.thumbnailGrid}>
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${selectedImage === index ? styles.thumbnailActive : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} view ${index + 1}`}
                      className={styles.thumbnailImage}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.infoSection}>
            <div className={styles.productHeader}>
              <button 
                onClick={() => navigate(-1)}
                className={styles.backButton}
              >
                <ArrowLeft size={20} />
                Back
              </button>
              
              <div className={styles.headerActions}>
                <button 
                  className={`${styles.wishlistButton} ${isInWishlist ? styles.inWishlist : ''}`}
                  onClick={() => setIsInWishlist(!isInWishlist)}
                >
                  <Heart size={20} />
                </button>
                <button className={styles.shareButton} onClick={handleShare}>
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <h1 className={styles.productTitle}>{product.name}</h1>
            
            {/* Author Information for Books */}
            {product.author && (
              <div className={styles.authorInfo}>
                <User size={16} />
                <span>By {product.author}</span>
              </div>
            )}

            {/* Rating */}
            {product.rating && (
              <div className={styles.ratingSection}>
                <div className={styles.ratingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? styles.filledStar : styles.emptyStar}
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className={styles.ratingValue}>{product.rating}</span>
                {product.reviewCount && (
                  <span className={styles.reviewCount}>({product.reviewCount} reviews)</span>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className={styles.pricingSection}>
              <span className={styles.currentPrice}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
              )}
              {discount > 0 && (
                <span className={styles.discountAmount}>
                  Save ₹{(product.originalPrice - product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <div className={styles.descriptionSection}>
              <p>{product.description}</p>
              
              {product.tags && product.tags.length > 0 && (
                <div className={styles.tagList}>
                  {product.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stock Information */}
            <div className={styles.stockSection}>
              <div className={`${styles.stockStatus} ${
                product.stock > 10 ? styles.inStock : 
                product.stock > 0 ? styles.lowStock : 
                styles.outOfStock
              }`}>
                {product.stock > 10 ? 'In Stock' : 
                 product.stock > 0 ? 'Low Stock' : 
                 'Out of Stock'}
              </div>
              {product.stock > 0 && (
                <span className={styles.stockCount}>
                  {product.stock} items available
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className={styles.quantitySection}>
                <label className={styles.quantityLabel}>Quantity:</label>
                <div className={styles.quantitySelector}>
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className={styles.quantityButton}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= Math.min(product.stock, 10)}
                    className={styles.quantityButton}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className={styles.actionSection}>
              <button 
                onClick={handleAddToCart}
                disabled={addedToCart || product.stock === 0}
                className={`${styles.addToCartButton} ${addedToCart ? styles.added : ''} ${
                  product.stock === 0 ? styles.outOfStockButton : ''
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart
                  </>
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart - ₹{(product.price * quantity).toLocaleString()}
                  </>
                )}
              </button>
              
              {product.stock > 0 && (
                <button className={styles.buyNowButton}>
                  Buy Now
                </button>
              )}
            </div>

            {/* Trust Features */}
            <div className={styles.trustFeatures}>
              <div className={styles.trustItem}>
                <Truck size={20} />
                <div>
                  <strong>Free Shipping</strong>
                  <span>On orders over ₹499</span>
                </div>
              </div>
              <div className={styles.trustItem}>
                <Shield size={20} />
                <div>
                  <strong>Quality Guaranteed</strong>
                  <span>Authentic Products</span>
                </div>
              </div>
              <div className={styles.trustItem}>
                <Check size={20} />
                <div>
                  <strong>Easy Returns</strong>
                  <span>30 Day Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className={styles.detailsTabs}>
          <div className={styles.tabHeaders}>
            <button className={`${styles.tabHeader} ${styles.tabActive}`}>
              Product Details
            </button>
            <button className={styles.tabHeader}>
              Specifications
            </button>
            <button className={styles.tabHeader}>
              Shipping & Returns
            </button>
            {product.reviewCount > 0 && (
              <button className={styles.tabHeader}>
                Reviews ({product.reviewCount})
              </button>
            )}
          </div>

          <div className={styles.tabContent}>
            <div className={styles.detailsGrid}>
              {product.category && (
                <div className={styles.detailItem}>
                  <strong>Category:</strong>
                  <span>{product.category}</span>
                </div>
              )}
              {product.author && (
                <div className={styles.detailItem}>
                  <strong>Author:</strong>
                  <span>{product.author}</span>
                </div>
              )}
              {product.pages && (
                <div className={styles.detailItem}>
                  <strong>Pages:</strong>
                  <span>{product.pages}</span>
                </div>
              )}
              {product.language && (
                <div className={styles.detailItem}>
                  <strong>Language:</strong>
                  <span>{product.language}</span>
                </div>
              )}
              {product.publisher && (
                <div className={styles.detailItem}>
                  <strong>Publisher:</strong>
                  <span>{product.publisher}</span>
                </div>
              )}
              {product.publishedDate && (
                <div className={styles.detailItem}>
                  <strong>Published:</strong>
                  <span>{new Date(product.publishedDate).getFullYear()}</span>
                </div>
              )}
              {product.isbn && (
                <div className={styles.detailItem}>
                  <strong>ISBN:</strong>
                  <span>{product.isbn}</span>
                </div>
              )}
              {product.createdAt && (
                <div className={styles.detailItem}>
                  <Calendar size={16} />
                  <strong>Added:</strong>
                  <span>{new Date(product.createdAt.seconds * 1000).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage