import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ThemeToggle'
import api from '../../api/axios'

const nav = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/banners', label: 'Banners' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/featured-products', label: 'Featured Products' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/customers', label: 'Customers' },
    { to: '/admin/requests', label: 'Requests' },
    { to: '/admin/footer', label: 'Footer' },
    { to: '/admin/profile', label: 'My Account' },
    { to: '/admin/sub-admins', label: 'Sub-Admins', adminOnly: true },
    { to: '/admin/audit', label: 'Audit Log', adminOnly: true },
]

export default function AdminLayout() {
    const { user, isAdmin } = useAuth()
    const visibleNav = nav.filter(item => !item.adminOnly || isAdmin)
    const location = useLocation()
    const [unreadRequestsCount, setUnreadRequestsCount] = useState(0)
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
    const [refundRequestsCount, setRefundRequestsCount] = useState(0)

    // Extracted fetch logic so it can be called manually
    const fetchUnreadCount = () => {
        api.get('/admin/requests')
            .then(r => {
                const unreadCount = r.data.filter(req => req.hasUnreadAdmin === true).length
                setUnreadRequestsCount(unreadCount)
            })
            .catch(() => setUnreadRequestsCount(0))
    }

    const fetchRefundRequestsCount = () => {
        api.get('/admin/orders/count-refunds')
            .then(r => setRefundRequestsCount(r.data))
            .catch(() => setRefundRequestsCount(0))
    }

    const fetchPendingOrdersCount = () => {
        api.get('/admin/orders/count-pending')
            .then(r => setPendingOrdersCount(r.data))
            .catch(() => setPendingOrdersCount(0))
    }

    useEffect(() => {
        fetchUnreadCount()
        fetchPendingOrdersCount()
        fetchRefundRequestsCount() // <-- NEW

        window.addEventListener('refreshAdminBadge', fetchUnreadCount)
        window.addEventListener('refreshAdminOrderBadge', () => {
            fetchPendingOrdersCount()
            fetchRefundRequestsCount() // <-- Refresh refunds too
        })

        return () => {
            window.removeEventListener('refreshAdminBadge', fetchUnreadCount)
            window.removeEventListener('refreshAdminOrderBadge', () => {
                fetchPendingOrdersCount()
                fetchRefundRequestsCount()
            })
        }
    }, [])

    return (
        <div className="flex h-screen bg-surface overflow-hidden" style={{ background: 'rgb(var(--paper))' }}>
            <aside className="w-60 bg-ink text-white hidden lg:flex flex-col fixed h-screen">
                <div className="p-7 border-b border-white/10 shrink-0">
                    <Link to="/" className="text-lg font-serif tracking-[0.3em] uppercase">Mibyll</Link>
                    <p className="text-[9px] uppercase tracking-widest2 text-neutral-500 mt-2">Admin Console</p>
                </div>

                <nav className="flex-1 p-5 space-y-1 overflow-y-auto custom-scrollbar">
                    {visibleNav.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.end}
                                 className={({ isActive }) =>
                                     `flex items-center px-4 py-3 text-[11px] uppercase tracking-widest2 transition-colors
                        ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
                            <span>{item.label}</span>
                            {/* Existing Requests Badge */}
                            {item.to === '/admin/requests' && unreadRequestsCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 ml-auto">
                                    {unreadRequestsCount}
                                </span>
                            )}

                            {/* NEW: Orders Badge */}
                            {item.to === '/admin/orders' && (pendingOrdersCount + refundRequestsCount) > 0 && (
                                <span className="bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 ml-auto">
                                    {pendingOrdersCount + refundRequestsCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-5 border-t border-white/10 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest2">Signed in</p>
                        <ThemeToggle className="text-neutral-400 hover:text-white" />
                    </div>
                    <p className="text-xs truncate text-white">{user?.email}</p>
                    <Link to="/" className="block mt-4 text-[10px] uppercase tracking-widest2 text-neutral-400 hover:text-white">
                        ← Back to Store
                    </Link>
                </div>
            </aside>

            <div id="admin-scroll-container" className="flex-1 lg:ml-60 h-full overflow-y-auto">
                <div className="lg:hidden bg-ink text-white px-5 py-4 flex items-center justify-between shrink-0">
                    <span className="font-serif tracking-[0.3em] uppercase text-sm">Mibyll Admin</span>
                    <div className="flex items-center gap-5">
                        <ThemeToggle />
                        <Link to="/" className="text-[10px] uppercase tracking-widest2 text-neutral-400">Store</Link>
                    </div>
                </div>

                <main className="p-5 lg:p-10">
                    <div key={location.pathname} className="animate-page-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
