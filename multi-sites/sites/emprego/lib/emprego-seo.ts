/**
 * Dados e helpers das páginas de SEO programático (/candidatos/..., /cidades/...).
 * Os dados vêm de lib/generated/seo-bundle.json, gravado por fetch-emprego-seo.js
 * (que consulta a API do Django). Arquivo exclusivo deste site — o sync-blog.js
 * não mexe nele.
 */
import { siteConfig } from '../site-config.ts';

export interface SeoStatRow { label: string; count: number; pct: number }
export interface SeoStats {
    total: number;
    novos_30d: number;
    idade: SeoStatRow[];
    experiencia: SeoStatRow[];
    bairros: SeoStatRow[];
    disponibilidade: SeoStatRow[];
}
export interface SeoCard {
    nome: string;
    cargo: string;
    bairro: string | null;
    faixa_etaria: string | null;
    experiencia: string | null;
    disponibilidade: string[];
    resumo: string;
    criado_em: string | null;
}
export interface SeoCombo {
    cargo_slug: string;
    cargo_label: string;
    cidade_slug: string;
    cidade_nome: string;
    uf: string;
    lastmod: string;
    stats: SeoStats;
    candidatos: SeoCard[];
    cidades_proximas: { cidade_slug: string; cidade_nome: string; uf: string; total: number }[];
    cargos_parecidos: { cargo_slug: string; cargo_label: string; total: number }[];
    tem_hub_cargo: boolean;
    tem_hub_cidade: boolean;
}
export interface SeoCargoHub {
    cargo_slug: string;
    cargo_label: string;
    total: number;
    cidades: { cidade_slug: string; cidade_nome: string; uf: string; total: number }[];
}
export interface SeoCidadeHub {
    cidade_slug: string;
    cidade_nome: string;
    uf: string;
    total: number;
    cargos: { cargo_slug: string; cargo_label: string; total: number }[];
}
export interface SeoBundle {
    generated_at: string | null;
    min_candidates: number;
    combos: SeoCombo[];
    cargos: SeoCargoHub[];
    cidades: SeoCidadeHub[];
}

const files = import.meta.glob('./generated/seo-bundle.json', { eager: true }) as Record<string, { default: SeoBundle }>;
const loaded = Object.values(files)[0]?.default;

export const seoBundle: SeoBundle = loaded ?? {
    generated_at: null, min_candidates: 0, combos: [], cargos: [], cidades: [],
};

const SITE = siteConfig.site.canonical.replace(/\/$/, '');
const APP_BUSCAR = 'https://app.empregoaqui.com.br/buscar';

export const urlCombo = (cargo: string, cidade: string) => `${SITE}/candidatos/${cargo}/${cidade}/`;
export const urlCargo = (cargo: string) => `${SITE}/candidatos/${cargo}/`;
export const urlCidade = (cidade: string) => `${SITE}/cidades/${cidade}/`;
export const urlHub = () => `${SITE}/candidatos/`;
/** Caminho relativo (para href interno). */
export const path = (u: string) => u.replace(SITE, '');

/** Primeira letra maiúscula, preservando o resto (os cargos vêm do cadastro). */
export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function linkApp(
    cargo: { slug: string; label: string },
    cidade: { slug: string; nome: string; uf: string },
    content = 'cta',
) {
    const qs = new URLSearchParams({
        q: cargo.label,
        cidade: cidade.nome,
        uf: cidade.uf,
        utm_source: 'empregoaqui-site',
        utm_medium: 'seo',
        utm_campaign: `landing-${cargo.slug}-${cidade.slug}`,
        utm_content: content,
    });
    return `${APP_BUSCAR}?${qs.toString()}`;
}

export function linkAppGenerico(content = 'hub') {
    const qs = new URLSearchParams({
        utm_source: 'empregoaqui-site', utm_medium: 'seo', utm_campaign: 'hub', utm_content: content,
    });
    return `${APP_BUSCAR}?${qs.toString()}`;
}

export function formatDateBR(iso: string | null | undefined) {
    if (!iso) return '';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', timeZone: siteConfig.site.timezone,
    }).format(new Date(iso));
}

/** Máximo entre datas ISO (para lastmod dos hubs). */
export const maxDate = (dates: (string | null | undefined)[]) =>
    dates.filter(Boolean).sort().at(-1) ?? null;

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
export const candidatosLabel = (n: number) => `${n} ${plural(n, 'candidato', 'candidatos')}`;

function joinList(items: string[]) {
    if (items.length <= 1) return items.join('');
    return `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`;
}

/** Textos gerados dos números reais da página — é o conteúdo que a torna única. */
export function buildTexts(c: SeoCombo) {
    const cargo = c.cargo_label;
    const cargoLc = cargo.toLowerCase();
    const local = `${c.cidade_nome}, ${c.uf}`;
    const s = c.stats;

    const novos = s.novos_30d > 0
        ? `, ${s.novos_30d} ${plural(s.novos_30d, 'novo', 'novos')} nos últimos 30 dias`
        : '';
    const partes: string[] = [
        `Em ${local}, o Emprego Aqui tem ${candidatosLabel(s.total)} a ${cargoLc} cadastrados${novos}.`,
    ];

    const exp = s.experiencia[0];
    if (exp && s.experiencia.reduce((n, r) => n + r.count, 0) >= 3) {
        partes.push(`Entre os que informaram a experiência, a faixa mais comum é “${exp.label.toLowerCase()}” (${exp.pct}%).`);
    }
    const idade = s.idade[0];
    if (idade && s.idade.reduce((n, r) => n + r.count, 0) >= 3) {
        partes.push(`A faixa etária predominante é de ${idade.label} anos (${idade.pct}%).`);
    }
    if (s.bairros.length >= 2) {
        partes.push(`Os bairros com mais candidatos são ${joinList(s.bairros.slice(0, 3).map((b) => b.label))}.`);
    }
    const disp = s.disponibilidade.slice(0, 2).map((d) => d.label.toLowerCase());
    if (disp.length) {
        partes.push(`Disponibilidade mais citada: ${joinList(disp)}.`);
    }

    const faq: { q: string; a: string }[] = [
        {
            q: `Quantos candidatos a ${cargoLc} estão disponíveis em ${c.cidade_nome}?`,
            a: `Hoje o Emprego Aqui tem ${candidatosLabel(s.total)} a ${cargoLc} em ${local}` +
               (s.novos_30d > 0 ? `, sendo ${s.novos_30d} ${plural(s.novos_30d, 'novo', 'novos')} nos últimos 30 dias` : '') +
               `. A lista é atualizada todos os dias.`,
        },
        {
            q: `Como falar com um candidato a ${cargoLc} em ${c.cidade_nome}?`,
            a: `Abra a busca do Emprego Aqui, escolha o candidato e fale direto com ele pelo WhatsApp, sem intermediário. O contato é liberado com créditos do Emprego Aqui.`,
        },
        {
            q: `Preciso publicar uma vaga de ${cargoLc} para encontrar candidatos?`,
            a: `Não. No Emprego Aqui você busca os candidatos já cadastrados e chama quem estiver disponível, sem anunciar vaga e sem esperar candidaturas.`,
        },
    ];
    if (s.bairros.length >= 2) {
        faq.push({
            q: `Em quais bairros de ${c.cidade_nome} estão os candidatos a ${cargoLc}?`,
            a: `Os bairros com mais candidatos são ${joinList(s.bairros.slice(0, 5).map((b) => `${b.label} (${b.count})`))}.`,
        });
    }
    if (exp && s.experiencia.reduce((n, r) => n + r.count, 0) >= 3) {
        faq.push({
            q: `Qual a experiência dos candidatos a ${cargoLc} em ${c.cidade_nome}?`,
            a: `Entre os candidatos que informaram a experiência, ${exp.pct}% estão na faixa “${exp.label.toLowerCase()}”.`,
        });
    }

    const updated = formatDateBR(c.lastmod);
    const title = `${cap(cargo)} em ${local}: ${candidatosLabel(s.total)} disponíveis | Emprego Aqui`;
    let description =
        `${candidatosLabel(s.total)} a ${cargoLc} disponíveis em ${local}, atualizado em ${updated}. ` +
        `Fale direto no WhatsApp, sem publicar vaga.`;
    if (s.bairros.length >= 2 && description.length < 120) {
        description += ` Bairros: ${joinList(s.bairros.slice(0, 2).map((b) => b.label))}.`;
    }

    return { intro: partes.join(' '), faq, title, description, updated };
}
