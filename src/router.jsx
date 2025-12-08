// AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home'
import Shop from './pages/Shop/Shop'
import ProductDetail from './pages/ProductDetail/ProductDetailPage'
import Cart from './pages/Cart/CartPage'
import Checkout from './pages/Checkout/Checkout'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import Wishlist from './pages/Wishlist/Wishlist'
import Help from './pages/Help/Help'
import Blog from './pages/Blog/Blog'
import GiftCards from './pages/GiftCards/GiftCards'
import Join from './pages/Join/Join'
import Artisans from './pages/Artisans/Artisans'
import AdminApp from './admin/AdminApp'
import NotFound from './pages/NotFound/NotFound'

const AppRouter = () => {
  return (
    <Routes>
      {/* Main Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Account & Admin */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* TopBar Links */}
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/help" element={<Help />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/gift-cards" element={<GiftCards />} />
      <Route path="/join" element={<Join />} />
      <Route path="/artisans" element={<Artisans />} />

      {/* Redirect old category routes to shop with query params */}
      <Route path="/bestsellers" element={<Navigate to="/shop?category=bestsellers" replace />} />
      <Route path="/fiction" element={<Navigate to="/shop?category=fiction" replace />} />
      <Route path="/non-fiction" element={<Navigate to="/shop?category=non-fiction" replace />} />
      <Route path="/childrens" element={<Navigate to="/shop?category=childrens" replace />} />
      <Route path="/stationery" element={<Navigate to="/shop?category=stationery" replace />} />
      <Route path="/gifts" element={<Navigate to="/shop?category=gifts" replace />} />

      {/* Additional redirects for convenience */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/products" element={<Navigate to="/shop" replace />} />

      {/* 404 - Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter