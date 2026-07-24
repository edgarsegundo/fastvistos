# Prompts para Claude Code — evolução SEO/GEO/AEO

Complementa [plano-evolucao-seo-geo-aeo.md](plano-evolucao-seo-geo-aeo.md).
Um prompt por fase, pensado pra rodar em **plan mode** (deixa o Claude Code
mapear os arquivos e o approach antes de editar). Não copie o roadmap
inteiro de uma vez — vá fase por fase, revise o diff, só então avance.

Decisões já tomadas (não deixe o Claude Code decidir de novo):
- Conteúdo = Toast UI Editor (markdown) para prosa + campos estruturados
  nativos (JSON) para FAQ/estatística/definição — nunca HTML livre tipo
  page-builder pra esses blocos.
- `type_specific_data` vira `@dataclass` Python validada, não JSON cru.
- Core Web Vitals via PageSpeed Insights API sob demanda (botão no
  admin), não telemetria contínua em produção — v1 primeiro.

---

## Fase 0 — `robots.txt` automático

```
Contexto: sistema de SEO em camadas documentado em
vitrine/docs/guia-seo-projetos-paginas.md. Já existe /sitemap.xml
(core/views.py::sitemap_xml) gerado dinamicamente do banco, multi-tenant,
usando Project.all_objects/Page.all_objects (não objects) para não
filtrar por tenant do threadlocal, e excluindo is_removed=True na mão.

Tarefa: criar endpoint /robots.txt seguindo exatamente o mesmo padrão de
sitemap_xml (mesmo arquivo core/views.py, mesma lógica de managers e
guard multi-tenant). Conteúdo:

User-agent: *
Allow: /
Sitemap: {site_url}/sitemap.xml
Disallow: /admin/
Disallow: /preview/

O site_url deve vir da mesma fonte que resolve_seo() usa hoje
(considerando canonical_domain_override quando existir), um bloco por
projeto que tiver domínio verificado, iterando como o sitemap já faz.

Adicionar rota em vitrine_core/urls.py. Adicionar teste em
core/tests/test_robots.py espelhando os casos de core/tests/test_sitemap.py
(cross-tenant, noindex se aplicável, soft-delete). Não mexer no nginx
ainda — isso fica pra um passo de infra separado, só sinalize no final
que falta cadastrar a rota lá, no mesmo padrão de /sitemap.xml.

Critério de pronto: endpoint funciona localmente, testes passam, e você
me diz explicitamente quais linhas de nginx.conf eu preciso adicionar
(mesmo formato do que já existe pra /sitemap.xml).
```

## Fase 1 — Novos tipos de JSON-LD com schema validado

```
Contexto: vitrine/docs/guia-seo-projetos-paginas.md documenta a
arquitetura atual: PageSeoSettings.type_specific_data é um JSONField
livre hoje, sem schema, lido pelos componentes Astro
JsonLdLocalBusinessBlock.astro (page_type=contact) e
JsonLdBlogPostBlock.astro (page_type=blog_post) em
multi-sites/sites/_saas/pages/[project]/[...slug].astro.

Decisão já tomada: type_specific_data vai deixar de ser JSON cru e virar
dataclasses Python validadas, uma por page_type.

Tarefa, nesta ordem:
1. Criar em core/seo_schemas.py (novo arquivo) uma dataclass por tipo
   novo: FaqPageData (list de {question, answer}), PersonData (name,
   job_title, image_url, same_as: list[str]), ProductData (name, price,
   currency, availability, image_url, rating opcional, review_count
   opcional), ArticleData (headline, author, published_at, image_url).
   Reaproveite o mesmo padrão pros 2 tipos existentes (contact/
   LocalBusiness, blog_post/BlogPosting) se ainda não estiverem
   formalizados, migrando o JSON livre atual pra dataclass sem quebrar
   dado existente.
2. Adicionar as novas choices em Page.PAGE_TYPE_CHOICES: faq, person,
   product, article.
3. resolve_seo() (core/seo.py) deve validar/serializar type_specific_data
   usando a dataclass correspondente ao page_type, sem quebrar se o
   dado salvo for de um schema antigo (migração suave).
4. Criar os componentes Astro: JsonLdFaqBlock.astro, JsonLdPersonBlock.astro,
   JsonLdProductBlock.astro, JsonLdArticleBlock.astro em
   multi-sites/sites/_saas/components/, seguindo exatamente o padrão dos
   existentes (props explícitas, sem importar siteConfig). Adicionar os
   branches condicionais em [...slug].astro por seo.page_type.
5. No admin (core/admin.py), trocar o campo JSONField cru por campos
   reais por tipo — pode usar um formset/inline condicional simples, ou,
   se for mais rápido de implementar corretamente, pelo menos separar em
   fieldsets nomeados por tipo com help_text claro (o objetivo final é o
   usuário nunca ver a palavra "JSON-LD" nem editar um textarea de JSON).
6. Testes: cobrir cada dataclass (validação de campos obrigatórios) e
   cada componente novo, seguindo o padrão de core/tests/test_seo.py.

Critério de pronto: consigo criar uma Page com page_type=faq, preencher
perguntas/respostas em campos normais do admin (não JSON), salvar, e ver
o <script type="application/ld+json"> correto no HTML final da página
buildada, sem eu ter escrito JSON manualmente em nenhum momento.
```

