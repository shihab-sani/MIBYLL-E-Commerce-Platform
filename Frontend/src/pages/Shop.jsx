import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

export default function Shop() {
    const [params, setParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const [searchInput, setSearchInput] = useState(params.get('q') || '')

    const category = params.get('category') || ''
    const q = params.get('q') || ''
    const sort = params.get('sort') || 'newest'
    const page = parseInt(params.get('page') || '0', 10)

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    }, [])

    // keep local search bar in sync when URL changes (e.g. via Navbar)
    useEffect(() => { setSearchInput(q) }, [q])

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/products', {
                params: { category: category || undefined, q: q || undefined, sort, page, size: 12 }
            })
            setProducts(data.content)
            setTotalPages(data.page?.totalPages ?? 0)
        } catch { setProducts([]) }
        finally { setLoading(false) }
    }, [category, q, sort, page])

    useEffect(() => { load() }, [load])

    const update = (key, value) => {
        const next = new URLSearchParams(params)
        if (value) next.set(key, value); else next.delete(key)
        if (key !== 'page') next.delete('page')
        setParams(next)
    }

    const submitSearch = (e) => {
        e.preventDefault()
        update('q', searchInput.trim())
    }

    const activeCategory = categories.find(c => c.slug === category)

// Fallback so heading is correct even before categories have loaded
    const urlCategoryName = category
        ? category.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())
        : null

    const heading = q
        ? `"${q}"`
        : activeCategory?.name || urlCategoryName || 'Collections'

    return (
        <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-12 lg:py-16">
            <div className="text-center mb-10">
                <p className="text-[10px] uppercase tracking-widest2 text-muted mb-3">
                    {activeCategory ? 'Collection' : q ? 'Search Results' : 'All Products'}
                </p>
                <h1 className="text-4xl md:text-5xl font-serif text-fg">
                    {heading}
                </h1>
            </div>

            {/* SEARCH BAR */}
            <form onSubmit={submitSearch} className="max-w-2xl mx-auto mb-12 relative">
                <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search products by name or brand…"
                    className="input-field pl-12 pr-28"
                />
                <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.6"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 text-[10px]
                     uppercase tracking-widest2 bg-ink text-white hover:bg-neutral-800
                     dark:bg-white dark:text-ink dark:hover:bg-neutral-200"
                >
                    Search
                </button>
                {q && (
                    <button
                        type="button"
                        onClick={() => { setSearchInput(''); update('q', '') }}
                        className="absolute right-28 top-1/2 -translate-y-1/2 text-[10px] uppercase
                       tracking-widest2 text-muted hover:text-fg"
                    >
                        Clear
                    </button>
                )}
            </form>

            {/* FILTER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-c py-4 mb-10">
                <div className="flex flex-wrap gap-5">
                    <button onClick={() => update('category', '')}
                            className={`text-[11px] uppercase tracking-widest2 transition-colors
                    ${!category ? 'underline text-fg' : 'text-muted hover:text-fg'}`}>
                        All
                    </button>
                    {categories.map(c => (
                        <button key={c.id} onClick={() => update('category', c.slug)}
                                className={`text-[11px] uppercase tracking-widest2 transition-colors
                      ${category === c.slug ? 'underline text-fg' : 'text-muted hover:text-fg'}`}>
                            {c.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[11px] uppercase tracking-widest2 text-muted">Sort</span>
                    <select value={sort} onChange={(e) => update('sort', e.target.value)}
                            className="text-[11px] uppercase tracking-widest2 bg-transparent border-none
                             focus:outline-none cursor-pointer text-fg">
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A–Z</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-sand aspect-[3/4]" />
                            <div className="h-3 bg-sand mt-4 w-2/3" />
                            <div className="h-3 bg-sand mt-2 w-1/3" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="py-32 text-center">
                    <p className="font-serif text-2xl mb-3 text-fg">Nothing found</p>
                    <p className="text-sm text-muted">Try a different search term or filter.</p>
                </div>
            ) : (
                <>
                    <div
                        key={`${category}-${q}-${sort}-${page}`}
                        className="animate-grid-in grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12"
                    >
                        {products.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-20">
                            <button disabled={page === 0} onClick={() => update('page', String(page - 1))}
                                    className="px-4 py-2 text-[11px] uppercase tracking-widest2
                                 text-fg disabled:opacity-30">
                                Prev
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button key={i} onClick={() => update('page', String(i))}
                                        className={`w-9 h-9 text-xs border transition-colors
                          ${page === i
                                            ? 'bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white'
                                            : 'border-c text-fg hover:border-fg'}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button disabled={page >= totalPages - 1} onClick={() => update('page', String(page + 1))}
                                    className="px-4 py-2 text-[11px] uppercase tracking-widest2
                                 text-fg disabled:opacity-30">
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}