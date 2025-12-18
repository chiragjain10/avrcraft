import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './contexts/AdminContext'
import AdminLayout from './components/common/AdminLayout/AdminLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Products from './pages/Products/Products'
import Categories from './pages/Categories/Categories'
import Blogs from './pages/Blogs/Blogs'
import Orders from './pages/Orders/Orders'
import Analytics from './pages/Analytics/Analytics'
import AdminArtisans from './pages/Artisans/AdminArtisans'
import CreateArtisan from './pages/Artisans/CreateArtisan'
import EditArtisan from './pages/Artisans/EditArtisan'
import AdminCustomers from './components/customers/AdminCustomers'
import Shipping from './pages/Shipping/Shipping'
import Coupons from './pages/Coupons/Coupons'
import Reviews from './pages/Reviews/Reviews'
import Inventory from './pages/Inventory/Inventory'
import Settings from './pages/Settings/Settings'
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
                    <Route path="artisans" element={<AdminArtisans />} />
                    <Route path="artisans/create" element={<CreateArtisan />} />
                    <Route path="artisans/:id/edit" element={<EditArtisan />} />
                    <Route path="blogs" element={<Blogs />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="coupons" element={<Coupons />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="shipping" element={<Shipping />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                </Routes>
            </AdminLayout>
        </AdminProvider>
    )
}

export default AdminApp