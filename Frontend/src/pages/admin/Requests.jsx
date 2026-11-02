import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function Requests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)
    const [replyTexts, setReplyTexts] = useState({})

    const load = () => {
        setLoading(true)
        api.get('/admin/requests')
            .then(r => setRequests(r.data))
            .catch(() => toast.error('Failed to load requests'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const toggleExpand = (req) => {
        if (expandedId === req.id) {
            setExpandedId(null)
        } else {
            setExpandedId(req.id)
            // Mark as read when opening
            if (req.hasUnreadAdmin) {
                api.patch(`/admin/requests/${req.id}/read`).then(() => {
                    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, hasUnreadAdmin: false } : r))
                    window.dispatchEvent(new Event('refreshAdminBadge'))
                })
            }
        }
    }

    const handleCloseConversation = (id) => {
        if(!confirm('Close this conversation? The customer will not be able to reply anymore.')) return;
        api.patch(`/admin/requests/${id}/close`).then(() => {
            toast.success('Conversation closed');
            load();
        });
    }

    const sendReply = (id) => {
        const text = replyTexts[id];
        if (!text?.trim()) return;
        api.post(`/admin/requests/${id}/reply`, { message: text }).then(() => {
            toast.success('Reply sent');
            setReplyTexts(prev => ({ ...prev, [id]: '' }));
            load();
        });
    }

    if (loading) return <div className="text-sm text-muted">Loading inquiries…</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-fg">Customer Inquiries</h1>
                <p className="text-xs text-muted mt-1">Manage requests from Featured Products.</p>
            </div>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="border border-c bg-surface py-12 text-center text-xs text-muted">
                        No inquiries found.
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="border border-c bg-surface flex flex-col">
                            {/* CARD HEADER (CLICK TO EXPAND) */}
                            <div
                                onClick={() => toggleExpand(req)}
                                className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-cbord/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-16 bg-sand shrink-0 overflow-hidden">
                                        {req.productImage && <img src={req.productImage} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-serif text-fg">{req.productName}</p>
                                            {req.hasUnreadAdmin && (
                                                <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse" title="Unread"></span>
                                            )}
                                        </div>
                                        <p className="text-[10px] uppercase text-muted mt-1">
                                            {req.customerName} • {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                        {(req.size || req.variantName) && (
                                            <p className="text-[10px] text-muted mt-1">
                                                {req.size && `Size: ${req.size}`}
                                                {req.size && req.variantName && ' | '}
                                                {req.variantName && `Color: ${req.variantName}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-[9px] uppercase tracking-widest2 px-3 py-1 border ${
                                        req.status === 'PENDING' ? 'border-amber-500 text-amber-500' :
                                            req.status === 'REPLIED' ? 'border-green-500 text-green-500' :
                                                req.status === 'CLOSED' ? 'border-gray-600 text-gray-500' :
                                                    'border-gray-500 text-gray-400'
                                    }`}>
                                        {req.status}
                                    </span>
                                    <svg className={`w-5 h-5 text-muted transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* EXPANDABLE CHAT AREA */}
                            {expandedId === req.id && (
                                <div className="border-t border-c p-4 sm:p-6 bg-cbord/5 flex flex-col gap-4 animate-fade-in">

                                    {/* Close Button & Status */}
                                    <div className="flex justify-between items-center pb-2 border-b border-c">
                                        <p className="text-xs text-muted">Inquiry from {req.customerName}</p>
                                        {req.status !== 'CLOSED' && (
                                            <button onClick={() => handleCloseConversation(req.id)} className="text-[10px] uppercase tracking-widest2 text-red-500 hover:underline">
                                                Close Conversation
                                            </button>
                                        )}
                                    </div>

                                    {/* Chat History */}
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                                        {req.messages?.map(msg => (
                                            <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                                <span className="text-[9px] text-muted mb-1">{msg.senderRole === 'ADMIN' ? 'You (Admin)' : req.customerName}</span>
                                                <div className={`px-4 py-2 max-w-[85%] text-sm ${msg.senderRole === 'ADMIN' ? 'bg-ink text-white' : 'bg-surface border border-c text-fg'}`}>
                                                    {msg.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Form */}
                                    {req.status === 'CLOSED' ? (
                                        <div className="p-4 border border-c bg-surface text-center text-sm text-muted">
                                            This conversation has been closed.
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Type your reply..."
                                                className="input-field flex-1"
                                                value={replyTexts[req.id] || ''}
                                                onChange={(e) => setReplyTexts(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                onKeyDown={(e) => { if (e.key === 'Enter') sendReply(req.id); }}
                                            />
                                            <button onClick={() => sendReply(req.id)} className="btn-primary px-6">Send</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
