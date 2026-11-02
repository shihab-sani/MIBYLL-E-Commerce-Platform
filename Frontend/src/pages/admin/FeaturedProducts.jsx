import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function FeaturedProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate() // <-- Initialize navigate

    // Extracted the load function so it can be called after delete
    const load = useCallback(() => {
        setLoading(true)
        api.get('/admin/products')
            .then(r => setProducts(r.data.filter(p => p.featured === true)))
            .catch(() => toast.error('Failed to load'))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this featured product? This action cannot be undone.')) return;

        try {
            await api.delete(`/admin/products/${id}`);
            toast.success('Product deleted successfully');
            load(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete product');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-fg">Featured Products</h1>
                    <p className="text-xs text-muted mt-1">These products are for Inquiry only and do not have standard pricing.</p>
                </div>
                <Link to="/admin/products/new" className="btn-primary">+ Add Featured Product</Link>
            </div>

            <div className="bg-surface border border-c overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                    <thead>
                    <tr className="text-left text-[9px] uppercase tracking-widest2 text-muted border-b border-c">
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan="4" className="px-5 py-12 text-center text-muted text-xs">Loading…</td></tr>
                    ) : products.length === 0 ? (
                        <tr><td colSpan="4" className="px-5 py-12 text-center text-muted text-xs">No Featured products yet.</td></tr>
                    ) : products.map(p => (
                        <tr key={p.id} className="border-b border-c last:border-0">
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-14 bg-sand shrink-0 overflow-hidden">
                                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <p className="text-fg">{p.name}</p>
                                        <p className="text-[10px] text-muted">{p.brand}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 text-muted">{p.categoryName || '—'}</td>
                            <td className="px-5 py-4">
                                    <span className={`text-[9px] uppercase tracking-widest2 px-2 py-1 
                                        ${p.active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-neutral-200 text-neutral-600'}`}>
                                        {p.active ? 'Active' : 'Hidden'}
                                    </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-4">
                                    <button
                                        onClick={() => navigate(`/admin/products/${p.id}/edit`)} // <-- Changed to p.id
                                        className="text-[10px] uppercase tracking-widest2 text-fg hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)} // <-- Changed to p.id
                                        className="text-[10px] uppercase tracking-widest2 text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
