import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_STYLES = {
    PENDING:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED:   'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export default function Orders() {
    const [orders, setOrders] = useState([])
    const [filter, setFilter] = useState('ALL')
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)

    const load = () => {
        setLoading(true)
        api.get('/admin/orders')
            .then(r => setOrders(r.data))
            .catch(() => toast.error('Failed to load orders'))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const changeStatus = async (order, status) => {
        try {
            await api.patch(`/admin/orders/${order.id}/status`, { status })
            toast.success(`Order marked ${status}`)
            load()
        } catch { toast.error('Update failed') }
    }

    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

    const counts = STATUSES.reduce((acc, s) => {
        acc[s] = orders.filter(o => o.status === s).length
        return acc
    }, {})

    const borderColor = { borderColor: 'rgb(var(--cbord))' }
    const surfaceBg = { background: 'rgb(var(--surface))' }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-fg">Orders</h1>
                <p className="text-xs text-muted mt-1">{orders.length} total orders</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 text-[10px] uppercase tracking-widest2 border transition-colors
                  ${filter === 'ALL'
                            ? 'bg-ink text-white border-ink dark:bg-fg dark:text-ink dark:border-fg'
                            : 'border-cbord text-fg hover:border-fg'}`}
                        style={filter === 'ALL' ? {} : borderColor}>
                    All ({orders.length})
                </button>
                {STATUSES.map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                            className={`px-4 py-2 text-[10px] uppercase tracking-widest2 border transition-colors
                    ${filter === s
                                ? 'bg-ink text-white border-ink dark:bg-fg dark:text-ink dark:border-fg'
                                : 'text-fg hover:border-fg'}`}
                            style={filter === s ? {} : borderColor}>
                        {s} ({counts[s] || 0})
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-sm text-muted py-10">Loading orders…</div>
                ) : filtered.length === 0 ? (
                    <div className="border py-16 text-center text-xs text-muted"
                         style={{ ...surfaceBg, ...borderColor }}>
                        No orders in this view
                    </div>
                ) : filtered.map(order => (
                    <div key={order.id} className="border" style={{ ...surfaceBg, ...borderColor }}>
                        <div className="p-5 flex flex-wrap items-center gap-5">
                            <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                                    className="flex-1 min-w-[260px] text-left">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-fg">{order.orderNumber}</span>
                                    <span className={`text-[9px] uppercase tracking-widest2 px-2 py-0.5 ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                                </div>
                                <p className="text-[11px] text-muted mt-2">
                                    {order.customerName} · {order.customerEmail}
                                </p>
                                <p className="text-[11px] text-muted mt-1">
                                    {new Date(order.createdAt).toLocaleString()} · {order.items.length} item(s)
                                </p>
                            </button>

                            <div className="text-right">
                                <p className="text-[9px] uppercase tracking-widest2 text-muted">Total</p>
                                <p className="text-lg text-fg">${order.totalAmount}</p>
                            </div>

                            <select
                                value={order.status}
                                onChange={(e) => changeStatus(order, e.target.value)}
                                className="text-[10px] uppercase tracking-widest2 border px-3 py-2
                           bg-surface text-fg focus:outline-none focus:border-fg cursor-pointer"
                                style={borderColor}
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {expanded === order.id && (
                            <div className="border-t p-5 space-y-5"
                                 style={{ ...borderColor, background: 'rgb(var(--cbord) / 0.15)' }}>
                                <div className="grid md:grid-cols-2 gap-5 text-xs">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest2 text-muted mb-2">Shipping Address</p>
                                        <p className="leading-relaxed text-fg">{order.shippingAddress}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest2 text-muted mb-2">Contact</p>
                                        <p className="text-fg">{order.phone}</p>
                                        <p className="text-muted mt-1">Payment: {order.paymentMethod}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[9px] uppercase tracking-widest2 text-muted mb-3">Items</p>
                                    <div className="space-y-3">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="w-12 h-16 bg-sand shrink-0 overflow-hidden">
                                                    {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1 text-xs">
                                                    <p className="text-fg">{item.productName}</p>
                                                    <p className="text-muted mt-0.5">
                                                        {item.size && `Size ${item.size} · `}Qty {item.quantity} · ${item.unitPrice} each
                                                    </p>
                                                </div>
                                                <span className="text-xs text-fg">${item.subtotal}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}