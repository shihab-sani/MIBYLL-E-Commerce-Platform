import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { COUNTRIES, findCountry, findLanguage, LANGUAGES } from '../data/countries'
import { TRANSLATIONS } from '../i18n/translations'

const LS_COUNTRY   = 'mibyll.country'
const LS_LANGUAGE  = 'mibyll.language'
const LS_REMEMBER  = 'mibyll.remember'
const LS_RATES     = 'mibyll.rates'
const LS_RATES_TS  = 'mibyll.rates.ts'

const RATES_TTL_MS = 24 * 60 * 60 * 1000 // refresh once a day (API updates daily)
const RATES_URL    = 'https://open.er-api.com/v6/latest/USD'

const LocalizationContext = createContext(null)

function detectFromBrowser() {
    const candidates = [navigator.language, ...(navigator.languages || [])].filter(Boolean)
    for (const locale of candidates) {
        const region = locale.split('-')[1]
        if (region && COUNTRIES.some((c) => c.code === region.toUpperCase())) {
            return region.toUpperCase()
        }
    }
    return null
}

async function detectFromIp() {
    try {
        const ctl = new AbortController()
        const tid = setTimeout(() => ctl.abort(), 3500)
        const res = await fetch('https://ipapi.co/json/', { signal: ctl.signal })
        clearTimeout(tid)
        if (!res.ok) return null
        const data = await res.json()
        if (data.country_code && COUNTRIES.some((c) => c.code === data.country_code)) {
            return data.country_code
        }
    } catch { /* fall through */ }
    return null
}

async function fetchRates() {
    const res = await fetch(RATES_URL)
    if (!res.ok) throw new Error('rates fetch failed')
    const data = await res.json()
    if (!data || !data.rates) throw new Error('rates malformed')
    return data.rates
}

function loadCachedRates() {
    try {
        const ts = Number(localStorage.getItem(LS_RATES_TS) || 0)
        if (Date.now() - ts > RATES_TTL_MS) return null
        const raw = localStorage.getItem(LS_RATES)
        return raw ? JSON.parse(raw) : null
    } catch { return null }
}

export function LocalizationProvider({ children }) {
    const [country, setCountryState] = useState(() => {
        const saved = localStorage.getItem(LS_COUNTRY)
        return saved ? findCountry(saved) : null
    })
    const [language, setLanguageState] = useState(() => {
        const saved = localStorage.getItem(LS_LANGUAGE)
        return findLanguage(saved || 'en').code
    })
    const [rates, setRates] = useState(() => loadCachedRates() || null)
    const [ready, setReady] = useState(false)
    const [showModal, setShowModal] = useState(() =>
        localStorage.getItem(LS_REMEMBER) !== 'true'
    )

    useEffect(() => {
        if (country) { setReady(true); return }

        let cancelled = false
        ;(async () => {
            const code = detectFromBrowser() || (await detectFromIp()) || 'BD'
            if (cancelled) return
            setCountryState(findCountry(code))
            setReady(true)
        })()
        return () => { cancelled = true }
    }, [country])

    useEffect(() => {
        if (rates) return
        let cancelled = false
        ;(async () => {
            try {
                const r = await fetchRates()
                if (cancelled) return
                setRates(r)
                localStorage.setItem(LS_RATES, JSON.stringify(r))
                localStorage.setItem(LS_RATES_TS, String(Date.now()))
            } catch {
                // Fallback: if API fails, use a sensible default so the UI doesn't break
                if (!cancelled) setRates({ USD: 1, BDT: 123.79 })
            }
        })()
        return () => { cancelled = true }
    }, [rates])

    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = language
    }, [language])

    useEffect(() => {
        if (country) localStorage.setItem(LS_COUNTRY, country.code)
    }, [country])

    useEffect(() => {
        localStorage.setItem(LS_LANGUAGE, language)
    }, [language])

    const setCountry = useCallback((code) => {
        setCountryState(findCountry(code))
    }, [])

    const setLanguage = useCallback((code) => {
        setLanguageState(findLanguage(code).code)
    }, [])

    const confirmModal = useCallback((remember) => {
        localStorage.setItem(LS_REMEMBER, remember ? 'true' : 'false')
        setShowModal(false)
    }, [])

    /**
     * Convert a BDT amount to the current country's currency.
     * The API returns rates relative to USD (e.g., USD: 1, BDT: 123.79).
     * To convert BDT to Target: (BDT / rate['BDT']) * rate[Target]
     */
    const convertPrice = useCallback((bdtAmount) => {
        if (bdtAmount == null) return 0
        const target = country?.currency || 'BDT'
        if (target === 'BDT' || !rates) return Number(bdtAmount)

        const bdtRate = rates['BDT'] || 123.79 // Fallback if API is down
        const targetRate = rates[target] || 1

        // Convert base BDT to USD, then to target currency
        return (Number(bdtAmount) / bdtRate) * targetRate
    }, [country, rates])

    /** Format a BDT amount as a currency string in the user's locale. */
    const formatPrice = useCallback((bdtAmount) => {
        const amount = convertPrice(bdtAmount)
        const currency = country?.currency || 'BDT'
        try {
            return new Intl.NumberFormat(language, {
                style: 'currency',
                currency,
            }).format(amount)
        } catch {
            return `${currency} ${amount.toFixed(2)}`
        }
    }, [convertPrice, country, language])

    const t = useCallback((key) => {
        const dict = TRANSLATIONS[language] || TRANSLATIONS.en
        const fallback = TRANSLATIONS.en
        const lookup = (obj) => {
            let cur = obj
            for (const part of key.split('.')) {
                if (cur && typeof cur === 'object' && part in cur) cur = cur[part]
                else return undefined
            }
            return typeof cur === 'string' ? cur : undefined
        }
        return lookup(dict) ?? lookup(fallback) ?? key
    }, [language])

    const value = useMemo(() => ({
        country, language, rates, ready, showModal,
        setCountry, setLanguage, confirmModal,
        convertPrice, formatPrice, t,
        countries: COUNTRIES,
        languages: LANGUAGES,
    }), [country, language, rates, ready, showModal,
        setCountry, setLanguage, confirmModal,
        convertPrice, formatPrice, t])

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    )
}

export const useLocalization = () => {
    const ctx = useContext(LocalizationContext)
    if (!ctx) throw new Error('useLocalization must be used inside LocalizationProvider')
    return ctx
}
