import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
    const hasDiscount = product.discountPercent > 0
    const hoverImage = product.images?.[1] || product.images?.[0]

    return (
        <Link to={`/product/${product.slug}`} className="group block">
            <div className="relative overflow-hidden bg-sand aspect-[3/4]">
                {product.images?.[0] ? (
                    <>
                        <img src={product.images[0]} alt={product.name} loading="lazy"
                             className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0" />
                        <img src={hoverImage} alt={product.name} loading="lazy"
                             className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">No image</div>
                )}

                {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-ink text-white text-[9px] uppercase tracking-widest2 px-2.5 py-1">
            −{product.discountPercent}%
          </span>
                )}
                {product.stockQuantity === 0 && (
                    <span className="absolute top-3 right-3 text-[9px] uppercase tracking-widest2 px-2.5 py-1
                           bg-surface text-fg border border-c">
            Sold Out
          </span>
                )}
            </div>

            <div className="pt-4 pb-2">
                {product.brand && (
                    <p className="text-[10px] uppercase tracking-widest2 text-muted mb-1">{product.brand}</p>
                )}
                <h3 className="text-sm font-sans font-normal leading-snug text-fg">{product.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm text-fg">${product.finalPrice}</span>
                    {hasDiscount && (
                        <span className="text-xs text-muted line-through">${product.price}</span>
                    )}
                </div>
            </div>
        </Link>
    )
}