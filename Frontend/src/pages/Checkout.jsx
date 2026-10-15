import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
    const { cart, fetchCart } = useCart()
    const { user, refreshProfile } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        shippingAddress: user?.address || '',
        phone: user?.phone || '',
        paymentMethod: 'COD',
    })
    const [submitting, setSubmitting] = useState(false)

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        if (cart.items.length === 0) { toast.error('Your bag is empty'); return }
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

    return (
        <div className="max-w-[1300px] mx-auto px-5 lg:px-10 py-12 lg:py-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-12">Checkout</h1>

            <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-12">
                <div className="space-y-10">
                    <section>
                        <h2 className="text-[11px] uppercase tracking-widest2 mb-6 pb-3 border-b border-neutral-200">
                            Shipping Details
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="label-field">Full Name</label>
                                <input value={user?.fullName || ''} disabled className="input-field bg-neutral-50" />
                            </div>

                            <div>
                                <label className="label-field">Shipping Address *</label>
                                <textarea rows="3" required value={form.shippingAddress}
                                          onChange={e => set('shippingAddress', e.target.value)}
                                          placeholder="Street, city, postal code, country"
                                          className="input-field resize-none" />
                            </div>

                            <div>
                                <label className="label-field">Phone *</label>
                                <input required value={form.phone} onChange={e => set('phone', e.target.value)}
                                       placeholder="+880 1XXX XXXXXX" className="input-field" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[11px] uppercase tracking-widest2 mb-6 pb-3 border-b border-neutral-200">
                            Payment Method
                        </h2>
                        <div className="space-y-3">
                            {[
                                { v: 'COD', l: 'Cash on Delivery' },
                                { v: 'CARD', l: 'Credit / Debit Card (demo)' },
                            ].map(opt => (
                                <label key={opt.v}
                                       className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors
                         ${form.paymentMethod === opt.v ? 'border-ink' : 'border-neutral-300'}`}>
                                    <input type="radio" name="payment" value={opt.v}
                                           checked={form.paymentMethod === opt.v}
                                           onChange={e => set('paymentMethod', e.target.value)}
                                           className="accent-black" />
                                    <span className="text-sm">{opt.l}</span>
                                </label>
                            ))}
                        </div>
                    </section>
                </div>

                {/* SUMMARY */}
                <aside className="lg:sticky lg:top-28 self-start bg-white border border-neutral-200 p-7">
                    <h2 className="text-[11px] uppercase tracking-widest2 mb-7">Your Order</h2>

                    <div className="space-y-5 max-h-72 overflow-y-auto pr-1">
                        {cart.items.map(i => (
                            <div key={i.id} className="flex gap-4">
                                <div className="w-14 h-20 bg-sand shrink-0 overflow-hidden">
                                    {i.imageUrl && <img src={i.imageUrl} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 text-xs">
                                    <p className="leading-snug">{i.productName}</p>
                                    <p className="text-neutral-500 mt-1">
                                        {i.size && `Size ${i.size} · `}Qty {i.quantity}
                                    </p>
                                    <p className="mt-1">${i.lineTotal}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-neutral-200 mt-6 pt-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Subtotal</span><span>${cart.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Shipping</span><span>Free</span>
                        </div>
                    </div>

                    <div className="border-t border-neutral-200 mt-6 pt-6 flex justify-between">
                        <span className="text-[11px] uppercase tracking-widest2">Total</span>
                        <span className="font-medium">${cart.subtotal}</span>
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary w-full mt-8">
                        {submitting ? 'Placing order…' : 'Place Order'}
                    </button>
                </aside>
            </form>
        </div>
    )
}