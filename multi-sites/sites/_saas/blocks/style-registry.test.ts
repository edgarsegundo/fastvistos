import { describe, expect, it } from 'vitest';
import {
    sanitizeElementStyle,
    styleToCss,
    STYLE_PROP_REGISTRY,
    TEXT_STYLE_KEYS,
    sanitizeTextStyle,
    sanitizeButtonStyle,
    sanitizeMediaStyle,
    sanitizeBadgeStyle,
} from './style-registry';
import { textStyleToCss, buttonStyleToCss, mediaStyleToCss } from './style-runtime';
import { TEXT_STYLE_FIELDS, BUTTON_STYLE_FIELDS, MEDIA_STYLE_FIELDS, BADGE_STYLE_FIELDS, elementStyleField } from './style-fields';

describe('STYLE_PROP_REGISTRY — schema por tipo (regressão do comportamento pré-refactor)', () => {
    it('TEXT_STYLE_FIELDS tem exatamente as chaves esperadas, com os ranges originais', () => {
        expect(Object.keys(TEXT_STYLE_FIELDS).sort()).toEqual(
            ['align', 'color', 'css', 'font', 'fontSize', 'fontWeight', 'htmlAttrs', 'letterSpacing', 'lineHeight', 'paragraphSpacing', 'textTransform'].sort(),
        );
        expect(TEXT_STYLE_FIELDS.color).toEqual({ type: 'color', label: 'Cor' });
        expect(TEXT_STYLE_FIELDS.fontSize.range).toEqual({ min: 10, max: 96, step: 1 });
        expect(TEXT_STYLE_FIELDS.letterSpacing.range).toEqual({ min: -2, max: 10, step: 0.5 });
        expect((TEXT_STYLE_FIELDS.align as any).options).toEqual(['left', 'center', 'right', 'justify']);
    });

    it('BUTTON_STYLE_FIELDS sobrescreve label de color e ranges de fontSize/letterSpacing (igual ao hardcoded original)', () => {
        expect(BUTTON_STYLE_FIELDS.color).toEqual({ type: 'color', label: 'Cor do texto' });
        expect(BUTTON_STYLE_FIELDS.fontSize.range).toEqual({ min: 10, max: 32, step: 1 });
        expect(BUTTON_STYLE_FIELDS.letterSpacing.range).toEqual({ min: -1, max: 6, step: 0.5 });
        expect(BUTTON_STYLE_FIELDS.radius.range).toEqual({ min: 0, max: 64, step: 1 });
    });

    it('MEDIA_STYLE_FIELDS tem só border/radius/shadow/htmlAttrs/css', () => {
        expect(Object.keys(MEDIA_STYLE_FIELDS).sort()).toEqual(['border', 'css', 'htmlAttrs', 'radius', 'shadow']);
    });

    it('BADGE_STYLE_FIELDS = TEXT + bgColor/border/radius(0-999), igual ao spread original', () => {
        expect(BADGE_STYLE_FIELDS.radius.range).toEqual({ min: 0, max: 999, step: 1 });
        expect(BADGE_STYLE_FIELDS.bgColor).toEqual({ type: 'color', label: 'Cor de fundo' });
        for (const key of Object.keys(TEXT_STYLE_FIELDS)) {
            expect(BADGE_STYLE_FIELDS).toHaveProperty(key);
        }
    });
});

describe('elementStyleField() — pick/omit', () => {
    it('omit remove a chave do objectFields do elemento, sem afetar sanitização', () => {
        const field = elementStyleField({ elementKey: 'title', elementLabel: 'Título', kind: 'text', omit: ['paragraphSpacing'] });
        const inner = field.objectFields!.title.objectFields!;
        expect(inner).not.toHaveProperty('paragraphSpacing');
        expect(inner).toHaveProperty('textTransform');
    });

    it('pick restringe a um subconjunto explícito', () => {
        const field = elementStyleField({ elementKey: 'x', elementLabel: 'X', kind: 'text', pick: ['color', 'font'] });
        expect(Object.keys(field.objectFields!.x.objectFields!).sort()).toEqual(['color', 'font']);
    });
});

