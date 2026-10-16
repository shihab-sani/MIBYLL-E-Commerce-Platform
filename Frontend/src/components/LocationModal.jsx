import { useState } from 'react'
import { useLocalization } from '../context/LocalizationContext'

export default function LocationModal() {
    const {
        countries, languages, country, language,
        setCountry, setLanguage, confirmModal, showModal, t,
    } = useLocalization()

    const [remember, setRemember] = useState(true)

    if (!showModal || !country) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-5xl bg-paper border border-c grid md:grid-cols-2 overflow-hidden shadow-2xl">

                {/* LEFT — form */}
                <div className="p-8 md:p-14 flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-[0.35em] uppercase text-fg mb-3">
                        Mibyll
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest2 text-muted mb-10">
                        {t('modal.title')}
                    </p>

                    <div className="space-y-8">
                        <div>
                            <label className="label-field">{t('modal.location')}</label>
                            <select
                                value={country.code}
                                onChange={(e) => setCountry(e.target.value)}
                                className="input-field"
                            >
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.flag} {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label-field">{t('modal.language')}</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="input-field"
                            >
                                {languages.map((l) => (
                                    <option key={l.code} value={l.code}>
                                        {l.native} — {l.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => confirmModal(remember)}
                            className="btn-primary w-full"
                        >
                            {t('modal.continue')}
                        </button>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="w-4 h-4 accent-black dark:accent-white"
                            />
                            <span className="text-xs text-fg">{t('modal.remember')}</span>
                        </label>
                    </div>
                </div>

                {/* RIGHT — image */}
                <div className="hidden md:block relative">
                    <img
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}
