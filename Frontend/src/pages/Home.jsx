import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import LuxuryDivider from '../components/LuxuryDivider'

// --- HERO BANNER ---
function HeroBanner({ banner }) {
    if (!banner) return null
    return (
        <section className="relative h-screen min-h-[600px] w-full bg-gray-100 overflow-hidden group">
            {banner.mediaType === 'VIDEO' ? (
                <video src={banner.mediaUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <img src={banner.mediaUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105" />
            )}

            <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 lg:px-24 pb-24
                            opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-8 group-hover:translate-y-0">
                {banner.title && (
                    <h1 className="text-[#1a1a1a] text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-4 max-w-3xl drop-shadow-sm">
                        {banner.title}
                    </h1>
                )}
                {banner.subtitle && (
                    <p className="text-[#1a1a1a] text-sm md:text-base tracking-wide mb-8 max-w-2xl drop-shadow-sm">
                        {banner.subtitle}
                    </p>
                )}
                {banner.ctaText && (
                    <Link
                        to={banner.ctaLink || '#'}
                        className="inline-block bg-[#ffffff] text-[#000000] border border-[#000000] px-10 py-3.5 text-xs uppercase tracking-widest2 hover:bg-[#000000] hover:text-[#ffffff] transition-colors w-max shadow-md font-medium mt-2"
                    >
                        {banner.ctaText}
                    </Link>
                )}
            </div>
        </section>
    )
}

// --- ALTERNATING BANNER ---
function AlternatingBanner({ banner, reverse }) {
    return (
        <section className={`flex flex-col md:flex-row min-h-[70vh] bg-surface ${reverse ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2 relative bg-sand flex-shrink-0">
                {banner.mediaType === 'VIDEO' ? (
                    <video src={banner.mediaUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <img src={banner.mediaUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
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
                    {/* We use 'description' or fallback to empty string since Banner doesn't have a 'description' field in the DB, only subtitle */}
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
    const [heroBanner, setHeroBanner] = useState(null)
    const [editorialBanners, setEditorialBanners] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch both positions
        Promise.all([
            api.get('/banners?position=TOP'),
            api.get('/banners?position=EDITORIAL')
        ]).then(([topRes, editRes]) => {
            if (topRes.data.length > 0) setHeroBanner(topRes.data[0])
            setEditorialBanners(editRes.data)
        }).catch(() => {
            // Handle error silently
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="h-screen bg-surface flex items-center justify-center text-muted">Loading…</div>

    return (
        <div className="bg-surface min-h-screen">
            {/* 1. HERO BANNER */}
            {heroBanner ? <HeroBanner banner={heroBanner} /> : <div className="h-[50vh] flex items-center justify-center">No Hero Banner</div>}

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
