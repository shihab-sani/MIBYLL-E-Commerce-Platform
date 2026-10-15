import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from || '/'

    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = await login(form.email, form.password)
            toast.success(`Welcome back, ${data.fullName.split(' ')[0]}`)
            navigate(data.role === 'ROLE_ADMIN' ? '/admin' : from, { replace: true })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed')
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif mb-3">Welcome Back</h1>
                    <p className="text-xs text-neutral-500">Sign in to your account</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="label-field">Email</label>
                        <input type="email" required value={form.email}
                               onChange={e => setForm({ ...form, email: e.target.value })}
                               className="input-field" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="label-field">Password</label>
                        <input type="password" required value={form.password}
                               onChange={e => setForm({ ...form, password: e.target.value })}
                               className="input-field" placeholder="••••••••" />
                    </div>

                    <button disabled={loading} className="btn-primary w-full mt-2">
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-xs text-neutral-500 mt-8">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="text-ink underline">Create one</Link>
                </p>
            </div>
        </div>
    )
}