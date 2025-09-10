/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', 
        './multi-sites/sites/vibecode/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './multi-sites/core/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './public/**/*.html'
    ],
    theme: {
        extend: {
            colors: {
                // VibeCode brand colors (modern tech theme)
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                secondary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    950: '#052e16',
                },
                accent: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    700: '#a21caf',
                    800: '#86198f',
                    900: '#701a75',
                    950: '#4a044e',
                },
            },
            fontFamily: {
                sans: ['JetBrains Mono', 'ui-monospace', 'Monaco', 'monospace'],
            },
            animation: {
                'code-blink': 'codeBlink 1s ease-in-out infinite',
                'tech-pulse': 'techPulse 2s ease-in-out infinite',
            },
            keyframes: {
                codeBlink: {
                    '0%, 50%': { opacity: '1' },
                    '51%, 100%': { opacity: '0' },
                },
                techPulse: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
                    '50%': { transform: 'scale(1.05)', opacity: '1' },
                },
            },
            backgroundImage: {
                'gradient-primary':
                    'linear-gradient(135deg, #0ea5e9 0%, #22c55e 50%, #d946ef 100%)',
            },
        },
    },
    plugins: [],
};
