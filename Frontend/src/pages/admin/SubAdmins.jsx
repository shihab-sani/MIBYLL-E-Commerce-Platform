import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function SubAdmins() {
    const { isAdmin } = useAuth()
    const [subs, setSubs] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
    const [saving, setSaving] = useState(false)

    const load = () => {
        setLoading(true)
        api.get('/admin/users').then(r => setSubs(r.data)).catch(() => {})
            .finally(() => setLoading(false))
    }
    useEffect(load, [])

    if (!isAdmin) {
        return (
            <div className="card p-8 text-center">
                <p className="text-sm text-fg">Only the primary admin can manage sub-admins.</p>
            </div>
        )
    }

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/admin/users', form)
            toast.success('Sub-admin created')
            setForm({ fullName: '', email: '', password: '', phone: '' })
            load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Create failed')
        } finally { setSaving(false) }
    }

    const remove = async (u) => {
        if (!confirm(`Delete sub-admin "${u.email}"?`)) return
        try {
            await api.delete(`/admin/users/${u.id}`)
            toast.success('Sub-admin deleted')
            load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed')
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">Sub-Admins</h1>
                <p className="text-xs text-muted mt-1">
                    Give trusted staff limited admin access. Their actions are recorded in the audit log.
                </p>
            </div>

            <form onSubmit={submit} className="card p-6 space-y-5 max-w-2xl">
                <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Create Sub-Admin</h2>
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="label-field">Full Name *</label>
                        <input required value={form.fullName}
                               onChange={e => setForm({ ...form, fullName: e.target.value })}
                               className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Email *</label>
                        <input type="email" required value={form.email}
                               onChange={e => setForm({ ...form, email: e.target.value })}
                               className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Phone</label>
                        <input value={form.phone}
                               onChange={e => setForm({ ...form, phone: e.target.value })}
                               className="input-field" />
                    </div>
                    <div>
                        <label className="label-field">Password * (min 6)</label>
                        <input type="password" required minLength={6} value={form.password}
                               onChange={e => setForm({ ...form, password: e.target.value })}
                               className="input-field" />
                    </div>
                </div>
                <button disabled={saving} className="btn-primary">
                    {saving ? 'Creating…' : 'Create Sub-Admin'}
                </button>
            </form>

            <div className="card overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                    <tr className="text-left text-[9px] uppercase tracking-widest2 text-muted border-b border-c">
                        <th className="px-5 py-3">Name</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Phone</th>
                        <th className="px-5 py-3">Joined</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="px-5 py-10 text-center text-xs text-muted">Loading…</td></tr>
                    ) : subs.length === 0 ? (
                        <tr><td colSpan="5" className="px-5 py-10 text-center text-xs text-muted">No sub-admins yet</td></tr>
                    ) : subs.map(u => (
                        <tr key={u.id} className="border-b border-c last:border-0">
                            <td className="px-5 py-4 text-fg">{u.fullName}</td>
                            <td className="px-5 py-4 text-muted">{u.email}</td>
                            <td className="px-5 py-4 text-muted">{u.phone || '—'}</td>
                            <td className="px-5 py-4 text-muted">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-5 py-4 text-right">
                                <button onClick={() => remove(u)}
                                        className="text-[10px] uppercase tracking-widest2 text-red-600 hover:underline">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}