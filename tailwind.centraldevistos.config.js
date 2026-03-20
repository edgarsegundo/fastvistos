/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './multi-sites/sites/centraldevistos/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './multi-sites/core/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './public/centraldevistos/**/*.html',
    ],
    theme: {
        extend: {
            colors: {
                testtailwind: '#ff00aa',
                blue: 
                    {
                        900: '#ff00aa',
                    }
            },
        },
    },    
    plugins: [],
};


