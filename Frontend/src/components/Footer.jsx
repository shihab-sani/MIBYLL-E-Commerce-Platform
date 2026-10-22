import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import SocialIcons from './SocialIcons'
import AboutUsPanel from './AboutUsPanel'

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
    socialLinks: [],
    aboutUsTitle: 'About Us',
    aboutUsContent: '',
    aboutUsEnabled: false,
    shippingPolicyContent: 'Complimentary shipping...',
    contactEmail: 'hello@mibyll.com',
    contactPhone: '+880 1700 000000',
    contactAddress: 'Dhaka, Bangladesh',
}

export default function Footer() {
    const [f, setF] = useState(fallback)
    const [aboutOpen, setAboutOpen] = useState(false)
    const [shippingOpen, setShippingOpen] = useState(false)

    useEffect(() => {
        api.get('/site/footer').then(r => setF({ ...fallback, ...r.data })).catch(() => {})
    }, [])

    const renderLinks = (links) => (
        // INCREASED FONT SIZE: text-sm instead of text-xs
        <ul className="space-y-3 text-sm">
            {(links || []).map((l, i) => (
                <li key={i}>
                    {l.href?.startsWith('http') ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white transition-colors">
                            {l.label}
                        </a>
                    ) : (
                        <Link to={l.href || '#'} className="text-neutral-300 hover:text-white transition-colors">
                            {l.label}
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    )

    return (
        <>
            <footer className="bg-ink text-white mt-24">
                <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="text-2xl font-serif tracking-[0.35em] uppercase mb-4">{f.brandName}</h3>
                        {/* INCREASED FONT SIZE: text-sm instead of text-xs */}
                        <p className="text-sm text-neutral-300 leading-relaxed max-w-xs">{f.tagline}</p>

                        {f.aboutUsEnabled && (
                            <button
                                onClick={() => setAboutOpen(true)}
                                className="mt-5 text-xs uppercase tracking-widest2 text-neutral-300
                                           hover:text-white underline transition-colors"
                            >
                                About Us →
                            </button>
                        )}
                    </div>

                    <div>
                        {/* INCREASED HEADER FONT SIZE */}
                        <h4 className="text-xs uppercase tracking-widest2 mb-5 text-neutral-400">Shop</h4>
                        {renderLinks(f.shopLinks)}
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest2 mb-5 text-neutral-400">Account</h4>
                        {renderLinks(f.accountLinks)}
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest2 mb-5 text-neutral-400">Client Care</h4>
                        {/* INCREASED FONT SIZE */}
                        <ul className="space-y-3 text-sm text-neutral-300">
                            {/* Hardcoded dynamic panels */}
                            <li>
                                <button onClick={() => setShippingOpen(true)} className="hover:text-white transition-colors text-left">
                                    Shipping & Returns Policy
                                </button>
                            </li>
                            {f.aboutUsEnabled && (
                                <li>
                                    <button onClick={() => setAboutOpen(true)} className="hover:text-white transition-colors text-left">
                                        About Us
                                    </button>
                                </li>
                            )}

                            {/* Filter out any duplicate links from the database */}
                            {(f.clientCareLinks || [])
                                .filter(l => l.label !== 'Shipping & Returns Policy' && l.label !== 'Shipping & Returns' && l.label !== 'About Us')
                                .map((l, i) => (
                                    <li key={i} className="hover:text-white transition-colors">
                                        {l.href && l.href !== '#' ? (
                                            <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                                        ) : (
                                            <span>{l.label}</span>
                                        )}
                                    </li>
                                ))
                            }
                        </ul>

                        {/* NEW CONTACT INFO (INCREASED FONT SIZE) */}
                        <div className="mt-8 pt-6 border-t border-white/10 text-sm text-neutral-300 space-y-2">
                            <p className="text-xs uppercase tracking-widest2 text-neutral-400 mb-3">Contact</p>
                            {f.contactEmail && <p><a href={`mailto:${f.contactEmail}`} className="hover:text-white transition-colors">{f.contactEmail}</a></p>}
                            {f.contactPhone && <p>{f.contactPhone}</p>}
                            {f.contactAddress && <p>{f.contactAddress}</p>}
                        </div>
                    </div>
                </div>

                {/* FOLLOW US row */}
                {f.socialLinks?.length > 0 && (
                    <div className="border-t border-white/10">
                        <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-8">
                            <p className="text-lg font-serif text-white mb-5">Follow Us</p>
                            <SocialIcons links={f.socialLinks} />
                        </div>
                    </div>
                )}

                <div className="border-t border-white/10">
                    <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-6 flex flex-col md:flex-row
                                    justify-between gap-3 text-xs uppercase tracking-widest2 text-neutral-500">
                        <span>{f.copyrightText || `© ${new Date().getFullYear()} ${f.brandName}. All rights reserved.`}</span>
                    </div>
                </div>
            </footer>

            <AboutUsPanel
                open={aboutOpen}
                onClose={() => setAboutOpen(false)}
                title={f.aboutUsTitle}
                content={f.aboutUsContent}
            />
            <AboutUsPanel
                open={shippingOpen}
                onClose={() => setShippingOpen(false)}
                title="Shipping & Returns Policy"
                content={f.shippingPolicyContent}
            />
        </>
    )
}