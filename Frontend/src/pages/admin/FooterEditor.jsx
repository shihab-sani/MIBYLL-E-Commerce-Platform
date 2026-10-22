import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

// --- Constants ---
const PAGE_TARGETS = [
    { label: 'Home', value: '/' },
    { label: 'All Products', value: '/shop' },
    { label: 'New Arrivals', value: '/shop?sort=newest' },
    { label: 'Cart', value: '/cart' },
    { label: 'My Orders', value: '/orders' },
    { label: 'Login', value: '/login' },
    { label: 'Register', value: '/register' },
]

const SOCIAL_PLATFORMS = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'X / Twitter' },
    { value: 'pinterest', label: 'Pinterest' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'custom', label: 'Custom (upload icon)' },
]

const empty = {
    brandName: '', tagline: '', copyrightText: '',
    shopLinks: [], accountLinks: [], clientCareLinks: [], socialLinks: [],
    aboutUsTitle: 'About Us', aboutUsContent: '', aboutUsEnabled: true,
    shippingPolicyContent: '',
    contactEmail: '', contactPhone: '', contactAddress: ''
}

function parse(json) {
    try { return JSON.parse(json || '[]') } catch { return [] }
}

// --- SUB-COMPONENTS (Moved outside to prevent scroll jump) ---

