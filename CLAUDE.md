# fastvistos — contexto do repo

Monorepo com dois projetos distintos:

- **`multi-sites/`** (raiz do repo) — Astro multi-tenant que builda vários
  sites estáticos legados (fastvistos, centraldevistos, emprego, etc.),
  cada um em `multi-sites/sites/{site-id}/`, orquestrado por
  `astro.config.mjs` / `SITE_ID` env var.
- **`vitrine/`** — Django, o SaaS que permite usuários criarem seus
  próprios `Project`s/`Page`s, buildados via um `site-id` especial
  (`_saas`) dentro do mesmo Astro acima.

## Regra permanente de todas as sessões

**Nunca rodar `git commit`, `git push` ou criar PR sozinho** — o usuário
faz essa parte manualmente, sempre. Pode preparar/mostrar o diff, nunca
efetivar.

## Se a tarefa for sobre Projetos/Páginas/Build/Deploy/SSO do SaaS (`vitrine/`)

Ler primeiro: [vitrine/docs/guia-projetos-paginas-build-deploy-context.md](vitrine/docs/guia-projetos-paginas-build-deploy-context.md)
— tem a lista de paths tocados com frequência e as decisões já tomadas
(evita reabrir debate já resolvido). Docs completos linkados de lá.

## Se a tarefa for sobre SEO/GEO/AEO (nativo ou a evolução em curso)

Ler primeiro: [vitrine/docs/seo/guia-seo-projetos-paginas.md](vitrine/docs/seo/guia-seo-projetos-paginas.md)
— arquitetura de SEO em camadas já implementada (`resolve_seo()` é a
única fonte de verdade de precedência, nunca duplicar fallback no Astro).

Pra tarefas da evolução em curso (JSON-LD por tipo, sitemap/robots/
llms.txt, blocos de conteúdo estruturado, Core Web Vitals, AI visibility
score), o trabalho está quebrado em 6 fases — não tentar implementar mais
de uma por sessão:
- Roadmap completo: [vitrine/docs/seo/plano-evolucao-seo-geo-aeo.md](vitrine/docs/seo/plano-evolucao-seo-geo-aeo.md)
- Prompt de cada fase + decisões de arquitetura já fechadas (não
  reabrir sem motivo novo): [vitrine/docs/seo/prompts-claude-code-seo-geo-aeo.md](vitrine/docs/seo/prompts-claude-code-seo-geo-aeo.md)

Sempre em plan mode, uma fase por vez.

## Outras áreas do repo

Ainda não documentadas num formato de contexto — se a sessão for sobre
outra área (ex: build dos sites legados, `tenancy/`, scripts na raiz),
vale perguntar ao usuário se quer que se crie um contexto equivalente
depois, em vez de assumir.
