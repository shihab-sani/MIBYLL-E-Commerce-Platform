import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useLocalization } from '../context/LocalizationContext'
import ThemeToggle from './ThemeToggle'
import api from '../api/axios'

export default function Navbar() {
    const { user, logout, isAdminPanelUser, isAuthenticated } = useAuth()
    const { cart } = useCart()
    const { country, countries, setCountry } = useLocalization()
    const navigate = useNavigate()
    const location = useLocation()

    const [categories, setCategories] = useState([])
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    const [isScrolled, setIsScrolled] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const searchRef = useRef(null)

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    }, [location.pathname])

    // 1. Reset everything when navigating to a new page
    useEffect(() => {
        setSearchOpen(false)
        setDrawerOpen(false)
    }, [location.pathname, location.search])

    // 2. THE FIX: Reset the subcategory panel whenever the drawer closes
    useEffect(() => {
        if (!drawerOpen) {
            // Wait for the slide-out animation (500ms) to finish before resetting
            const timer = setTimeout(() => setActiveCategory(null), 500)
            return () => clearTimeout(timer)
        }
    }, [drawerOpen])

    useEffect(() => {
        const onDoc = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
        }
        document.addEventListener('mousedown', onDoc)
        return () => document.removeEventListener('mousedown', onDoc)
    }, [])

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (drawerOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [drawerOpen])

    const handleLogout = () => { logout(); navigate('/'); setDrawerOpen(false) }

    const submitSearch = (e) => {
        e.preventDefault()
        const q = searchValue.trim()
        if (!q) return
        setSearchOpen(false)
        setSearchValue('')
        navigate(`/shop?q=${encodeURIComponent(q)}`)
    }

    const isSolid = isScrolled || isHovered

    return (
        <>
            {/* HEADER */}
            <header
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                    isSolid
                        ? 'bg-[#050510] text-white shadow-xl py-0'
                        : 'bg-transparent text-white mix-blend-difference py-4'
                }`}
            >
                <div className="max-w-[1500px] mx-auto px-5 lg:px-10">
                    <div className="grid grid-cols-3 items-center h-16 lg:h-20">
                        <div className="flex justify-start">
                            <button onClick={() => setDrawerOpen(true)} aria-label="Menu" className="hover:opacity-60 transition-opacity">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    <path d="M8 4v16M16 4v16" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <Link to="/" className="text-2xl lg:text-3xl font-serif tracking-[0.35em] uppercase">
                                Mibyll
                            </Link>
                        </div>

                        <div className="flex justify-end items-center gap-6">
                            <div className="relative" ref={searchRef}>
                                <button onClick={() => setSearchOpen(v => !v)} aria-label="Search" className="hover:opacity-60 transition-opacity">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="m20 20-3.5-3.5" />
                                    </svg>
                                </button>
                                {searchOpen && (
                                    <form onSubmit={submitSearch} className="absolute top-full right-0 mt-6 w-[min(90vw,360px)] border border-white/20 bg-black/95 text-white shadow-2xl backdrop-blur-md animate-fade-in">
                                        <input
                                            autoFocus
                                            value={searchValue}
                                            onChange={e => setSearchValue(e.target.value)}
                                            placeholder="Search products…"
                                            className="w-full px-5 py-4 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                                        />
                                    </form>
                                )}
                            </div>
                            <Link to={isAuthenticated ? "/orders" : "/cart"} className="relative hover:opacity-60 transition-opacity">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                {cart?.totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                        {cart.totalItems}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* MULTI-TIER SLIDING DRAWER */}
            <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

                {/* Main Drawer Container */}
                <div className={`absolute left-0 top-0 h-full w-[320px] sm:w-[380px] bg-surface shadow-2xl overflow-hidden
                                transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                    {/* WRAPPER THAT SLIDES BETWEEN PANELS */}
                    <div className={`relative w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
                                    ${activeCategory ? '-translate-x-full' : 'translate-x-0'}`}>

                        {/* --- PANEL 1: MAIN MENU --- */}
                        <div className="absolute top-0 left-0 w-full h-full flex flex-col bg-surface text-fg">

                            <div className="flex items-center justify-between px-8 h-20 border-b border-c shrink-0">
                                <button onClick={() => setDrawerOpen(false)} className="hover:opacity-50 transition-opacity text-fg">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                                <span className="text-xl font-serif tracking-[0.2em] uppercase text-fg">Menu</span>
                                <div className="w-6"></div>
                            </div>

                            <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                                <nav className="flex flex-col">
                                    {categories.map(c => {
                                        // Check if this category has subcategories
                                        const hasSubcategories = c.subcategories && c.subcategories.length > 0;

                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    if (hasSubcategories) {
                                                        setActiveCategory(c); // Opens sub-panel
                                                    } else {
                                                        setDrawerOpen(false); // Closes menu
                                                        navigate(`/shop?category=${c.slug}`); // Directs to shop
                                                    }
                                                }}
                                                className="px-8 py-5 text-left text-sm uppercase tracking-widest2 border-b border-c flex justify-between items-center transition-all hover:bg-cbord/10 text-fg/80 hover:text-fg"
                                            >
                                                {c.name}

                                                {/* Only show the arrow if subcategories exist */}
                                                {hasSubcategories && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M9 18l6-6-6-6" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>

                                {/* Account & Settings */}
                                <div className="mt-12 px-8 pb-12 flex flex-col gap-6">
                                    <h3 className="text-[10px] text-muted uppercase tracking-widest border-b border-c pb-2">Account</h3>
                                    {isAuthenticated ? (
                                        <>
                                            {isAdminPanelUser && <Link to="/admin" onClick={() => setDrawerOpen(false)} className="hover:opacity-60 text-fg text-sm">Admin Panel</Link>}
                                            {!isAdminPanelUser && (
                                                <>
                                                    <Link to="/profile" onClick={() => setDrawerOpen(false)} className="hover:opacity-60 text-fg text-sm">Profile</Link>
                                                    <Link to="/orders" onClick={() => setDrawerOpen(false)} className="hover:opacity-60 text-fg text-sm">My Orders</Link>
                                                </>
                                            )}
                                            <button onClick={handleLogout} className="text-left hover:opacity-60 text-red-500 text-sm">Logout</button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" onClick={() => setDrawerOpen(false)} className="hover:opacity-60 text-fg text-sm">Sign In</Link>
                                            <Link to="/register" onClick={() => setDrawerOpen(false)} className="hover:opacity-60 text-fg text-sm">Create Account</Link>
                                        </>
                                    )}

                                    <div className="mt-6 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase tracking-widest text-muted">Theme</span>
                                            <ThemeToggle />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase tracking-widest text-muted">Country</span>
                                            <select value={country?.code || 'US'} onChange={(e) => setCountry(e.target.value)} className="bg-surface text-xs border border-c px-2 py-1 focus:outline-none text-fg">
                                                {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- PANEL 2: SUBCATEGORIES --- */}
                        <div className="absolute top-0 left-full w-full h-full flex flex-col bg-surface text-fg">

                            <div className="flex items-center justify-between px-8 h-20 border-b border-c shrink-0">
                                <button onClick={() => setActiveCategory(null)} className="flex items-center gap-2 hover:opacity-50 transition-opacity text-fg text-xs uppercase tracking-wider font-medium">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 18l-6-6 6-6"/>
                                    </svg>
                                    Back
                                </button>
                                <span className="text-lg font-serif tracking-[0.2em] uppercase text-fg">
                                    {activeCategory?.name || 'Category'}
                                </span>
                                <button onClick={() => setDrawerOpen(false)} className="hover:opacity-50 transition-opacity text-fg">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                                <Link
                                    to={`/shop?category=${activeCategory?.slug}`}
                                    onClick={() => setDrawerOpen(false)}
                                    className="block text-center bg-surface border border-c text-fg px-6 py-4 text-xs uppercase tracking-widest2 hover:border-fg transition-colors mb-8"
                                >
                                    See All {activeCategory?.name}
                                </Link>

                                <div className="flex flex-col">
                                    {(activeCategory?.subcategories || []).map(sub => (
                                        <Link
                                            key={sub.slug}
                                            to={`/shop?category=${sub.slug}`} // <-- FIXED: Only pass the category slug
                                            onClick={() => setDrawerOpen(false)}
                                            className="group flex justify-between items-center py-4 pl-4 pr-2 border-b border-c hover:border-fg transition-colors"
                                        >
                                            <span className="text-xs uppercase tracking-widest2 text-fg">
                                                {sub.name}
                                            </span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted group-hover:text-fg transition-colors">
                                                <path d="M9 18l6-6-6-6" />
                                            </svg>
                                        </Link>
                                    ))}

                                    {(!activeCategory?.subcategories || activeCategory.subcategories.length === 0) && (
                                        <div className="text-center text-muted py-10 text-xs">
                                            Explore our full collection of {activeCategory?.name}.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
