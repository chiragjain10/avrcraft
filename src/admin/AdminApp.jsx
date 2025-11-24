import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './contexts/AdminContext'
import AdminLayout from './components/common/AdminLayout/AdminLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Products from './pages/Products/Products'
import Categories from './pages/Categories/Categories'
import Blogs from './pages/Blogs/Blogs'
import Orders from './pages/Orders/Orders'
import Analytics from './pages/Analytics/Analytics'
import './styles/admin-globals.css'

const AdminApp = () => {
  return (
    <AdminProvider>
      <AdminLayout>
        <Routes>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="orders" element={<Orders />} />
          <Route path="analytics" element={<Analytics />} />
        </Routes>
      </AdminLayout>
    </AdminProvider>
  )
}

export default AdminApp