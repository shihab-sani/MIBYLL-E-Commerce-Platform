import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import ImageUploader from '../../components/ImageUploader'

const empty = {
    name: '', slug: '', description: '', price: '', discountPercent: 0,
    stockQuantity: 0, brand: '', active: true, featured: false,
    categoryId: '', subCategoryId: '',
    sizeType: 'CLOTHING', variants: [], images: [],
}

export default function ProductForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = !!id

    const [form, setForm] = useState(empty)
    const [normalCategories, setNormalCategories] = useState([])
    const [featuredCategories, setFeaturedCategories] = useState([])
    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        // Fetch ONLY categories with normal products
        api.get('/admin/categories/normal-available').then(r => setNormalCategories(r.data)).catch(() => {})
        // Fetch ONLY categories with featured products
        api.get('/admin/categories/featured-available').then(r => setFeaturedCategories(r.data)).catch(() => {})
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
                    active: p.active, featured: p.featured || false,
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

        const finalPrice = form.featured ? 0 : Number(form.price)
        const finalStock = form.featured ? 0 : Number(form.stockQuantity)
        const finalCategoryId = form.subCategoryId || form.categoryId

        const payload = {
            name: form.name, slug: form.slug || null, description: form.description,
            price: finalPrice, discountPercent: form.featured ? 0 : Number(form.discountPercent),
            stockQuantity: finalStock, brand: form.brand,
            active: form.active, featured: form.featured,
            categoryId: finalCategoryId || null,
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

    // Determine which list to show based on the checkbox
    const displayCategories = form.featured ? featuredCategories : normalCategories
    const activeMainCategory = displayCategories.find(c => c.id === form.categoryId)
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

                {/* TYPE & ORGANISATION */}
                <section className="card p-6 space-y-5">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Type & Organisation</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <label className={`flex flex-col gap-1 p-4 border cursor-pointer ${form.featured ? 'border-fg bg-cbord/10' : 'border-cbord'}`}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.featured}
                                    onChange={e => {
                                        const isChecked = e.target.checked
                                        // Reset category when switching modes to prevent mismatched IDs
                                        setForm(f => ({ ...f, featured: isChecked, categoryId: '', subCategoryId: '' }))
                                    }}
                                />
                                <span className="text-xs uppercase font-medium">Featured (Inquiry Only)</span>
                            </div>
                            <span className="text-[10px] text-muted">Disables pricing & limits category options</span>
                        </label>

                        <label className="flex flex-col gap-1 p-4 border border-cbord cursor-pointer">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
                                <span className="text-xs uppercase font-medium">Active</span>
                            </div>
                            <span className="text-[10px] text-muted">Visible to customers</span>
                        </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="label-field">Main Category</label>
                            <select
                                value={form.categoryId}
                                onChange={e => setForm({ ...form, categoryId: e.target.value, subCategoryId: '' })}
                                className="input-field"
                                disabled={form.featured && displayCategories.length === 0}
                            >
                                <option value="">— None —</option>
                                {displayCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            {/* Warning Message if no featured categories are available */}
                            {form.featured && displayCategories.length === 0 && (
                                <p className="text-[10px] text-amber-500 mt-1">
                                    No available categories for Featured products. Please create a new category in the Categories tab.
                                </p>
                            )}
                        </div>
                        {subcategories.length > 0 && (
                            <div>
                                <label className="label-field">Subcategory</label>
                                <select value={form.subCategoryId} onChange={e => set('subCategoryId', e.target.value)} className="input-field">
                                    <option value="">— Select Subcategory (Optional) —</option>
                                    {subcategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="label-field">Size Type</label>
                        <select value={form.sizeType} onChange={e => set('sizeType', e.target.value)} className="input-field max-w-md">
                            <option value="CLOTHING">Clothing</option>
                            <option value="SHOES">Shoes</option>
                            <option value="RINGS">Rings</option>
                            <option value="NONE">No Sizes</option>
                        </select>
                    </div>
                </section>

                {/* PRICING */}
                <section className={`card p-6 space-y-5 ${form.featured ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">
                        Pricing & Inventory {form.featured && '(Disabled for Featured items)'}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-5">
                        <div>
                            <label className="label-field">Base Price (৳)</label>
                            <input type="number" disabled={form.featured} value={form.price} onChange={e => set('price', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="label-field">Discount (%)</label>
                            <input type="number" disabled={form.featured} value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="label-field">Stock Quantity</label>
                            <input type="number" disabled={form.featured} value={form.stockQuantity} onChange={e => set('stockQuantity', e.target.value)} className="input-field" />
                        </div>
                    </div>
                </section>

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
