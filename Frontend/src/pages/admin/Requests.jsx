import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function Requests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [selectedReq, setSelectedReq] = useState(null)
    const [status, setStatus] = useState('PENDING')
    const [reply, setReply] = useState('')
    const [saving, setSaving] = useState(false)

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
        setStatus(req.status || 'PENDING')
        setReply(req.adminReply || '')
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.patch(`/admin/requests/${selectedReq.id}/status`, {
                status,
                adminReply: reply
            })
            toast.success('Inquiry updated')
            setSelectedReq(null)
            load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update')
        } finally {
            setSaving(false)
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
                                        <span className="text-fg">{req.productName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-fg max-w-[200px] truncate" title={req.message}>
                                    {req.message}
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
                            <p className="text-xs text-muted mb-1">Message from {selectedReq.customerName}:</p>
                            <p className="text-sm text-fg italic">"{selectedReq.message}"</p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="label-field">Update Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="REPLIED">Replied</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="label-field">Admin Reply (Optional)</label>
                                <textarea
                                    rows="4"
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                    placeholder="Type your response to the customer here..."
                                    className="input-field resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setSelectedReq(null)} className="btn-outline">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="btn-primary">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
