import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import MyOrders from './pages/MyOrders'

import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Banners from './pages/admin/Banners'
import Products from './pages/admin/Products'
import ProductForm from './pages/admin/ProductForm'
import Categories from './pages/admin/Categories'
import Orders from './pages/admin/Orders'
import Customers from './pages/admin/Customers'

import Profile from './pages/Profile'
import AdminProfile from './pages/admin/AdminProfile'
import SubAdmins from './pages/admin/SubAdmins'
import AuditLog from './pages/admin/AuditLog'

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

export default function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* ADMIN — separate layout */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="banners" element={<Banners />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id/edit" element={<ProductForm />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="sub-admins" element={<SubAdmins />} />
                    <Route path="audit" element={<AuditLog />} />
                </Route>

                {/* CUSTOMER — storefront layout with page transitions */}
                <Route path="*" element={
                                     <div className="min-h-screen flex flex-col">
                                        <Navbar />
                                        <main className="flex-1">
                                            <AnimatedRoutes />
                                        </main>
                                        <Footer />
                                    </div>
                                } />
            </Routes>
        </>
    )
}

function AnimatedRoutes() {
    const location = useLocation()
    return (
        <div key={location.pathname} className="animate-page-in">
            <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={
                                            <ProtectedRoute><Profile /></ProtectedRoute>
                                       } />
                <Route path="/checkout" element={
                                             <ProtectedRoute><Checkout /></ProtectedRoute>
                                        } />
                <Route path="/orders" element={
                                           <ProtectedRoute><MyOrders /></ProtectedRoute>
                                      } />
                <Route path="*" element={
                                     <div className="py-40 text-center">
                                        <h1 className="text-5xl font-serif mb-4 text-fg">404</h1>
                                        <p className="text-sm text-muted">Page not found</p>
                                    </div>
                                } />
            </Routes>
        </div>
    )
}