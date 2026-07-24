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

- **`/llms.txt` (v1, Fase 2) só lista título+descrição por página —
  falta incluir os blocos de FAQ/estatística/definição** (`ContentBlock`,
  Fase 3, ainda não implementado) pra virar o diferencial real de
  citabilidade por IA que o roadmap prevê. Spec já fechado (formato de
  saída, ponto de extensão em `project_llms_txt`, testes a adicionar),
  só bloqueado até `ContentBlock` existir. Achado durante a Fase 2 do
  roadmap SEO/GEO/AEO. Detalhamento:
  [decisoes/llms-txt-blocos-estruturados.md](decisoes/llms-txt-blocos-estruturados.md).

- **Botão "Importar JSON" de `type_specific_data` só existe pra
  `page_type=faq`** — os outros 5 tipos (`contact`, `blog_post`,
  `person`, `product`, `article`) já têm dataclass+schema validado em
  `core/seo_schemas.py::PAGE_TYPE_SCHEMAS` (Fase 1 do roadmap
  SEO/GEO/AEO), mas só FAQ ganhou o botão de importar arquivo — o
  parsing generaliza quase de graça pros outros tipos, o que falta
  decidir é o formato de arquivo aceito por tipo (lista de itens faz
  sentido pra FAQ/`same_as`; não faz sentido do mesmo jeito pra
  Product/Article, que são objetos únicos). Achado durante a Fase 1 do
  roadmap SEO/GEO/AEO. Detalhamento:
  [decisoes/import-json-type-specific-data.md](decisoes/import-json-type-specific-data.md).
