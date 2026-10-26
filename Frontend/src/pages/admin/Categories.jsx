import { Fragment } from 'react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import ImageUploader from '../../components/ImageUploader'

const empty = { name: '', slug: '', description: '', images: [], parentId: '' }

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
            parentId: form.parentId || null,
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
            parentId: c.parentId || '',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const move = async (c, direction) => {
        try {
            await api.patch(`/admin/categories/${c.id}/move?direction=${direction}`)
            load()
        } catch {
            toast.error('Failed to move category')
        }
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

    // Find the currently editing category to check if it has children
    const editingCategory = categories.find(c => c.id === editingId)
    const hasSubcategories = editingCategory?.subcategories?.length > 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">Categories</h1>
                <p className="text-xs text-muted mt-1">Organise your catalogue into main categories and subcategories.</p>
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
                        <label className="label-field">Parent Category (Leave blank for Main Category)</label>
                        <select
                            value={form.parentId}
                            onChange={e => setForm({ ...form, parentId: e.target.value })}
                            className="input-field"
                            disabled={hasSubcategories} // Prevent making a main category into a subcategory if it has children
                        >
                            <option value="">— None (Main Category) —</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {hasSubcategories && (
                            <p className="text-[10px] text-amber-500 mt-1">
                                This category has subcategories and cannot be moved.
                            </p>
                        )}
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

            {/* LIST (Nested) */}
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
                        <Fragment key={c.id}>
                            {/* Main Category Row */}
                            <tr className="border-b last:border-0 bg-cbord/5" style={borderColor}>
                                <td className="px-5 py-4">
                                    <div className="w-14 h-10 bg-sand overflow-hidden">
                                        {c.imageUrl && <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-fg font-medium">{c.name}</td>
                                <td className="px-5 py-4 text-muted font-mono text-xs">{c.slug}</td>
                                <td className="px-5 py-4 text-right whitespace-nowrap flex justify-end items-center gap-4">
                                    <div className="flex border border-c">
                                        <button onClick={() => move(c, -1)} className="w-6 h-6 border-r border-c hover:bg-cbord/20 flex items-center justify-center text-xs text-fg">↑</button>
                                        <button onClick={() => move(c, 1)} className="w-6 h-6 hover:bg-cbord/20 flex items-center justify-center text-xs text-fg">↓</button>
                                    </div>
                                    <button onClick={() => edit(c)} className="text-[10px] uppercase tracking-widest2 text-fg hover:underline">Edit</button>
                                    <button onClick={() => remove(c)} className="text-[10px] uppercase tracking-widest2 text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>

                            {/* Subcategory Rows */}
                            {c.subcategories?.map(sub => (
                                <tr key={sub.id} className="border-b last:border-0" style={borderColor}>
                                    <td className="px-5 py-3 pl-12">
                                        <div className="w-10 h-8 bg-sand overflow-hidden">
                                            {sub.imageUrl && <img src={sub.imageUrl} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-muted text-sm pl-12">
                                        <span className="text-[10px] mr-2">↳</span> {sub.name}
                                    </td>
                                    <td className="px-5 py-3 text-muted font-mono text-xs">{sub.slug}</td>
                                    <td className="px-5 py-3 text-right whitespace-nowrap flex justify-end items-center gap-4">
                                        <div className="flex border border-c">
                                            <button onClick={() => move(sub, -1)} className="w-6 h-6 border-r border-c hover:bg-cbord/20 flex items-center justify-center text-xs text-fg">↑</button>
                                            <button onClick={() => move(sub, 1)} className="w-6 h-6 hover:bg-cbord/20 flex items-center justify-center text-xs text-fg">↓</button>
                                        </div>
                                        <button onClick={() => edit(sub)} className="text-[10px] uppercase tracking-widest2 text-fg hover:underline">Edit</button>
                                        <button onClick={() => remove(sub)} className="text-[10px] uppercase tracking-widest2 text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </Fragment>
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
