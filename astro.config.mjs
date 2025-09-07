// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Constants
const SITE_URL = 'https://fastvistos.com.br';

// https://astro.build/config
export default defineConfig({
    site: SITE_URL,
    vite: {
        plugins: [tailwindcss()]
    }
});