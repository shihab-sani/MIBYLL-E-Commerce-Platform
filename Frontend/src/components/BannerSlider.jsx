import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function BannerSlider({ banners, variant = 'hero' }) {
    const [index, setIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const touchStart = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (paused || banners.length <= 1) return
        const t = setTimeout(() => setIndex(i => (i + 1) % banners.length), 6000)
        return () => clearTimeout(t)
    }, [index, paused, banners.length])

    useEffect(() => {
        if (index >= banners.length) setIndex(0)
    }, [banners.length, index])

    if (!banners || banners.length === 0) return null

    const next = () => setIndex(i => (i + 1) % banners.length)
    const prev = () => setIndex(i => (i - 1 + banners.length) % banners.length)

    const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
    const onTouchEnd = (e) => {
        if (touchStart.current == null) return
        const dx = e.changedTouches[0].clientX - touchStart.current
        if (Math.abs(dx) > 50) { dx < 0 ? next() : prev() }
        touchStart.current = null
    }

    const current = banners[index]

    /** Resolve the click target for the active banner. */
    const targetFor = (b) => {
        if (b.linkedProductSlug) return `/product/${b.linkedProductSlug}`
        if (b.ctaLink) return b.ctaLink
        return null
    }

    const target = targetFor(current)
    const isCompact = variant === 'compact'

    const containerH = isCompact
        ? 'h-[55vh] min-h-[380px]'
        : 'h-[85vh] min-h-[520px]'

    return (
        <section
            className={`relative ${containerH} w-full overflow-hidden bg-sand`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Media layers */}
            {banners.map((b, i) => {
                const itemTarget = targetFor(b)
                const mediaInner = b.mediaType === 'VIDEO' ? (
                    <video
                        key={`${b.id}-${i === index ? 'active' : 'idle'}`}
                        src={b.mediaUrl}
                        autoPlay muted loop playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src={b.mediaUrl}
                        alt={b.title || ''}
                        className={`absolute inset-0 w-full h-full object-cover
                        transition-transform duration-[8000ms] ease-out
                        ${i === index ? 'scale-105' : 'scale-100'}`}
                    />
                )

                return (
                    <div
                        key={b.id}
                        className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out
                        ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}
                        ${itemTarget && i === index ? 'cursor-pointer' : ''}`}
                        onClick={itemTarget && i === index ? () => navigate(itemTarget) : undefined}
                    >
                        {mediaInner}
                        <div className={`absolute inset-0 ${isCompact ? 'bg-black/15' : 'bg-black/30'}`} />
                    </div>
                )
            })}

            {/* Text overlay — only if the active banner has text */}
            {!isCompact && (current.title || current.subtitle || current.ctaText) && (
                <div className="relative z-20 h-full flex flex-col items-center justify-center text-center
                        text-white px-6 pointer-events-none">
                    <div key={index} className="animate-fade-in max-w-4xl pointer-events-auto">
                        {current.subtitle && (
                            <p className="text-[10px] uppercase tracking-widest2 mb-5 opacity-90">
                                {current.subtitle}
                            </p>
                        )}
                        {current.title && (
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light leading-[0.95] whitespace-pre-line">
                                {current.title}
                            </h1>
                        )}
                        {current.ctaText && target && (
                            <Link
                                to={target}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-10 inline-block btn-outline border-white text-white
                           hover:bg-white hover:text-ink"
                            >
                                {current.ctaText}
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prev() }}
                        aria-label="Previous banner"
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11
                       flex items-center justify-center text-white text-2xl leading-none
                       border border-white/40 hover:bg-white/20 transition-all"
                    >
                        ‹
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next() }}
                        aria-label="Next banner"
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11
                       flex items-center justify-center text-white text-2xl leading-none
                       border border-white/40 hover:bg-white/20 transition-all"
                    >
                        ›
                    </button>
                </>
            )}

            {/* Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setIndex(i) }}
                            aria-label={`Go to slide ${i + 1}`}
                            className={`h-[2px] transition-all duration-500
                          ${i === index ? 'w-10 bg-white' : 'w-5 bg-white/40 hover:bg-white/70'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}