/**
 * Campos de Aparência agrupados por TIPO de elemento (texto/botão/mídia/
 * badge), derivados de `STYLE_PROP_REGISTRY` (fonte única por propriedade,
 * ver style-registry.ts) — mais o helper `elementStyleField()` que gera o
 * boilerplate `{type:'elementStyles', objectFields:{...}}` de `registry.ts`
 * a partir de um "tipo" + pick/omit, em vez de repetir esse objeto à mão por
 * elemento.
 */
import type { FieldSchema } from './registry';
import {
    BADGE_STYLE_KEYS,
    BUTTON_STYLE_KEYS,
    MEDIA_STYLE_KEYS,
    STYLE_PROP_REGISTRY,
    TEXT_STYLE_KEYS,
} from './style-registry';

/** Monta um `Record<key, FieldSchema>` a partir de chaves do registry, com overrides pontuais (label/range/units) pro contexto de um "tipo" específico — nunca muda sanitização/CSS, só a UI. */
export function pickFields(keys: string[], overrides: Record<string, Partial<FieldSchema>> = {}): Record<string, FieldSchema> {
    return Object.fromEntries(
        keys.map((key) => [key, { ...STYLE_PROP_REGISTRY[key].fieldSchema, ...overrides[key] }]),
    );
}

export const TEXT_STYLE_FIELDS: Record<string, FieldSchema> = pickFields(TEXT_STYLE_KEYS);

export const BUTTON_STYLE_FIELDS: Record<string, FieldSchema> = pickFields(BUTTON_STYLE_KEYS, {
    color: { label: 'Cor do texto' },
    fontSize: { range: { min: 10, max: 32, step: 1 } },
    letterSpacing: { range: { min: -1, max: 6, step: 0.5 } },
});

export const MEDIA_STYLE_FIELDS: Record<string, FieldSchema> = pickFields(MEDIA_STYLE_KEYS);

export const BADGE_STYLE_FIELDS: Record<string, FieldSchema> = pickFields(BADGE_STYLE_KEYS, {
    radius: { range: { min: 0, max: 999, step: 1 } },
});

export type StyleKind = 'text' | 'button' | 'media' | 'badge';
const KIND_FIELDS: Record<StyleKind, Record<string, FieldSchema>> = {
    text: TEXT_STYLE_FIELDS,
    button: BUTTON_STYLE_FIELDS,
    media: MEDIA_STYLE_FIELDS,
    badge: BADGE_STYLE_FIELDS,
};

/**
 * Gera o campo `<elemento>Style` completo (`{type:'elementStyles', objectFields:{...}}`)
 * que hoje era escrito à mão por elemento em `registry.ts`. `pick`/`omit`
 * restringem quais propriedades do "tipo" aparecem pra ESTE elemento
 * específico (nem toda propriedade faz sentido em todo elemento) — atuam só
 * no schema; sanitização/conversão pra CSS continuam permissivas (só emitem
 * o que estiver presente no valor salvo), então omitir aqui não exige
 * nenhuma mudança de runtime.
 */
export function elementStyleField(opts: {
    elementKey: string;
    elementLabel: string;
    kind: StyleKind;
    pick?: string[];
    omit?: string[];
    extra?: Record<string, FieldSchema>;
    label?: string;
    showFor?: string[];
    hideWhen?: FieldSchema['hideWhen'];
}): FieldSchema {
    let entries = Object.entries(KIND_FIELDS[opts.kind]);
    if (opts.pick) entries = entries.filter(([k]) => opts.pick!.includes(k));
    if (opts.omit) entries = entries.filter(([k]) => !opts.omit!.includes(k));
    const objectFields = { ...Object.fromEntries(entries), ...(opts.extra ?? {}) };
    return {
        type: 'elementStyles',
        label: opts.label ?? 'Aparência',
        showFor: opts.showFor,
        hideWhen: opts.hideWhen,
        objectFields: { [opts.elementKey]: { type: 'object', label: opts.elementLabel, objectFields } },
    };
}
