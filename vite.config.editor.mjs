/*
 * Build do bundle do editor visual (Puck) — separado do build do Astro.
 *
 * Reusa os MESMOS componentes de bloco (.tsx) e o saas.css da produção
 * (single-source) e emite um bundle React auto-contido em
 * vitrine/core/static/puck-editor/ (editor.js + editor.css), servido pelo Django
 * na view do admin (core/editor.html). Rodar: `npm run build:editor`.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    // publicDir:false é ESSENCIAL — por padrão o Vite copia a pasta public/
    // (raiz do repo) inteira pro outDir a cada build. Esse repo tem assets
    // de outra feature (blog-image-editor) em public/, que acabavam
    // recopiados pro bundle do editor a cada build sem eu pedir. Esse
    // bundle não usa nada de public/ — não precisa copiar nada de lá.
    publicDir: false,
    build: {
        // NUNCA "core/static/editor" — esse path já é usado pelo blog-image-
        // editor (feature #56, não relacionada). emptyOutDir:true apaga a
        // pasta inteira a cada build; colidir ali destrói assets de outra
        // feature. "puck-editor" é exclusivo deste bundle.
        outDir: resolve(__dirname, 'vitrine/core/static/puck-editor'),
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'multi-sites/sites/_saas/editor/main.tsx'),
            output: {
                entryFileNames: 'editor.js',
                assetFileNames: 'editor.[ext]',
                chunkFileNames: 'editor-[name].js',
            },
        },
    },
});
