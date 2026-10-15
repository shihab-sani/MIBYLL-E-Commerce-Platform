import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

export default function ProductDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { addToCart } = useCart()

    const [product, setProduct] = useState(null)
    const [activeImage, setActiveImage] = useState(0)
    const [size, setSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        setLoading(true)
        api.get(`/products/${slug}`)
            .then(r => { setProduct(r.data); setActiveImage(0) })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false))
    }, [slug])

    const handleAdd = async (buyNow = false) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to continue')
            navigate('/login', { state: { from: `/product/${slug}` } })
            return
        }
        setAdding(true)
        try {
            await addToCart(product.id, quantity, size)
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
        <div className="max-w-[1500px] mx-auto px-5 lg:px-10 py-10 lg:py-16">
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
                        <span className="text-2xl">${product.finalPrice}</span>
                        {hasDiscount && (
                            <>
                                <span className="text-base text-neutral-400 line-through">${product.price}</span>
                                <span className="text-[10px] uppercase tracking-widest2 bg-ink text-white px-2 py-1">
                  Save {product.discountPercent}%
                </span>
                            </>
                        )}
                    </div>

                    <p className="text-sm text-neutral-600 leading-relaxed mb-10">{product.description}</p>

                    {/* Size */}
                    <div className="mb-7">
                        <div className="flex justify-between mb-3">
                            <span className="label-field mb-0">Size</span>
                            <span className="text-[10px] uppercase tracking-widest2 text-neutral-400">Size guide</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SIZES.map(s => (
                                <button key={s} onClick={() => setSize(s === size ? '' : s)}
                                        className={`w-12 h-12 text-xs border transition-colors
                          ${size === s ? 'bg-ink text-white border-ink' : 'border-neutral-300 hover:border-ink'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

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
                        <button onClick={() => handleAdd(false)} disabled={soldOut || adding}
                                className="btn-primary flex-1">
                            {adding ? 'Adding…' : 'Add to Bag'}
                        </button>
                        <button onClick={() => handleAdd(true)} disabled={soldOut || adding}
                                className="btn-outline flex-1">
                            Buy Now
                        </button>
                    </div>

                    <div className="mt-10 pt-8 border-t border-neutral-200 space-y-3 text-xs text-neutral-500">
                        <p>Complimentary shipping on all orders over $200.</p>
                        <p>Free returns within 30 days of delivery.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}