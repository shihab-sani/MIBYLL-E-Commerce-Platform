import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const load = () => {
        setLoading(true)
        api.get('/admin/products')
            .then(r => setProducts(r.data))
            .catch(() => toast.error('Failed to load products'))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const remove = async (p) => {
        if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
        try {
            await api.delete(`/admin/products/${p.id}`)
            toast.success('Product deleted')
            load()
        } catch { toast.error('Delete failed') }
    }

    const quickDiscount = async (p) => {
        const input = prompt(`Discount % for "${p.name}" (0–90):`, p.discountPercent)
        if (input === null) return
        const val = Number(input)
        if (isNaN(val) || val < 0 || val > 90) { toast.error('Enter a number 0–90'); return }
        try {
            await api.patch(`/admin/products/${p.id}/discount`, { discountPercent: val })
            toast.success('Discount updated'); load()
        } catch { toast.error('Update failed') }
    }

    const quickPrice = async (p) => {
        const input = prompt(`New base price for "${p.name}":`, p.price)
        if (input === null) return
        const val = Number(input)
        if (isNaN(val) || val < 0) { toast.error('Invalid price'); return }
        try {
            await api.patch(`/admin/products/${p.id}/price`, { price: val })
            toast.success('Price updated'); load()
        } catch { toast.error('Update failed') }
    }

    const quickStock = async (p) => {
        const input = prompt(`Stock quantity for "${p.name}":`, p.stockQuantity)
        if (input === null) return
        const val = Number(input)
        if (isNaN(val) || val < 0) { toast.error('Invalid quantity'); return }
        try {
            await api.patch(`/admin/products/${p.id}/stock`, { stockQuantity: val })
            toast.success('Stock updated'); load()
        } catch { toast.error('Update failed') }
    }

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(search.toLowerCase())
    )

    const borderColor = { borderColor: 'rgb(var(--cbord))' }
    const surfaceBg = { background: 'rgb(var(--surface))' }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-fg">Products</h1>
                    <p className="text-xs text-muted mt-1">{products.length} total</p>
                </div>
                <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
            </div>

            <input
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field max-w-sm"
            />

            <div className="border overflow-x-auto" style={{ ...surfaceBg, ...borderColor }}>
                <table className="w-full text-sm min-w-[900px]">
                    <thead>
                    <tr className="text-left text-[9px] uppercase tracking-widest2 text-muted border-b" style={borderColor}>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Price</th>
                        <th className="px-5 py-3">Discount</th>
                        <th className="px-5 py-3">Final</th>
                        <th className="px-5 py-3">Stock</th>
                        <th className="px-5 py-3">Flags</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan="8" className="px-5 py-12 text-center text-muted text-xs">Loading…</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan="8" className="px-5 py-12 text-center text-muted text-xs">No products</td></tr>
                    ) : filtered.map(p => (
                        <tr key={p.id} className="border-b last:border-0"
                            style={borderColor}>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-14 bg-sand shrink-0 overflow-hidden">
                                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate max-w-[220px] text-fg">{p.name}</p>
                                        <p className="text-[10px] text-muted">{p.brand}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 text-muted">{p.categoryName || '—'}</td>

                            <td className="px-5 py-4">
                                <button onClick={() => quickPrice(p)} className="text-fg hover:underline">৳ {p.price}</button>
                            </td>

                            <td className="px-5 py-4">
                                <button onClick={() => quickDiscount(p)}
                                        className={`hover:underline ${p.discountPercent > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted'}`}>
                                    {p.discountPercent}%
                                </button>
                            </td>

                            <td className="px-5 py-4 text-fg font-medium">৳ {p.finalPrice}</td>

                            <td className="px-5 py-4">
                                <button onClick={() => quickStock(p)}
                                        className={`hover:underline ${p.stockQuantity < 5 ? 'text-amber-500 font-medium' : 'text-fg'}`}>
                                    {p.stockQuantity}
                                </button>
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {p.active && (
                                        <span className="text-[9px] uppercase tracking-widest2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        Active
                      </span>
                                    )}
                                    {!p.active && (
                                        <span className="text-[9px] uppercase tracking-widest2 px-2 py-1"
                                              style={{ background: 'rgb(var(--cbord) / 0.4)', color: 'rgb(var(--muted))' }}>
                        Hidden
                      </span>
                                    )}
                                    {p.featured && (
                                        <span className="text-[9px] uppercase tracking-widest2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Featured
                      </span>
                                    )}
                                    {p.newArrival && (
                                        <span className="text-[9px] uppercase tracking-widest2 px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        New
                      </span>
                                    )}
                                </div>
                            </td>

                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                <Link to={`/admin/products/${p.id}/edit`}
                                      className="text-[10px] uppercase tracking-widest2 text-fg hover:underline mr-4">
                                    Edit
                                </Link>
                                <button onClick={() => remove(p)}
                                        className="text-[10px] uppercase tracking-widest2 text-red-600 hover:underline">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}