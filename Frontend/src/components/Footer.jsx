import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-ink text-white mt-24">
            <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
                <div className="col-span-2 md:col-span-1">
                    <h3 className="text-2xl font-serif tracking-[0.35em] uppercase mb-4">Mibyll</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                        A considered edit of contemporary craft. Made to be worn, kept and passed on.
                    </p>
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-widest2 mb-5 text-neutral-400">Shop</h4>
                    <ul className="space-y-3 text-xs">
                        <li><Link to="/shop" className="hover:opacity-60">All Products</Link></li>
                        <li><Link to="/cart" className="hover:opacity-60">Cart</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-widest2 mb-5 text-neutral-400">Account</h4>
                    <ul className="space-y-3 text-xs">
                        <li><Link to="/orders" className="hover:opacity-60">My Orders</Link></li>
                        <li><Link to="/login" className="hover:opacity-60">Login</Link></li>
                        <li><Link to="/register" className="hover:opacity-60">Create Account</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-widest2 mb-5 text-neutral-400">Client Care</h4>
                    <ul className="space-y-3 text-xs text-neutral-400">
                        <li>Shipping &amp; Returns</li>
                        <li>Size Guide</li>
                        <li>Contact</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-6 flex flex-col md:flex-row
                        justify-between gap-3 text-[10px] uppercase tracking-widest2 text-neutral-500">
                    <span>© {new Date().getFullYear()} Mibyll. All rights reserved.</span>
                </div>
            </div>
        </footer>
    )
}