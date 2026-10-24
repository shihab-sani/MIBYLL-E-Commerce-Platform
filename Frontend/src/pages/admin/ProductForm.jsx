import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import ImageUploader from '../../components/ImageUploader'

const empty = {
    name: '', slug: '', description: '', price: '', discountPercent: 0,
    stockQuantity: 0, brand: '', featured: false, newArrival: false, active: true,
    categoryId: '', images: [],
    sizeType: 'CLOTHING',
    variants: [],
}

export default function ProductForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = !!id

    const [form, setForm] = useState(empty)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    }, [])

    useEffect(() => {
        if (!isEdit) return
        api.get('/admin/products')
            .then(r => {
                const p = r.data.find(x => String(x.id) === String(id))
                if (!p) { toast.error('Product not found'); navigate('/admin/products'); return }
                setForm({
                    name: p.name,
                    slug: p.slug,
                    description: p.description || '',
                    price: p.price,
                    discountPercent: p.discountPercent,
                    stockQuantity: p.stockQuantity,
                    brand: p.brand || '',
                    featured: p.featured,
                    newArrival: p.newArrival || false,
                    active: p.active,
                    categoryId: p.categoryId || '',
                    images: p.images || [],
                    sizeType: p.sizeType || 'CLOTHING',
                    variants: p.variants || [],
                })
            })
            .catch(() => toast.error('Failed to load product'))
            .finally(() => setLoading(false))
    }, [id, isEdit, navigate])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        const payload = {
            name: form.name,
            slug: form.slug || null,
            description: form.description,
            price: Number(form.price),
            discountPercent: Number(form.discountPercent),
            stockQuantity: Number(form.stockQuantity),
            brand: form.brand,
            featured: form.featured,
            newArrival: form.newArrival,
            active: form.active,
            categoryId: form.categoryId || null,
            images: form.images,
            sizeType: form.sizeType,
            variants: form.variants,
        }
        try {
            if (isEdit) {
                await api.put(`/admin/products/${id}`, payload)
                toast.success('Product updated')
            } else {
                await api.post('/admin/products', payload)
                toast.success('Product created')
            }
            navigate('/admin/products')
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).join(', ')
                : err.response?.data?.message || 'Save failed'
            toast.error(msg)
        } finally { setSaving(false) }
    }

    if (loading) return <div className="text-sm text-muted">Loading…</div>

    const checkboxes = [
        { key: 'featured',   label: 'Featured',    hint: 'Show in the Featured section on the homepage' },
        { key: 'newArrival', label: 'New Arrival', hint: 'Show in the New Arrivals section on the homepage' },
        { key: 'active',     label: 'Active',      hint: 'Visible to customers' },
    ]

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">
                    {isEdit ? 'Edit Product' : 'New Product'}
                </h1>
                <p className="text-xs text-muted mt-1">
                    {isEdit ? 'Update product details, pricing and inventory' : 'Add a new product to your catalogue'}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">

                {/* BASIC INFO */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Basic Info</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="label-field">Product Name *</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)}
                                   className="input-field" placeholder="Silk Embroidered Saree" />
                        </div>
                        <div>
                            <label className="label-field">Slug (optional)</label>
                            <input value={form.slug} onChange={e => set('slug', e.target.value)}
                                   className="input-field" placeholder="auto-generated from name" />
                        </div>
                        <div>
                            <label className="label-field">Brand</label>
                            <input value={form.brand} onChange={e => set('brand', e.target.value)}
                                   className="input-field" placeholder="Mibyll" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-field">Description</label>
                            <textarea rows="4" value={form.description}
                                      onChange={e => set('description', e.target.value)}
                                      className="input-field resize-none"
                                      placeholder="Describe the product, materials, fit…" />
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Pricing &amp; Inventory</h2>
                    <div className="grid md:grid-cols-3 gap-5">
                        <div>
                            <label className="label-field">Base Price (৳) *</label>
                            <input type="number" step="0.01" min="0" required value={form.price}
                                   onChange={e => set('price', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="label-field">Discount (%)</label>
                            <input type="number" min="0" max="90" value={form.discountPercent}
                                   onChange={e => set('discountPercent', e.target.value)} className="input-field" />
                            {Number(form.price) > 0 && Number(form.discountPercent) > 0 && (
                                <p className="text-[10px] text-green-600 dark:text-green-400 mt-2">
                                    Final: ৳ {(Number(form.price) * (1 - Number(form.discountPercent) / 100)).toFixed(2)}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="label-field">Stock Quantity *</label>
                            <input type="number" min="0" required value={form.stockQuantity}
                                   onChange={e => set('stockQuantity', e.target.value)} className="input-field" />
                        </div>
                    </div>
                </section>

                {/* ORGANISATION & VARIANTS */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Organisation</h2>

                    <div>
                        <label className="label-field">Category</label>
                        <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
                                className="input-field max-w-md">
                            <option value="">— None —</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="label-field">Size Type</label>
                        <select value={form.sizeType} onChange={e => set('sizeType', e.target.value)} className="input-field max-w-md">
                            <option value="CLOTHING">Clothing (XS, S, M, L, XL)</option>
                            <option value="SHOES">Shoes (38, 39, 40...)</option>
                            <option value="RINGS">Rings (5, 6, 7, 8...)</option>
                            <option value="NONE">No Sizes</option>
                        </select>
                    </div>

                    {/* DESIGN / COLOR VARIANTS (Moved Here) */}
                    <div className="pt-4 border-t border-c">
                        <div className="flex justify-between items-center mb-3">
                            <label className="label-field mb-0">Design / Color Variants</label>
                            <button
                                type="button"
                                onClick={() => set('variants', [...form.variants, { name: '', imageUrl: '' }])}
                                className="text-[10px] uppercase underline text-fg hover:opacity-60 transition-opacity"
                            >
                                + Add Variant
                            </button>
                        </div>

                        {form.variants.length === 0 && (
                            <p className="text-[10px] text-muted mb-2">
                                No variants added. Add a variant if this product comes in multiple colors or designs.
                            </p>
                        )}

                        <div className="space-y-3">
                            {form.variants.map((v, i) => (
                                <div key={i} className="flex gap-4 items-end border border-c p-4 rounded bg-surface/50">
                                    <div className="flex-1">
                                        <label className="label-field">Variant Name (e.g. Black)</label>
                                        <input
                                            value={v.name}
                                            onChange={e => {
                                                const copy = [...form.variants]
                                                copy[i] = { ...copy[i], name: e.target.value }
                                                set('variants', copy)
                                            }}
                                            className="input-field"
                                        />
                                    </div>

                                    <div className="w-24">
                                        <ImageUploader
                                            value={v.imageUrl ? [v.imageUrl] : []}
                                            multiple={false}
                                            onChange={(urls) => {
                                                const copy = [...form.variants]
                                                copy[i] = { ...copy[i], imageUrl: urls[0] || '' }
                                                set('variants', copy)
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => set('variants', form.variants.filter((_, j) => j !== i))}
                                        className="text-red-500 pb-3"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-c">
                        {checkboxes.map(cb => (
                            <label key={cb.key}
                                   className="flex items-start gap-3 cursor-pointer p-4 border border-cbord">
                                <input
                                    type="checkbox"
                                    checked={form[cb.key]}
                                    onChange={e => set(cb.key, e.target.checked)}
                                    className="w-4 h-4 mt-0.5 accent-black dark:accent-white"
                                />
                                <span>
                                    <span className="block text-xs uppercase tracking-widest2 text-fg">
                                        {cb.label}
                                    </span>
                                    <span className="block text-[10px] text-muted mt-1">
                                        {cb.hint}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* IMAGES */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Images</h2>
                    <ImageUploader value={form.images} onChange={(imgs) => set('images', imgs)} multiple />
                    <p className="text-[10px] text-muted">
                        The first image is the main image. The second is used for the hover effect on the storefront.
                    </p>
                </section>

                <div className="flex gap-4">
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
                    </button>
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
