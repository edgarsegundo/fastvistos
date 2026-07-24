# Backlog

Lista corrida de itens identificados mas não priorizados/agendados —
achados durante outro trabalho, adiados de propósito. Cada linha aponta
pro detalhamento em `decisoes/` (contexto + opções), não pra um spec já
fechado — a decisão de *como* resolver ainda está em aberto salvo
indicação contrária.

Sem numeração/ordem — cada item é independente. Quando um item vira
trabalho ativo, mover pra uma issue/branch e marcar aqui como feito ou
remover a linha.

- **`canonical_domain_override` (SEO) e `Domain` (verificação DNS/SSL) são
  dois cadastros de domínio desconectados** — nenhum código liga os
  dois hoje, então um projeto pode ter domínio verificado+SSL emitido e
  não aparecer em `sitemap.xml`/`robots.txt`, ou o inverso (domínio não
  verificado sendo anunciado a crawlers). Achado durante a Fase 0 do
  roadmap SEO/GEO/AEO (`/robots.txt`). Detalhamento:
  [decisoes/canonical-domain-vs-domain-model.md](decisoes/canonical-domain-vs-domain-model.md).

- **Bloquear crawling de páginas específicas via `Disallow:` no
  `robots.txt`, por página** — cogitado no roadmap SEO/GEO/AEO como
  "reaproveitar `noindex`", mas isso seria errado (Google recomenda não
  misturar `noindex` com `Disallow:` — o crawler bloqueado nunca vê a
  tag `noindex`, página pode indexar mesmo assim via link externo). Sem
  caso de uso real hoje, especulativo. Detalhamento:
  [decisoes/robots-txt-per-page-disallow.md](decisoes/robots-txt-per-page-disallow.md).
