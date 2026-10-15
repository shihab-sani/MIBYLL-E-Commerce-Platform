import { useEffect, useState } from 'react'
import api from '../../api/axios'

const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const STATUS_STYLES = {
    PENDING:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED:   'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export default function Customers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        api.get('/admin/customers')
            .then(r => setCustomers(r.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const filtered = customers.filter(c => {
        const q = search.toLowerCase()
        return c.fullName?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    })

    const totalCustomers = customers.length
    const withOrders = customers.filter(c => c.orderCount > 0).length
    const grandTotal = customers.reduce((s, c) => s + Number(c.totalSpent), 0)

    const borderColor = { borderColor: 'rgb(var(--cbord))' }
    const surfaceBg = { background: 'rgb(var(--surface))' }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-fg">Customers</h1>
                <p className="text-xs text-muted mt-1">
                    {totalCustomers} accounts · {withOrders} have placed orders · {money(grandTotal)} lifetime revenue
                </p>
            </div>

            <input
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field max-w-sm"
            />

            {loading ? (
                <div className="text-sm text-muted py-10">Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="border py-16 text-center text-xs text-muted"
                     style={{ ...surfaceBg, ...borderColor }}>
                    No customers found
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(c => (
                        <div key={c.id} className="border" style={{ ...surfaceBg, ...borderColor }}>
                            <button
                                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                                className="w-full text-left p-5 flex flex-wrap items-center gap-5"
                            >
                                <div className="w-12 h-12 shrink-0 rounded-full bg-ink text-white flex items-center
                                justify-center text-sm font-serif">
                                    {c.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-[220px]">
                                    <p className="text-sm text-fg font-medium">{c.fullName}</p>
                                    <p className="text-[11px] text-muted mt-0.5">{c.email}</p>
                                    {c.phone && <p className="text-[11px] text-muted">{c.phone}</p>}
                                </div>

                                <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-widest2 text-muted">Orders</p>
                                    <p className="text-lg text-fg">{c.orderCount}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-widest2 text-muted">Total Spent</p>
                                    <p className="text-lg text-fg">{money(c.totalSpent)}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-widest2 text-muted">Joined</p>
                                    <p className="text-xs text-fg">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="1.6"
                                     className={`text-fg transition-transform ${expanded === c.id ? 'rotate-180' : ''}`}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {expanded === c.id && (
                                <div className="border-t p-5 space-y-5"
                                     style={{ ...borderColor, background: 'rgb(var(--cbord) / 0.15)' }}>
                                    {c.address && (
                                        <div className="text-xs">
                                            <p className="text-[9px] uppercase tracking-widest2 text-muted mb-1">Default Address</p>
                                            <p className="text-fg">{c.address}</p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest2 text-muted mb-3">
                                            Order History ({c.orderCount})
                                        </p>

                                        {c.orders.length === 0 ? (
                                            <p className="text-xs text-muted">No orders yet.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {c.orders.map(o => (
                                                    <div key={o.id} className="border bg-surface" style={borderColor}>
                                                        <div className="p-4 flex flex-wrap items-center gap-4 text-xs">
                                                            <span className="font-medium text-fg">{o.orderNumber}</span>
                                                            <span className={`text-[9px] uppercase tracking-widest2 px-2 py-0.5 ${STATUS_STYLES[o.status]}`}>
                                {o.status}
                              </span>
                                                            <span className="text-muted">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </span>
                                                            <span className="text-muted">{o.items.length} item(s)</span>
                                                            <span className="ml-auto text-fg font-medium">{money(o.totalAmount)}</span>
                                                        </div>
                                                        <div className="px-4 pb-4 space-y-2">
                                                            {o.items.map(item => (
                                                                <div key={item.id} className="flex items-center gap-3 text-[11px]">
                                                                    <div className="w-9 h-12 bg-sand shrink-0 overflow-hidden">
                                                                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="truncate text-fg">{item.productName}</p>
                                                                        <p className="text-muted">
                                                                            {item.size && `Size ${item.size} · `}Qty {item.quantity} · {money(item.unitPrice)}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-fg">{money(item.subtotal)}</span>
                                                                </div>
                                                            ))}
                                                            <p className="text-[10px] text-muted pt-2 border-t" style={borderColor}>
                                                                Shipped to: {o.shippingAddress} · Phone: {o.phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}