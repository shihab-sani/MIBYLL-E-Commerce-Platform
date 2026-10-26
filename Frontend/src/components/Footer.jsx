import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import SocialIcons from './SocialIcons'
import AboutUsPanel from './AboutUsPanel'

const fallback = {
    brandName: 'Mibyll',
    tagline: 'A considered edit of contemporary craft. Made to be worn, kept and passed on.',
    copyrightText: '',
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
                {/* Changed to 4 columns on large screens so Client Care and Contact sit side-by-side */}
                <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

                    {/* COLUMN 1: Brand & Follow Us */}
                    <div>
                        <h3 className="text-2xl font-serif tracking-[0.35em] uppercase mb-4">{f.brandName}</h3>
                        <p className="text-sm text-neutral-300 leading-relaxed max-w-xs mb-10">{f.tagline}</p>

                        {f.socialLinks?.length > 0 && (
                            <div>
                                <h4 className="text-xs uppercase tracking-widest2 mb-5 text-neutral-400">Follow Us</h4>
                                <SocialIcons links={f.socialLinks} />
                            </div>
                        )}
                    </div>

                    {/* COLUMN 2: Account */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest2 mb-5 text-neutral-400">Account</h4>
                        {renderLinks(f.accountLinks)}
                    </div>

                    {/* COLUMN 3: Client Care (Includes About Us) */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest2 mb-5 text-neutral-400">Client Care</h4>
                        <ul className="space-y-3 text-sm text-neutral-300">
                            <li>
                                <button onClick={() => setShippingOpen(true)} className="hover:text-white transition-colors text-left">
                                    Shipping & Returns Policy
                                </button>
                            </li>
                            {(f.clientCareLinks || [])
                                .filter(l => l.label !== 'Shipping & Returns Policy' && l.label !== 'Shipping & Returns')
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
                            {/* About Us moved here */}
                            {f.aboutUsEnabled && (
                                <li>
                                    <button
                                        onClick={() => setAboutOpen(true)}
                                        className="hover:text-white transition-colors text-left"
                                    >
                                        About {f.brandName}
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* COLUMN 4: Contact (Now its own standalone column) */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest2 mb-5 text-neutral-400">Contact</h4>
                        <div className="text-sm text-neutral-300 space-y-3">
                            {f.contactEmail && (
                                <p>
                                    <a href={`mailto:${f.contactEmail}`} className="hover:text-white transition-colors">
                                        {f.contactEmail}
                                    </a>
                                </p>
                            )}
                            {f.contactPhone && <p>{f.contactPhone}</p>}
                            {f.contactAddress && <p>{f.contactAddress}</p>}
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="border-t border-white/10">
                    <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-6 flex flex-col md:flex-row
                                    justify-between gap-3 text-xs uppercase tracking-widest2 text-neutral-500">
                        <span>{f.copyrightText || `© ${new Date().getFullYear()} ${f.brandName}. All rights reserved.`}</span>
                    </div>
                </div>
            </footer>

            {/* Panels */}
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
