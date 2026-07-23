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

## Outras áreas do repo

Ainda não documentadas num formato de contexto — se a sessão for sobre
outra área (ex: build dos sites legados, `tenancy/`, scripts na raiz),
vale perguntar ao usuário se quer que se crie um contexto equivalente
depois, em vez de assumir.
