import { useEffect } from 'react'

export default function AboutUsPanel({ open, onClose, title, content }) {
    useEffect(() => {
        if (!open) return
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [open, onClose])

    return (
        <div className={`fixed inset-0 z-[80] ${open ? '' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300
                            ${open ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Panel */}
            <aside
                className={`absolute right-0 top-0 h-full w-full sm:w-[520px] max-w-full
                            shadow-2xl overflow-y-auto transition-transform duration-400 ease-out
                            ${open ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ background: 'rgb(var(--paper))' }}
            >
                <div className="flex items-center justify-between p-6 border-b border-c">
                    <h2 className="text-2xl font-serif text-fg">{title || 'About Us'}</h2>
                    <button onClick={onClose}
                            aria-label="Close"
                            className="text-2xl text-fg leading-none hover:opacity-60">×</button>
                </div>

                <div className="p-6 text-sm text-fg leading-relaxed whitespace-pre-wrap">
                    {content || 'No content yet.'}
                </div>
            </aside>
        </div>
    )
}
