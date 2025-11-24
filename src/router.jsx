import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Shop from './pages/Shop/Shop'
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import CartPage from './pages/Cart/CartPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import Checkout from './pages/Checkout/Checkout'
import AdminApp from './admin/AdminApp'

const AppRouter = () => {
  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Cart & Checkout Routes */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<Checkout />} />
      
      {/* Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Category Routes */}
      <Route path="/category/:category" element={<Shop />} />
      
      {/* Search Route */}
      <Route path="/search" element={<Shop />} />
      
      {/* 404 Route - Catch all undefined routes */}
      <Route path="*" element={<NotFound />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  )
}

// Simple 404 component
const NotFound = () => {
  return (
    <div style={{ 
      padding: '4rem', 
      textAlign: 'center',
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for doesn't exist.</p>
      <a href="/" style={{ 
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px'
      }}>
        Go Back Home
      </a>
    </div>
  )
}

export default AppRouter