/** @type {import('tailwindcss').Config} */
console.log('🔍 Loading Tailwind config for Zenith site - Config should work now!');

export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './multi-sites/sites/zenith/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './multi-sites/core/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './public-sites/zenith/**/*.html',
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(214.3 31.8% 91.4%)",
                background: "#ff0000", // BRIGHT RED for testing
                foreground: {
                    DEFAULT: "#00ff00", // BRIGHT GREEN for testing
                    dark: "hsl(222.2 84% 4.9%)"
                },
                primary: {
                    DEFAULT: "#0000ff", // BRIGHT BLUE for testing
                    foreground: "#ffffff"
                },
                muted: {
                    DEFAULT: "hsl(210 40% 96.1%)",
                    foreground: "hsl(215.4 16.3% 46.9%)"
                }
            }
        }
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/aspect-ratio'),
    ],
};
