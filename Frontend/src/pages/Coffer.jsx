import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../api/axios'

export default function Coffer() {
    const [entries, setEntries] = useState([])
    const [activeYear, setActiveYear] = useState('')
    const [loading, setLoading] = useState(true)

    // Refs for measuring positions
    const yearRefs = useRef({})
    const [markerTop, setMarkerTop] = useState(0)

    // Fetch data
    useEffect(() => {
        api.get('/coffer')
            .then(r => {
                setEntries(r.data)
                if (r.data.length > 0) setActiveYear(r.data[0].year)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    // Update the floating marker position when activeYear changes
    const updateMarkerPosition = useCallback(() => {
        const activeEl = yearRefs.current[activeYear]
        if (activeEl) {
            // Get the vertical center of the active year button
            const top = activeEl.offsetTop + activeEl.offsetHeight / 2
            setMarkerTop(top)
        }
    }, [activeYear])

    useEffect(() => {
        // Small timeout to ensure DOM is ready after render
        const timer = setTimeout(updateMarkerPosition, 50)
        window.addEventListener('resize', updateMarkerPosition)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', updateMarkerPosition)
        }
    }, [activeYear, updateMarkerPosition, entries])

    if (loading) return <div className="h-screen flex items-center justify-center text-muted">Loading...</div>

    const activeEntry = entries.find(e => e.year === activeYear) || entries[0]

    return (
        <div className="bg-surface min-h-screen pt-32 pb-24">
            {/* Editorial Header */}
            <div className="text-center max-w-3xl mx-auto px-5 mb-24">
                <h1 className="text-4xl md:text-6xl font-serif text-fg mb-6">The History of the House</h1>
                <div className="w-24 h-px bg-[#C5A880] mx-auto mb-6" />
                <p className="text-muted text-sm leading-relaxed">
                    A timeline of the key moments and milestones that make up the House's incredible legacy.
                </p>
            </div>

            <div className="max-w-[1200px] mx-auto px-5 lg:px-10 flex flex-col md:flex-row gap-12 md:gap-24 relative">

                {/* --- REFINED YEAR SCRUBBER --- */}
                <aside className="w-full md:w-48 shrink-0">
                    <div className="md:sticky md:top-40 relative">

                        {/* Floating Gold Marker */}
                        <div
                            className="absolute left-0 w-8 h-8 -ml-3 rounded-full bg-[#C5A880]/30 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-0"
                            style={{
                                top: `${markerTop}px`,
                                transform: 'translateY(-50%)'
                            }}
                        />

                        {/* Years List */}
                        <div className="flex flex-row md:flex-col gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 custom-scrollbar relative z-10">
                            {entries.map(e => (
                                <button
                                    key={e.id}
                                    ref={el => yearRefs.current[e.year] = el}
                                    onClick={() => setActiveYear(e.year)}
                                    className={`relative text-left transition-all duration-500 focus:outline-none whitespace-nowrap ${
                                        activeYear === e.year
                                            ? 'text-[#C5A880] text-3xl font-serif font-medium md:translate-x-3'
                                            : 'text-muted/60 text-lg hover:text-fg/80'
                                    }`}
                                >
                                    {e.year}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Active Content Area */}
                <main className="flex-1">
                    {activeEntry && (
                        <section
                            key={activeEntry.id}
                            className="animate-fade-in flex flex-col md:flex-row gap-10 md:gap-20 items-start"
                        >
                            <div className="flex-1 md:pt-4">
                                <h2 className="text-5xl font-serif mb-6 text-[#C5A880]">
                                    {activeEntry.year}
                                </h2>
                                <h3 className="text-3xl font-serif text-fg mb-6 leading-tight break-words">
                                    {activeEntry.title}
                                </h3>
                                <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {activeEntry.description}
                                </p>
                            </div>

                            {activeEntry.imageUrl && (
                                <div className="w-full md:w-1/2 shrink-0 aspect-[4/5] bg-sand overflow-hidden shadow-xl">
                                    <img
                                        src={activeEntry.imageUrl}
                                        alt={activeEntry.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>
        </div>
    )
}
