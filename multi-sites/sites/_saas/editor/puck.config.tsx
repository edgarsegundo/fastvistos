/*
 * Config do Puck derivado do registry de blocos (fase 0/1) — fonte única.
 * Um adapter converte cada `BlockSchema.fields` (neutro de framework) nos
 * `fields` do Puck, e o `render` reusa o MESMO componente da produção
 * (BLOCK_COMPONENTS). Campos de texto viram inline (contentEditable) no canvas;
 * url/markdown/html ficam no painel lateral.
 */
import type { Config, Fields } from '@measured/puck';
import { BLOCK_COMPONENTS, BLOCK_SCHEMAS, type BlockSchema, type FieldSchema } from '../blocks/registry';
import { EDITOR_DEFAULT_PROPS } from './defaults';
import { ToggleField } from './fields/ToggleField';
import { ImageField } from './fields/ImageField';

function toPuckField(f: FieldSchema): any {
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

function fieldsFromSchema(fields: Record<string, FieldSchema>): Fields {
    const out: Record<string, any> = {};
    for (const [key, f] of Object.entries(fields)) {
        out[key] = toPuckField(f);
    }
    return out as Fields;
}

function buildComponents() {
    const components: Record<string, any> = {};
    for (const [type, schema] of Object.entries(BLOCK_SCHEMAS as Record<string, BlockSchema>)) {
        const Comp = BLOCK_COMPONENTS[type];
        if (!Comp) continue;
        const component: Record<string, any> = {
            label: schema.label,
            fields: fieldsFromSchema(schema.fields),
            defaultProps: EDITOR_DEFAULT_PROPS[type] ?? {},
            render: (props: any) => <Comp {...props} />,
        };
        // Bloco com variantes (ex: Hero.layout): o painel mostra só os campos
        // da variante atual. `fields` acima fica como conjunto completo (fallback);
        // resolveFields filtra por `showFor` a cada mudança de props.
        if (schema.variantField) {
            const variantKey = schema.variantField;
            component.resolveFields = (data: any) => {
                const props = data?.props ?? {};
                const current = props[variantKey];
                const out: Record<string, any> = {};
                for (const [key, f] of Object.entries(schema.fields)) {
                    // filtro por variante
                    if (f.showFor && !(current != null && f.showFor.includes(current))) continue;
                    // filtro por toggle Mostrar/Ocultar (hideWhen)
                    if (f.hideWhen && props[f.hideWhen.field] === f.hideWhen.equals) continue;
                    out[key] = toPuckField(f);
                }
                return out;
            };
        }
        components[type] = component;
    }
    return components;
}

export const puckConfig: Config = {
    components: buildComponents(),
    // Agrupa a paleta: estruturados vs livres (escape hatch).
    categories: {
        estruturados: {
            title: 'Blocos',
            components: ['Hero', 'Features', 'Sobre', 'Depoimentos', 'Preco', 'Faq', 'Cta', 'Contato'],
        },
        livres: {
            title: 'Conteúdo livre',
            components: ['RichText', 'HtmlSafe', 'CodeEmbed'],
        },
    },
};
