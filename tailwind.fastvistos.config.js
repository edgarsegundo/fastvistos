/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', 
        './multi-sites/sites/fastvistos/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './multi-sites/core/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './public/**/*.html'
    ],
    theme: {
        extend: {
            colors: {
                // FastVistos brand colors (blue/orange theme)
                primary: {
                    50: '#eff8ff',
                    100: '#daedff',
                    200: '#bee1ff',
                    300: '#91d0ff',
                    400: '#5db4fd',
                    500: '#3b95fa',
                    600: '#2575ef',
                    700: '#1d5ddc',
                    800: '#1e4ab3',
                    900: '#1e408d',
                    950: '#172957',
                },
                secondary: {
                    50: '#fff7ed',
                    100: '#ffeed4',
                    200: '#ffd9a8',
                    300: '#ffbe71',
                    400: '#ff9738',
                    500: '#ff7900', // Main orange
                    600: '#e05e00',
                    700: '#b84902',
                    800: '#953b08',
                    900: '#7a3209',
                    950: '#461801',
                },
                accent: {
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
            },
            fontFamily: {
                sans: ['Source Sans Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            animation: {
                wiggle: 'wiggle 4s 2s infinite',
                typing: 'typing 3s steps(60) 1s forwards',
                blink: 'blink .75s step-end infinite',
            },
            keyframes: {
                wiggle: {
                    '5%, 50%': { transform: 'scale(1)' },
                    '10%': { transform: 'scale(.9)' },
                    '15%': { transform: 'scale(1.15)' },
                    '20%': { transform: 'scale(1.15) rotate(-5deg)' },
                    '25%': { transform: 'scale(1.15) rotate(5deg)' },
                    '30%': { transform: 'scale(1.15) rotate(-3deg)' },
                    '35%': { transform: 'scale(1.15) rotate(2deg)' },
                    '40%': { transform: 'scale(1.15) rotate(0)' },
                },
                typing: {
                    to: { width: '100%' },
                },
                blink: {
                    '50%': { 'border-color': 'transparent' },
                },
            },
            backgroundImage: {
                'gradient-primary':
                    'linear-gradient(270deg, #0077b6 0%, #1F4E7A 50%, #2A5E90 100%)',
            },
        },
    },
    plugins: [],
};
