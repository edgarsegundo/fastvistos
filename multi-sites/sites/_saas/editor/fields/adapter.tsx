/*
 * Adapter: converte cada `FieldSchema` (neutro de framework, definido no
 * registry de blocos) num `Fields` do Puck. Extraído de `puck.config.tsx`
 * pra poder ser reaproveitado por custom fields que precisam renderizar
 * outros campos por dentro de si (ex: ElementStylesField) sem criar import
 * circular com `puck.config.tsx`.
 */
import type { Fields } from '@measured/puck';
import type { FieldSchema } from '../../blocks/registry';
import { ToggleField } from './ToggleField';
import { ImageField } from './ImageField';

export function toPuckField(f: FieldSchema): any {
    switch (f.type) {
        case 'text':
        case 'url':
            return { type: 'text', label: f.label, contentEditable: f.type === 'text' && f.inlineEditable !== false };
        case 'textarea':
            return { type: 'textarea', label: f.label, contentEditable: f.inlineEditable !== false };
        case 'markdown':
        case 'html':
            // conteúdo cru: painel lateral, nunca inline no canvas
            return { type: 'textarea', label: f.label };
        case 'select':
        case 'radio':
            return {
                type: f.type,
                label: f.label,
                options: (f.options ?? []).map((o) =>
                    typeof o === 'string' ? { label: o, value: o } : o,
                ),
            };
        case 'array':
            return {
                type: 'array',
                label: f.label,
                ...(f.max != null ? { max: f.max } : {}),
                arrayFields: fieldsFromSchema(f.itemFields ?? {}),
                getItemSummary: (item: any) =>
                    item?.title || item?.question || item?.name || item?.label || item?.text || item?.alt || 'item',
            };
        case 'object':
            return {
                type: 'object',
                label: f.label,
                objectFields: fieldsFromSchema(f.objectFields ?? {}),
            };
        case 'toggle': {
            // Sem label do Puck: a linha inteira (nome + switch) é o próprio render.
            const label = f.label;
            return {
                type: 'custom',
                render: ({ value, onChange }: any) => (
                    <ToggleField label={label} value={value} onChange={onChange} />
                ),
            };
        }
        case 'image': {
            const label = f.label;
            return {
                type: 'custom',
                render: ({ value, onChange }: any) => (
                    <ImageField label={label} value={value} onChange={onChange} />
                ),
            };
        }
        default:
            return { type: 'text', label: f.label };
    }
}

export function fieldsFromSchema(fields: Record<string, FieldSchema>): Fields {
    const out: Record<string, any> = {};
    for (const [key, f] of Object.entries(fields)) {
        out[key] = toPuckField(f);
    }
    return out as Fields;
}
