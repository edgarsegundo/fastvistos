# Contexto rápido: Projetos, Páginas, Build, Deploy, SSO

Arquivo enxuto pra colar/carregar no início de uma sessão nova sobre este
assunto — não repete explicação, só aponta onde as coisas estão. Docs
completos: [guia-projetos-paginas-build-deploy.md](guia-projetos-paginas-build-deploy.md)
(uso + arquitetura) e [provisionamento-vps-nginx-ssl-deploy.md](provisionamento-vps-nginx-ssl-deploy.md)
(infra/VPS).

## O que é

SaaS multi-tenant (Django + Astro) onde cada usuário cria `Project`s
(mini-sites) com `Page`s, publicados em `https://saas.fastvistos.com.br/app/{slug}/`.
Build do Astro é sempre escopado a 1 projeto por vez (nunca site-wide).

## Paths tocados com mais frequência neste assunto

**Django — modelos e lógica de negócio**
- `vitrine/core/models.py` — `Project`, `Page` (constraint `unique_home_page_per_project`), `Build`, `Deployment`, `Domain`
- `vitrine/core/deploy.py` — `build_project()`, `deploy_build()`, `rollback_to_build()`, `rename_project_release()`, `verify_domain_dns()`, `provision_domain_nginx_ssl()`, `run_ssh_command()`
- `vitrine/core/admin.py` — `ProjectAdmin` (inclusive `save_model()` com o auto-rename+rebuild de slug), `PageAdmin` (`live_link_actions`, `preview_link`)
- `vitrine/core/admin_domain.py` — `DomainAdmin`
- `vitrine/core/views.py` — `AuthView`, `api_projects_list`, `api_project_pages`, `preview_page`, `api_trigger_rebuild`
- `vitrine/core/adapters.py` — adapters do django-allauth (Google SSO)
- `vitrine/core/provisioning.py` — `provision_tenant_for_user()`
- `vitrine/core/management/commands/build_static_sites.py` — wrapper do `npm run build:_saas`
- `vitrine/vitrine_core/settings.py` — `ASTRO_ROOT`, `PLATFORM_SITE_ID`, `PLATFORM_PUBLIC_BASE_URL`, `DEPLOY_SSH_*`, `WWW_ROOT`, config do allauth (sem `SITE_ID` fixo — deliberado)

**Astro**
- `multi-sites/sites/_saas/pages/[project]/[...slug].astro` — rota dinâmica que renderiza qualquer projeto/página; `getStaticPaths()` respeita `PROJECT_SLUG_FILTER`

**Infra/VPS (fonte de verdade versionada no repo)**
- `vitrine/ops/vitrine-deploy.sh` — script restrito rodado pelo `deploybot` no VPS (verbos: `rsync-release`, `switch-symlink`, `reload-nginx`, `rename-project`; `write-nginx-conf`/`certbot-issue`/`dns-check` são stub, fase futura)
- `vitrine/rebuild.sh` — deploy do container; reinstala `ops/vitrine-deploy.sh` no host a cada rodada
- `vitrine/Dockerfile`, `vitrine/docker-compose.yml`, `vitrine/run.sh`

**Fora do repo (só documentado, não versionado)**
- `/home/deploybot/.ssh/authorized_keys` (forced-command)
- sudoers do `deploybot`
- config Nginx em `reverse-proxy-config/sites/030-saas-fastvistos.conf`

## Decisões que já foram tomadas (não reabrir sem motivo novo)

- Build sempre por-projeto, nunca site-wide (ver "Arquitetura" no guia principal).
- Lock de concorrência é **global** (1 build por vez em toda a plataforma), não por-projeto — o `dist/_saas` é compartilhado.
- `SITE_ID` do `django.contrib.sites` **não é fixado** — resolução por domínio da request.
- URL pública é path-based (`/app/{slug}/`), não subdomínio por projeto.
- Editar `Project.slug` depois de publicado é permitido e dispara rename+rebuild automático (não é read-only).
- Domínio customizado (`Domain`/Certbot automático) está com o Python pronto, mas o script do VPS ainda é stub — fase futura deliberada.

## Convenção de commit/push

Esta sessão nunca roda `git commit`/`git push`/PR sozinha — isso fica
sempre a cargo do usuário.
