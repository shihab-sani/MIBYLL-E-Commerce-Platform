import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { COUNTRIES, COUNTRY_CITIES } from '../../data/locations' // NEW IMPORT

export default function AdminProfile() {
    const { refreshProfile, user } = useAuth()
    const [form, setForm] = useState({
        fullName: '', email: '', phone: '', address: '',
        country: 'BD', city: '', zipCode: ''
    })
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [changing, setChanging] = useState(false)

    useEffect(() => {
        api.get('/auth/me')
            .then(r => setForm({
                fullName: r.data.fullName || '',
                email: r.data.email || '',
                phone: r.data.phone || '',
                address: r.data.address || '',
                country: r.data.country || 'BD',
                city: r.data.city || '',
                zipCode: r.data.zipCode || ''
            }))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const save = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put('/auth/me', form)
            await refreshProfile()
            toast.success('Profile updated')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed')
        } finally { setSaving(false) }
    }

    const changePwd = async (e) => {
        e.preventDefault()
        if (pwd.newPassword !== pwd.confirmPassword) { toast.error('Passwords do not match'); return }
        if (pwd.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
        setChanging(true)
        try {
            await api.put('/auth/me', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
            setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
            toast.success('Password changed')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password change failed')
        } finally { setChanging(false) }
    }

    if (loading) return <div className="text-sm text-muted">Loading…</div>

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-fg">My Account</h1>
                <p className="text-xs text-muted mt-1">Signed in as <span className="text-fg">{user?.email}</span></p>
            </div>

            <form onSubmit={save} className="card p-6 space-y-5">
                <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Profile</h2>
                <div>
                    <label className="label-field">Full Name</label>
                    <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input-field" />
                </div>
                <div>
                    <label className="label-field">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
                </div>
                <div>
                    <label className="label-field">Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
                <div>
                    <label className="label-field">Address</label>
                    <textarea rows="3" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label-field">Country</label>
                        <select
                            value={form.country}
                            onChange={e => setForm({ ...form, country: e.target.value, city: '' })} // Reset city on country change
                            className="input-field"
                        >
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label-field">City</label>
                        <select
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
                            className="input-field"
                        >
                            <option value="">Select City</option>
                            {(COUNTRY_CITIES[form.country] || []).map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="label-field">Zip Code</label>
                    <input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} className="input-field" />
                </div>

                <button disabled={saving} className="btn-primary">
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </form>

            <form onSubmit={changePwd} className="card p-6 space-y-5">
                <h2 className="text-[11px] uppercase tracking-widest2 text-fg">Change Password</h2>
                <div>
                    <label className="label-field">Current Password</label>
                    <input type="password" value={pwd.currentPassword} onChange={e => setPwd({ ...pwd, currentPassword: e.target.value })} className="input-field" />
                </div>
                <div>
                    <label className="label-field">New Password</label>
                    <input type="password" value={pwd.newPassword} onChange={e => setPwd({ ...pwd, newPassword: e.target.value })} className="input-field" />
                </div>
                <div>
                    <label className="label-field">Confirm New Password</label>
                    <input type="password" value={pwd.confirmPassword} onChange={e => setPwd({ ...pwd, confirmPassword: e.target.value })} className="input-field" />
                </div>
                <button disabled={changing} className="btn-primary">
                    {changing ? 'Updating…' : 'Update Password'}
                </button>
            </form>
        </div>
    )
}