## Fase 2 — `llms.txt`

```
Contexto: mesma arquitetura de camadas, resolve_seo() já retorna title/
seo_description resolvidos por página via api_project_pages
(core/views.py). Sitemap e robots.txt (fase anterior) seguem o mesmo
padrão de endpoint dinâmico por projeto.

Tarefa: criar endpoint /llms.txt por projeto, mesmo padrão de
sitemap_xml/robots (managers all_objects + guard multi-tenant + exclui
is_removed e noindex). Formato:

# {nome do projeto ou organization_name}

{descrição curta do projeto — usar seo_description da home page se não
houver campo dedicado; se não houver, pule a linha}

## Páginas

- [{title}]({url}): {seo_description}
- (uma linha por página publicada, noindex excluída)

Se precisar de um campo novo pra descrição do projeto (não confundir com
SEO description da home), adicionar em ProjectSeoSettings, com fallback
vazio se não preenchido — não bloquear geração do arquivo por isso.

Testes espelhando core/tests/test_sitemap.py. Não integrar ainda os
blocos de FAQ/estatística (isso é a fase seguinte) — v1 é só título +
descrição por página.

Critério de pronto: /llms.txt de um projeto de teste retorna markdown
válido, lista todas as páginas publicadas com descrição, exclui noindex,
e não vaza páginas de outro tenant.
```

## Fase 3 — Blocos estruturados (FAQ, estatística, definição)

```
Contexto: decisão de arquitetura já tomada — conteúdo de prosa continua
livre (Toast UI Editor / markdown), mas FAQ/estatística/definição são
blocos estruturados nativos, não HTML/markdown livre, porque precisam
alimentar tanto o HTML visível quanto o JSON-LD (JsonLdFaqBlock da Fase 1)
a partir da MESMA fonte de dado — sem o usuário duplicar informação.

Decisão já tomada (não reabrir): uma página pode ter VÁRIOS blocos
estruturados de tipos diferentes misturados com o conteúdo livre — ex:
uma página page_type=product pode ter 2 blocos de FAQ e 1 de
estatística no meio do texto. Por isso page_type e ContentBlock são
CAMPOS COM RESPONSABILIDADES DIFERENTES, não um substituindo o outro —
mesmo padrão já usado no projeto entre is_home e page_type (ver guia
principal): page_type decide o schema JSON-LD PRINCIPAL da página
(Product, Article, LocalBusiness, etc — da Fase 1); ContentBlock decide
quais seções estruturadas ADICIONAIS a página tem, independente do
page_type. As duas coisas podem coexistir na mesma página — inclusive
gerando mais de um <script type="application/ld+json"> na mesma URL
(ex: Product + FAQPage), o que é válido em Schema.org. page_type=faq
continua existindo só para o caso de nicho de uma página inteira
dedicada a FAQ; não é pré-requisito para usar blocos de FAQ soltos.

Implementação (model separado):
1. Criar model ContentBlock (core/models.py): FK pra Page, campo
   block_type (choices: faq, stat_highlight, definition), campo order
   (int, pra posição relativa dentro da página), e um campo estruturado
   por tipo (pode reaproveitar as dataclasses da Fase 1 pro FAQ; criar
   StatHighlightData (stat_text, source_name, source_url opcional) e
   DefinitionData (term, definition) novas em core/seo_schemas.py).
2. Inline no admin de Page (PageContentBlockInline) pra adicionar/
   reordenar blocos.
3. Astro: componentes visuais (não JSON-LD, esses já existem) —
   FaqAccordion.astro, StatHighlightCard.astro, DefinitionCallout.astro —
   renderizados na posição certa dentro do conteúdo da página, usando
   `order`. Precisa decidir com o Astro existente como blocos se
   intercalam com o conteúdo markdown livre — investigue como
   [...slug].astro renderiza `page.content` hoje antes de propor a
   solução.
4. Cada FaqAccordion renderizado deve automaticamente alimentar
   JsonLdFaqBlock com os mesmos dados (sem reescrever a query). O
   FAQPage JSON-LD montado a partir de ContentBlocks deve coexistir com
   o JSON-LD principal do page_type (ex: Product), como <script>s
   separados na mesma página — não substituir um pelo outro.

Critério de pronto: consigo adicionar 2 blocos de FAQ e 1 de estatística
numa página genérica (page_type=generic), reordenar, salvar, e ver os 3
renderizados na posição certa no HTML final, com o FAQPage JSON-LD
gerado automaticamente a partir dos blocos FAQ da página.
```

