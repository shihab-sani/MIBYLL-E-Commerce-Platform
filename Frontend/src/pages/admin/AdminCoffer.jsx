import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import ImageUploader from '../../components/ImageUploader'

// 1. Removed displayOrder from empty state
const empty = { year: '', title: '', description: '', imageUrl: '' }

export default function AdminCoffer() {
    const [entries, setEntries] = useState([])
    const [form, setForm] = useState(empty)
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        api.get('/admin/coffer').then(r => setEntries(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
    }
    useEffect(load, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        try {
            if (editingId) await api.put(`/admin/coffer/${editingId}`, form)
            else await api.post('/admin/coffer', form)
            toast.success('Saved successfully')
            setForm(empty); setEditingId(null); load()
        } catch { toast.error('Failed to save') }
    }

    const edit = (c) => {
        setEditingId(c.id)
        // 2. Removed displayOrder from edit logic
        setForm({ year: c.year, title: c.title, description: c.description || '', imageUrl: c.imageUrl || '' })
        document.getElementById('admin-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const remove = async (id) => {
        if (!confirm('Delete this entry?')) return
        await api.delete(`/admin/coffer/${id}`)
        toast.success('Deleted')
        load()
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-serif text-fg">Coffer (Heritage Timeline)</h1>
                <p className="text-xs text-muted mt-1">Manage the brand's history shown on the storefront.</p>
            </div>

            <form onSubmit={submit} className="card p-6 space-y-5">
                <h2 className="text-[11px] uppercase tracking-widest2 text-fg">{editingId ? 'Edit Entry' : 'New Entry'}</h2>
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label-field">Year *</label>
                        <input required value={form.year} onChange={e => set('year', e.target.value)} className="input-field" placeholder="1942" />
                    </div>
                    {/* 3. Removed the Display Order input field */}
                    <div className="md:col-span-2">
                        <label className="label-field">Title *</label>
                        <input required value={form.title} onChange={e => set('title', e.target.value)} className="input-field" placeholder="Harry Winston moves to 7 East 51st Street" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label-field">Description</label>
                        <textarea rows="4" value={form.description} onChange={e => set('description', e.target.value)} className="input-field resize-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label-field">Historical Image</label>
                        <ImageUploader value={form.imageUrl ? [form.imageUrl] : []} onChange={urls => set('imageUrl', urls[0] || '')} multiple={false} />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="btn-primary">Save Entry</button>
                    {editingId && <button type="button" onClick={() => { setForm(empty); setEditingId(null) }} className="btn-outline">Cancel</button>}
                </div>
            </form>

            {loading ? <p className="text-sm text-muted">Loading...</p> : (
                <div className="space-y-3">
                    {entries.map(c => (
                        <div key={c.id} className="card p-4 flex items-center gap-4">
                            <div className="w-16 h-20 bg-sand shrink-0 overflow-hidden">
                                {c.imageUrl && <img src={c.imageUrl} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-serif text-fg">{c.year} — {c.title}</p>
                                <p className="text-xs text-muted truncate max-w-md">{c.description}</p>
                            </div>
                            <button onClick={() => edit(c)} className="text-[10px] uppercase text-fg hover:underline">Edit</button>
                            <button onClick={() => remove(c.id)} className="text-[10px] uppercase text-red-500 hover:underline">Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
