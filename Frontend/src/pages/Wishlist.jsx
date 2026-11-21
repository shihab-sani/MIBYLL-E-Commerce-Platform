import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useLocalization } from '../context/LocalizationContext'

export default function Wishlist() {
    const { wishlistItems, toggleWishlist } = useWishlist()
    const { formatPrice } = useLocalization()

    return (
        <div className="max-w-[1500px] mx-auto px-5 lg:px-10 pt-32 pb-24 min-h-[70vh]">
            <h1 className="text-4xl md:text-5xl font-serif text-fg mb-4 uppercase">Wish List</h1>
            <p className="text-sm text-muted mb-12">
                You have {wishlistItems.length} item{wishlistItems.length !== 1 && 's'} saved.
            </p>

            {wishlistItems.length === 0 ? (
                <div className="border border-c bg-surface py-24 text-center">
                    <p className="text-sm text-muted mb-6">Your wishlist is currently empty.</p>
                    <Link to="/shop" className="btn-primary">Discover Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {wishlistItems.map((product) => (
                        <div key={product.id} className="group relative flex flex-col">

                            {/* Image */}
                            <div className="relative aspect-[3/4] bg-sand overflow-hidden mb-5">
                                <Link to={`/product/${product.slug}`}>
                                    <img
                                        src={product.images?.[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </Link>

                                {/* Remove X Button */}
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white text-ink flex items-center justify-center rounded-full shadow-sm transition-colors"
                                    title="Remove"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Details */}
                            <div className="text-center flex-1 flex flex-col">
                                <h3 className="text-sm font-medium text-fg mb-1 uppercase tracking-wider">{product.name}</h3>
                                <p className="text-sm text-fg mb-4">{formatPrice(product.finalPrice)}</p>

                                <div className="mt-auto">
                                    <Link
                                        to={`/product/${product.slug}`}
                                        className="block text-center w-full bg-[#111] text-white py-3 text-[10px] uppercase tracking-widest2 hover:bg-black transition-colors"
                                    >
                                        Select Options
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
