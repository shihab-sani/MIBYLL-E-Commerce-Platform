import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function Requests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [selectedReq, setSelectedReq] = useState(null)
    const [reply, setReply] = useState('')

    const load = () => {
        setLoading(true)
        api.get('/admin/requests')
            .then(r => setRequests(r.data))
            .catch(() => toast.error('Failed to load requests'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const openManageModal = (req) => {
        setSelectedReq(req)
        setReply('') // Just clear it

        // Mark as read when opening
        if (req.hasUnreadAdmin) {
            api.patch(`/admin/requests/${req.id}/read`).then(() => {
                setRequests(prev => prev.map(r => r.id === req.id ? { ...r, hasUnreadAdmin: false } : r))
            })
        }
    }

    if (loading) return <div className="text-sm text-muted">Loading inquiries…</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif text-fg">Customer Inquiries</h1>
                <p className="text-xs text-muted mt-1">Manage requests from Featured Products.</p>
            </div>

            <div className="border border-c overflow-x-auto" style={{ background: 'rgb(var(--surface))' }}>
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b border-c bg-cbord/5">
                    <tr>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest2 text-muted font-medium">Date</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest2 text-muted font-medium">Customer</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest2 text-muted font-medium">Product</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest2 text-muted font-medium">Message</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest2 text-muted font-medium">Status</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest2 text-muted font-medium text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-c">
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-10 text-center text-muted text-xs">
                                No inquiries found.
                            </td>
                        </tr>
                    ) : (
                        requests.map((req) => (
                            <tr key={req.id} className="hover:bg-cbord/5 transition-colors">
                                <td className="px-6 py-4 text-xs text-muted">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-fg">{req.customerName}</p>
                                    <p className="text-[10px] text-muted">{req.customerEmail}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {req.productImage && (
                                            <img src={req.productImage} alt="" className="w-8 h-10 object-cover bg-sand" />
                                        )}
                                        <div>
                                            <span className="text-fg block">{req.productName}</span>
                                            {/* NEW: Show requested size/variant */}
                                            {(req.size || req.variantName) && (
                                                <span className="text-[10px] text-muted uppercase tracking-widest2">
                                                    {req.size && `Size: ${req.size}`}
                                                    {req.size && req.variantName && ' | '}
                                                    {req.variantName && `Color: ${req.variantName}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-fg max-w-[200px] truncate" title={req.messages?.[0]?.message}>
                                    {req.messages?.[0]?.message || 'No messages'}
                                </td>
                                <td className="px-6 py-4">
                                        <span className={`text-[9px] uppercase tracking-widest2 px-2 py-1 border ${
                                            req.status === 'PENDING' ? 'border-amber-500 text-amber-500' :
                                                req.status === 'REPLIED' ? 'border-green-500 text-green-500' :
                                                    'border-gray-500 text-gray-400'
                                        }`}>
                                            {req.status || 'PENDING'}
                                        </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openManageModal(req)} className="text-[10px] uppercase tracking-widest2 text-fg hover:underline">
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* MANAGE MODAL */}
            {selectedReq && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedReq(null)} />
                    <div className="relative w-full max-w-lg border border-c p-6 shadow-2xl animate-fade-in" style={{ background: 'rgb(var(--surface))' }}>
                        <h2 className="text-xl font-serif text-fg mb-6">Manage Inquiry</h2>

                        <div className="mb-6 p-4 border border-c bg-cbord/5">
                            {/* DELETED: selectedReq.message line */}
                            <p className="text-xs text-muted mb-1">Inquiry from {selectedReq.customerName}</p>

                            {/* Show selected options in modal */}
                            {(selectedReq.size || selectedReq.variantName) && (
                                <div className="flex gap-4 pt-3 border-t border-c">
                                    {selectedReq.size && (
                                        <p className="text-xs text-fg"><strong className="text-muted">Size:</strong> {selectedReq.size}</p>
                                    )}
                                    {selectedReq.variantName && (
                                        <p className="text-xs text-fg"><strong className="text-muted">Color:</strong> {selectedReq.variantName}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* CHAT HISTORY */}
                        <div className="mb-6 max-h-[300px] overflow-y-auto custom-scrollbar p-4 border border-c bg-cbord/5 flex flex-col gap-3">
                            {selectedReq.messages?.map(msg => (
                                <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[9px] text-muted mb-1">{msg.senderRole === 'ADMIN' ? 'You (Admin)' : selectedReq.customerName}</span>
                                    <div className={`px-4 py-2 max-w-[85%] text-sm ${msg.senderRole === 'ADMIN' ? 'bg-ink text-white' : 'bg-surface border border-c text-fg'}`}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* REPLY FORM */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Type your reply to the customer..."
                                className="input-field flex-1"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && reply.trim()) {
                                        api.post(`/admin/requests/${selectedReq.id}/reply`, { message: reply }).then(() => {
                                            toast.success('Reply sent');
                                            setSelectedReq(null);
                                            load();
                                        });
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (!reply.trim()) return;
                                    api.post(`/admin/requests/${selectedReq.id}/reply`, { message: reply }).then(() => {
                                        toast.success('Reply sent');
                                        setSelectedReq(null);
                                        load();
                                    });
                                }}
                                className="btn-primary px-6"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
