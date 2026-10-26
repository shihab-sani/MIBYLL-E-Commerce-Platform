import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function Requests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/requests').then(r => setRequests(r.data)).catch(() => {}).finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif text-fg">Customer Requests</h1>
            {loading ? <p>Loading...</p> : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead>
                        <tr className="text-left text-[9px] uppercase tracking-widest2 text-muted border-b border-c">
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Customer</th>
                            <th className="px-5 py-3">Product</th>
                            <th className="px-5 py-3">Message</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.map(r => (
                            <tr key={r.id} className="border-b border-c last:border-0">
                                <td className="px-5 py-4 text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td className="px-5 py-4">
                                    <p className="text-fg">{r.customerName}</p>
                                    <p className="text-xs text-muted">{r.customerEmail}</p>
                                </td>
                                <td className="px-5 py-4 flex items-center gap-3">
                                    {r.productImage && <img src={r.productImage} className="w-10 h-12 object-cover" />}
                                    <span className="text-fg">{r.productName}</span>
                                </td>
                                <td className="px-5 py-4 text-fg max-w-xs">{r.message}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
