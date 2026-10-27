import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import ImageUploader from '../../components/ImageUploader'

const empty = {
    title: '', subtitle: '', ctaText: '', ctaLink: '',
    mediaList: [],
    position: 'TOP', linkedProductId: '', displayOrder: 0, active: true,
    categoryId: '', subCategoryId: '',
}

export default function Banners() {
    const [banners, setBanners] = useState([])
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [form, setForm] = useState(empty)
    const [editingId, setEditingId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        Promise.all([
            api.get('/admin/banners'),
            api.get('/admin/products'),
            api.get('/categories'),
        ]).then(([b, p, c]) => {
            setBanners(b.data)
            setProducts(p.data)
            setCategories(c.data)
        }).catch(() => toast.error('Failed to load'))
            .finally(() => setLoading(false))
    }
    useEffect(load, [])

    const reset = () => { setForm(empty); setEditingId(null) }
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const onPickProduct = (id) => {
        set('linkedProductId', id)
        const p = products.find(x => String(x.id) === String(id))
        if (p) {
            if (!form.mediaList.length && p.images?.[0]) {
                setForm(f => ({ ...f, mediaList: [{ mediaUrl: p.images[0], mediaType: 'IMAGE' }] }))
            }
            if (!form.title) {
                setForm(f => ({ ...f, title: p.name }))
            }
            set('ctaLink', `/product/${p.slug}`)
            set('categoryId', '')
            set('subCategoryId', '')
        }
    }

    const submit = async (e) => {
        e.preventDefault()
        if (form.mediaList.length === 0) { toast.error('Upload at least one image/video'); return }
        setSaving(true)
        const payload = {
            title: form.title,
            subtitle: form.subtitle, // acts as Description
            ctaText: form.ctaText,
            ctaLink: form.ctaLink || null,
            position: form.position,
            linkedProductId: form.linkedProductId ? Number(form.linkedProductId) : null,
            displayOrder: Number(form.displayOrder),
            active: form.active,
            mediaList: form.mediaList
        }
        try {
            if (editingId) {
                await api.put(`/admin/banners/${editingId}`, payload)
                toast.success('Banner updated')
            } else {
                await api.post('/admin/banners', payload)
                toast.success('Banner created')
            }
            reset(); load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed')
        } finally { setSaving(false) }
    }

    const edit = (b) => {
        setEditingId(b.id)
        let catId = '', subId = ''
        if (b.ctaLink && b.ctaLink.includes('category=')) {
            const slug = b.ctaLink.split('category=')[1]
            for (const cat of categories) {
                if (cat.slug === slug) { catId = cat.id; break; }
                if (cat.subcategories) {
                    const sub = cat.subcategories.find(s => s.slug === slug)
                    if (sub) { catId = cat.id; subId = sub.id; break; }
                }
            }
        }
        setForm({
            title: b.title || '',
            subtitle: b.subtitle || '',
            ctaText: b.ctaText || '',
            ctaLink: b.ctaLink || '',
            mediaList: b.mediaList || [],
            position: b.position || 'TOP',
            linkedProductId: b.linkedProductId || '',
            displayOrder: b.displayOrder ?? 0,
            active: b.active,
            categoryId: catId,
            subCategoryId: subId
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const remove = async (b) => {
        if (!confirm('Delete this banner?')) return
        try {
            await api.delete(`/admin/banners/${b.id}`)
            toast.success('Banner deleted')
            load()
        } catch { toast.error('Delete failed') }
    }

    const move = async (b, direction) => {
        try {
            await api.patch(`/admin/banners/${b.id}/move?direction=${direction}`)
            load()
        } catch { toast.error('Move failed') }
    }

    const activeMainCategory = categories.find(c => c.id === form.categoryId)
    const subcategories = activeMainCategory?.subcategories || []

    const borderColor = { borderColor: 'rgb(var(--cbord))' }
    const surfaceBg   = { background: 'rgb(var(--surface))' }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">Banners</h1>
                <p className="text-xs text-muted mt-1">
                    TOP banners appear as the hero. EDITORIAL banners stack one by one on the homepage.
                </p>
            </div>

            <form onSubmit={submit} className="border p-6 space-y-5 max-w-3xl"
                  style={{ ...surfaceBg, ...borderColor }}>
                <h2 className="text-[11px] uppercase tracking-widest2 text-fg">
                    {editingId ? 'Edit Banner' : 'New Banner'}
                </h2>

                {/* POSITION */}
                <div>
                    <label className="label-field">Position *</label>
                    <div className="flex gap-3">
                        {['TOP', 'EDITORIAL'].map(pos => (
                            <button
                                type="button"
                                key={pos}
                                onClick={() => set('position', pos)}
                                className={`px-6 py-3 text-[11px] uppercase tracking-widest2 border transition-colors
                  ${form.position === pos
                                    ? 'bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white'
                                    : 'text-fg hover:border-fg'}`}
                                style={form.position === pos ? {} : borderColor}
                            >
                                {pos === 'TOP' ? 'Top (Hero)' : 'Editorial (Homepage)'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TITLE & DESCRIPTION */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="label-field">Title</label>
                        <textarea rows="2" value={form.title} onChange={e => set('title', e.target.value)}
                                  placeholder="The Art of&#10;Quiet Luxury"
                                  className="input-field resize-none" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="label-field">Description</label>
                        <textarea rows="2" value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
                                  placeholder="Autumn / Winter Collection" className="input-field resize-none" />
                    </div>

                    <div>
                        <label className="label-field">Button Text (optional)</label>
                        <input value={form.ctaText} onChange={e => set('ctaText', e.target.value)}
                               placeholder="Explore the Collection" className="input-field" />
                    </div>
                </div>

                {/* LINK TO PRODUCT */}
                <div>
                    <label className="label-field">Link to a Product (optional)</label>
                    <select value={form.linkedProductId}
                            onChange={e => onPickProduct(e.target.value)}
                            className="input-field">
                        <option value="">— None —</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* LINK TO CATEGORY / SUBCATEGORY */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label-field">Link to Category</label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => {
                                const catId = e.target.value
                                const cat = categories.find(c => c.id === catId)
                                setForm(f => ({
                                    ...f,
                                    categoryId: catId,
                                    subCategoryId: '',
                                    ctaLink: cat ? `/shop?category=${cat.slug}` : '',
                                    linkedProductId: ''
                                }))
                            }}
                            className="input-field"
                        >
                            <option value="">— None —</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {subcategories.length > 0 && (
                        <div>
                            <label className="label-field">Link to Subcategory</label>
                            <select
                                value={form.subCategoryId}
                                onChange={(e) => {
                                    const subId = e.target.value
                                    const sub = subcategories.find(s => s.id === subId)
                                    setForm(f => ({
                                        ...f,
                                        subCategoryId: subId,
                                        ctaLink: sub ? `/shop?category=${sub.slug}` : `/shop?category=${activeMainCategory.slug}`
                                    }))
                                }}
                                className="input-field"
                            >
                                <option value="">— None (Main Category) —</option>
                                {subcategories.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* MEDIA */}
                <div>
                    <label className="label-field">Media (Images & Videos) *</label>
                    <ImageUploader
                        value={form.mediaList.map(m => m.mediaUrl)}
                        multiple={true}
                        accept="image/*,video/*"
                        label="Click or drop images/videos"
                        hint="Add as many as you want"
                        onChange={(urls) => {
                            const newMedia = urls.map(url => {
                                const isVideo = /\.(mp4|webm|mov|avi|mkv|ogv|m4v)(\?|#|$)/i.test(url)
                                return { mediaUrl: url, mediaType: isVideo ? 'VIDEO' : 'IMAGE' }
                            })
                            setForm(f => ({ ...f, mediaList: newMedia }))
                        }}
                    />
                </div>

                {/* ORDER + ACTIVE */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label-field">Display Order</label>
                        <input type="number" min="0" value={form.displayOrder}
                               onChange={e => set('displayOrder', e.target.value)}
                               className="input-field" />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.active}
                                   onChange={e => set('active', e.target.checked)}
                                   className="w-4 h-4 accent-black dark:accent-white" />
                            <span className="text-xs uppercase tracking-widest2 text-fg">Active</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button disabled={saving} className="btn-primary">
                        {saving ? 'Saving…' : editingId ? 'Update Banner' : 'Create Banner'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={reset} className="btn-outline">Cancel</button>
                    )}
                </div>
            </form>

            {/* LIST */}
            {loading ? (
                <div className="text-sm text-muted py-10">Loading…</div>
            ) : banners.length === 0 ? (
                <div className="border py-16 text-center text-xs text-muted" style={{ ...surfaceBg, ...borderColor }}>
                    No banners yet. Add one above.
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map((b, idx) => (
                        <div key={b.id} className="border flex flex-wrap items-center gap-4 p-4" style={{ ...surfaceBg, ...borderColor }}>
                            <div className="w-32 h-20 bg-sand overflow-hidden shrink-0">
                                {b.mediaList?.[0]?.mediaType === 'VIDEO' ? (
                                    <video src={b.mediaList[0].mediaUrl} muted className="w-full h-full object-cover" />
                                ) : (
                                    b.mediaList?.[0] && <img src={b.mediaList[0].mediaUrl} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm text-fg font-medium truncate">{b.title || '(no title)'}</p>
                                    <span className={`text-[9px] uppercase tracking-widest2 px-2 py-0.5
                                        ${b.position === 'EDITORIAL' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                                        {b.position || 'TOP'}
                                    </span>
                                </div>
                                {b.subtitle && <p className="text-[11px] text-muted mt-1 truncate">{b.subtitle}</p>}
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => move(b, -1)} disabled={idx === 0} className="w-8 h-8 border text-fg disabled:opacity-30" style={borderColor}>↑</button>
                                <button onClick={() => move(b, 1)} className="w-8 h-8 border text-fg" style={borderColor}>↓</button>
                            </div>

                            <button onClick={() => edit(b)} className="text-[10px] uppercase tracking-widest2 text-fg hover:underline">Edit</button>
                            <button onClick={() => remove(b)} className="text-[10px] uppercase tracking-widest2 text-red-600 hover:underline">Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
