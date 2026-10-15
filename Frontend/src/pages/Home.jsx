import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import BannerSlider from '../components/BannerSlider'

const categories = [
    { name: 'Women', slug: 'women', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200' },
    { name: 'Men', slug: 'men', img: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200' },
    { name: 'Accessories', slug: 'accessories', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200' },
]

function DefaultHero() {
    return (
        <section className="relative h-[85vh] min-h-[520px] w-full overflow-hidden">
            <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2000"
                alt="Campaign"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
                <p className="text-[10px] uppercase tracking-widest2 mb-5 opacity-90">
                    Autumn / Winter Collection
                </p>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light leading-[0.95] max-w-4xl">
                    The Art of<br />Quiet Luxury
                </h1>
                <Link to="/shop" className="mt-10 btn-outline border-white text-white hover:bg-white hover:text-ink">
                    Explore the Collection
                </Link>
            </div>
        </section>
    )
}

function EditorialFallback() {
    return (
        <section className="relative h-[70vh] min-h-[420px] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=2000"
                 alt="Editorial" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
                <h2 className="text-4xl md:text-6xl font-serif font-light max-w-3xl leading-tight">
                    Crafted slowly.<br />Worn forever.
                </h2>
                <p className="mt-6 text-sm max-w-lg opacity-90 leading-relaxed">
                    Each piece is made in limited quantities by artisans who have honed their craft over generations.
                </p>
            </div>
        </section>
    )
}

export default function Home() {
    const [featured, setFeatured] = useState([])
    const [newArrivals, setNewArrivals] = useState([])
    const [topBanners, setTopBanners] = useState([])
    const [bottomBanners, setBottomBanners] = useState([])

    useEffect(() => {
        api.get('/banners?position=TOP').then(r => setTopBanners(r.data)).catch(() => {})
        api.get('/banners?position=BOTTOM').then(r => setBottomBanners(r.data)).catch(() => {})
        api.get('/products/featured?limit=8').then(r => setFeatured(r.data)).catch(() => {})
        api.get('/products/new-arrivals?limit=8').then(r => setNewArrivals(r.data)).catch(() => {})
    }, [])

    return (
        <div>
            {/* 1 — TOP BANNER */}
            {topBanners.length > 0
                ? <BannerSlider banners={topBanners} variant="hero" />
                : <DefaultHero />}

            {/* 2 — CATEGORY TILES */}
            <section className="max-w-[1500px] mx-auto px-5 lg:px-10 py-20 lg:py-28">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {categories.map((c) => (
                        <Link key={c.slug} to={`/shop?category=${c.slug}`}
                              className="group relative aspect-[4/5] overflow-hidden hover-lift">
                            <img src={c.img} alt={c.name}
                                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute bottom-8 left-0 right-0 text-center text-white">
                                <h3 className="text-2xl font-serif tracking-[0.25em] uppercase">{c.name}</h3>
                                <span className="inline-block mt-3 text-[10px] uppercase tracking-widest2
                                 border-b border-white/70 pb-1">Discover</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 3 — FEATURED */}
            {featured.length > 0 && (
                <section className="max-w-[1500px] mx-auto px-5 lg:px-10 pb-20">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest2 text-muted mb-3">Curated</p>
                            <h2 className="text-3xl md:text-4xl font-serif text-fg">Featured Pieces</h2>
                        </div>
                        <Link to="/shop" className="nav-link border-b border-fg pb-1 hidden md:block">View All</Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
                        {featured.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* 4 — NEW ARRIVALS */}
            {newArrivals.length > 0 && (
                <section className="max-w-[1500px] mx-auto px-5 lg:px-10 pb-20">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest2 text-muted mb-3">Just In</p>
                            <h2 className="text-3xl md:text-4xl font-serif text-fg">New Arrivals</h2>
                        </div>
                        <Link to="/shop?sort=newest" className="nav-link border-b border-fg pb-1 hidden md:block">View All</Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
                        {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* 5 — BOTTOM BANNER (reviews-ready) */}
            {bottomBanners.length > 0
                ? <BannerSlider banners={bottomBanners} variant="compact" />
                : <EditorialFallback />}
        </div>
    )
}