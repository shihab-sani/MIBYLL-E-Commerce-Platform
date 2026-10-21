import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLocalization } from '../context/LocalizationContext'
import { COUNTRIES, COUNTRY_CITIES } from '../data/locations' // NEW IMPORT

export default function Checkout() {
    const { cart, fetchCart } = useCart()
    const { user, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const { formatPrice } = useLocalization()

    const [form, setForm] = useState({
        shippingAddress: user?.address || '',
        phone: user?.phone || '',
        paymentMethod: 'COD',
        country: user?.country || 'BD',
        city: user?.city || '',
        zipCode: user?.zipCode || '',
    })

    const [storeInfo, setStoreInfo] = useState({
        adminCountry: 'BD',
        adminCity: 'Dhaka',
        localRate: 60,
        domesticRate: 120,
        internationalRate: 3500
    })

    const [submitting, setSubmitting] = useState(false)
    const [shippingCost, setShippingCost] = useState(0)

    useEffect(() => {
        api.get('/site/store-info').then(r => setStoreInfo(r.data)).catch(() => {})
    }, [])

    useEffect(() => {
        if (form.country !== storeInfo.adminCountry) {
            setShippingCost(storeInfo.internationalRate)
        } else if (form.city.trim().toLowerCase() !== storeInfo.adminCity.trim().toLowerCase()) {
            setShippingCost(storeInfo.domesticRate)
        } else {
            setShippingCost(storeInfo.localRate)
        }
    }, [form.country, form.city, storeInfo])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        if (cart.items.length === 0) { toast.error('Your bag is empty'); return }
        if (!form.city.trim()) { toast.error('City is required'); return }

        setSubmitting(true)
        try {
            await api.post('/orders', form)
            await fetchCart()
            await refreshProfile()
            toast.success('Order placed successfully')
            navigate('/orders')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not place order')
        } finally { setSubmitting(false) }
    }

    if (cart.items.length === 0) {
        return (
            <div className="py-40 text-center">
                <h1 className="text-3xl font-serif mb-4">Nothing to check out</h1>
                <button onClick={() => navigate('/shop')} className="btn-primary">Back to Shop</button>
            </div>
        )
    }

    const finalTotal = Number(cart.subtotal) + Number(shippingCost)

    return (
        <div className="max-w-[1300px] mx-auto px-5 lg:px-10 py-12 lg:py-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-12">Checkout</h1>

            <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-12">
                <div className="space-y-10">
                    <section>
                        <h2 className="text-[11px] uppercase tracking-widest2 mb-6 pb-3 border-b border-c">Shipping Details</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="label-field">Full Name</label>
                                <input value={user?.fullName || ''} disabled className="input-field opacity-50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-field">Country *</label>
                                    <select
                                        value={form.country}
                                        onChange={e => {
                                            set('country', e.target.value)
                                            set('city', '') // Reset city
                                        }}
                                        className="input-field"
                                    >
                                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-field">City *</label>
                                    <select
                                        required
                                        value={form.city}
                                        onChange={e => set('city', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Select City</option>
                                        {(COUNTRY_CITIES[form.country] || []).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-field">Zip Code</label>
                                    <input value={form.zipCode} onChange={e => set('zipCode', e.target.value)} className="input-field" />
                                </div>
                                <div>
                                    <label className="label-field">Phone *</label>
                                    <input required value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" />
                                </div>
                            </div>

                            <div>
                                <label className="label-field">Street Address *</label>
                                <textarea rows="2" required value={form.shippingAddress}
                                          onChange={e => set('shippingAddress', e.target.value)}
                                          className="input-field resize-none" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[11px] uppercase tracking-widest2 mb-6 pb-3 border-b border-c">Payment Method</h2>
                        <div className="space-y-3">
                            {[{ v: 'COD', l: 'Cash on Delivery' }].map(opt => (
                                <label key={opt.v} className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors
                         ${form.paymentMethod === opt.v ? 'border-fg' : 'border-c'}`}>
                                    <input type="radio" name="payment" value={opt.v} checked={form.paymentMethod === opt.v}
                                           onChange={e => set('paymentMethod', e.target.value)} className="accent-black" />
                                    <span className="text-sm">{opt.l}</span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="lg:sticky lg:top-28 self-start card p-7">
                    <h2 className="text-[11px] uppercase tracking-widest2 mb-7">Your Order</h2>
                    <div className="space-y-5 max-h-72 overflow-y-auto pr-1">
                        {cart.items.map(i => (
                            <div key={i.id} className="flex gap-4">
                                <div className="w-14 h-20 bg-sand shrink-0 overflow-hidden">
                                    {i.imageUrl && <img src={i.imageUrl} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 text-xs">
                                    <p className="leading-snug">{i.productName}</p>
                                    <p className="text-muted mt-1">{i.size && `Size ${i.size} · `}Qty {i.quantity}</p>
                                    <p className="mt-1">{formatPrice(i.lineTotal)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-c mt-6 pt-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted">Subtotal</span>
                            <span>{formatPrice(cart.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Shipping</span>
                            <span>{formatPrice(shippingCost)}</span>
                        </div>
                    </div>

                    <div className="border-t border-c mt-6 pt-6 flex justify-between font-medium">
                        <span className="text-[11px] uppercase tracking-widest2">Total</span>
                        <span>{formatPrice(finalTotal)}</span>
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary w-full mt-8">
                        {submitting ? 'Placing order…' : 'Place Order'}
                    </button>
                </aside>
            </form>
        </div>
    )
}
