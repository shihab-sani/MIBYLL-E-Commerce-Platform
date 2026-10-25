import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useLocalization } from '../context/LocalizationContext'
import AboutUsPanel from '../components/AboutUsPanel'

export default function ProductDetail() {
    const { slug } = useParams()
    const { formatPrice } = useLocalization()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { addToCart } = useCart()

    const [product, setProduct] = useState(null)
    const [related, setRelated] = useState([])
    const [activeImage, setActiveImage] = useState(0)
    const [size, setSize] = useState('')
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [shippingPolicy, setShippingPolicy] = useState('')
    const [shippingOpen, setShippingOpen] = useState(false)

    // Helper to get available sizes based on Admin's selection
    const getSizes = (type) => {
        if (type === 'CLOTHING') return ['XS', 'S', 'M', 'L', 'XL']
        if (type === 'SHOES') return ['38', '39', '40', '41', '42', '43', '44', '45']
        if (type === 'RINGS') return ['5', '6', '7', '8', '9', '10', '11', '12']
        return []
    }

    const availableSizes = getSizes(product?.sizeType)

    useEffect(() => {
        setLoading(true)
        api.get('/site/footer').then(r => {
            if (r.data.shippingPolicyContent) setShippingPolicy(r.data.shippingPolicyContent)
        }).catch(() => {})

        api.get(`/products/${slug}`)
            .then(r => {
                setProduct(r.data)
                setActiveImage(0)
                setSize('')
                setSelectedVariant(null)
                api.get(`/products/${slug}/related`)
                    .then(res => setRelated(res.data))
                    .catch(() => {})
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false))
    }, [slug])

    // Update image when a variant is selected
    useEffect(() => {
        if (selectedVariant && selectedVariant.imageUrl && product?.images) {
            const idx = product.images.indexOf(selectedVariant.imageUrl)
            if (idx !== -1) setActiveImage(idx)
        }
    }, [selectedVariant, product])

    const handleAdd = async (buyNow = false) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to continue')
            navigate('/login', { state: { from: `/product/${slug}` } })
            return
        }

        if (availableSizes.length > 0 && !size) {
            toast.error('Please select a size first')
            return
        }

        setAdding(true)
        try {
            await addToCart(product.id, quantity, size, selectedVariant?.name || '')
            toast.success('Added to bag')
            if (buyNow) navigate('/cart')
        } catch (e) {
            toast.error(e.response?.data?.message || 'Could not add to bag')
        } finally { setAdding(false) }
    }

    if (loading) {
        return (
            <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-16 grid lg:grid-cols-2 gap-12">
                <div className="bg-sand aspect-[3/4] animate-pulse" />
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-sand w-1/4" />
                    <div className="h-8 bg-sand w-3/4" />
                    <div className="h-4 bg-sand w-1/3" />
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="py-40 text-center">
                <p className="font-serif text-3xl mb-4">Product not found</p>
                <Link to="/shop" className="btn-outline">Back to Shop</Link>
            </div>
        )
    }

    const hasDiscount = product.discountPercent > 0
    const soldOut = product.stockQuantity === 0

    return (
        <div className="max-w-[1500px] mx-auto px-5 lg:px-10 pt-32 pb-10 lg:pb-16">
            <nav className="text-[10px] uppercase tracking-widest2 text-neutral-500 mb-8">
                <Link to="/" className="hover:text-ink">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/shop" className="hover:text-ink">Shop</Link>
                {product.categoryName && (
                    <>
                        <span className="mx-2">/</span>
                        <span>{product.categoryName}</span>
                    </>
                )}
            </nav>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                {/* GALLERY */}
                <div className="flex gap-4">
                    {product.images?.length > 1 && (
                        <div className="flex flex-col gap-3 w-20 shrink-0">
                            {product.images.map((img, i) => (
                                <button key={i} onClick={() => setActiveImage(i)}
                                        className={`aspect-[3/4] overflow-hidden border ${activeImage === i ? 'border-ink' : 'border-transparent'}`}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 bg-sand aspect-[3/4] overflow-hidden">
                        {product.images?.[activeImage] ? (
                            <img src={product.images[activeImage]} alt={product.name}
                                 className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">No image</div>
                        )}
                    </div>
                </div>

                {/* INFO */}
                <div className="lg:pt-4 lg:sticky lg:top-28 self-start">
                    {product.brand && (
                        <p className="text-[10px] uppercase tracking-widest2 text-neutral-500 mb-3">{product.brand}</p>
                    )}
                    <h1 className="text-3xl md:text-4xl font-serif leading-tight mb-5">{product.name}</h1>

                    <div className="flex items-baseline gap-3 mb-8">
                        <span className="text-2xl">{formatPrice(product.finalPrice)}</span>
                        {hasDiscount && (
                            <>
                                <span className="text-base text-neutral-400 line-through">{formatPrice(product.price)}</span>
                                <span className="text-[10px] uppercase tracking-widest2 bg-ink text-white px-2 py-1">
                                    Save {product.discountPercent}%
                                </span>
                            </>
                        )}
                    </div>

                    <p className="text-sm text-neutral-600 leading-relaxed mb-10">{product.description}</p>

                    {/* VARIANTS (COLOR/DESIGN) */}
                    {product.variants?.length > 0 && (
                        <div className="mb-7">
                            <div className="flex justify-between mb-3">
                                <span className="label-field mb-0">Design / Color</span>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {product.variants.map(v => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setSelectedVariant(v)}
                                        className={`w-14 h-14 border overflow-hidden transition-colors ${selectedVariant?.id === v.id ? 'border-ink' : 'border-transparent hover:border-neutral-400'}`}
                                        title={v.name}
                                    >
                                        <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                            {selectedVariant && (
                                <p className="text-xs text-muted mt-2">
                                    Selected: <span className="text-fg">{selectedVariant.name}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* SIZES */}
                    {product.sizeType !== 'NONE' && availableSizes.length > 0 && (
                        <div className="mb-7">
                            <div className="flex justify-between mb-3">
                                <span className="label-field mb-0">Size</span>
                                <span className="text-[10px] uppercase tracking-widest2 text-neutral-400">Size guide</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map(s => (
                                    <button key={s} onClick={() => setSize(s === size ? '' : s)}
                                            className={`w-12 h-12 text-xs border transition-colors
                              ${size === s ? 'bg-ink text-white border-ink' : 'border-neutral-300 hover:border-ink'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-8">
                        <span className="label-field">Quantity</span>
                        <div className="inline-flex items-center border border-neutral-300">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-11 h-11 hover:bg-neutral-100">−</button>
                            <span className="w-12 text-center text-sm">{quantity}</span>
                            <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                                    className="w-11 h-11 hover:bg-neutral-100">+</button>
                        </div>
                        <p className="mt-3 text-xs text-neutral-500">
                            {soldOut ? 'Out of stock' : `${product.stockQuantity} in stock`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => handleAdd(false)} disabled={soldOut || adding} className="btn-primary flex-1">
                            {adding ? 'Adding…' : 'Add to Bag'}
                        </button>
                        <button onClick={() => handleAdd(true)} disabled={soldOut || adding} className="btn-outline flex-1">
                            Buy Now
                        </button>
                    </div>

                    <div className="mt-10 pt-8 border-t border-neutral-200 space-y-3 text-xs text-neutral-500">
                        <button onClick={() => setShippingOpen(true)} className="underline hover:text-fg text-fg block">
                            View full Shipping & Returns Policy
                        </button>
                    </div>
                    <AboutUsPanel open={shippingOpen} onClose={() => setShippingOpen(false)} title="Shipping & Returns Policy" content={shippingPolicy} />
                </div>
            </div>

            {related.length > 0 && (
                <section className="mt-24 pt-12 border-t border-neutral-200">
                    <h2 className="text-xl md:text-2xl font-serif text-fg mb-8">You may be interested in</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
                        {related.map(rp => (
                            <Link to={`/product/${rp.slug}`} key={rp.id} className="group flex flex-col text-center">
                                <div className="relative bg-sand aspect-[3/4] overflow-hidden mb-4">
                                    {rp.images?.[0] ? (
                                        <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">No Image</div>
                                    )}
                                </div>
                                <div className="mt-auto">
                                    <h3 className="text-sm font-medium text-fg mb-1 group-hover:opacity-70 transition-opacity">{rp.name}</h3>
                                    <p className="text-sm text-fg">{formatPrice(rp.finalPrice)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