describe('sanitizeElementStyle / *StyleToCss — comportamento idêntico ao pré-refactor', () => {
    it('sanitizeTextStyle mantém válidos e descarta inválidos', () => {
        const out = sanitizeTextStyle({ color: '#111827', fontSize: 'not-valid', align: 'center', bogus: 'x' });
        expect(out).toEqual({ color: '#111827', align: 'center' });
    });

    it('textStyleToCss converte color/font/align, resolve família de fonte, e o css customizado sempre vence por último', () => {
        const css = textStyleToCss({ color: '#ff0000', font: 'Poppins', align: 'right', css: { color: '#00ff00' } });
        expect(css.color).toBe('#00ff00'); // escape hatch vence
        expect(css.textAlign).toBe('right');
        expect(String(css.fontFamily)).toContain('Poppins');
    });

    it('textTransform novo: sanitiza e converte pra CSS', () => {
        expect(sanitizeTextStyle({ textTransform: 'uppercase' })).toEqual({ textTransform: 'uppercase' });
        expect(sanitizeTextStyle({ textTransform: 'diagonal' } as any)).toEqual({});
        expect(textStyleToCss({ textTransform: 'capitalize' }).textTransform).toBe('capitalize');
    });

    it('align aceita justify', () => {
        expect(sanitizeTextStyle({ align: 'justify' })).toEqual({ align: 'justify' });
        expect(textStyleToCss({ align: 'justify' }).textAlign).toBe('justify');
    });

    it('paragraphSpacing novo: dimension -> marginBottom', () => {
        expect(sanitizeTextStyle({ paragraphSpacing: '12px' })).toEqual({ paragraphSpacing: '12px' });
        expect(textStyleToCss({ paragraphSpacing: '1rem' }).marginBottom).toBe('1rem');
    });

    it('buttonStyleToCss: hoverBgColor vira CSS var (ponte pro :hover), não uma propriedade de cor direta', () => {
        const css = buttonStyleToCss({ hoverBgColor: '#1d4ed8' });
        expect((css as any)['--cta-hover-bg']).toBe('#1d4ed8');
    });

    it('buttonStyleToCss: border/shadow/radius compostos', () => {
        const css = buttonStyleToCss({
            border: { width: '1px', style: 'solid', color: '#000' },
            radius: '8px',
            shadow: { color: '#0002', x: '0', y: '2px', blur: '4px', spread: '0' },
        });
        expect(css.borderWidth).toBe('1px');
        expect(css.borderStyle).toBe('solid');
        expect(css.borderColor).toBe('#000');
        expect(css.borderRadius).toBe('8px');
        expect(css.boxShadow).toBe('0 2px 4px 0 #0002');
    });

    it('mediaStyleToCss: só border/radius/shadow, sem propriedades de texto', () => {
        const css = mediaStyleToCss({ radius: '12px' });
        expect(css.borderRadius).toBe('12px');
        expect(css).not.toHaveProperty('color');
    });

    it('sanitizeButtonStyle/sanitizeMediaStyle/sanitizeBadgeStyle: inválidos descartados', () => {
        expect(sanitizeButtonStyle({ bgColor: 'not-hex' })).toEqual({});
        expect(sanitizeMediaStyle({ radius: 'nope' })).toEqual({});
        expect(sanitizeBadgeStyle({ bgColor: '#fff', radius: 'nope' })).toEqual({ bgColor: '#fff' });
    });
});

describe('sanitizeElementStyle genérico', () => {
    it('ignora chaves fora da lista de `keys` mesmo que sejam propriedades válidas conhecidas', () => {
        const out = sanitizeElementStyle({ color: '#fff', bgColor: '#000' }, TEXT_STYLE_KEYS);
        expect(out).toEqual({ color: '#fff' }); // bgColor não está em TEXT_STYLE_KEYS
    });

    it('styleToCss aplica só as keys pedidas', () => {
        const css = styleToCss({ color: '#fff', bgColor: '#000' }, ['color']);
        expect(css).toEqual({ color: '#fff' });
    });
});

describe('STYLE_PROP_REGISTRY completude', () => {
    it('toda propriedade tem fieldSchema + sanitize + toCss', () => {
        for (const [key, def] of Object.entries(STYLE_PROP_REGISTRY)) {
            expect(def.fieldSchema, `${key}.fieldSchema`).toBeTruthy();
            expect(typeof def.sanitize, `${key}.sanitize`).toBe('function');
            expect(typeof def.toCss, `${key}.toCss`).toBe('function');
        }
    });
});
