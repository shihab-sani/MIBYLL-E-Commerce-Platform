import { useEffect, useState, useMemo, useRef } from 'react' // <-- Added useRef
import { Link } from 'react-router-dom'
import api from '../api/axios'
import LuxuryDivider from '../components/LuxuryDivider'

// --- HERO SLIDER ---
function HeroSlider({ banners }) {
    const flatMedia = useMemo(() => {
        return banners.flatMap(banner =>
            (banner.mediaList || []).map(media => ({ ...media, banner }))
        );
    }, [banners]);

    const [globalIndex, setGlobalIndex] = useState(0);
    const videoRefs = useRef([]); // <-- Added video refs

    const currentMedia = flatMedia[globalIndex];
    const currentBanner = currentMedia?.banner;
    const isVideo = currentMedia?.mediaType === 'VIDEO';
    const isOnlySlide = flatMedia.length === 1;

    // 1. Manage Video Playback on Slide Change
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === globalIndex) {
                    video.currentTime = 0; // Rewind to start
                    video.play().catch(e => console.log('Video play interrupted', e));
                } else {
                    video.pause(); // Pause background videos
                }
            }
        });
    }, [globalIndex]);

    useEffect(() => {
        if (isOnlySlide || isVideo) return;

        const bannerMediaList = currentBanner?.mediaList || [];
        const indexInBanner = bannerMediaList.findIndex(m => m.mediaUrl === currentMedia.mediaUrl);
        const isLastMedia = indexInBanner === bannerMediaList.length - 1;
        const delay = isLastMedia ? 6000 : 3000;

        const timer = setTimeout(() => {
            setGlobalIndex((prev) => (prev + 1) % flatMedia.length);
        }, delay);

        return () => clearTimeout(timer);
    }, [globalIndex, flatMedia, isVideo, isOnlySlide, currentBanner, currentMedia]);

    if (!banners || banners.length === 0 || flatMedia.length === 0) return null;

    const nextSlide = () => setGlobalIndex((prev) => (prev + 1) % flatMedia.length);
    const prevSlide = () => setGlobalIndex((prev) => (prev === 0 ? flatMedia.length - 1 : prev - 1));

    return (
        <section className="relative h-screen min-h-[600px] w-full bg-gray-900 overflow-hidden transform-gpu group">
            {flatMedia.map((media, index) => (
                <div
                    key={`${media.banner.id}-${index}`}
                    className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out will-change-[opacity] ${
                        index === globalIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    {media.mediaType === 'VIDEO' ? (
                        <video
                            ref={el => videoRefs.current[index] = el} // <-- Attach ref
                            src={media.mediaUrl}
                            autoPlay
                            muted
                            loop={isOnlySlide}
                            onEnded={() => {
                                if (!isOnlySlide) nextSlide();
                            }}
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

            {/* Text Container */}
            <div className="absolute inset-0 z-20 flex items-end pb-20 md:pb-32 pointer-events-none">
                <div className="w-full max-w-[1500px] mx-auto px-5 lg:px-10">
                    <div className="max-w-xl text-left flex flex-col items-start pointer-events-auto">
                        {currentBanner?.title && (
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-4 drop-shadow-lg">
                                {currentBanner.title}
                            </h2>
                        )}
                        {currentBanner?.subtitle && (
                            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-8 max-w-md drop-shadow-md whitespace-pre-wrap">
                                {currentBanner.subtitle}
                            </p>
                        )}
                        {currentBanner?.ctaText && (
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
    const videoRefs = useRef([]); // <-- Added video refs

    const currentMedia = mediaList[mediaIndex];
    const isVideo = currentMedia?.mediaType === 'VIDEO';
    const isOnlyMedia = mediaList.length === 1;

    // 1. Manage Video Playback on Slide Change
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === mediaIndex) {
                    video.currentTime = 0;
                    video.play().catch(e => console.log('Video play interrupted', e));
                } else {
                    video.pause();
                }
            }
        });
    }, [mediaIndex]);

    useEffect(() => {
        if (isOnlyMedia || isVideo) return;

        const timer = setInterval(() => {
            setMediaIndex((prev) => (prev + 1) % mediaList.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [mediaList.length, isVideo, isOnlyMedia])

    if (mediaList.length === 0) return null

    const nextMedia = () => setMediaIndex((prev) => (prev + 1) % mediaList.length);

    return (
        <section className={`group flex flex-col md:flex-row h-screen min-h-[600px] bg-surface ${reverse ? 'md:flex-row-reverse' : ''}`}>
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
                                ref={el => videoRefs.current[index] = el} // <-- Attach ref
                                src={media.mediaUrl}
                                autoPlay
                                muted
                                loop={isOnlyMedia}
                                onEnded={() => {
                                    if (!isOnlyMedia) nextMedia();
                                }}
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                            />
                        ) : (
                            <img
                                src={media.mediaUrl}
                                alt={banner.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-24">
                <div className="max-w-md flex flex-col items-start text-left">
                    {banner.title && (
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-fg leading-tight mb-6">
                            {banner.title}
                        </h2>
                    )}
                    {banner.subtitle && (
                        <p className="text-muted text-sm md:text-base leading-relaxed mb-10">
                            {banner.subtitle}
                        </p>
                    )}
                    {banner.ctaText && (
                        <Link
                            to={banner.ctaLink || '#'}
                            className="inline-block border border-[#C5A880] text-[#C5A880] px-10 py-4 text-xs uppercase tracking-widest2 hover:bg-[#C5A880] hover:text-white transition-all duration-300 w-max"
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
            {topBanners.length > 0 ? (
                <HeroSlider banners={topBanners} />
            ) : (
                <div className="h-[50vh] flex items-center justify-center text-muted">No Hero Banner configured</div>
            )}

            <LuxuryDivider />

            <div className="flex flex-col">
                {editorialBanners.map((banner, index) => {
                    const isReverse = index % 2 !== 0
                    return (
                        <AlternatingBanner key={banner.id} banner={banner} reverse={isReverse} />
                    )
                })}
            </div>

            <LuxuryDivider />
        </div>
    )
}
