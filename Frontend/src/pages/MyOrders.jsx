import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'

const STATUS_STYLES = {
    PENDING:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED:   'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const TABS = [
    { key: 'ALL',       label: 'All' },
    { key: 'ONGOING',   label: 'Ongoing' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'CART',      label: 'In Cart' },
]

export default function MyOrders() {
    const { cart } = useCart()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('ALL')

    useEffect(() => {
        api.get('/orders')
            .then(r => setOrders(r.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const filtered = orders.filter(o => {
        if (tab === 'ALL' || tab === 'CART') return true
        if (tab === 'ONGOING')   return ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(o.status)
        if (tab === 'DELIVERED') return o.status === 'DELIVERED'
        if (tab === 'CANCELLED') return o.status === 'CANCELLED'
        return true
    })

    return (
        <div className="max-w-[1100px] mx-auto px-5 lg:px-10 py-12 lg:py-16">
            <h1 className="text-4xl md:text-5xl font-serif text-fg mb-8">My Orders</h1>

            {/* TABS */}
            <div className="flex flex-wrap gap-2 mb-10 border-b border-c pb-4">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-5 py-2 text-[10px] uppercase tracking-widest2 border transition-colors
              ${tab === t.key
                            ? 'bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white'
                            : 'text-fg border-c hover:border-fg'}`}
                    >
                        {t.label}
                        {t.key === 'CART' && cart?.totalItems > 0 && (
                            <span className="ml-2 text-[9px] opacity-80">({cart.totalItems})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* CART TAB */}
            {tab === 'CART' && (
                cart?.items?.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-sm text-muted mb-6">Your cart is empty.</p>
                        <Link to="/shop" className="btn-primary">Browse Products</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-xs text-muted mb-4">
                            Items currently in your cart — {cart.items.length} item(s), subtotal ${cart.subtotal}
                        </p>
                        {cart.items.map(item => (
                            <div key={item.id} className="card p-4 flex gap-4 items-center">
                                <div className="w-16 h-20 bg-sand shrink-0 overflow-hidden">
                                    {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 text-sm">
                                    <Link to={`/product/${item.slug}`} className="text-fg hover:underline">
                                        {item.productName}
                                    </Link>
                                    <p className="text-xs text-muted mt-1">
                                        {item.size && `Size ${item.size} · `}Qty {item.quantity} · ${item.unitPrice}
                                    </p>
                                </div>
                                <span className="text-sm text-fg">${item.lineTotal}</span>
                            </div>
                        ))}
                        <div className="pt-4">
                            <Link to="/cart" className="btn-primary">Go to Cart</Link>
                        </div>
                    </div>
                )
            )}

            {/* ORDERS TAB(S) */}
            {tab !== 'CART' && (
                loading ? (
                    <div className="py-20 text-center text-sm text-muted">Loading orders…</div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-sm text-muted mb-8">No orders in this view.</p>
                        <Link to="/shop" className="btn-primary">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filtered.map(order => (
                            <div key={order.id} className="card">
                                <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-c">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest2 text-muted">Order</p>
                                        <p className="text-sm font-medium text-fg mt-1">{order.orderNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest2 text-muted">Date</p>
                                        <p className="text-sm text-fg mt-1">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest2 text-muted">Total</p>
                                        <p className="text-sm text-fg mt-1">${order.totalAmount}</p>
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-widest2 px-3 py-1.5 ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                                </div>

                                <div className="p-6 space-y-4">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-16 h-20 bg-sand shrink-0 overflow-hidden">
                                                {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1 text-sm">
                                                <p className="text-fg">{item.productName}</p>
                                                <p className="text-xs text-muted mt-1">
                                                    {item.size && `Size ${item.size} · `}Qty {item.quantity} · ${item.unitPrice}
                                                </p>
                                            </div>
                                            <span className="text-sm text-fg">${item.subtotal}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-6 pb-6 text-xs text-muted">
                                    <p>
                                        <span className="uppercase tracking-widest2 text-[10px]">Ship to:</span>{' '}
                                        <span className="text-fg">{order.shippingAddress}</span>
                                    </p>
                                    <p className="mt-1">
                                        <span className="uppercase tracking-widest2 text-[10px]">Phone:</span>{' '}
                                        <span className="text-fg">{order.phone}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    )
}