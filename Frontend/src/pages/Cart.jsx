import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLocalization } from '../context/LocalizationContext'

export default function Cart() {
    const { cart, updateItem, removeItem, loading } = useCart()
    const { isAuthenticated } = useAuth()
    const { formatPrice } = useLocalization()
    const navigate = useNavigate()

    const handleCheckout = () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to checkout')
            navigate('/login', { state: { from: '/checkout' } })
            return
        }
        navigate('/checkout')
    }

    if (!isAuthenticated) {
        return (
            <div className="py-40 text-center px-5">
                <h1 className="text-4xl font-serif mb-5">Your Bag</h1>
                <p className="text-sm text-neutral-500 mb-8">Sign in to view your bag.</p>
                <Link to="/login" className="btn-primary">Sign In</Link>
            </div>
        )
    }

    if (loading && cart.items.length === 0) {
        return <div className="py-40 text-center text-sm text-neutral-500">Loading…</div>
    }

    if (cart.items.length === 0) {
        return (
            <div className="py-40 text-center px-5">
                <h1 className="text-4xl font-serif mb-5">Your Bag</h1>
                <p className="text-sm text-neutral-500 mb-8">Your bag is empty.</p>
                <Link to="/shop" className="btn-primary">Continue Shopping</Link>
            </div>
        )
    }

    return (
        <div className="max-w-[1300px] mx-auto px-5 lg:px-10 py-12 lg:py-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-12">Your Bag</h1>

            <div className="grid lg:grid-cols-[1fr_380px] gap-12">
                {/* ITEMS */}
                <div className="divide-y divide-neutral-200">
                    {cart.items.map((item) => (
                        <div key={item.id} className="py-6 flex gap-5">
                            <Link to={`/product/${item.slug}`} className="w-24 sm:w-32 shrink-0 bg-sand aspect-[3/4] overflow-hidden">
                                {item.imageUrl
                                    ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full" />}
                            </Link>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between gap-4">
                                        <Link to={`/product/${item.slug}`} className="text-sm font-medium hover:opacity-60">
                                            {item.productName}
                                        </Link>
                                        <span className="text-sm whitespace-nowrap">{formatPrice(item.lineTotal)}</span>
                                    </div>
                                    {item.size && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] text-muted uppercase tracking-widest2">Size:</span>
                                            <select
                                                value={item.size}
                                                onChange={(e) => updateItem(item.id, item.quantity, e.target.value)}
                                                className="text-xs bg-transparent border border-neutral-300 dark:border-neutral-700 px-2 py-1 outline-none cursor-pointer hover:border-ink transition-colors"
                                            >
                                                {['XS', 'S', 'M', 'L', 'XL'].map(s => (
                                                    <option key={s} value={s} className="bg-surface text-fg">{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <p className="text-xs text-neutral-500 mt-1">{formatPrice(item.unitPrice)} each</p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="inline-flex items-center border border-neutral-300">
                                        <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                                                className="w-9 h-9 hover:bg-neutral-100 text-sm">−</button>
                                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => {
                                                if (item.quantity >= item.stockQuantity) {
                                                    toast.error('No more stock available')
                                                    return
                                                }
                                                updateItem(item.id, item.quantity + 1)
                                            }}
                                            className="w-9 h-9 hover:bg-neutral-100 text-sm">+</button>
                                    </div>

                                    <button onClick={() => removeItem(item.id)}
                                            className="text-[10px] uppercase tracking-widest2 text-neutral-500 hover:text-ink underline">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SUMMARY */}
                <aside className="lg:sticky lg:top-28 self-start bg-white border border-neutral-200 p-7">
                    <h2 className="text-[11px] uppercase tracking-widest2 mb-7">Order Summary</h2>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Subtotal</span>
                            <span>{formatPrice(cart.subtotal)}</span>
                        </div>
                        {cart.totalSavings > 0 && (
                            <div className="flex justify-between text-green-700">
                                <span>Savings</span>
                                <span>−{formatPrice(cart.totalSavings)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Shipping</span>
                            <span className="text-neutral-500">Calculated at checkout</span>
                        </div>
                    </div>

                    <div className="border-t border-neutral-200 mt-6 pt-6 flex justify-between text-base">
                        <span className="uppercase tracking-widest2 text-[11px]">Total</span>
                        <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                    </div>

                    <button onClick={handleCheckout} className="btn-primary w-full mt-8">
                        Proceed to Checkout
                    </button>
                    <Link to="/shop" className="block text-center mt-5 text-[10px] uppercase tracking-widest2 text-neutral-500 hover:text-ink">
                        Continue Shopping
                    </Link>
                </aside>
            </div>
        </div>
    )
}