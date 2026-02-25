import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/admin/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Products from './pages/admin/Products.jsx'
import Categories from './pages/admin/Categories.jsx'
import Billing from './pages/admin/Billing.jsx'
import Orders from './pages/admin/Orders.jsx'
import Coupons from './pages/admin/Coupons.jsx'
import Partners from './pages/admin/Partners.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/user/Home.jsx'
import Catalogue from './pages/user/Catalogue.jsx'
import ProductDetail from './pages/user/ProductDetail.jsx'
import Enquiry from './pages/user/Enquiry.jsx'
import Partner from './pages/user/Partner.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="billing" element={<Billing />} />
        <Route path="orders" element={<Orders />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="partners" element={<Partners />} />
      </Route>

      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Catalogue />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/enquiry" element={<Enquiry />} />
      <Route path="/partner" element={<Partner />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

