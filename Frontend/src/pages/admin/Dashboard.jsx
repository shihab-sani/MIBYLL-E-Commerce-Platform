import { useEffect, useState } from 'react'
import api from '../../api/axios'

const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/dashboard')
            .then(r => setData(r.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="text-sm text-muted">Loading dashboard…</div>
    if (!data) return <div className="text-sm text-red-500">Failed to load dashboard.</div>

    const { kpis, monthlySales, topProducts, recentOrders } = data
    const maxRevenue = Math.max(...monthlySales.map(m => Number(m.revenue)), 1)

    const cards = [
        { label: 'Total Revenue', value: money(kpis.totalRevenue), warn: false },
        { label: 'Total Orders', value: kpis.totalOrders, warn: false },
        { label: 'Customers', value: kpis.totalCustomers, warn: false },
        { label: 'Products', value: kpis.totalProducts, warn: false },
        { label: 'Low Stock (<5)', value: kpis.lowStockCount, warn: kpis.lowStockCount > 0 },
        { label: 'Pending Orders', value: kpis.pendingOrders, warn: kpis.pendingOrders > 0 },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">Dashboard</h1>
                <p className="text-xs text-muted mt-1">Overview of your store performance</p>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {cards.map(c => (
                    <div key={c.label}
                         className="border p-5"
                         style={{ background: 'rgb(var(--surface))', borderColor: 'rgb(var(--cbord))' }}>
                        <p className="text-[9px] uppercase tracking-widest2 text-muted">{c.label}</p>
                        <p className={`text-xl mt-2 ${c.warn ? 'text-amber-500' : 'text-fg'}`}>
                            {c.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* MONTHLY SALES */}
                <div className="border p-6"
                     style={{ background: 'rgb(var(--surface))', borderColor: 'rgb(var(--cbord))' }}>
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg mb-6">
                        Monthly Sales (12 mo)
                    </h2>
                    <div className="flex items-end gap-2 h-52">
                        {monthlySales.map((m, i) => {
                            const h = maxRevenue > 0 ? (Number(m.revenue) / maxRevenue) * 100 : 0
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                    <div className="absolute -top-8 hidden group-hover:block bg-ink text-white
                                  text-[9px] px-2 py-1 whitespace-nowrap z-10">
                                        {money(m.revenue)} · {m.orders} orders
                                    </div>
                                    <div className="w-full h-full flex items-end"
                                         style={{ background: 'rgb(var(--cbord) / 0.3)' }}>
                                        <div className="w-full transition-all bg-fg"
                                             style={{ height: `${Math.max(h, 2)}%` }} />
                                    </div>
                                    <span className="text-[8px] text-muted">{m.month.slice(5)}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* TOP PRODUCTS */}
                <div className="border p-6"
                     style={{ background: 'rgb(var(--surface))', borderColor: 'rgb(var(--cbord))' }}>
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg mb-6">
                        Top Selling Products
                    </h2>
                    {topProducts.length === 0 ? (
                        <p className="text-xs text-muted">No sales data yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {topProducts.map((p, i) => (
                                <div key={p.productId} className="flex items-center gap-4">
                                    <span className="text-xs text-muted w-5">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate text-fg">{p.name}</p>
                                        <p className="text-[10px] text-muted">{p.unitsSold} units sold</p>
                                    </div>
                                    <span className="text-sm text-fg">{money(p.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="border"
                 style={{ background: 'rgb(var(--surface))', borderColor: 'rgb(var(--cbord))' }}>
                <div className="p-6 border-b" style={{ borderColor: 'rgb(var(--cbord))' }}>
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left text-[9px] uppercase tracking-widest2 text-muted border-b"
                            style={{ borderColor: 'rgb(var(--cbord))' }}>
                            <th className="px-6 py-3">Order #</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentOrders.map(o => (
                            <tr key={o.id} className="border-b last:border-0"
                                style={{ borderColor: 'rgb(var(--cbord))' }}>
                                <td className="px-6 py-4 text-fg font-medium">{o.orderNumber}</td>
                                <td className="px-6 py-4 text-fg">{o.customerName}</td>
                                <td className="px-6 py-4 text-muted">
                                    {new Date(o.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-fg">{o.status}</td>
                                <td className="px-6 py-4 text-right text-fg">{money(o.totalAmount)}</td>
                            </tr>
                        ))}
                        {recentOrders.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-muted text-xs">
                                    No orders yet
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}