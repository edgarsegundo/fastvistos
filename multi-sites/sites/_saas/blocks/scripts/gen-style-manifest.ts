/**
 * Gera `blocks/style-manifest.generated.json` a partir de `STYLE_PROP_REGISTRY`
 * (style-registry.ts) e `BLOCK_SCHEMAS` (registry.ts) — substitui as listas
 * hardcoded que existiam em 2 lugares (o array `HERO_STYLE_PROP_KEYS` em
 * style-runtime.ts e o dict `_HERO_STYLE_PROP_KEYS` em vitrine/core/models.py)
 * por UMA fonte gerada, e alimenta o teste de paridade TS↔Python
 * (`vitrine/core/tests/test_style_sanitizer_parity.py`) que falha se alguém
 * adicionar uma propriedade de estilo só de um lado.
 *
 * Rodar: `npm run gen:style-manifest` (toda vez que uma propriedade for
 * adicionada/removida do STYLE_PROP_REGISTRY, ou um bloco novo ganhar
 * `elementStyleField()`).
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCK_SCHEMAS, type FieldSchema } from '../registry';
import { STYLE_PROP_REGISTRY } from '../style-registry';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Pra cada bloco, mapeia `<prop>Style` (ex: "titleStyle") → chave do elemento (ex: "title"). */
function collectBlockStyleProps(): Record<string, Record<string, string>> {
    const out: Record<string, Record<string, string>> = {};
    for (const [blockName, schema] of Object.entries(BLOCK_SCHEMAS)) {
        const props: Record<string, string> = {};
        for (const [fieldKey, field] of Object.entries(schema.fields)) {
            if (field.type !== 'elementStyles') continue;
            const elementKey = Object.keys((field as FieldSchema).objectFields ?? {})[0];
            if (elementKey) props[fieldKey] = elementKey;
        }
        if (Object.keys(props).length) out[blockName] = props;
    }
    return out;
}

const manifest = {
    // Toda propriedade lógica conhecida (STYLE_PROP_REGISTRY) — o teste de
    // paridade Python confirma que `_STYLE_PROP_VALIDATORS` trata exatamente
    // este conjunto (menos diferenças documentadas, se houver).
    propertyKeys: Object.keys(STYLE_PROP_REGISTRY).sort(),
    // <BlockType>: { <propKey>: <elementKey> } — substitui HERO_STYLE_PROP_KEYS
    // (style-runtime.ts) e _HERO_STYLE_PROP_KEYS (models.py).
    blocks: collectBlockStyleProps(),
};

const outPath = resolve(__dirname, '../style-manifest.generated.json');
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`gen-style-manifest: escrito ${outPath}`);
console.log(`  propertyKeys: ${manifest.propertyKeys.length}`);
console.log(`  blocks: ${Object.keys(manifest.blocks).join(', ')}`);
