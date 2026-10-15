import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import ImageUploader from '../../components/ImageUploader'

const empty = { name: '', slug: '', description: '', images: [] }

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [form, setForm] = useState(empty)
    const [editingId, setEditingId] = useState(null)
    const [saving, setSaving] = useState(false)

    const load = () => api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    useEffect(() => { load() }, [])

    const reset = () => { setForm(empty); setEditingId(null) }

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        const payload = {
            name: form.name,
            slug: form.slug || null,
            description: form.description,
            imageUrl: form.images[0] || null,
        }
        try {
            if (editingId) {
                await api.put(`/admin/categories/${editingId}`, payload)
                toast.success('Category updated')
            } else {
                await api.post('/admin/categories', payload)
                toast.success('Category created')
            }
            reset(); load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed')
        } finally { setSaving(false) }
    }

    const edit = (c) => {
        setEditingId(c.id)
        setForm({
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            images: c.imageUrl ? [c.imageUrl] : [],
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const remove = async (c) => {
        if (!confirm(`Delete category "${c.name}"?`)) return
        try {
            await api.delete(`/admin/categories/${c.id}`)
            toast.success('Category deleted')
            load()
        } catch { toast.error('Delete failed — category may be in use') }
    }

    const borderColor = { borderColor: 'rgb(var(--cbord))' }
    const surfaceBg   = { background: 'rgb(var(--surface))' }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">Categories</h1>
                <p className="text-xs text-muted mt-1">Organise your catalogue</p>
            </div>

            <form onSubmit={submit} className="border p-6 space-y-5 max-w-2xl"
                  style={{ ...surfaceBg, ...borderColor }}>
                <h2 className="text-[11px] uppercase tracking-widest2 text-fg">
                    {editingId ? 'Edit Category' : 'New Category'}
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label-field">Name *</label>
                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                               className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Slug (optional)</label>
                        <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                               className="input-field" placeholder="auto" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label-field">Description</label>
                        <textarea rows="2" value={form.description}
                                  onChange={e => setForm({ ...form, description: e.target.value })}
                                  className="input-field resize-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label-field">Category Image</label>
                        <ImageUploader
                            value={form.images}
                            onChange={(imgs) => setForm({ ...form, images: imgs })}
                            multiple={false}
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button disabled={saving} className="btn-primary">
                        {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={reset} className="btn-outline">Cancel</button>
                    )}
                </div>
            </form>

            <div className="border overflow-x-auto" style={{ ...surfaceBg, ...borderColor }}>
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                    <tr className="text-left text-[9px] uppercase tracking-widest2 text-muted border-b" style={borderColor}>
                        <th className="px-5 py-3">Image</th>
                        <th className="px-5 py-3">Name</th>
                        <th className="px-5 py-3">Slug</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categories.map(c => (
                        <tr key={c.id} className="border-b last:border-0" style={borderColor}>
                            <td className="px-5 py-4">
                                <div className="w-14 h-10 bg-sand overflow-hidden">
                                    {c.imageUrl && <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />}
                                </div>
                            </td>
                            <td className="px-5 py-4 text-fg">{c.name}</td>
                            <td className="px-5 py-4 text-muted font-mono text-xs">{c.slug}</td>
                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                <button onClick={() => edit(c)}
                                        className="text-[10px] uppercase tracking-widest2 text-fg hover:underline mr-4">Edit</button>
                                <button onClick={() => remove(c)}
                                        className="text-[10px] uppercase tracking-widest2 text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                    {categories.length === 0 && (
                        <tr><td colSpan="4" className="px-5 py-10 text-center text-xs text-muted">No categories</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}