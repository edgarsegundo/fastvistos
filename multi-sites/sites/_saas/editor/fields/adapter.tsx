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
import { ColorField } from './ColorField';
import { FontField } from './FontField';
import { DimensionField } from './DimensionField';
import { ShadowField } from './ShadowField';
import { BorderField } from './BorderField';
import { CssField } from './CssField';
import { AttrsField } from './AttrsField';
import { ElementStylesField } from './ElementStylesField';
import { RichTextField } from './RichTextField';

/**
 * `key` = a chave do campo no schema (ex: "title") — só usada pelo
 * `richText` pra ancorar `id="content-field-<key>"` (clique-no-canvas em
 * editor/App.tsx rola até lá). Opcional porque a maioria dos campos não
 * precisa: `fieldsFromSchema`/`resolveFields` (puck.config.tsx) sempre
 * passam a própria chave; `ElementStylesField` chama `renderField(leaf)`
 * sem chave pros campos-folha de Aparência (não têm esse anchor).
 */
export function toPuckField(f: FieldSchema, key?: string): any {
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
        case 'color': {
            const label = f.label;
            return { type: 'custom', render: ({ value, onChange }: any) => <ColorField label={label} value={value} onChange={onChange} /> };
        }
        case 'font': {
            const label = f.label;
            return { type: 'custom', render: ({ value, onChange }: any) => <FontField label={label} value={value} onChange={onChange} /> };
        }
        case 'dimension': {
            const label = f.label;
            const units = f.units ?? [];
            const range = f.range;
            return {
                type: 'custom',
                render: ({ value, onChange }: any) => (
                    <DimensionField label={label} value={value} onChange={onChange} units={units} range={range} />
                ),
            };
        }
        case 'shadow': {
            const label = f.label;
            return { type: 'custom', render: ({ value, onChange }: any) => <ShadowField label={label} value={value} onChange={onChange} /> };
        }
        case 'border': {
            const label = f.label;
            return { type: 'custom', render: ({ value, onChange }: any) => <BorderField label={label} value={value} onChange={onChange} /> };
        }
        case 'css': {
            const label = f.label;
            return { type: 'custom', render: ({ value, onChange }: any) => <CssField label={label} value={value} onChange={onChange} /> };
        }
        case 'htmlAttrs': {
            const label = f.label;
            return { type: 'custom', render: ({ value, onChange }: any) => <AttrsField label={label} value={value} onChange={onChange} /> };
        }
        case 'richText': {
            const label = f.label;
            const id = key ? `content-field-${key}` : undefined;
            return {
                type: 'custom',
                render: ({ value, onChange }: any) => (
                    <RichTextField label={label} value={value} onChange={onChange} id={id} />
                ),
            };
        }
        case 'elementStyles': {
            const groups = f.objectFields ?? {};
            return {
                type: 'custom',
                render: ({ value, onChange }: any) => (
                    <ElementStylesField groups={groups} value={value} onChange={onChange} renderField={toPuckField} />
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
        out[key] = toPuckField(f, key);
    }
    return out as Fields;
}
