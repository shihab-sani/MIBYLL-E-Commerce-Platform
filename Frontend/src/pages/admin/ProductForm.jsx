import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import ImageUploader from '../../components/ImageUploader'

const empty = {
    name: '', slug: '', description: '', price: '', discountPercent: 0,
    stockQuantity: 0, brand: '', active: true,
    categoryId: '', subCategoryId: '',
    sizeType: 'CLOTHING', variants: [], images: [],
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
                    name: p.name, slug: p.slug, description: p.description || '',
                    price: p.price, discountPercent: p.discountPercent,
                    stockQuantity: p.stockQuantity, brand: p.brand || '',
                    active: p.active,
                    categoryId: p.categoryId || '', subCategoryId: '',
                    sizeType: p.sizeType || 'CLOTHING', variants: p.variants || [],
                    images: p.images || [],
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
            name: form.name, slug: form.slug || null, description: form.description,
            price: Number(form.price), discountPercent: Number(form.discountPercent),
            stockQuantity: Number(form.stockQuantity), brand: form.brand,
            active: form.active,
            categoryId: form.subCategoryId || form.categoryId || null,
            images: form.images, sizeType: form.sizeType, variants: form.variants,
        }
        try {
            if (isEdit) await api.put(`/admin/products/${id}`, payload)
            else await api.post('/admin/products', payload)
            toast.success('Product saved')
            navigate('/admin/products')
        } catch (err) {
            toast.error('Save failed')
        } finally { setSaving(false) }
    }

    if (loading) return <div className="text-sm text-muted">Loading…</div>

    const activeMainCategory = categories.find(c => c.id === form.categoryId)
    const subcategories = activeMainCategory?.subcategories || []

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">{isEdit ? 'Edit Product' : 'New Product'}</h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* BASIC INFO */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Basic Info</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="label-field">Product Name *</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="label-field">Brand</label>
                            <input value={form.brand} onChange={e => set('brand', e.target.value)} className="input-field" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-field">Description</label>
                            <textarea rows="4" value={form.description} onChange={e => set('description', e.target.value)} className="input-field resize-none" />
                        </div>
                    </div>
                </section>

                {/* ORGANISATION */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Organisation</h2>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="label-field">Main Category</label>
                            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value, subCategoryId: '' })} className="input-field">
                                <option value="">— None —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        {subcategories.length > 0 && (
                            <div>
                                <label className="label-field">Subcategory</label>
                                <select value={form.subCategoryId} onChange={e => set('subCategoryId', e.target.value)} className="input-field">
                                    <option value="">— Select Subcategory —</option>
                                    {subcategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="label-field">Size Type</label>
                            <select value={form.sizeType} onChange={e => set('sizeType', e.target.value)} className="input-field">
                                <option value="CLOTHING">Clothing</option>
                                <option value="SHOES">Shoes</option>
                                <option value="RINGS">Rings</option>
                                <option value="NONE">No Sizes</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-black dark:accent-white" />
                                <span className="text-xs uppercase tracking-widest2 text-fg">Active</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Pricing & Inventory</h2>
                    <div className="grid md:grid-cols-3 gap-5">
                        <div>
                            <label className="label-field">Base Price (৳)</label>
                            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="label-field">Discount (%)</label>
                            <input type="number" value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="label-field">Stock Quantity</label>
                            <input type="number" value={form.stockQuantity} onChange={e => set('stockQuantity', e.target.value)} className="input-field" />
                        </div>
                    </div>
                </section>

                {/* IMAGES & VARIANTS */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Images</h2>
                    <ImageUploader value={form.images} onChange={(imgs) => set('images', imgs)} multiple />
                </section>

                <div className="flex gap-4">
                    <button type="submit" disabled={saving} className="btn-primary">Save Product</button>
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">Cancel</button>
                </div>
            </form>
        </div>
    )
}
