import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { createPortal } from 'react-dom'

// --- FEATURED IMAGE SLIDER COMPONENT ---
function FeaturedImageSlider({ images, overrideImage }) {
    const [index, setIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const timerRef = useRef(null)

    useEffect(() => {
        // If a specific variant image is selected, we don't need the timer
        if (overrideImage || !images || images.length <= 1 || isHovered) return

        timerRef.current = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length)
        }, 3000) // 3 seconds

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [images, isHovered, overrideImage])

    // If a variant is selected, show it directly with a smooth fade
    if (overrideImage) {
        return (
            <img
                src={overrideImage}
                alt="Selected Variant"
                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            />
        )
    }

    if (!images || images.length === 0) {
        return <div className="w-full h-full bg-sand" />
    }

    return (
        <div
            className="w-full h-full relative overflow-hidden group cursor-default"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {images.map((img, i) => (
                <img
                    key={i}
                    src={img}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                        i === index ? 'opacity-100' : 'opacity-0'
                    } group-hover:scale-105`}
                />
            ))}

            {/* Dots indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.preventDefault(); setIndex(i); }}
                            className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function Shop() {
    const [params, setParams] = useSearchParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const [searchInput, setSearchInput] = useState(params.get('q') || '')

    const [featuredProducts, setFeaturedProducts] = useState([])

    // Modal & Selection State
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [productSelections, setProductSelections] = useState({})
    const [message, setMessage] = useState('')
    const [sendingRequest, setSendingRequest] = useState(false)

    const category = params.get('category') || ''
    const q = params.get('q') || ''
    const sort = params.get('sort') || 'newest'
    const page = parseInt(params.get('page') || '0', 10)

    // Helper to get available sizes
    const getSizes = (product) => {
        const type = product.sizeType;
        let allSizes = [];
        if (type === 'CLOTHING') allSizes = ['XS', 'S', 'M', 'L', 'XL'];
        else if (type === 'SHOES') allSizes = ['38', '39', '40', '41', '42', '43', '44', '45'];
        else if (type === 'RINGS') allSizes = ['5', '6', '7', '8', '9', '10', '11', '12'];

        if (product.disabledSizes) {
            return allSizes.filter(s => !product.disabledSizes.includes(s));
        }
        return allSizes;
    }

    // Toggle variant selection (click same one to deselect)
    const toggleVariant = (productId, variant) => {
        setProductSelections(prev => {
            const current = prev[productId] || {}
            const isSelected = current.variant?.id === variant.id
            return {
                ...prev,
                [productId]: {
                    ...current,
                    variant: isSelected ? null : variant
                }
            }
        })
    }

    useEffect(() => {
        if (selectedProduct) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [selectedProduct])

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    }, [])

    useEffect(() => { setSearchInput(q) }, [q])

    const load = useCallback(async () => {
        if (!category && !q) {
            setProducts([])
            setFeaturedProducts([])
            setTotalPages(0)
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const prodRes = await api.get('/products', {
                params: { category: category || undefined, q: q || undefined, sort, page, size: 12, featured: false }
            })
            setProducts(prodRes.data.content || [])
            setTotalPages(prodRes.data.page?.totalPages ?? 0)

            if (category || q) {
                const featRes = await api.get('/products', {
                    params: { category: category || undefined, q: q || undefined, featured: true, size: 20 }
                })
                setFeaturedProducts(featRes.data.content || [])
            } else {
                setFeaturedProducts([])
            }
        } catch {
            setProducts([])
            setFeaturedProducts([])
        }
        finally { setLoading(false) }
    }, [category, q, sort, page])

    useEffect(() => { load() }, [load])

    const update = (key, value) => {
        const next = new URLSearchParams(params)
        if (value) next.set(key, value); else next.delete(key)
        if (key === 'category') {
            next.delete('q')
            setSearchInput('')
        }
        if (key !== 'page') next.delete('page')
        setParams(next)
    }

    const submitSearch = (e) => {
        e.preventDefault()
        update('q', searchInput.trim())
    }

    const submitRequest = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) { toast.error('Please sign in to send a request'); return }

        const selection = productSelections[selectedProduct.id] || { size: '', variant: null }

        setSendingRequest(true)
        try {
            await api.post('/orders/requests', {
                productId: selectedProduct.id,
                message,
                size: selection.size || '',
                variantName: selection.variant?.name || ''
            })
            toast.success('Request sent to Admin!')
            setSelectedProduct(null)
            setMessage('')
        } catch { toast.error('Failed to send request') }
        finally { setSendingRequest(false) }
    }

    const mainCategory = categories.find(c =>
        c.slug === category || (c.subcategories && c.subcategories.some(sub => sub.slug === category))
    )
    const activeSubCategory = mainCategory?.subcategories?.find(sub => sub.slug === category)

    let heading = 'Shop'
    if (activeSubCategory) heading = activeSubCategory.name
    else if (mainCategory) heading = mainCategory.name
    else if (q) heading = `"${q}"`

    return (
        <div className="max-w-[1500px] mx-auto px-5 lg:px-10 pt-32 pb-12 lg:pb-16">
            {/* HEADER */}
            <div className="text-center mb-10">
                <p className="text-[10px] uppercase tracking-widest2 text-muted mb-3">
                    {mainCategory || q ? 'Collection' : 'All Products'}
                </p>
                <h1 className="text-4xl md:text-5xl font-serif text-fg uppercase">{heading}</h1>
            </div>

            {/* SEARCH BAR */}
            <form onSubmit={submitSearch} className="max-w-2xl mx-auto mb-12 relative">
                <input
                    type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search products by name or brand…" className="input-field pl-12 pr-28"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                     className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 text-[10px] uppercase tracking-widest2 bg-ink text-white hover:bg-neutral-800 dark:bg-white dark:text-ink dark:hover:bg-neutral-200">
                    Search
                </button>
            </form>

            {/* FEATURED EDITORIAL SECTION */}
            {featuredProducts.length > 0 && (
                <div className="mb-24 animate-fade-in">
                    <p className="text-center text-[10px] uppercase tracking-widest2 text-[#C5A880] mb-12">
                        Featured Collection
                    </p>
                    {featuredProducts.map((product, index) => {
                        const isReverse = index % 2 !== 0
                        const selection = productSelections[product.id] || { size: '', variant: null }
                        const availableSizes = getSizes(product)

                        return (
                            <section key={product.id} className={`flex flex-col md:flex-row h-screen min-h-[600px] mb-12 bg-surface ${isReverse ? 'md:flex-row-reverse' : ''}`}>

                                {/* SLIDER IMAGE (Passes selected variant image if exists) */}
                                <div className="w-full md:w-1/2 relative bg-sand flex-shrink-0 overflow-hidden h-[50vh] md:h-full">
                                    <FeaturedImageSlider
                                        images={product.images}
                                        overrideImage={selection.variant?.imageUrl}
                                    />
                                </div>

                                <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-24 text-center">
                                    <div className="max-w-md min-w-0 w-full">
                                        <h2 className="text-3xl md:text-5xl font-serif text-fg mb-6 break-words">{product.name}</h2>
                                        <p className="text-muted text-sm leading-relaxed mb-8 break-words whitespace-pre-wrap">{product.description}</p>

                                        {/* SIZES */}
                                        {availableSizes.length > 0 && (
                                            <div className="mb-6">
                                                <p className="text-[10px] uppercase tracking-widest2 text-muted mb-3">Select Size</p>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {availableSizes.map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setProductSelections(prev => ({
                                                                ...prev, [product.id]: { ...selection, size: s }
                                                            }))}
                                                            className={`w-10 h-10 text-xs border transition-colors ${selection.size === s ? 'bg-fg text-surface border-fg' : 'border-c text-fg hover:border-fg'}`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* VARIANTS */}
                                        {product.variants?.length > 0 && (
                                            <div className="mb-8">
                                                <p className="text-[10px] uppercase tracking-widest2 text-muted mb-3">Select Design / Color</p>
                                                <div className="flex flex-wrap justify-center gap-3">
                                                    {product.variants.map(v => (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => toggleVariant(product.id, v)}
                                                            className={`w-16 h-16 border-2 overflow-hidden transition-all duration-300 ${selection.variant?.id === v.id ? 'border-fg scale-110 shadow-lg' : 'border-transparent hover:border-c'}`}
                                                        >
                                                            <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="inline-block border border-[#C5A880] text-[#C5A880] px-10 py-3 text-xs uppercase tracking-widest2 hover:bg-[#C5A880] hover:text-white transition-colors"
                                        >
                                            Interested
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )
                    })}
                </div>
            )}

            {/* FILTER BAR */}
            {products.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 border-y border-c py-4 mb-10">
                    <div className="flex flex-wrap gap-5">
                        {mainCategory ? (
                            <>
                                <Link to={`/shop?category=${mainCategory.slug}`}
                                      className={`text-[11px] uppercase tracking-widest2 transition-colors pb-1 ${!activeSubCategory && !q ? 'border-b border-fg text-fg' : 'text-muted hover:text-fg'}`}>
                                    All {mainCategory.name}
                                </Link>
                                {(mainCategory.subcategories || []).map(sub => (
                                    <button key={sub.slug} onClick={() => update('category', sub.slug)}
                                            className={`text-[11px] uppercase tracking-widest2 transition-colors pb-1 ${category === sub.slug && !q ? 'border-b border-fg text-fg' : 'text-muted hover:text-fg'}`}>
                                        {sub.name}
                                    </button>
                                ))}
                            </>
                        ) : (
                            categories.map(c => (
                                <button key={c.id} onClick={() => update('category', c.slug)}
                                        className={`text-[11px] uppercase tracking-widest2 transition-colors pb-1 ${category === c.slug ? 'border-b border-fg text-fg' : 'text-muted hover:text-fg'}`}>
                                    {c.name}
                                </button>
                            ))
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] uppercase tracking-widest2 text-muted">Sort</span>
                        <select value={sort} onChange={(e) => update('sort', e.target.value)}
                                className="text-[11px] uppercase tracking-widest2 bg-transparent border-none focus:outline-none cursor-pointer text-fg">
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A–Z</option>
                        </select>
                    </div>
                </div>
            )}

            {/* NORMAL PRODUCTS GRID */}
            {!category && !q ? (
                <div className="py-32 text-center animate-fade-in">
                    <p className="font-serif text-3xl mb-4 text-fg">Discover Mibyll</p>
                    <p className="text-sm text-muted max-w-md mx-auto">Please select a category from the menu or use the search bar above.</p>
                </div>
            ) : loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-sand aspect-[3/4]" />
                            <div className="h-3 bg-sand mt-4 w-2/3" />
                            <div className="h-3 bg-sand mt-2 w-1/3" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 && featuredProducts.length === 0 ? (
                <div className="py-32 text-center">
                    <p className="font-serif text-2xl mb-3 text-fg">Nothing found</p>
                    <p className="text-sm text-muted">Try a different search term or filter.</p>
                </div>
            ) : products.length > 0 && (
                <>
                    <div key={`${category}-${q}-${sort}-${page}`} className="animate-grid-in grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
                        {products.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-20">
                            <button disabled={page === 0} onClick={() => update('page', String(page - 1))}
                                    className="px-4 py-2 text-[11px] uppercase tracking-widest2 text-fg disabled:opacity-30">Prev</button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button key={i} onClick={() => update('page', String(i))}
                                        className={`w-9 h-9 text-xs border transition-colors ${page === i ? 'bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white' : 'border-c text-fg hover:border-fg'}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button disabled={page >= totalPages - 1} onClick={() => update('page', String(page + 1))}
                                    className="px-4 py-2 text-[11px] uppercase tracking-widest2 text-fg disabled:opacity-30">Next</button>
                        </div>
                    )}
                </>
            )}

            {/* INQUIRY MODAL */}
            {selectedProduct && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-5">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
                    <div className="relative bg-surface p-6 sm:p-8 w-full max-w-md shadow-2xl border border-c animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h2 className="text-xl font-serif mb-2 text-fg">Inquire about {selectedProduct.name}</h2>
                        <p className="text-xs text-muted mb-6">Send a message to our team regarding this piece.</p>

                        <form onSubmit={submitRequest}>
                            {/* Display what was selected outside the modal */}
                            {(productSelections[selectedProduct.id]?.size || productSelections[selectedProduct.id]?.variant) && (
                                <div className="mb-5 p-4 border border-c bg-cbord/5 text-left flex items-center gap-4">
                                    {productSelections[selectedProduct.id]?.variant?.imageUrl && (
                                        <img src={productSelections[selectedProduct.id].variant.imageUrl} alt="variant" className="w-12 h-12 object-cover bg-sand shrink-0" />
                                    )}
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest2 text-muted mb-1">Your Selections</p>
                                        <div className="flex flex-wrap gap-4">
                                            {productSelections[selectedProduct.id]?.size && (
                                                <p className="text-sm text-fg"><span className="text-muted">Size:</span> {productSelections[selectedProduct.id].size}</p>
                                            )}
                                            {productSelections[selectedProduct.id]?.variant && (
                                                <p className="text-sm text-fg"><span className="text-muted">Design:</span> {productSelections[selectedProduct.id].variant.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <label className="label-field text-left block">Message</label>
                            <textarea
                                required
                                rows="4"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="I am interested in this piece, please contact me..."
                                className="input-field resize-none mb-4"
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setSelectedProduct(null)} className="btn-outline">Cancel</button>
                                <button type="submit" disabled={sendingRequest} className="btn-primary">
                                    {sendingRequest ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
