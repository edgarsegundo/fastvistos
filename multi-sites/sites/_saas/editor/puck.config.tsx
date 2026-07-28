/*
 * Config do Puck derivado do registry de blocos (fase 0/1) — fonte única.
 * Um adapter converte cada `BlockSchema.fields` (neutro de framework) nos
 * `fields` do Puck, e o `render` reusa o MESMO componente da produção
 * (BLOCK_COMPONENTS). Campos de texto viram inline (contentEditable) no canvas;
 * url/markdown/html ficam no painel lateral.
 */
import type { Config } from '@measured/puck';
import { BLOCK_COMPONENTS, BLOCK_SCHEMAS, type BlockSchema } from '../blocks/registry';
import { EDITOR_DEFAULT_PROPS } from './defaults';
import { toPuckField, fieldsFromSchema } from './fields/adapter';

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
