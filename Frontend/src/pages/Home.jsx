import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import LuxuryDivider from '../components/LuxuryDivider'

function HeroSlider({ banners }) {
    // 1. Flatten all media from all banners into one single array
    const flatMedia = useMemo(() => {
        return banners.flatMap(banner =>
            (banner.mediaList || []).map(media => ({ ...media, banner }))
        );
    }, [banners]);

    const [globalIndex, setGlobalIndex] = useState(0);

    useEffect(() => {
        if (flatMedia.length <= 1) return;

        const currentMedia = flatMedia[globalIndex];
        const bannerMediaList = currentMedia.banner.mediaList || [];

        // Check if this is the last image of the current banner to set the 6s delay
        const indexInBanner = bannerMediaList.findIndex(m => m.mediaUrl === currentMedia.mediaUrl);
        const isLastMedia = indexInBanner === bannerMediaList.length - 1;

        const delay = isLastMedia ? 6000 : 3000;

        const timer = setTimeout(() => {
            setGlobalIndex((prev) => (prev + 1) % flatMedia.length);
        }, delay);

        return () => clearTimeout(timer);
    }, [globalIndex, flatMedia]);

    if (!banners || banners.length === 0 || flatMedia.length === 0) return null;

    const currentMedia = flatMedia[globalIndex];
    const currentBanner = currentMedia.banner;

    const nextSlide = () => setGlobalIndex((prev) => (prev + 1) % flatMedia.length);
    const prevSlide = () => setGlobalIndex((prev) => (prev === 0 ? flatMedia.length - 1 : prev - 1));

    return (
        <section className="relative h-screen min-h-[600px] w-full bg-gray-900 overflow-hidden transform-gpu group">

            {/* 2. Render ALL media simultaneously, but only show the active one */}
            {flatMedia.map((media, index) => (
                <div
                    key={`${media.banner.id}-${index}`}
                    // Changed ease-out to ease-in-out for a smoother luxury crossfade
                    className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out will-change-[opacity] ${
                        index === globalIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    {media.mediaType === 'VIDEO' ? (
                        <video
                            src={media.mediaUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-105 transform-gpu will-change-transform"
                        />
                    ) : (
                        <img
                            src={media.mediaUrl}
                            alt={media.banner.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-105 transform-gpu will-change-transform"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                </div>
            ))}

            {/* Navigation Arrows */}
            {flatMedia.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-white transition-transform duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-white transition-transform duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </>
            )}

            {/* Text Container (Uses the active banner's text) */}
            <div className="absolute inset-0 z-20 flex items-end pb-20 md:pb-32 pointer-events-none">
                <div className="w-full max-w-[1500px] mx-auto px-5 lg:px-10">
                    <div className="max-w-xl text-left flex flex-col items-start pointer-events-auto">

                        {currentBanner.title && (
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-4 drop-shadow-lg">
                                {currentBanner.title}
                            </h2>
                        )}

                        {currentBanner.subtitle && (
                            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-8 max-w-md drop-shadow-md whitespace-pre-wrap">
                                {currentBanner.subtitle}
                            </p>
                        )}

                        {currentBanner.ctaText && (
                            <Link
                                to={currentBanner.ctaLink || '#'}
                                className="inline-block bg-[#C5A880] text-black px-10 py-4 text-xs font-medium uppercase tracking-widest2 border border-[#C5A880] hover:bg-transparent hover:text-[#C5A880] transition-all duration-300 w-max"
                            >
                                {currentBanner.ctaText}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide Indicators */}
            {flatMedia.length > 1 && (
                <div className="absolute bottom-10 right-5 md:right-10 z-40 flex gap-2">
                    {flatMedia.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setGlobalIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 shadow-md ${
                                idx === globalIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/60 hover:bg-white'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

// --- ALTERNATING BANNER (Editorial) ---
function AlternatingBanner({ banner, reverse }) {
    const [mediaIndex, setMediaIndex] = useState(0)
    const mediaList = banner.mediaList || []

    useEffect(() => {
        if (mediaList.length <= 1) return
        const timer = setInterval(() => {
            setMediaIndex((prev) => (prev + 1) % mediaList.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [mediaList.length])

    if (mediaList.length === 0) return null

    return (
        /* 1. Added the `group` class to the section */
        <section className={`group flex flex-col md:flex-row h-screen min-h-[600px] bg-surface ${reverse ? 'md:flex-row-reverse' : ''}`}>

            {/* Image side: full height on desktop, 50vh on mobile */}
            <div className="w-full md:w-1/2 relative bg-sand flex-shrink-0 overflow-hidden h-[50vh] md:h-full">
                {mediaList.map((media, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === mediaIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        {media.mediaType === 'VIDEO' ? (
                            <video
                                src={media.mediaUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                            />
                        ) : (
                            <img
                                src={media.mediaUrl}
                                alt={banner.title}
                                /* 2. Added the zoom effect to the image */
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Text side: Centered vertically, left-aligned horizontally */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-24">
                <div className="max-w-md flex flex-col items-start text-left">
                    {/* TITLE FIRST */}
                    {banner.title && (
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-fg leading-tight mb-6">
                            {banner.title}
                        </h2>
                    )}

                    {/* DESCRIPTION UNDER TITLE */}
                    {banner.subtitle && (
                        <p className="text-muted text-sm md:text-base leading-relaxed mb-10">
                            {banner.subtitle}
                        </p>
                    )}

                    {/* BUTTON */}
                    {banner.ctaText && (
                        <Link
                            to={banner.ctaLink || '#'}
                            /* Added hover:scale-105 to the button as well for extra interactivity */
                            className="inline-block border border-[#C5A880] text-[#C5A880] px-10 py-4 text-xs uppercase tracking-widest2 hover:bg-[#C5A880] hover:text-white hover:scale-105 transition-all duration-300 w-max"
                        >
                            {banner.ctaText}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    )
}

export default function Home() {
    const [topBanners, setTopBanners] = useState([])
    const [editorialBanners, setEditorialBanners] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/banners?position=TOP'),
            api.get('/banners?position=EDITORIAL')
        ]).then(([topRes, editRes]) => {
            const sortedTop = topRes.data.sort((a, b) => a.displayOrder - b.displayOrder)
            const sortedEdit = editRes.data.sort((a, b) => a.displayOrder - b.displayOrder)
            setTopBanners(sortedTop)
            setEditorialBanners(sortedEdit)
        }).catch(() => {
            // Handle error
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="h-screen bg-surface flex items-center justify-center text-muted">Loading…</div>

    return (
        <div className="bg-surface min-h-screen">
            {/* 1. DYNAMIC HERO SLIDER */}
            {topBanners.length > 0 ? (
                <HeroSlider banners={topBanners} />
            ) : (
                <div className="h-[50vh] flex items-center justify-center text-muted">No Hero Banner configured</div>
            )}

            {/* 2. DIVIDER */}
            <LuxuryDivider />

            {/* 3. DYNAMIC EDITORIAL BANNERS */}
            <div className="flex flex-col">
                {editorialBanners.map((banner, index) => {
                    const isReverse = index % 2 !== 0
                    return (
                        <AlternatingBanner key={banner.id} banner={banner} reverse={isReverse} />
                    )
                })}
            </div>

            {/* 4. FINAL DIVIDER */}
            <LuxuryDivider />
        </div>
    )
}
