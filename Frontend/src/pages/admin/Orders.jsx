import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
const money = (n) => `৳ ${Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const STATUS_STYLES = {
    PENDING:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED:   'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    REFUNDED:  'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

export default function Orders() {
    const [orders, setOrders] = useState([])
    const [filter, setFilter] = useState('ALL')
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)

    // Reject Modal State
    const [rejectModal, setRejectModal] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')

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
                                    {order.refundRequested && (
                                        <span className="text-[9px] uppercase tracking-widest2 px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-900/50 animate-pulse">
                                            ⚠️ Refund Requested
                                        </span>
                                    )}
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
                                <p className="text-lg text-fg">{money(order.totalAmount)}</p>
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

                                        {/* SINGLE CORRECTED REFUND BOX */}
                                        {(order.refundRequested || order.refundRejected || order.refundApproved) && (
                                            <div className={`p-4 rounded mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border ${
                                                order.refundApproved ? 'bg-green-900/20 border-green-900/50' :
                                                    order.refundRejected && !order.refundRequested ? 'bg-gray-900/30 border-gray-700' :
                                                        'bg-red-900/20 border-red-900/50'
                                            }`}>
                                                <div>
                                                    {order.refundRequested ? (
                                                        <>
                                                            <p className="text-[10px] uppercase tracking-widest2 text-red-500 mb-1">Refund Requested</p>
                                                            <p className="text-sm text-red-200">{order.refundReason}</p>
                                                        </>
                                                    ) : order.refundApproved ? (
                                                        <p className="text-[10px] uppercase tracking-widest2 text-green-500 mb-1">Refund Approved</p>
                                                    ) : (
                                                        <>
                                                            <p className="text-[10px] uppercase tracking-widest2 text-gray-400 mb-1">Refund Rejected</p>
                                                            <p className="text-sm text-gray-300">Reason: {order.refundRejectionReason}</p>
                                                        </>
                                                    )}
                                                </div>

                                                {order.refundRequested && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Approve this refund?')) return
                                                                try {
                                                                    await api.patch(`/admin/orders/${order.id}/approve-refund`)
                                                                    toast.success('Refund approved')
                                                                    load()
                                                                } catch {
                                                                    toast.error('Failed to approve')
                                                                }
                                                            }}
                                                            className="btn-primary py-2 px-4 whitespace-nowrap text-xs"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            onClick={() => setRejectModal({ orderId: order.id })}
                                                            className="btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-2 px-4 whitespace-nowrap text-xs"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {!order.refundRequested && order.refundApproved && (
                                                    <span className="text-xs font-bold text-green-500 uppercase tracking-widest border border-green-500 px-3 py-1.5 rounded bg-green-900/20">
                                                        Approved
                                                    </span>
                                                )}

                                                {!order.refundRequested && order.refundRejected && (
                                                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500 px-3 py-1.5 rounded bg-red-900/20">
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* NEW: Refund History */}
                                        {order.refundLogs && order.refundLogs.length > 0 && (
                                            <div className="mt-6 border-t border-c pt-4">
                                                <p className="text-[10px] uppercase tracking-widest2 text-muted mb-3">Refund History</p>
                                                <div className="space-y-3">
                                                    {order.refundLogs.map(log => (
                                                        <div key={log.id} className="flex gap-3 text-xs">
                                                            <div className="w-24 shrink-0 text-muted">
                                                                {new Date(log.createdAt).toLocaleDateString()}
                                                            </div>
                                                            <div>
                                                                <span className={`font-bold uppercase tracking-wider text-[9px] mr-2 ${
                                                                    log.action === 'REJECTED' ? 'text-red-500' :
                                                                        log.action === 'APPROVED' ? 'text-green-500' :
                                                                            log.action === 'REQUESTED' ? 'text-amber-500' : 'text-gray-400'
                                                                        }`}>
                                                                    [{log.action}]
                                                                </span>
                                                                <span className="text-fg">{log.reason}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
                                                        {item.size && `Size ${item.size} · `}Qty {item.quantity} · {money(item.unitPrice)} each
                                                    </p>
                                                </div>
                                                <span className="text-xs text-fg">{money(item.subtotal)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* REJECT MODAL */}
            {rejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setRejectModal(null)} />
                    <div className="relative card p-6 w-full max-w-md animate-page-in">
                        <h2 className="text-xl font-serif mb-4 text-fg">Reject Refund</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!rejectionReason.trim()) return toast.error('Reason is required');
                            try {
                                await api.patch(`/admin/orders/${rejectModal.orderId}/reject-refund`, { reason: rejectionReason });
                                toast.success('Refund rejected');
                                setRejectModal(null); setRejectionReason(''); load();
                            } catch { toast.error('Failed to reject'); }
                        }}>
                            <label className="label-field">Reason for rejection</label>
                            <textarea required rows="4" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="input-field resize-none mb-4" placeholder="Explain why the refund is rejected..." />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setRejectModal(null)} className="btn-outline">Cancel</button>
                                <button type="submit" className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">Confirm Rejection</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