function LinkEditor({ title, field, form, setForm }) {
    return (
        <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-[11px] uppercase tracking-widest2 text-fg">{title}</h3>
                <button type="button"
                        onClick={() => setForm(f => ({ ...f, [field]: [...f[field], { label: '', href: '/' }] }))}
                        className="text-[10px] uppercase tracking-widest2 text-fg hover:underline">
                    + Add Link
                </button>
            </div>
            <div className="space-y-2">
                {form[field].map((l, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <input value={l.label} placeholder="Label" onChange={e => {
                            const copy = [...form[field]]; copy[i] = { ...copy[i], label: e.target.value }; setForm(f => ({ ...f, [field]: copy }))
                        }} className="input-field flex-1" />
                        <select value={l.href || '/'} onChange={e => {
                            const copy = [...form[field]]; copy[i] = { ...copy[i], href: e.target.value }; setForm(f => ({ ...f, [field]: copy }))
                        }} className="input-field flex-1">
                            {PAGE_TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <button type="button" onClick={() => setForm(f => ({ ...f, [field]: f[field].filter((_, j) => j !== i) }))}
                                className="px-3 text-red-600 text-xs">✕</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SocialEditor({ form, setForm }) {
    return (
        <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-[11px] uppercase tracking-widest2 text-fg">Follow Us</h3>
                <button type="button"
                        onClick={() => setForm(f => ({ ...f, socialLinks: [...f.socialLinks, { platform: 'facebook', url: '' }] }))}
                        className="text-[10px] uppercase tracking-widest2 text-fg hover:underline">
                    + Add Icon
                </button>
            </div>
            <div className="space-y-3">
                {form.socialLinks.map((l, i) => (
                    <div key={i} className="p-3 border border-c rounded space-y-2">
                        <div className="flex gap-2">
                            <select value={l.platform} onChange={e => {
                                const copy = [...form.socialLinks]; copy[i] = { ...copy[i], platform: e.target.value }; setForm(f => ({ ...f, socialLinks: copy }))
                            }} className="input-field flex-1">
                                {SOCIAL_PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                            <button type="button" onClick={() => setForm(f => ({ ...f, socialLinks: f.socialLinks.filter((_, j) => j !== i) }))}
                                    className="px-3 text-red-600 text-xs">✕</button>
                        </div>
                        <input value={l.url || ''} placeholder="https://facebook.com/yourpage" onChange={e => {
                            const copy = [...form.socialLinks]; copy[i] = { ...copy[i], url: e.target.value }; setForm(f => ({ ...f, socialLinks: copy }))
                        }} className="input-field w-full text-xs" />
                        {l.platform === 'custom' && (
                            <input value={l.iconUrl || ''} placeholder="Custom icon URL (https://…)" onChange={e => {
                                const copy = [...form.socialLinks]; copy[i] = { ...copy[i], iconUrl: e.target.value }; setForm(f => ({ ...f, socialLinks: copy }))
                            }} className="input-field w-full text-xs" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- MAIN COMPONENT ---

export default function FooterEditor() {
    const [form, setForm] = useState(empty)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        api.get('/admin/site/footer')
            .then(r => {
                const d = r.data
                setForm({
                    brandName: d.brandName || '',
                    tagline: d.tagline || '',
                    copyrightText: d.copyrightText || '',
                    shopLinks: parse(d.shopLinksJson),
                    accountLinks: parse(d.accountLinksJson),
                    clientCareLinks: parse(d.clientCareLinksJson),
                    socialLinks: parse(d.socialLinksJson),
                    aboutUsTitle: d.aboutUsTitle || 'About Us',
                    aboutUsContent: d.aboutUsContent || '',
                    aboutUsEnabled: d.aboutUsEnabled !== false,
                    shippingPolicyContent: d.shippingPolicyContent || '',
                    contactEmail: d.contactEmail || '',
                    contactPhone: d.contactPhone || '',
                    contactAddress: d.contactAddress || '',
                })
            })
            .catch(() => toast.error('Failed to load footer'))
            .finally(() => setLoading(false))
    }, [])

    const save = async () => {
        setSaving(true)
        const payload = {
            id: 1,
            brandName: form.brandName,
            tagline: form.tagline,
            copyrightText: form.copyrightText,
            shopLinksJson: JSON.stringify(form.shopLinks.filter(l => l.label)),
            accountLinksJson: JSON.stringify(form.accountLinks.filter(l => l.label)),
            clientCareLinksJson: JSON.stringify(form.clientCareLinks.filter(l => l.label)),
            socialLinksJson: JSON.stringify(form.socialLinks.filter(l => l.url)),
            aboutUsTitle: form.aboutUsTitle,
            aboutUsContent: form.aboutUsContent,
            aboutUsEnabled: form.aboutUsEnabled,
            shippingPolicyContent: form.shippingPolicyContent,
            contactEmail: form.contactEmail,
            contactPhone: form.contactPhone,
            contactAddress: form.contactAddress,
        }
        try {
            await api.put('/admin/site/footer', payload)
            toast.success('Footer updated')
        } catch {
            toast.error('Save failed')
        } finally { setSaving(false) }
    }

    if (loading) return <div className="text-sm text-muted">Loading…</div>

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-serif text-fg">Footer</h1>
                <p className="text-xs text-muted mt-1">Edit the site-wide footer. Changes appear instantly on the storefront.</p>
            </div>

            <div className="space-y-6">
                <section className="card p-6 space-y-4">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Brand</h2>
                    <div>
                        <label className="label-field">Brand Name</label>
                        <input value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })} className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Tagline</label>
                        <textarea rows="2" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className="input-field resize-none" />
                    </div>
                    <div>
                        <label className="label-field">Copyright Text (blank = auto)</label>
                        <input value={form.copyrightText} onChange={e => setForm({ ...form, copyrightText: e.target.value })} className="input-field" />
                    </div>
                </section>

                <section className="card p-6 space-y-4">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Contact Information</h2>
                    <div>
                        <label className="label-field">Email</label>
                        <input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Phone Number</label>
                        <input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Address</label>
                        <input value={form.contactAddress} onChange={e => setForm({ ...form, contactAddress: e.target.value })} className="input-field" />
                    </div>
                </section>

                <section className="card p-6 space-y-4">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">About Us Panel</h2>
                    <div>
                        <label className="label-field">Title</label>
                        <input value={form.aboutUsTitle} onChange={e => setForm({ ...form, aboutUsTitle: e.target.value })} className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Content (blank line = new paragraph)</label>
                        <textarea rows="10" value={form.aboutUsContent} onChange={e => setForm({ ...form, aboutUsContent: e.target.value })} className="input-field resize-none text-sm leading-relaxed" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.aboutUsEnabled} onChange={e => setForm({ ...form, aboutUsEnabled: e.target.checked })} className="w-4 h-4 accent-black dark:accent-white" />
                        <span className="text-xs uppercase tracking-widest2 text-fg">Show "About Us" link in footer</span>
                    </label>
                </section>

                <section className="card p-6 space-y-4">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Shipping & Returns Policy</h2>
                    <div>
                        <label className="label-field">Content (blank line = new paragraph)</label>
                        <textarea rows="8" value={form.shippingPolicyContent} onChange={e => setForm({ ...form, shippingPolicyContent: e.target.value })} className="input-field resize-none text-sm leading-relaxed" />
                    </div>
                </section>

                {/* Passing form and setForm as props to the extracted components */}
                <SocialEditor form={form} setForm={setForm} />
                <LinkEditor title="Shop Column" field="shopLinks" form={form} setForm={setForm} />
                <LinkEditor title="Account Column" field="accountLinks" form={form} setForm={setForm} />
                <LinkEditor title="Client Care Column" field="clientCareLinks" form={form} setForm={setForm} />

                <button onClick={save} disabled={saving} className="btn-primary" type="button">
                    {saving ? 'Saving…' : 'Save Footer'}
                </button>
            </div>
        </div>
    )
}
