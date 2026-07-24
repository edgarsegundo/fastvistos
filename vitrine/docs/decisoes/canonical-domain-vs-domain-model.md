# `canonical_domain_override` (SEO) vs. `Domain` (verificação DNS/SSL) — dois cadastros desconectados

**Data**: 2026-07-24
**Status**: 🟡 Em aberto — problema mapeado, fix ainda não decidido
**Achado durante**: Fase 0 do roadmap SEO/GEO/AEO (`/robots.txt`,
[guia-seo-projetos-paginas.md](../seo/guia-seo-projetos-paginas.md)),
ver também o item em [../backlog.md](../backlog.md).

Este documento **não é um spec fechado** — é o registro do problema e
das opções cogitadas, pra quem pegar esse item não precisar remapear o
código do zero. A escolha de abordagem ainda não foi feita.

## Contexto

`core/seo.py::resolve_seo()` monta `site_url`/`canonical` de cada página
usando `ProjectSeoSettings.canonical_domain_override`
(`core/models.py:500-503`) — um `CharField` livre, preenchido manualmente
pelo usuário, sem nenhuma validação de que o domínio realmente aponta pro
VPS ou tem SSL:

```python
# core/seo.py:49-51
domain_override = project_seo.canonical_domain_override if project_seo else ''
base_url = (domain_override or settings.PLATFORM_PUBLIC_BASE_URL).rstrip('/')
site_url = f"{base_url}/app/{project.slug}/" if not domain_override else f"{base_url}/"
```

Esse `site_url` é a mesma fonte usada por `sitemap_xml` e `robots_txt`
(`core/views.py`) pra anunciar URLs a crawlers.

Separadamente, existe o model `Domain` (`core/models.py:375-446`) — um
cadastro de domínio customizado com verificação DNS real e provisionamento
de Nginx/SSL real, **não um stub**:

- `core/deploy.py::verify_domain_dns()` (linha 378) — resolve o domínio
  via `socket.gethostbyname()` e confere contra `settings.VPS_PUBLIC_IP`,
  setando `Domain.verification_status`.
- `core/deploy.py::provision_domain_nginx_ssl()` (linha 413) — rollout em
  3 fases (bootstrap HTTP → Certbot webroot → config HTTPS completa) via
  `run_ssh_command()` (linha 69), que executa comandos restritos
  (`write-nginx-conf`, `certbot-issue`, `reload-nginx`) num host remoto
  `deploybot@`.
- Ambas ações expostas no Django Admin
  (`core/admin_domain.py::DomainAdmin.action_verify_dns`,
  `.action_provision_nginx_and_ssl`).

**Nota de correção de doc**: `guia-seo-projetos-paginas.md` (seção
"Limitações conhecidas") descrevia `Domain` como "stub, fase futura" —
impreciso. O lado Python (verificação DNS + geração/aplicação de config
Nginx + Certbot) está implementado e funcional. O que falta é o script
restrito do lado do VPS que recebe os comandos SSH
(`write-nginx-conf`/`certbot-issue`/`reload-nginx`) — isso sim ainda não
foi escrito/deployado (confirmado em
`guia-projetos-paginas-build-deploy-context.md:55`: "o Python está
pronto, mas o script do VPS ainda é stub"). Ou seja: o *provisionamento*
tem uma perna faltando, mas a *verificação DNS* (`verify_domain_dns`) já
roda de ponta a ponta hoje.

## O problema

`grep -rn "canonical_domain_override"` no código mostra zero referências
cruzadas com `Domain` — são dois cadastros de domínio inteiramente
desacoplados. Dois cenários ruins na prática:

1. **Falso positivo**: usuário verifica DNS + emite SSL de verdade via
   `Domain` (badge "✅ Verificado" no admin), mas esquece de também
   colar a mesma string em `ProjectSeoSettings.canonical_domain_override`
   — o projeto continua invisível pro próprio domínio em
   `sitemap.xml`/`robots.txt`, que seguem apontando pro
   `PLATFORM_PUBLIC_BASE_URL` (`/app/{slug}/`).
2. **Falso negativo**: usuário preenche
   `canonical_domain_override='https://meudominio.com'` direto (sem
   nunca ter passado por `Domain`/verificação) — `resolve_seo()`,
   `sitemap_xml` e `robots_txt` passam a anunciar esse domínio pra
   crawlers como canônico, mesmo que ele nunca tenha sido verificado
   (pode nem resolver, ou não ter SSL — link morto exposto).

## Opções cogitadas (nenhuma decidida)

1. **`resolve_seo()` passa a preferir o `Domain` verificado** —
   `project.domains.filter(is_primary=True, verification_status=Domain.VERIFICATION_VERIFIED).first()`
   como fonte de `site_url`, com `canonical_domain_override` como
   fallback manual só se não houver `Domain` verificado. Reduz o
   cenário 2 (falso negativo), mas ainda depende de alguém marcar
   `is_primary`.
2. **Sincronizar os dois campos via signal** — `post_save` em `Domain`
   (quando `verification_status` vira `VERIFICATION_VERIFIED`) escreve
   automaticamente em `ProjectSeoSettings.canonical_domain_override`.
   Resolve o cenário 1 sem exigir ação manual, mas duplica o dado em
   dois lugares (mesmo problema que a migration de SEO já evitou antes,
   ver `guia-seo-projetos-paginas.md`).
3. **Deprecar `canonical_domain_override`, `Domain` vira única fonte de
   verdade** — remove o campo livre, `resolve_seo()` só lê
   `project.domains`. Mais limpo, mas é breaking change pra quem já
   preencheu o campo manualmente (precisa de migration de dados) e força
   resolver o script stub do VPS antes (senão ninguém consegue ter um
   `Domain` verificado sem o provisionamento funcionar).
4. **Não fazer nada agora, só validar no admin** — adicionar um aviso no
   `ProjectSeoSettingsInline` se `canonical_domain_override` estiver
   preenchido mas não existir um `Domain` correspondente verificado (ou
   vice-versa). Menor esforço, não resolve o dado desatualizado, só
   torna o gap visível pra quem está editando.

## Por que não decidir agora

Qualquer uma das opções 1-3 competem com o item ainda maior "o script do
VPS pro provisionamento de `Domain` não existe" — sem isso, `Domain`
verificado é raro na prática (poucos projetos vão ter passado por
`provision_domain_nginx_ssl` com sucesso), o que limita o valor de
integrar agora. Vale reavaliar quando esse script for escrito.