## Fase 4 — Core Web Vitals (PageSpeed Insights sob demanda)

```
Contexto: decisão já tomada — v1 usa PageSpeed Insights API sob demanda
(botão no admin), não telemetria contínua em produção.

Tarefa:
1. Função core/performance.py::fetch_pagespeed_score(url) que chama a
   PageSpeed Insights API (googleapis.com/pagespeedonline) pra uma URL,
   extrai LCP, CLS, INP (ou os campos equivalentes que a API retornar) e
   o performance score geral.
2. Endpoint/admin action "Checar performance" no PageAdmin
   (core/admin.py) — dispara a chamada pra url pública da página
   (resolve_seo() já dá o site_url + slug), mostra resultado inline (não
   precisa persistir em model novo na v1 — pode cachear em cache do
   Django por algumas horas pra não estourar rate limit da API).
3. Tratar erro de rede/rate limit da API sem quebrar o admin — mostrar
   mensagem de "não foi possível checar agora, tente de novo" em vez de
   500.
4. Testes com a chamada de API mockada (não bater na API real nos testes).

Critério de pronto: numa página já publicada, clico "Checar performance"
no admin e vejo LCP/CLS/INP e o score geral, sem travar a página do
admin nem estourar erro se a API estiver fora do ar.
```

## Fase 5 — AI Visibility Score

```
Contexto: hoje existe um checklist de texto colorido
(_seo_checklist_html() em core/admin.py), que não bloqueia salvamento
(filosofia Yoast — orienta, não impede publicar). As fases 1-4 já
existem: JSON-LD tipado (Fase 1), llms.txt (Fase 2), blocos estruturados
(Fase 3), Core Web Vitals sob demanda (Fase 4).

Tarefa: criar core/ai_visibility_score.py::compute_score(page) → retorna
um score 0-100 e a lista de itens que faltam, agregando:
- Sinais clássicos que o checklist atual já verifica (título, descrição,
  canonical, og_image, favicon preenchidos) — peso menor.
- JSON-LD correto presente pro page_type (usa as dataclasses da Fase 1)
  — peso médio.
- Pelo menos 1 ContentBlock (FAQ/estatística/definição) presente na
  página (Fase 3) — peso alto, é o diferencial real.
- Página incluída em llms.txt do projeto (Fase 2) — peso médio.
- Último score de performance checado (Fase 4), se existir e não estiver
  expirado do cache — peso médio.

Trocar _seo_checklist_html() por essa função, mantendo o mesmo lugar no
admin (readonly field no topo do PageSeoSettingsInline), mas mostrando o
número/score além da lista de itens faltando — sem bloquear salvamento
em nenhum caso, mesma filosofia de hoje.

Critério de pronto: uma página nova mostra score baixo com lista clara
do que falta; ao preencher JSON-LD + adicionar um bloco FAQ + aparecer
no llms.txt, o score sobe visivelmente — sem eu precisar rodar migração
manual nenhuma pra ver o efeito.
```
