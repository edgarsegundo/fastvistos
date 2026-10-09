/**
 * Seção extra do llms.txt do emprego: páginas de SEO programático (/candidatos/, /cidades/).
 * Lida pelo gancho de core/pages/llms.txt.ts (copiado para pages/llms.txt.ts pelo sync-blog.js).
 * Arquivo exclusivo deste site — o sync não o sobrescreve. Usa os mesmos dados das páginas
 * (lib/generated/seo-bundle.json), então fica atualizado a cada build.
 */
import {
    seoBundle, cap, candidatosLabel, formatDateBR, urlHub, urlCargo, urlCidade, urlCombo,
} from './emprego-seo.ts';

// O llms.txt precisa continuar curto: hubs entram todos, páginas cargo+cidade só as mais fortes.
const MAX_COMBOS = 150;

export function llmsExtraLines(_canonical: string): string[] {
    const { combos, cargos, cidades } = seoBundle;
    if (combos.length === 0) return [];

    const total = combos.reduce((n, c) => n + c.stats.total, 0);
    const lines: string[] = [
        '## Candidatos por cargo e cidade',
        '',
        `- [Candidatos disponíveis por cargo e cidade](${urlHub()}): ${candidatosLabel(total)} em ${combos.length} combinações de cargo e cidade, com contato direto pelo WhatsApp.`,
    ];

    if (cargos.length > 0) {
        lines.push('', '### Por cargo', '');
        for (const c of cargos) {
            lines.push(`- [${cap(c.cargo_label)}](${urlCargo(c.cargo_slug)}): ${candidatosLabel(c.total)} em ${c.cidades.length} cidades`);
        }
    }

    if (cidades.length > 0) {
        lines.push('', '### Por cidade', '');
        for (const c of cidades) {
            lines.push(`- [${c.cidade_nome}, ${c.uf}](${urlCidade(c.cidade_slug)}): ${candidatosLabel(c.total)} em ${c.cargos.length} cargos`);
        }
    }

    const top = [...combos].sort((a, b) => b.stats.total - a.stats.total).slice(0, MAX_COMBOS);
    lines.push('', '### Cargo e cidade (mais candidatos)', '');
    for (const c of top) {
        lines.push(
            `- [${cap(c.cargo_label)} em ${c.cidade_nome}, ${c.uf}](${urlCombo(c.cargo_slug, c.cidade_slug)}): ` +
            `${candidatosLabel(c.stats.total)} disponíveis, atualizado em ${formatDateBR(c.lastmod)}`,
        );
    }
    return lines;
}
