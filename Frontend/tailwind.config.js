/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
                sans: ['Jost', 'Inter', 'system-ui', 'sans-serif'],
            },
            letterSpacing: {
                widest2: '0.25em',
            },
            colors: {
                ink: '#0a0a0a',
                paper: 'rgb(var(--paper) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                fg: 'rgb(var(--fg) / <alpha-value>)',
                cbord: 'rgb(var(--cbord) / <alpha-value>)',
                muted: 'rgb(var(--muted) / <alpha-value>)',
                sand: 'rgb(var(--sand) / <alpha-value>)',
            },
        },
    },
    plugins: [],
}