import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import ImageUploader from '../../components/ImageUploader'

const empty = {
    title: '', subtitle: '', ctaText: '', ctaLink: '',
    mediaUrl: '', mediaType: 'IMAGE', position: 'TOP',
    linkedProductId: '', displayOrder: 0, active: true,
}

export default function Banners() {
    const [banners, setBanners] = useState([])
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [form, setForm] = useState(empty)
    const [editingId, setEditingId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [customLinkMode, setCustomLinkMode] = useState(false)

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

    const reset = () => { setForm(empty); setEditingId(null); setCustomLinkMode(false) }
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    /**
     * Friendly options for the CTA Link dropdown.
     * The `value` is the actual endpoint but only the `label` is shown.
     */
    const linkOptions = useMemo(() => {
        const opts = [
            { group: 'Pages', items: [
                    { label: 'Home',          value: '/' },
                    { label: 'All Products',  value: '/shop' },
                    { label: 'New Arrivals',  value: '/shop?sort=newest' },
                    { label: 'My Orders',     value: '/orders' },
                ]},
        ]
        if (categories.length > 0) {
            opts.push({
                group: 'Categories',
                items: categories.map(c => ({
                    label: c.name,
                    value: `/shop?category=${c.slug}`,
                })),
            })
        }
        if (products.length > 0) {
            opts.push({
                group: 'Products',
                items: products.map(p => ({
                    label: p.name,
                    value: `/product/${p.slug}`,
                })),
            })
        }
        return opts
    }, [categories, products])

    const allKnownValues = useMemo(
        () => linkOptions.flatMap(g => g.items.map(i => i.value)),
        [linkOptions]
    )

    const onPickProduct = (id) => {
        set('linkedProductId', id)
        const p = products.find(x => String(x.id) === String(id))
        if (p) {
            if (!form.mediaUrl && p.images?.[0]) {
                setForm(f => ({ ...f, mediaUrl: p.images[0], mediaType: 'IMAGE' }))
            }
            if (!form.title) {
                setForm(f => ({ ...f, title: p.name }))
            }
            // Auto-set the link to the product page
            set('ctaLink', `/product/${p.slug}`)
            setCustomLinkMode(false)
        }
    }

    const submit = async (e) => {
        e.preventDefault()
        if (!form.mediaUrl) { toast.error('Upload an image/video or pick a product'); return }
        setSaving(true)
        const payload = {
            title: form.title,
            subtitle: form.subtitle,
            ctaText: form.ctaText,
            ctaLink: form.ctaLink || null,
            mediaUrl: form.mediaUrl,
            mediaType: form.mediaType,
            position: form.position,
            linkedProductId: form.linkedProductId ? Number(form.linkedProductId) : null,
            displayOrder: Number(form.displayOrder),
            active: form.active,
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
        setForm({
            title: b.title || '',
            subtitle: b.subtitle || '',
            ctaText: b.ctaText || '',
            ctaLink: b.ctaLink || '',
            mediaUrl: b.mediaUrl || '',
            mediaType: b.mediaType || 'IMAGE',
            position: b.position || 'TOP',
            linkedProductId: b.linkedProductId || '',
            displayOrder: b.displayOrder ?? 0,
            active: b.active,
        })
        // If the saved link isn't one of the known options → custom mode
        setCustomLinkMode(!!b.ctaLink && !allKnownValues.includes(b.ctaLink))
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

    const borderColor = { borderColor: 'rgb(var(--cbord))' }
    const surfaceBg   = { background: 'rgb(var(--surface))' }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">Banners</h1>
                <p className="text-xs text-muted mt-1">
                    TOP banners appear as the homepage hero. BOTTOM banners appear as the
                    editorial / review section below the featured products.
                </p>
            </div>

            {/* FORM */}
            <form onSubmit={submit} className="border p-6 space-y-5 max-w-3xl"
                  style={{ ...surfaceBg, ...borderColor }}>
                <h2 className="text-[11px] uppercase tracking-widest2 text-fg">
                    {editingId ? 'Edit Banner' : 'New Banner'}
                </h2>

                {/* POSITION */}
                <div>
                    <label className="label-field">Position *</label>
                    <div className="flex gap-3">
                        {['TOP', 'BOTTOM'].map(pos => (
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
                                {pos === 'TOP' ? 'Top (Hero)' : 'Bottom (Reviews)'}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted mt-2">
                        Bottom is designed for customer review screenshots linked to products.
                    </p>
                </div>

                {/* BASIC */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="label-field">Headline (optional)</label>
                        <textarea rows="2" value={form.title} onChange={e => set('title', e.target.value)}
                                  placeholder="The Art of&#10;Quiet Luxury"
                                  className="input-field resize-none" />
                        <p className="text-[10px] text-muted mt-1">
                            Use a line break to split. Leave empty for a plain image / review slide.
                        </p>
                    </div>

                    <div>
                        <label className="label-field">Subtitle (optional)</label>
                        <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
                               placeholder="Autumn / Winter Collection" className="input-field" />
                    </div>

                    <div>
                        <label className="label-field">CTA Text (optional)</label>
                        <input value={form.ctaText} onChange={e => set('ctaText', e.target.value)}
                               placeholder="Explore the Collection" className="input-field" />
                    </div>
                </div>

                {/* LINK PRODUCT */}
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
                    <p className="text-[10px] text-muted mt-1">
                        When set, clicking the entire banner takes the customer to this product's page.
                    </p>
                </div>

                {/* CTA LINK DROPDOWN */}
                <div>
                    <label className="label-field">CTA / Click-through Link</label>
                    <select
                        value={customLinkMode ? '__custom__' : (form.ctaLink || '')}
                        onChange={(e) => {
                            const v = e.target.value
                            if (v === '__custom__') {
                                setCustomLinkMode(true)
                            } else {
                                setCustomLinkMode(false)
                                set('ctaLink', v)
                            }
                        }}
                        className="input-field"
                    >
                        <option value="">— None —</option>
                        {linkOptions.map(g => (
                            <optgroup key={g.group} label={g.group}>
                                {g.items.map(it => (
                                    <option key={it.value} value={it.value}>{it.label}</option>
                                ))}
                            </optgroup>
                        ))}
                        <option value="__custom__">Custom URL…</option>
                    </select>

                    {customLinkMode && (
                        <input
                            value={form.ctaLink}
                            onChange={e => set('ctaLink', e.target.value)}
                            placeholder="/shop?category=women  or  /product/slug"
                            className="input-field mt-2 font-mono text-xs"
                        />
                    )}

                    <p className="text-[10px] text-muted mt-1">
                        Pick a friendly name — the underlying URL is stored automatically.
                    </p>
                </div>

                {/* MEDIA */}
                <div>
                    <label className="label-field">Media (Image or Video)</label>
                    {form.mediaUrl ? (
                        <div className="relative aspect-[16/7] overflow-hidden border"
                             style={borderColor}>
                            {form.mediaType === 'VIDEO' ? (
                                <video src={form.mediaUrl} controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={form.mediaUrl} alt="" className="w-full h-full object-cover" />
                            )}
                            <button type="button"
                                    onClick={() => setForm(f => ({ ...f, mediaUrl: '', mediaType: 'IMAGE' }))}
                                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 hover:bg-black">
                                Replace
                            </button>
                        </div>
                    ) : (
                        <ImageUploader
                            value={[]}
                            multiple={false}
                            accept="image/*,video/*"
                            label="Click or drop an image or video"
                            hint="JPG / PNG / WEBP / MP4 / WEBM — single file"
                            onChange={(urls) => {
                                const url = urls[0]
                                if (!url) return
                                const isVideo = /\.(mp4|webm|mov|avi|mkv|ogv|m4v)(\?|#|$)/i.test(url)
                                setForm(f => ({ ...f, mediaUrl: url, mediaType: isVideo ? 'VIDEO' : 'IMAGE' }))
                            }}
                        />
                    )}
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
                <div className="border py-16 text-center text-xs text-muted"
                     style={{ ...surfaceBg, ...borderColor }}>
                    No banners yet. Add one above.
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map((b, idx) => (
                        <div key={b.id} className="border flex flex-wrap items-center gap-4 p-4"
                             style={{ ...surfaceBg, ...borderColor }}>
                            <div className="w-32 h-20 bg-sand overflow-hidden shrink-0">
                                {b.mediaType === 'VIDEO' ? (
                                    <video src={b.mediaUrl} muted className="w-full h-full object-cover" />
                                ) : (
                                    b.mediaUrl && <img src={b.mediaUrl} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm text-fg font-medium truncate">
                                        {b.title || '(no headline)'}
                                    </p>
                                    <span className={`text-[9px] uppercase tracking-widest2 px-2 py-0.5
                    ${b.position === 'BOTTOM'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                    {b.position || 'TOP'}
                  </span>
                                    <span className={`text-[9px] uppercase tracking-widest2 px-2 py-0.5
                    ${b.active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                        : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                    {b.active ? 'Active' : 'Hidden'}
                  </span>
                                </div>
                                {b.subtitle && <p className="text-[11px] text-muted mt-1">{b.subtitle}</p>}
                                {b.ctaLink && <p className="text-[10px] text-muted font-mono">{b.ctaLink}</p>}
                                {b.linkedProductSlug && (
                                    <p className="text-[10px] text-muted">
                                        Linked product: <span className="text-fg">{b.linkedProductSlug}</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => move(b, -1)}
                                        disabled={idx === 0 || banners.findIndex(x => x.id === b.id) === 0}
                                        className="w-8 h-8 border text-fg disabled:opacity-30 hover:border-fg"
                                        style={borderColor}>↑</button>
                                <button onClick={() => move(b, 1)}
                                        className="w-8 h-8 border text-fg hover:border-fg"
                                        style={borderColor}>↓</button>
                            </div>

                            <button onClick={() => edit(b)}
                                    className="text-[10px] uppercase tracking-widest2 text-fg hover:underline">
                                Edit
                            </button>
                            <button onClick={() => remove(b)}
                                    className="text-[10px] uppercase tracking-widest2 text-red-600 hover:underline">
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}