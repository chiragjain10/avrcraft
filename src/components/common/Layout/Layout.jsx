// Layout.jsx
import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

const Layout = ({ children }) => {
  const location = useLocation()
  
  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin')
  
  if (isAdminRoute) {
    // Admin route - no header/footer
    return <div>{children}</div>
  }
  
  // Normal route - with header/footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout