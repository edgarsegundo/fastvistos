# Bloquear crawling de páginas específicas via `robots.txt` (`Disallow:` por página)

**Data**: 2026-07-24
**Status**: 🟡 Em aberto — sem caso de uso real ainda, especulativo
**Achado durante**: Fase 0 do roadmap SEO/GEO/AEO (`/robots.txt`,
[guia-seo-projetos-paginas.md](../seo/guia-seo-projetos-paginas.md)),
ver também o item em [../backlog.md](../backlog.md).

Este documento **não é um spec fechado** — registra o problema e por que
foi adiado, não uma decisão de implementação.

## Contexto

`vitrine/docs/seo/plano-evolucao-seo-geo-aeo.md` (Fase 0) cogitava:

> Considerar um campo em `PageSeoSettings` (ou reaproveitar `noindex`)
> pra permitir bloquear paths específicos por página, não só via
> `<meta robots>`.

Hoje `PageSeoSettings.noindex` (`core/models.py`) já existe e faz duas
coisas:
1. Exclui a página de `sitemap.xml` (`core/views.py::sitemap_xml`).
2. Renderiza `<meta name="robots" content="noindex, nofollow" />` no
   HTML (`multi-sites/sites/_saas/layouts/Layout.astro:41`, consumido via
   `[...slug].astro:160`).

Isso **permite** o crawler visitar a página — só pede pra não indexar.

## Por que NÃO reaproveitar `noindex` pra também emitir `Disallow:`

Um `Disallow:` no `robots.txt` **impede o crawler de sequer buscar** a
página — mecanismo oposto ao `noindex` (que depende do crawler visitar a
página pra ver a tag). O Google recomenda explicitamente **não** misturar
os dois: se a página está bloqueada via `robots.txt`, o crawler nunca
chega a ver `<meta name="robots" content="noindex">`, e a página pode
acabar indexada mesmo assim (sem snippet, só por causa de links externos
apontando pra ela) — o oposto do efeito desejado.

Ou seja, a sugestão do roadmap ("ou reaproveitar `noindex`") seria
ativamente contraproducente, não só uma questão de escopo. Se esse
recurso for implementado, precisa ser um campo **novo e semanticamente
distinto** do `noindex` (ex.: `disallow_crawl` em `PageSeoSettings`), não
uma extensão dele.

## Esforço estimado (se decidido implementar)

Pequeno tecnicamente — mesmo padrão de iteração já usado em
`core/views.py::sitemap_xml`/`robots_txt` (`Project.all_objects`/
`Page.all_objects`, `is_published=True, is_removed=False`): pra cada
página com o novo flag marcado, emitir uma linha
`Disallow: {seo['canonical'] sem o domínio}` no `robots_txt`. Não exige
migração de dado existente (campo novo, default `False`).

## Por que ficou de fora

Não existe nenhum caso de uso concreto hoje — nenhum usuário do SaaS
pediu pra esconder uma página específica de crawlers, é só uma linha
"considerar" no texto do roadmap. Construir agora seria especular sobre
necessidade futura sem demanda real. Revisitar se/quando aparecer um
pedido concreto (ex.: página de staging, variante duplicada, ferramenta
interna que vazou pro `_saas` publicado).
