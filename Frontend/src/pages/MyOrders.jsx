import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useLocalization } from '../context/LocalizationContext'

const STATUS_STYLES = {
    PENDING:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED:   'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    REFUNDED:  'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

const TABS = [
    { key: 'ALL',       label: 'All' },
    { key: 'CART',      label: 'In Cart' },
    { key: 'ONGOING',   label: 'Ongoing' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'INQUIRIES', label: 'My Inquiries' },
]

export default function MyOrders() {
    const { cart, updateItem, removeItem } = useCart()
    const { formatPrice } = useLocalization()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('ALL')

    // Inquiries State
    const [inquiries, setInquiries] = useState([])
    const [loadingInquiries, setLoadingInquiries] = useState(true)
    const [replyTexts, setReplyTexts] = useState({})
    const [expandedInquiryId, setExpandedInquiryId] = useState(null)

    // Refund Modal State
    const [refundModal, setRefundModal] = useState(null)
    const [refundReason, setRefundReason] = useState('')
    const [submittingRefund, setSubmittingRefund] = useState(false)

    const loadInquiries = () => {
        api.get('/orders/requests')
            .then(r => setInquiries(r.data))
            .catch(() => {})
            .finally(() => setLoadingInquiries(false))
    }

    const load = () => {
        setLoading(true)
        api.get('/orders')
            .then(r => setOrders(r.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
        loadInquiries()
    }, [])

    const handleCancel = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order?')) return
        try {
            await api.patch(`/orders/${orderId}/cancel`)
            toast.success('Order cancelled')
            load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not cancel order')
        }
    }

    const handleRefund = async (e) => {
        e.preventDefault()
        if (!refundReason.trim()) { toast.error('Please provide a reason'); return }
        setSubmittingRefund(true)
        try {
            await api.post(`/orders/${refundModal.orderId}/refund`, { reason: refundReason })
            toast.success('Refund request submitted')
            setRefundModal(null)
            setRefundReason('')
            load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not request refund')
        } finally { setSubmittingRefund(false) }
    }

    const handleCancelRefund = async (orderId) => {
        if (!confirm('Are you sure you want to cancel your refund request?')) return
        try {
            await api.patch(`/orders/${orderId}/cancel-refund`)
            toast.success('Refund request cancelled')
            load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not cancel refund')
        }
    }

    const isRefundExpired = (deliveredAt) => {
        if (!deliveredAt) return false;
        const days = (new Date() - new Date(deliveredAt)) / (1000 * 60 * 60 * 24);
        return days >= 2;
    }

    const toggleInquiry = (inquiry) => {
        if (expandedInquiryId === inquiry.id) {
            setExpandedInquiryId(null)
        } else {
            setExpandedInquiryId(inquiry.id)
            // Mark as read ONLY for this specific inquiry when opened
            if (inquiry.hasUnreadCustomer) {
                api.patch(`/orders/requests/${inquiry.id}/read`).then(() => {
                    setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, hasUnreadCustomer: false } : i))
                })
            }
        }
    }

    const handleCloseConversation = (id) => {
        if(!confirm('Close this conversation? You cannot send messages afterwards.')) return;
        api.patch(`/orders/requests/${id}/close`).then(() => {
            toast.success('Conversation closed');
            loadInquiries();
        });
    }

    const sendReply = (id) => {
        const text = replyTexts[id];
        if (!text?.trim()) return;
        api.post(`/orders/requests/${id}/reply`, { message: text }).then(() => {
            setReplyTexts(prev => ({ ...prev, [id]: '' }));
            toast.success('Message sent');
            loadInquiries();
        });
    }

    // --- GROUPED DATA FOR 'ALL' TAB ---
    const ongoingOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(o.status))
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED')
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED')
    const unreadCount = inquiries.filter(i => i.hasUnreadCustomer).length;

    // --- REUSABLE UI COMPONENTS ---
    const CartItemCard = ({ item }) => (
        <div className="card p-4 flex gap-4 items-center mb-4">
            <div className="w-16 h-20 bg-sand shrink-0 overflow-hidden">
                {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 text-sm">
                <Link to={`/product/${item.slug}`} className="text-fg hover:underline">
                    {item.productName}
                </Link>
                <p className="text-xs text-muted mt-1">
                    {item.variantName && `Color: ${item.variantName} · `}
                    {item.size && `Size ${item.size} · `}Qty {item.quantity} · {formatPrice(item.unitPrice)}
                </p>
            </div>
            <span className="text-sm text-fg">{formatPrice(item.lineTotal)}</span>
        </div>
    )

    const OrderCard = ({ order }) => (
        <div className="card mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-c">
                <div>
                    <p className="text-[10px] uppercase tracking-widest2 text-muted">Order</p>
                    <p className="text-sm font-medium text-fg mt-1">{order.orderNumber}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-widest2 text-muted">Date</p>
                    <p className="text-sm text-fg mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-widest2 text-muted">Total</p>
                    <p className="text-sm text-fg mt-1">৳ {order.totalAmount}</p>
                </div>
                <div className="flex gap-2">
                    <span className={`text-[10px] uppercase tracking-widest2 px-3 py-1.5 ${STATUS_STYLES[order.status]}`}>
                        {order.status}
                    </span>
                    {order.refundApproved && (
                        <span className="text-[10px] uppercase tracking-widest2 px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            Refund Approved
                        </span>
                    )}
                    {order.refundRejected && (
                        <span className="text-[10px] uppercase tracking-widest2 px-3 py-1.5 bg-gray-800 text-gray-300 border border-gray-700">
                            Refund Rejected
                        </span>
                    )}
                </div>
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
                                {item.size && `Size ${item.size} · `}Qty {item.quantity} · ৳ {item.unitPrice}
                            </p>
                        </div>
                        <span className="text-sm text-fg">৳ {item.subtotal}</span>
                    </div>
                ))}
            </div>

            <div className="px-6 pb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="text-xs text-muted">
                    <p><span className="uppercase tracking-widest2 text-[10px]">Ship to:</span> <span className="text-fg">{order.shippingAddress}</span></p>
                    <p className="mt-1"><span className="uppercase tracking-widest2 text-[10px]">Phone:</span> <span className="text-fg">{order.phone}</span></p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    {order.refundRejected && !order.refundRequested && (
                        <p className="text-xs text-red-400 text-right mb-2 max-w-xs">
                            <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">Rejection Reason:</span>
                            {order.refundRejectionReason}
                        </p>
                    )}

                    <div className="flex gap-3">
                        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                            <button onClick={() => handleCancel(order.id)} className="btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                                Cancel Order
                            </button>
                        )}

                        {order.status === 'DELIVERED' && (
                            order.refundApproved ? (
                                <span className="btn-outline border-green-500 text-green-500 disabled:opacity-100">
                                    Refund Approved
                                </span>
                            ) : order.refundRequested ? (
                                <button onClick={() => handleCancelRefund(order.id)} className="btn-outline border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white">
                                    Cancel Refund Request
                                </button>
                            ) : (
                                <button
                                    disabled={isRefundExpired(order.deliveredAt)}
                                    onClick={() => setRefundModal({ orderId: order.id })}
                                    className={`btn-outline disabled:opacity-50 disabled:cursor-not-allowed ${order.refundRejected ? 'border-red-500 text-red-500' : ''}`}
                                >
                                    {isRefundExpired(order.deliveredAt) ? 'Refund Expired' : order.refundRejected ? 'Request Refund Again' : 'Request Refund'}
                                </button>
                            )
                        )}
                    </div>
                </div>
                {order.refundLogs && order.refundLogs.length > 0 && (
                    <div className="w-full mt-6 pt-6 border-t border-c">
                        <p className="text-[10px] uppercase tracking-widest2 text-muted mb-3">Refund History</p>
                        <div className="space-y-3">
                            {order.refundLogs.map(log => (
                                <div key={log.id} className="flex flex-col sm:flex-row sm:gap-3 text-xs">
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
        </div>
    )

    return (
        <div className="max-w-[1100px] mx-auto px-5 lg:px-10 py-12 lg:py-16">
            <h1 className="text-4xl md:text-5xl font-serif text-fg mb-8">My Orders</h1>

            {/* TABS */}
            <div className="flex flex-wrap gap-2 mb-10 border-b border-c pb-4">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} // <-- REMOVED the read-all logic
                            className={`relative px-5 py-2 text-[10px] uppercase tracking-widest2 border transition-colors 
                            ${tab === t.key ? 'bg-ink text-white border-ink' : 'text-fg border-c hover:border-fg'}`}>
                        {t.label}
                        {t.key === 'INQUIRIES' && unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* --- ALL TAB (DARAZ STYLE) --- */}
            {tab === 'ALL' && (
                <div className="space-y-12">
                    {loading ? (
                        <div className="py-20 text-center text-sm text-muted">Loading...</div>
                    ) : (
                        <>
                            {/* CART ITEMS */}
                            {cart?.items?.length > 0 && (
                                <section>
                                    <h2 className="text-[11px] uppercase tracking-widest2 text-muted mb-4 border-b border-c pb-2">In Cart</h2>
                                    {cart.items.map(item => <CartItemCard key={item.id} item={item} />)}
                                    <div className="pt-2">
                                        <Link to="/cart" className="btn-primary">Go to Cart</Link>
                                    </div>
                                </section>
                            )}

                            {/* ONGOING ORDERS */}
                            {ongoingOrders.length > 0 && (
                                <section>
                                    <h2 className="text-[11px] uppercase tracking-widest2 text-muted mb-4 border-b border-c pb-2">Ongoing Orders</h2>
                                    {ongoingOrders.map(order => <OrderCard key={order.id} order={order} />)}
                                </section>
                            )}

                            {/* DELIVERED ORDERS */}
                            {deliveredOrders.length > 0 && (
                                <section>
                                    <h2 className="text-[11px] uppercase tracking-widest2 text-muted mb-4 border-b border-c pb-2">Delivered Orders</h2>
                                    {deliveredOrders.map(order => <OrderCard key={order.id} order={order} />)}
                                </section>
                            )}

                            {/* CANCELLED ORDERS */}
                            {cancelledOrders.length > 0 && (
                                <section>
                                    <h2 className="text-[11px] uppercase tracking-widest2 text-muted mb-4 border-b border-c pb-2">Cancelled Orders</h2>
                                    {cancelledOrders.map(order => <OrderCard key={order.id} order={order} />)}
                                </section>
                            )}

                            {/* IF EVERYTHING IS EMPTY */}
                            {cart?.items?.length === 0 && orders.length === 0 && (
                                <div className="py-24 text-center">
                                    <p className="text-sm text-muted mb-8">You have no recent activity.</p>
                                    <Link to="/shop" className="btn-primary">Start Shopping</Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* --- INQUIRIES TAB --- */}
            {tab === 'INQUIRIES' && (
                <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="border border-c bg-surface flex flex-col">

                            {/* CARD HEADER (CLICK TO EXPAND) */}
                            <div
                                onClick={() => toggleInquiry(inquiry)}
                                className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-cbord/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-16 bg-sand shrink-0 overflow-hidden">
                                        {inquiry.productImage && <img src={inquiry.productImage} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-serif text-fg">{inquiry.productName}</p>
                                            {/* Unread Red Dot */}
                                            {inquiry.hasUnreadCustomer && (
                                                <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse" title="New Reply"></span>
                                            )}
                                        </div>
                                        <p className="text-[10px] uppercase text-muted mt-1">
                                            {inquiry.size && `Size: ${inquiry.size} | `}
                                            {inquiry.variantName && `Design: ${inquiry.variantName}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[9px] uppercase tracking-widest2 px-3 py-1 border ${
                                        inquiry.status === 'PENDING' ? 'border-amber-500 text-amber-500' :
                                            inquiry.status === 'REPLIED' ? 'border-green-500 text-green-500' :
                                                inquiry.status === 'CLOSED' ? 'border-gray-600 text-gray-500' :
                                                    'border-gray-500 text-gray-400'
                                    }`}>
                                        {inquiry.status}
                                    </span>
                                    <svg className={`w-5 h-5 text-muted transition-transform ${expandedInquiryId === inquiry.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* EXPANDABLE CHAT AREA */}
                            {expandedInquiryId === inquiry.id && (
                                <div className="border-t border-c p-4 sm:p-6 bg-cbord/5 flex flex-col gap-4 animate-fade-in">

                                    {/* Close Button & Status */}
                                    <div className="flex justify-between items-center pb-2 border-b border-c">
                                        <p className="text-xs text-muted">Inquiry from you</p>
                                        {inquiry.status !== 'CLOSED' && (
                                            <button onClick={() => handleCloseConversation(inquiry.id)} className="text-[10px] uppercase tracking-widest2 text-red-500 hover:underline">
                                                Close Conversation
                                            </button>
                                        )}
                                    </div>

                                    {/* Chat History */}
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                                        {inquiry.messages.map((msg) => (
                                            <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'CUSTOMER' ? 'items-end' : 'items-start'}`}>
                                                <span className="text-[9px] text-muted mb-1">{msg.senderRole === 'CUSTOMER' ? 'You' : 'Mibyll Support'}</span>
                                                <div className={`px-4 py-2 max-w-[85%] text-sm ${msg.senderRole === 'CUSTOMER' ? 'bg-ink text-white' : 'bg-surface border border-c text-fg'}`}>
                                                    {msg.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Form */}
                                    {inquiry.status === 'CLOSED' ? (
                                        <div className="p-4 border border-c bg-surface text-center text-sm text-muted">
                                            This conversation is closed.
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="input-field flex-1"
                                                value={replyTexts[inquiry.id] || ''}
                                                onChange={(e) => setReplyTexts(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                                                onKeyDown={(e) => { if (e.key === 'Enter') sendReply(inquiry.id); }}
                                            />
                                            <button onClick={() => sendReply(inquiry.id)} className="btn-primary px-6">Send</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* --- CART TAB (ONLY CART) --- */}
            {tab === 'CART' && (
                cart?.items?.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-sm text-muted mb-6">Your cart is empty.</p>
                        <Link to="/shop" className="btn-primary">Browse Products</Link>
                    </div>
                ) : (
                    <div>
                        <p className="text-xs text-muted mb-4">
                            Items currently in your cart — {cart.items.length} item(s), subtotal {formatPrice(cart.subtotal)}
                        </p>
                        {cart.items.map(item => <CartItemCard key={item.id} item={item} />)}
                        <div className="pt-4 mt-6 border-t border-c">
                            <Link to="/cart" className="btn-primary">Go to Cart</Link>
                        </div>
                    </div>
                )
            )}

            {/* --- SPECIFIC ORDER TABS (ONGOING, DELIVERED, CANCELLED) --- */}
            {['ONGOING', 'DELIVERED', 'CANCELLED'].includes(tab) && (
                loading ? (
                    <div className="py-20 text-center text-sm text-muted">Loading orders…</div>
                ) : (
                    (() => {
                        let filtered = orders
                        if (tab === 'ONGOING') filtered = ongoingOrders
                        if (tab === 'DELIVERED') filtered = deliveredOrders
                        if (tab === 'CANCELLED') filtered = cancelledOrders

                        return filtered.length === 0 ? (
                            <div className="py-24 text-center">
                                <p className="text-sm text-muted mb-8">No orders in this view.</p>
                                <Link to="/shop" className="btn-primary">Start Shopping</Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filtered.map(order => <OrderCard key={order.id} order={order} />)}
                            </div>
                        )
                    })()
                )
            )}

            {/* REFUND MODAL */}
            {refundModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setRefundModal(null)} />
                    <div className="relative card p-6 w-full max-w-md animate-page-in">
                        <h2 className="text-xl font-serif mb-4 text-fg">Request Refund</h2>
                        <form onSubmit={handleRefund}>
                            <label className="label-field">Reason for return</label>
                            <textarea
                                required rows="4"
                                value={refundReason}
                                onChange={e => setRefundReason(e.target.value)}
                                className="input-field resize-none mb-4"
                                placeholder="Please explain why you are returning this product..."
                            />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setRefundModal(null)} className="btn-outline">Cancel</button>
                                <button type="submit" disabled={submittingRefund} className="btn-primary">
                                    {submittingRefund ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
