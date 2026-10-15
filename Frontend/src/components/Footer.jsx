import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const fallback = {
    brandName: 'Mibyll',
    tagline: 'A considered edit of contemporary craft. Made to be worn, kept and passed on.',
    copyrightText: '',
    shopLinks: [
        { label: 'All Products', href: '/shop' },
        { label: 'Cart', href: '/cart' },
    ],
    accountLinks: [
        { label: 'My Orders', href: '/orders' },
        { label: 'Login', href: '/login' },
        { label: 'Create Account', href: '/register' },
    ],
    clientCareLinks: [
        { label: 'Shipping & Returns', href: '#' },
        { label: 'Size Guide', href: '#' },
        { label: 'Contact', href: '#' },
    ],
}

export default function Footer() {
    const [f, setF] = useState(fallback)

    useEffect(() => {
        api.get('/site/footer').then(r => setF({ ...fallback, ...r.data })).catch(() => {})
    }, [])

    const renderLinks = (links) => (
        <ul className="space-y-3 text-xs">
            {links.map((l, i) => (
                <li key={i}>
                    {l.href?.startsWith('http') ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-60">
                            {l.label}
                        </a>
                    ) : (
                        <Link to={l.href || '#'} className="hover:opacity-60">{l.label}</Link>
                    )}
                </li>
            ))}
        </ul>
    )

    return (
        <footer className="bg-ink text-white mt-24">
            <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
                <div className="col-span-2 md:col-span-1">
                    <h3 className="text-2xl font-serif tracking-[0.35em] uppercase mb-4">{f.brandName}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">{f.tagline}</p>
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-widest2 mb-5 text-neutral-400">Shop</h4>
                    {renderLinks(f.shopLinks || [])}
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-widest2 mb-5 text-neutral-400">Account</h4>
                    {renderLinks(f.accountLinks || [])}
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-widest2 mb-5 text-neutral-400">Client Care</h4>
                    <ul className="space-y-3 text-xs text-neutral-400">
                        {(f.clientCareLinks || []).map((l, i) => (
                            <li key={i} className="hover:text-white">
                                {l.href && l.href !== '#' ? (
                                    <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                                ) : (
                                    <span>{l.label}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-6 flex flex-col md:flex-row
                                justify-between gap-3 text-[10px] uppercase tracking-widest2 text-neutral-500">
                    <span>{f.copyrightText || `© ${new Date().getFullYear()} ${f.brandName}. All rights reserved.`}</span>
                </div>
            </div>
        </footer>
    )
}