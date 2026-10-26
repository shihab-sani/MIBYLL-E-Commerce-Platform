import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import LuxuryDivider from '../components/LuxuryDivider'

// --- HERO SLIDER ---
function HeroSlider({ banners }) {
    const [bannerIndex, setBannerIndex] = useState(0)
    const [mediaIndex, setMediaIndex] = useState(0)

    // Dynamic Auto-slide logic
    useEffect(() => {
        if (!banners || banners.length === 0) return

        const currentBanner = banners[bannerIndex]
        const mediaList = currentBanner.mediaList || []
        if (mediaList.length === 0) return

        // Check if this is the last image of the current banner
        const isLastMedia = mediaIndex === mediaList.length - 1

        // Wait 6 seconds if it's the last image, otherwise 3 seconds
        const delay = isLastMedia ? 6000 : 3000

        const timer = setTimeout(() => {
            if (isLastMedia) {
                // Move to next banner and reset media
                setMediaIndex(0)
                setBannerIndex((prev) => (prev + 1) % banners.length)
            } else {
                // Cycle to next image in the same banner
                setMediaIndex((prev) => prev + 1)
            }
        }, delay)

        return () => clearTimeout(timer)
    }, [bannerIndex, mediaIndex, banners])

    if (!banners || banners.length === 0) return null

    const currentBanner = banners[bannerIndex]
    const currentMediaList = currentBanner.mediaList || []
    const currentMedia = currentMediaList[mediaIndex] || currentMediaList[0] || {}

    // Manual Navigation (Arrows)
    const nextSlide = () => {
        setBannerIndex((prev) => (prev + 1) % banners.length)
        setMediaIndex(0)
    }

    const prevSlide = () => {
        setBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
        setMediaIndex(0)
    }

    return (
        <section className="relative h-screen min-h-[600px] w-full bg-gray-100 overflow-hidden group">

            {/* Background Media Layers (Cycles through the images of the CURRENT banner) */}
            {currentMediaList.map((media, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
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
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={media.mediaUrl}
                            alt={currentBanner.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[5000ms] group-hover:scale-105"
                        />
                    )}
                </div>
            ))}

            {/* Navigation Arrows (Only show if there is more than 1 banner to slide between) */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </>
            )}

            {/* Text Container (Hover Reveal) */}
            <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 lg:px-24 pb-24
                            opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-8 group-hover:translate-y-0 z-20 pointer-events-none">

                {/* We key this by bannerIndex so the text animates when the banner changes */}
                <div key={bannerIndex} className="pointer-events-auto animate-fade-in">
                    {currentBanner.title && (
                        <h1 className="text-[#1a1a1a] text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-4 max-w-3xl drop-shadow-sm">
                            {currentBanner.title}
                        </h1>
                    )}
                    {currentBanner.subtitle && (
                        <p className="text-[#1a1a1a] text-sm md:text-base tracking-wide mb-8 max-w-2xl drop-shadow-sm">
                            {currentBanner.subtitle}
                        </p>
                    )}
                    {currentBanner.ctaText && (
                        <Link
                            to={currentBanner.ctaLink || '#'}
                            className="inline-block bg-[#ffffff] text-[#000000] border border-[#000000] px-10 py-3.5 text-xs uppercase tracking-widest2 hover:bg-[#000000] hover:text-[#ffffff] transition-colors w-max shadow-md font-medium mt-2"
                        >
                            {currentBanner.ctaText}
                        </Link>
                    )}
                </div>
            </div>

            {/* Slide Indicators (Dots) */}
            {banners.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setBannerIndex(idx)
                                setMediaIndex(0)
                            }}
                            className={`h-1 transition-all duration-300 ${
                                idx === bannerIndex ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'
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
        <section className={`flex flex-col md:flex-row min-h-[70vh] bg-surface ${reverse ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2 relative bg-sand flex-shrink-0 overflow-hidden">
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
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={media.mediaUrl}
                                alt={banner.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-24">
                <div className="max-w-md text-center flex flex-col items-center">
                    {banner.subtitle && (
                        <p className="text-muted text-xs uppercase tracking-widest2 mb-6">
                            {banner.subtitle}
                        </p>
                    )}
                    {banner.title && (
                        <h2 className="text-4xl md:text-5xl font-serif text-fg leading-tight mb-6">
                            {banner.title}
                        </h2>
                    )}
                    {banner.description && (
                        <p className="text-muted text-sm leading-relaxed mb-10">
                            {banner.description}
                        </p>
                    )}
                    {banner.ctaText && (
                        <Link
                            to={banner.ctaLink || '#'}
                            className="inline-block border border-[#C5A880] text-[#C5A880] px-10 py-3 text-xs uppercase tracking-widest2 hover:bg-[#C5A880] hover:text-white transition-colors w-max"
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
