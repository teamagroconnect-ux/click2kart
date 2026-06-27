import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/admin/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Products from './pages/admin/Products.jsx'
import Brands from './pages/admin/Brands.jsx'
import Categories from './pages/admin/Categories.jsx'
import SubCategories from './pages/admin/SubCategories.jsx'
import Billing from './pages/admin/Billing.jsx'
import Orders from './pages/admin/Orders.jsx'
import PaymentVerification from './pages/admin/PaymentVerification.jsx'
import Coupons from './pages/admin/Coupons.jsx'
import Partners from './pages/admin/Partners.jsx'
import Settings from './pages/admin/Settings.jsx'
import Retailers from './pages/admin/Retailers.jsx'
import RetailerDetail from './pages/admin/RetailerDetail.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import InventoryPage from './pages/admin/InventoryPage.jsx'
import StaffManagement from './pages/admin/StaffManagement.jsx'
import Stores from './pages/admin/Stores.jsx'
import Offers from './pages/admin/Offers.jsx'
import OfflineRetailers from './pages/admin/OfflineRetailers.jsx'
import SupportTickets from './pages/admin/SupportTickets.jsx'
import Home from './pages/user/Home.jsx'
import Catalogue from './pages/user/Catalogue.jsx'
import BrandPage from './pages/user/BrandPage.jsx'
import UserBrands from './pages/user/Brands.jsx'
import UserCategories from './pages/user/Categories.jsx'
import ProductDetail from './pages/user/ProductDetail.jsx'
import Enquiry from './pages/user/Enquiry.jsx'
import PartnerLayout from './components/PartnerLayout.jsx'
import PartnerProtectedRoute from './components/PartnerProtectedRoute.jsx'
import UserLayout from './components/UserLayout.jsx'
import UserLogin from './pages/user/Login.jsx'
import UserSignup from './pages/user/Signup.jsx'
import ForgotPassword from './pages/user/ForgotPassword.jsx'
import ResetPassword from './pages/user/ResetPassword.jsx'
import OrderHistory from './pages/user/OrderHistory.jsx'
import Cart from './pages/user/Cart.jsx'
import Profile from './pages/user/Profile.jsx'
import ManualPayment from './pages/user/ManualPayment.jsx'
import PrivacyPolicy from './pages/user/PrivacyPolicy.jsx'
import TermsOfService from './pages/user/TermsOfService.jsx'
import PartnerLogin from './pages/partner/Login.jsx'
import PartnerDashboard from './pages/partner/Dashboard.jsx'
import PartnerLanding from './pages/partner/Landing.jsx'
import PartnerOnboarding from './pages/partner/Onboarding.jsx'
import PartnerProfile from './pages/partner/Profile.jsx'
import MyCoupons from './pages/partner/MyCoupons.jsx'
import MyRetailers from './pages/partner/MyBusinesses.jsx'
import Earnings from './pages/partner/Earnings.jsx'
import ReferredOrders from './pages/partner/ReferredOrders.jsx'
import PartnerVerify from './pages/partner/Verify.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="brands" element={<Brands />} />
        <Route path="categories" element={<Categories />} />
        <Route path="subcategories" element={<SubCategories />} />
        <Route path="billing" element={<Billing />} />
        <Route path="orders" element={<Orders />} />
        <Route path="payment-verification" element={<PaymentVerification />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="partners" element={<Partners />} />
        <Route path="retailers" element={<Retailers />} />
        <Route path="retailers/:id" element={<RetailerDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="stores" element={<Stores />} />
        <Route path="offers" element={<Offers />} />
        <Route path="offline-retailers" element={<OfflineRetailers />} />
        <Route path="support-tickets" element={<SupportTickets />} />
      </Route>

      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Catalogue />} />
        <Route path="brands" element={<UserBrands />} />
        <Route path="categories" element={<UserCategories />} />
        <Route path="brand/:slug" element={<BrandPage />} />
        <Route path="products/:idOrSlug" element={<ProductDetail />} />
        <Route path="order" element={<Enquiry />} />
        <Route path="login" element={<UserLogin />} />
        <Route path="signup" element={<UserSignup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="profile" element={<Profile />} />
        <Route path="cart" element={<Cart />} />
        <Route path="manual-payment" element={<ManualPayment />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
      </Route>

      <Route path="/partner" element={<PartnerLanding />} />
      <Route path="/partner/login" element={<PartnerLogin />} />
      <Route path="/partner/onboarding" element={<PartnerOnboarding />} />
      <Route path="/partner/verify/:id" element={<PartnerVerify />} />
      <Route
        path="/partner"
        element={
          <PartnerProtectedRoute>
            <PartnerLayout />
          </PartnerProtectedRoute>
        }
      >
        <Route index element={<PartnerDashboard />} />
        <Route path="dashboard" element={<PartnerDashboard />} />
        <Route path="my-coupons" element={<MyCoupons />} />
        <Route path="my-retailers" element={<MyRetailers />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="orders" element={<ReferredOrders />} />
        <Route path="add-business" element={<UserSignup />} />
        <Route path="profile" element={<PartnerProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
