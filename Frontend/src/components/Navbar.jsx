import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ThemeToggle from './ThemeToggle'
import api from '../api/axios'
import { useLocalization } from '../context/LocalizationContext'

export default function Navbar() {
    const { user, logout, isAdmin, isAdminPanelUser, isAuthenticated } = useAuth()
    const { cart } = useCart()
    const { country, language, countries, languages, setCountry, setLanguage, t } = useLocalization()
    const navigate = useNavigate()
    const location = useLocation()

    const [categories, setCategories] = useState([])
    const [open, setOpen] = useState(false)
    const [catOpen, setCatOpen] = useState(false)
    const [mobileCatOpen, setMobileCatOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const dropRef = useRef(null)
    const searchRef = useRef(null)

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    }, [location.pathname])

    useEffect(() => {
        const onDoc = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setCatOpen(false)
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
        }
        document.addEventListener('mousedown', onDoc)
        return () => document.removeEventListener('mousedown', onDoc)
    }, [])

    useEffect(() => { setSearchOpen(false) }, [location.pathname, location.search])

    const handleLogout = () => { logout(); navigate('/') }

    const goCategory = (slug) => {
        setCatOpen(false); setMobileCatOpen(false); setOpen(false)
        navigate(`/shop?category=${slug}`)
    }

    const submitSearch = (e) => {
        e.preventDefault()
        const q = searchValue.trim()
        if (!q) return
        setSearchOpen(false)
        setSearchValue('')
        navigate(`/shop?q=${encodeURIComponent(q)}`)
    }

    return (
        <>
            <header className="sticky top-0 z-50 backdrop-blur border-b border-c"
                    style={{ background: 'rgb(var(--paper) / 0.95)' }}>
                <div className="max-w-[1500px] mx-auto px-5 lg:px-10">
                    <div className="flex items-center justify-between h-16 lg:h-20">

                        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="1.2">
                                <path d="M3 6h18M3 12h18M3 18h18" />
                            </svg>
                        </button>

                        <Link to="/" className="text-xl lg:text-2xl font-serif tracking-[0.35em] uppercase text-fg">
                            Mibyll
                        </Link>

                        <nav className="hidden lg:flex items-center gap-9">
                            <div className="relative" ref={dropRef}>
                                <button onClick={() => setCatOpen(v => !v)}
                                        className="nav-link flex items-center gap-2 text-fg">
                                    {t('nav.categories')}
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2"
                                         className={`transition-transform ${catOpen ? 'rotate-180' : ''}`}>
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {catOpen && (
                                    <div className="absolute top-full left-0 mt-4 min-w-[220px] py-2 shadow-lg border border-c animate-fade-in"
                                         style={{ background: 'rgb(var(--surface))' }}>
                                        {categories.length === 0 ? (
                                            <p className="px-5 py-3 text-[11px] uppercase tracking-widest2 text-muted">
                                                {t('nav.noCategories')}
                                            </p>
                                        ) : categories.map(c => (
                                            <button key={c.id} onClick={() => goCategory(c.slug)}
                                                    className="block w-full text-left px-5 py-3 text-[11px] uppercase
                                         tracking-widest2 text-fg hover:opacity-60 transition-opacity">
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link to="/shop" className="nav-link text-fg">{t('nav.all')}</Link>
                        </nav>

                        <div className="flex items-center gap-5">
                            {/* Search */}
                            <div className="relative" ref={searchRef}>
                                <button onClick={() => setSearchOpen(v => !v)}
                                        aria-label="Search"
                                        className="text-fg hover:opacity-60 transition-opacity">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="1.4">
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="m20 20-3.5-3.5" />
                                    </svg>
                                </button>

                                {searchOpen && (
                                    <form onSubmit={submitSearch}
                                          className="absolute top-full right-0 mt-4 w-[min(90vw,360px)]
                                   border border-c shadow-lg animate-slide-in"
                                          style={{ background: 'rgb(var(--surface))' }}>
                                        <input
                                            autoFocus
                                            value={searchValue}
                                            onChange={e => setSearchValue(e.target.value)}
                                            placeholder="Search products…"
                                            className="w-full px-4 py-3 text-sm bg-transparent text-fg
                                 focus:outline-none"
                                        />
                                    </form>
                                )}
                            </div>
                            {/* Location / Language switcher */}
                            <div className="relative hidden lg:flex items-center gap-2">
                                <select
                                    value={country?.code || 'US'}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="text-[10px] uppercase tracking-widest2 bg-transparent border-none
                   text-fg focus:outline-none cursor-pointer"
                                >
                                    {countries.map((c) => (
                                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                    ))}
                                </select>

                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="text-[10px] uppercase tracking-widest2 bg-transparent border-none
                   text-fg focus:outline-none cursor-pointer"
                                >
                                    {languages.map((l) => (
                                        <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <ThemeToggle />

                            {isAdmin && (
                                <Link to="/admin" className="hidden lg:block nav-link text-fg">{t('nav.admin')}</Link>
                            )}

                            {isAuthenticated ? (
                                <div className="hidden lg:flex items-center gap-4">
                                    {!isAdminPanelUser && (
                                        <>
                                            <Link to="/profile" className="nav-link text-fg">{t('nav.profile')}</Link>
                                            <Link to="/orders" className="nav-link text-fg">{t('nav.orders')}</Link>
                                        </>
                                    )}
                                    <button onClick={handleLogout} className="nav-link text-fg">{t('nav.logout')}</button>
                                </div>
                            ) : (
                                <Link to="/login" className="hidden lg:block nav-link text-fg">{t('nav.login')}</Link>
                            )}

                            <Link to="/cart" className="relative text-fg">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="1.2">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                {cart?.totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-ink text-white text-[9px] w-4 h-4
                                   rounded-full flex items-center justify-center">
                    {cart.totalItems}
                  </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {open && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-[80%] p-8 overflow-y-auto no-scrollbar
                          animate-slide-in"
                         style={{ background: 'rgb(var(--paper))' }}>
                        <div className="flex items-center justify-between mb-10">
                            <button onClick={() => setOpen(false)} className="text-2xl leading-none text-fg">×</button>
                            <ThemeToggle />
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const q = searchValue.trim()
                            if (!q) return
                            setOpen(false)
                            setSearchValue('')
                            navigate(`/shop?q=${encodeURIComponent(q)}`)
                        }} className="mb-8">
                            <input value={searchValue} onChange={e => setSearchValue(e.target.value)}
                                   placeholder="Search products…"
                                   className="input-field" />
                        </form>

                        <nav className="flex flex-col gap-1">
                            <button onClick={() => setMobileCatOpen(v => !v)}
                                    className="flex items-center justify-between text-lg font-serif
                                 tracking-[0.2em] uppercase py-3 text-fg">
                                {t('nav.categories')}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2"
                                     className={`transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {mobileCatOpen && (
                                <div className="pl-4 flex flex-col gap-3 mb-3 animate-fade-in">
                                    {categories.length === 0 ? (
                                        <p className="text-[11px] uppercase tracking-widest2 text-muted">{t('nav.noCategories')}</p>
                                    ) : categories.map(c => (
                                        <button key={c.id} onClick={() => goCategory(c.slug)}
                                                className="text-left text-sm uppercase tracking-widest2
                                       text-muted hover:text-fg transition-colors">
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <Link to="/shop" onClick={() => setOpen(false)}
                                  className="text-lg font-serif tracking-[0.2em] uppercase py-3 text-fg">
                                {t('nav.all')}
                            </Link>
                        </nav>

                        <div className="mt-12 pt-8 border-t border-c flex flex-col gap-5">
                            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="nav-link text-fg">{t('nav.adminPanel')}</Link>}
                            {isAuthenticated ? (
                                <>
                                    {/* THE FIX: Wrapped the Profile link in the check */}
                                    {!isAdminPanelUser && (
                                        <>
                                            <Link to="/profile" onClick={() => setOpen(false)} className="nav-link text-fg">
                                                {t('nav.profile')}
                                            </Link>
                                            <Link to="/orders" onClick={() => setOpen(false)} className="nav-link text-fg">
                                                {t('nav.orders')}
                                            </Link>
                                        </>
                                    )}
                                    <button onClick={() => { handleLogout(); setOpen(false) }}
                                            className="nav-link text-left text-fg">
                                        {t('nav.logout')}
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setOpen(false)} className="nav-link text-fg">
                                    {t('nav.login')}
                                </Link>
                            )}
                        </div>
                        {user && <p className="mt-10 text-xs text-muted">{user.email}</p>}
                    </div>
                </div>
            )}
        </>
    )
}
