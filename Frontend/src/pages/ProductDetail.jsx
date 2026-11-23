import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useLocalization } from '../context/LocalizationContext'
import AboutUsPanel from '../components/AboutUsPanel'
import { useWishlist } from '../context/WishlistContext'

export default function ProductDetail() {
    const { slug } = useParams()
    const { formatPrice } = useLocalization()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { addToCart } = useCart()

    // 1. Move ALL state declarations to the top
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

    const [reviews, setReviews] = useState([])
    const [rating, setRating] = useState(5)
    const [reviewImages, setReviewImages] = useState([])
    const [comment, setComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)
    const [editingReviewId, setEditingReviewId] = useState(null)

    // 2. Now safely use the Wishlist context
    const { isInWishlist, toggleWishlist } = useWishlist()
    const isSaved = isInWishlist(product?.id)

    // Helper to get available sizes based on Admin's selection
    const getSizes = (type) => {
        let allSizes = [];
        if (type === 'CLOTHING') allSizes = ['XS', 'S', 'M', 'L', 'XL']
        else if (type === 'SHOES') allSizes = ['38', '39', '40', '41', '42', '43', '44', '45']
        else if (type === 'RINGS') allSizes = ['5', '6', '7', '8', '9', '10', '11', '12']

        if (product?.disabledSizes) {
            return allSizes.filter(s => !product.disabledSizes.includes(s))
        }
        return allSizes
    }

    const availableSizes = getSizes(product?.sizeType)

    useEffect(() => {
        setLoading(true)
        api.get(`/products/${slug}`)
            .then(r => {
                setProduct(r.data)
                setActiveImage(0)
                setSize('')
                setSelectedVariant(null)

                api.get(`/products/${slug}/reviews`).then(res => setReviews(res.data)).catch(() => {})

                api.get(`/products/${slug}/related`)
                    .then(res => setRelated(res.data))
                    .catch(() => {})
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false))

        return () => document.body.classList.remove('hide-navbar')
    }, [slug])

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

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) {
            toast.error('Please sign in to leave a review')
            return
        }
        setSubmittingReview(true)
        try {
            const payload = { rating, comment, imageUrls: reviewImages }

            if (editingReviewId) {
                await api.put(`/products/${slug}/reviews/${editingReviewId}`, payload)
                toast.success('Your review has been updated.')
            } else {
                await api.post(`/products/${slug}/reviews`, payload)
                toast.success('Thank you! Your review has been submitted.')
            }

            setComment('')
            setRating(5)
            setReviewImages([])
            setEditingReviewId(null)

            api.get(`/products/${slug}/reviews`).then(res => setReviews(res.data))
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review')
        } finally {
            setSubmittingReview(false)
        }
    }

    const handleEditClick = (review) => {
        setEditingReviewId(review.id)
        setRating(review.rating)
        setComment(review.comment)
        setReviewImages(review.imageUrls || [])
        document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setEditingReviewId(null)
        setRating(5)
        setComment('')
        setReviewImages([])
    }

    const handleDeleteClick = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return
        try {
            await api.delete(`/products/${slug}/reviews/${reviewId}`)
            toast.success('Review deleted.')
            api.get(`/products/${slug}/reviews`).then(res => setReviews(res.data))
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete review')
        }
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
    const displayImg = selectedVariant?.imageUrl || product.images?.[activeImage];

    return (
        <div className="max-w-[1500px] mx-auto px-5 lg:px-10 pt-32 pb-10 lg:pb-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                {/* GALLERY */}
                <div className="flex gap-4">
                    {product.images?.length > 1 && (
                        <div className="flex flex-col gap-3 w-20 shrink-0">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setActiveImage(i);
                                        setSelectedVariant(null);
                                    }}
                                    className={`aspect-[3/4] overflow-hidden border transition-colors ${
                                        (!selectedVariant && activeImage === i) ? 'border-fg' : 'border-transparent'
                                    }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 bg-sand aspect-[3/4] overflow-hidden">
                        {displayImg ? (
                            <img src={displayImg} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">No image</div>
                        )}
                    </div>
                </div>

                {/* INFO */}
                <div className="lg:pt-4 lg:sticky lg:top-28 self-start min-w-0 w-full">
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

                    <p className="text-sm text-neutral-600 leading-relaxed mb-10 break-words whitespace-pre-wrap">{product.description}</p>

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
                                        className={`w-16 h-16 border-2 overflow-hidden transition-all duration-200 ${
                                            selectedVariant?.id === v.id
                                                ? 'border-fg scale-105 shadow-md'
                                                : 'border-c hover:border-fg'
                                        }`}
                                        title={v.name}
                                    >
                                        <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                            {selectedVariant && (
                                <p className="text-xs text-muted mt-3">
                                    Selected: <span className="text-fg font-medium">{selectedVariant.name}</span>
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

                    <div className="flex gap-3 mt-8">
                        <button onClick={() => handleAdd(false)} disabled={soldOut || adding} className="btn-primary flex-1">
                            {adding ? 'Adding…' : 'Add to Bag'}
                        </button>
                        <button
                            onClick={() => toggleWishlist(product.id)}
                            className={`w-12 h-12 shrink-0 flex items-center justify-center border transition-colors ${
                                isSaved ? 'border-[#C5A880]' : 'border-c hover:border-fg'
                            }`}
                            title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <svg
                                width="20" height="20" viewBox="0 0 24 24"
                                fill={isSaved ? "#C5A880" : "none"}
                                stroke={isSaved ? "#C5A880" : "currentColor"}
                                strokeWidth="1.5"
                                className={isSaved ? "" : "text-fg"}
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
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

            {/* --- CUSTOMER REVIEWS SECTION --- */}
            <section className="mt-24 pt-12 border-t border-neutral-200">
                <h2 className="text-2xl md:text-3xl font-serif text-fg mb-10 text-center">Customer Reviews</h2>

                <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-24">

                    {/* Write a Review Form */}
                    <div id="review-form" className="bg-surface border border-c p-6 md:p-8 h-fit relative">
                        <h3 className="text-[11px] uppercase tracking-widest2 text-fg mb-6">
                            {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
                        </h3>

                        <form onSubmit={handleReviewSubmit}>

                            {/* Star Rating Selector */}
                            <div className="mb-6">
                                <label className="label-field mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <svg
                                                width="24" height="24" viewBox="0 0 24 24"
                                                fill={star <= rating ? "#C5A880" : "none"}
                                                stroke={star <= rating ? "#C5A880" : "currentColor"}
                                                strokeWidth="1"
                                                className={star <= rating ? "" : "text-neutral-300"}
                                            >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="label-field">Your Review</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    className="input-field resize-none"
                                    placeholder="Share your thoughts about this piece..."
                                />
                            </div>

                            <div className="mb-6">
                                <label className="label-field">Add Photos (Optional)</label>
                                <ImageUploader
                                    value={reviewImages}
                                    onChange={(urls) => setReviewImages(urls)}
                                    multiple={true}
                                    uploadUrl="/upload"
                                />
                            </div>

                            <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                                {submittingReview ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                            </button>

                            {/* Cancel Edit Button */}
                            {editingReviewId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="btn-outline w-full mt-3"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Reviews List */}
                    <div>
                        {reviews.map((review) => {
                            // STRICT CHECK: User must be logged in, have an email, and match the review's email
                            const isMyReview = user && user.email && review.userEmail &&
                                user.email.toLowerCase() === review.userEmail.toLowerCase();

                            return (
                                <div key={review.id} className="border-b border-c pb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-fg">{review.userName}</span>
                                            <span className="text-[10px] uppercase tracking-widest2 text-muted">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Stars */}
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg
                                                        key={star}
                                                        width="14" height="14" viewBox="0 0 24 24"
                                                        fill={star <= review.rating ? "#C5A880" : "none"}
                                                        stroke={star <= review.rating ? "#C5A880" : "currentColor"}
                                                        strokeWidth="1"
                                                        className={star <= review.rating ? "" : "text-neutral-300"}
                                                    >
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                ))}
                                            </div>

                                            {/* Edit / Delete Options (Only visible to the owner) */}
                                            {isMyReview && (
                                                <div className="flex gap-2 ml-4 border-l border-c pl-4">
                                                    <button
                                                        onClick={() => handleEditClick(review)}
                                                        className="text-[10px] uppercase tracking-widest2 text-fg hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(review.id)}
                                                        className="text-[10px] uppercase tracking-widest2 text-red-500 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{review.comment}</p>

                                    {/* Images */}
                                    {review.imageUrls && review.imageUrls.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {review.imageUrls.map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-16 h-16 md:w-20 md:h-20 border border-c bg-sand overflow-hidden hover:opacity-80 transition-opacity"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Review image ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    {review.adminReply && (
                                        <div className="mt-4 p-3 bg-cbord/10 border-l-2 border-[#C5A880]">
                                            <p className="text-[10px] uppercase tracking-widest2 text-[#C5A880] mb-1">Reply from Mibyll</p>
                                            <p className="text-xs text-fg">{review.adminReply}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

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
                                    <h3 className="text-sm font-medium text-fg mb-1 group-hover:opacity-70 transition-opacity break-words">{rp.name}</h3>
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
