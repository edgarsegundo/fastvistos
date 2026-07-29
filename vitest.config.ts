import { defineConfig } from 'vitest/config';

/**
 * Setup mínimo — só funções puras (blocks/style-registry.ts, style-fields.ts,
 * style-runtime.ts, theme/validation.ts), sem DOM/jsdom. Ver
 * multi-sites/sites/_saas/blocks/*.test.ts.
 */
export default defineConfig({
    test: {
        include: ['multi-sites/sites/_saas/**/*.test.ts'],
        environment: 'node',
    },
});
