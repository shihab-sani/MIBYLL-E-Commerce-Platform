import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const emptyLink = { label: '', href: '' }

export default function FooterEditor() {
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({
        brandName: '',
        tagline: '',
        copyrightText: '',
        shopLinks: [],
        accountLinks: [],
        clientCareLinks: [],
    })

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
                })
            })
            .catch(() => toast.error('Failed to load footer'))
            .finally(() => setLoading(false))
    }, [])

    function parse(json) {
        try { return JSON.parse(json || '[]') } catch { return [] }
    }

    const save = async (e) => {
        e.preventDefault()
        setSaving(true)
        const payload = {
            id: 1,
            brandName: form.brandName,
            tagline: form.tagline,
            copyrightText: form.copyrightText,
            shopLinksJson: JSON.stringify(form.shopLinks.filter(l => l.label)),
            accountLinksJson: JSON.stringify(form.accountLinks.filter(l => l.label)),
            clientCareLinksJson: JSON.stringify(form.clientCareLinks.filter(l => l.label)),
        }
        try {
            await api.put('/admin/site/footer', payload)
            toast.success('Footer updated')
        } catch {
            toast.error('Save failed')
        } finally { setSaving(false) }
    }

    const LinkEditor = ({ title, field }) => (
        <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-[11px] uppercase tracking-widest2 text-fg">{title}</h3>
                <button type="button"
                        onClick={() => setForm(f => ({ ...f, [field]: [...f[field], { ...emptyLink }] }))}
                        className="text-[10px] uppercase tracking-widest2 text-fg hover:underline">
                    + Add Link
                </button>
            </div>
            <div className="space-y-2">
                {form[field].map((l, i) => (
                    <div key={i} className="flex gap-2">
                        <input value={l.label} placeholder="Label"
                               onChange={e => {
                                   const copy = [...form[field]]
                                   copy[i] = { ...copy[i], label: e.target.value }
                                   setForm(f => ({ ...f, [field]: copy }))
                               }}
                               className="input-field flex-1" />
                        <input value={l.href} placeholder="/shop or https://…"
                               onChange={e => {
                                   const copy = [...form[field]]
                                   copy[i] = { ...copy[i], href: e.target.value }
                                   setForm(f => ({ ...f, [field]: copy }))
                               }}
                               className="input-field flex-1 font-mono text-xs" />
                        <button type="button"
                                onClick={() => {
                                    const copy = form[field].filter((_, j) => j !== i)
                                    setForm(f => ({ ...f, [field]: copy }))
                                }}
                                className="px-3 text-red-600 text-xs">✕</button>
                    </div>
                ))}
                {form[field].length === 0 && (
                    <p className="text-[10px] text-muted">No links. Click "+ Add Link".</p>
                )}
            </div>
        </div>
    )

    if (loading) return <div className="text-sm text-muted">Loading…</div>

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-serif text-fg">Footer</h1>
                <p className="text-xs text-muted mt-1">
                    Edit the site-wide footer. Changes appear instantly on the storefront.
                </p>
            </div>

            <form onSubmit={save} className="space-y-6">
                <section className="card p-6 space-y-4">
                    <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Brand</h2>
                    <div>
                        <label className="label-field">Brand Name</label>
                        <input value={form.brandName}
                               onChange={e => setForm({ ...form, brandName: e.target.value })}
                               className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Tagline</label>
                        <textarea rows="2" value={form.tagline}
                                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                                  className="input-field resize-none" />
                    </div>
                    <div>
                        <label className="label-field">Copyright Text (optional — auto-generated if blank)</label>
                        <input value={form.copyrightText}
                               onChange={e => setForm({ ...form, copyrightText: e.target.value })}
                               className="input-field" />
                    </div>
                </section>

                <LinkEditor title="Shop Column" field="shopLinks" />
                <LinkEditor title="Account Column" field="accountLinks" />
                <LinkEditor title="Client Care Column" field="clientCareLinks" />

                <button disabled={saving} className="btn-primary">
                    {saving ? 'Saving…' : 'Save Footer'}
                </button>
            </form>
        </div>
    )
}
