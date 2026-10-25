export default function LuxuryDivider() {
    return (
        <div className="flex items-center justify-center w-full py-16 px-4 bg-white">
            <div className="h-[1px] bg-[#C5A880] flex-1 max-w-[30%] opacity-60" />
            <div className="mx-4 text-[#C5A880]">
                {/* Simple SVG Ornament */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                </svg>
            </div>
            <div className="h-[1px] bg-[#C5A880] flex-1 max-w-[30%] opacity-60" />
        </div>
    )
}
