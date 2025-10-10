/** @type {import('tailwindcss').Config} */
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
                background: "hsl(0 0% 100%)",
                foreground: {
                    DEFAULT: "#000",
                    dark: "hsl(222.2 84% 4.9%)"
                },
                primary: {
                    DEFAULT: "hsl(222.2 47.4% 11.2%)",
                    foreground: "hsl(210 40% 98%)"
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
