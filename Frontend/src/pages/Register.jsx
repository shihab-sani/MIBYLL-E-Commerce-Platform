import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        fullName: '', email: '', password: '', phone: '', address: ''
    })
    const [loading, setLoading] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        if (!form.address.trim()) { toast.error('Address is required'); return }
        setLoading(true)
        try {
            await register(form)
            toast.success('Account created')
            navigate('/', { replace: true })
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).join(', ')
                : err.response?.data?.message || 'Registration failed'
            toast.error(msg)
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif mb-3 text-fg">Create Account</h1>
                    <p className="text-xs text-muted">Join the MIBYLL Community</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="label-field">Full Name *</label>
                        <input required value={form.fullName}
                               onChange={e => setForm({ ...form, fullName: e.target.value })}
                               className="input-field" placeholder="Jane Doe" />
                    </div>
                    <div>
                        <label className="label-field">Email *</label>
                        <input type="email" required value={form.email}
                               onChange={e => setForm({ ...form, email: e.target.value })}
                               className="input-field" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="label-field">Phone (optional)</label>
                        <input value={form.phone}
                               onChange={e => setForm({ ...form, phone: e.target.value })}
                               className="input-field" placeholder="+880 1XXX XXXXXX" />
                    </div>
                    <div>
                        <label className="label-field">Address *</label>
                        <textarea required rows="3" value={form.address}
                                  onChange={e => setForm({ ...form, address: e.target.value })}
                                  className="input-field resize-none"
                                  placeholder="Street, city, postal code, country" />
                    </div>
                    <div>
                        <label className="label-field">Password *</label>
                        <input type="password" required minLength={6} value={form.password}
                               onChange={e => setForm({ ...form, password: e.target.value })}
                               className="input-field" placeholder="Minimum 6 characters" />
                    </div>

                    <button disabled={loading} className="btn-primary w-full mt-2">
                        {loading ? 'Creating…' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-xs text-muted mt-8">
                    Already have an account?{' '}
                    <Link to="/login" className="text-fg underline">Sign in</Link>
                </p>
            </div>
        </div>
    )
}