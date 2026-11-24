import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useConfirm } from '../../context/ConfirmContext'

const money = (n) => `৳ ${Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const STATUS_STYLES = {
    PENDING:   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED:   'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export default function Customers() {
    const { confirm } = useConfirm()
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)
    const [search, setSearch] = useState('')
    const [reviews, setReviews] = useState({})
    const [replyTexts, setReplyTexts] = useState({})

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

    const fetchReviews = (userId) => {
        if (reviews[userId]) return
        api.get(`/admin/customers/${userId}/reviews`)
            .then(r => {
                setReviews(prev => ({ ...prev, [userId]: r.data }))

                // Clear the local unseen count for this customer
                setCustomers(prev => prev.map(cust =>
                    cust.id === userId ? { ...cust, unseenReviewsCount: 0 } : cust
                ))

                // Tell the sidebar to refresh its count
                window.dispatchEvent(new Event('refreshAdminReviewBadge'))
            })
            .catch(() => toast.error('Failed to load reviews'))
    }

    const handleExpand = (id) => {
        const isExpanding = expanded !== id
        setExpanded(isExpanding ? id : null)
        if (isExpanding) fetchReviews(id)
    }

    const handleReplySubmit = async (e, reviewId, customerId) => {
        e.preventDefault()
        const text = replyTexts[reviewId]
        if (!text?.trim()) return
        try {
            await api.patch(`/admin/reviews/${reviewId}/reply`, { reply: text })
            toast.success('Reply saved')
            setReviews(prev => ({
                ...prev,
                [customerId]: prev[customerId].map(r => r.id === reviewId ? { ...r, adminReply: text } : r)
            }))
            setReplyTexts(prev => ({ ...prev, [reviewId]: '' }))
        } catch { toast.error('Failed to save reply') }
    }

    const handleDeleteReply = async (reviewId, customerId) => {
        const isConfirmed = await confirm({
            title: 'Delete Reply',
            message: 'Are you sure you want to delete your reply to this review?',
            confirmText: 'Delete',
            isDanger: true
        })
        if (!isConfirmed) return

        try {
            await api.delete(`/admin/reviews/${reviewId}/reply`)
            toast.success('Reply deleted')
            setReviews(prev => ({
                ...prev,
                [customerId]: prev[customerId].map(r => r.id === reviewId ? { ...r, adminReply: null } : r)
            }))
        } catch { toast.error('Failed to delete reply') }
    }

    const handleDeleteReview = async (reviewId, customerId) => {
        const isConfirmed = await confirm({
            title: 'Delete Review',
            message: 'Are you sure you want to permanently delete this customer review?',
            confirmText: 'Delete',
            isDanger: true
        })
        if (!isConfirmed) return

        try {
            await api.delete(`/admin/reviews/${reviewId}`)
            toast.success('Review deleted')
            setReviews(prev => ({
                ...prev,
                [customerId]: prev[customerId].filter(r => r.id !== reviewId)
            }))
        } catch { toast.error('Failed to delete review') }
    }

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
                                onClick={() => handleExpand(c.id)}
                                className="w-full text-left p-5 flex flex-wrap items-center gap-5"
                            >
                                <div className="w-12 h-12 shrink-0 rounded-full bg-ink text-white flex items-center justify-center text-sm font-serif">
                                    {c.fullName?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-[220px]">
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm text-fg font-medium">{c.fullName}</p>
                                        {/* NEW: Review Badge */}
                                        {c.unseenReviewsCount > 0 && (
                                            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                New Review
                                            </span>
                                        )}
                                    </div>
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

                                    {/* --- PRODUCT REVIEWS SECTION --- */}
                                    <div className="mt-8 pt-6 border-t border-c">
                                        <p className="text-[9px] uppercase tracking-widest2 text-muted mb-4">
                                            Product Reviews
                                        </p>

                                        {!reviews[c.id] ? (
                                            <p className="text-xs text-muted">Loading reviews...</p>
                                        ) : reviews[c.id].length === 0 ? (
                                            <p className="text-xs text-muted">This customer hasn't left any reviews yet.</p>
                                        ) : (
                                            <div className="space-y-6">
                                                {reviews[c.id].map(review => (
                                                    <div key={review.id} className="bg-surface border border-c p-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-16 bg-sand shrink-0">
                                                                {review.productImage && <img src={review.productImage} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <Link to={`/product/${review.productSlug}`} target="_blank" className="text-sm font-medium text-fg hover:underline">
                                                                            {review.productName}
                                                                        </Link>
                                                                        <div className="flex gap-1 mt-1">
                                                                            {[1,2,3,4,5].map(star => (
                                                                                <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= review.rating ? "#C5A880" : "none"} stroke={star <= review.rating ? "#C5A880" : "currentColor"} strokeWidth="1">
                                                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                                                </svg>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => handleDeleteReview(review.id, c.id)} className="text-[9px] uppercase tracking-widest2 text-red-500 hover:underline">
                                                                        Delete Review
                                                                    </button>
                                                                </div>

                                                                <p className="text-xs text-fg mt-2">{review.comment}</p>

                                                                {review.imageUrls?.length > 0 && (
                                                                    <div className="flex gap-2 mt-2">
                                                                        {review.imageUrls.map((url, i) => (
                                                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="w-10 h-10 border border-c">
                                                                                <img src={url} className="w-full h-full object-cover" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Admin Reply Section */}
                                                                <div className="mt-4 pt-3 border-t border-c">
                                                                    {review.adminReply ? (
                                                                        <div className="bg-cbord/10 p-3 relative group">
                                                                            <p className="text-[9px] uppercase tracking-widest2 text-[#C5A880] mb-1">Your Reply</p>
                                                                            <p className="text-xs text-fg">{review.adminReply}</p>

                                                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button onClick={() => setReplyTexts({...replyTexts, [review.id]: review.adminReply})} className="text-[9px] uppercase text-fg hover:underline">Edit</button>
                                                                                <button onClick={() => handleDeleteReply(review.id, c.id)} className="text-[9px] uppercase text-red-500 hover:underline">Delete</button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <form onSubmit={(e) => handleReplySubmit(e, review.id, c.id)} className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Write a reply..."
                                                                                value={replyTexts[review.id] || ''}
                                                                                onChange={e => setReplyTexts({...replyTexts, [review.id]: e.target.value})}
                                                                                className="input-field text-xs py-2"
                                                                            />
                                                                            <button type="submit" className="btn-primary py-2 px-4 text-[10px]">Reply</button>
                                                                        </form>
                                                                    )}
                                                                </div>
                                                            </div>
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
