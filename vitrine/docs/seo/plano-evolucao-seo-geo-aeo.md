# Plano: evoluir o SEO em camadas para "SEO/GEO/AEO nativo"

Complementa [guia-seo-projetos-paginas.md](guia-seo-projetos-paginas.md) —
leia aquele primeiro. Este documento não propõe reescrever nada: a
arquitetura de 3 camadas (`PlatformSeoDefaults → ProjectSeoSettings →
PageSeoSettings`, resolvida em `resolve_seo()`) é exatamente a fundação
certa pra isso. O que falta é *conteúdo* (mais tipos de schema, mais
sinais pra IA) e *dois arquivos que hoje não existem* (`robots.txt`,
`llms.txt`), não uma nova arquitetura.

Índice:
- [Diagnóstico: o que já existe vs. o que falta](#diagnóstico-o-que-já-existe-vs-o-que-falta)
- [Por que isso é diferenciação real (e não feature de marketing)](#por-que-isso-é-diferenciação-real)
- [Roadmap em 6 fases](#roadmap-em-6-fases)
- [Detalhamento técnico por fase](#detalhamento-técnico-por-fase)
- [Decisões de arquitetura a tomar agora](#decisões-de-arquitetura-a-tomar-agora)
- [O que não fazer (riscos e escopo fora)](#o-que-não-fazer)
- [Métricas de sucesso](#métricas-de-sucesso)

---

## Diagnóstico: o que já existe vs. o que falta

| Ideia do "SEO/GEO/AEO nativo" | Estado atual | Gap |
|---|---|---|
| JSON-LD por tipo de página | `WebSite`, `Organization`, `WebPage`, `Breadcrumb`, `LocalBusiness` (contact), `BlogPosting` (blog_post) | Faltam `FAQPage`, `Person`, `Product`, `Article` genérico, `HowTo`. Os blocos existentes leem `type_specific_data` livre, sem schema validado. |
| Sitemap.xml automático | ✅ Já existe, gerado do banco via `resolve_seo()`, exclui `noindex` — **é a parte mais madura do sistema hoje** | Falta só o passo de infra (rota no nginx) |
| **robots.txt automático** | ❌ **Não existe** | Gap crítico e mais barato de fechar — hoje um projeto novo simplesmente não tem `robots.txt`, o que é pior que ter um genérico |
| llms.txt | ❌ Não existe | Não implementado; padrão emergente, baixo esforço técnico (é um dump de texto), alto valor de posicionamento |
| HTML semântico limpo | Parcial — Astro gera HTML limpo por padrão (vantagem estrutural vs. builders que empilham `<div>`), mas não há auditoria do conteúdo rico do usuário (rich text pode virar `<div>` genérico em vez de `<article>`/`<section>`/`<h2>`) | Precisa auditar o editor de conteúdo, não a camada de SEO |
| Conteúdo estruturado pra extração (FAQ, definições, stats) | ❌ Não existe como *tipo de conteúdo* — só como JSON-LD invisível pro usuário | Este é o item que mais falta e o que mais conecta SEO técnico com GEO/AEO |
| Core Web Vitals | Vantagem estrutural (Astro = HTML estático, pouco JS) mas **não medido nem exposto** | Falta instrumentação e feedback pro usuário |
| AI visibility score | Existe um checklist de texto colorido (`_seo_checklist_html()`), não bloqueia salvamento | Precisa virar score numérico agregando os sinais novos, não só "preencheu os campos clássicos" |

Resumindo o diagnóstico em uma frase: **você já tem a parte mais difícil
de acertar (arquitetura de resolução em camadas, testada, sem duplicar
regra de precedência) — o que falta é principalmente conteúdo/tipos
novos plugados nela, não infraestrutura nova.**

## Por que isso é diferenciação real

Vale nomear o porquê antes do roadmap, porque isso deveria guiar
priorização: os itens que **builders no-code tradicionais não conseguem
replicar facilmente** são os que valem mais como diferenciação de venda.

- Sitemap/robots/JSON-LD automáticos: qualquer builder maduro (Webflow,
  Framer) já tem. Importante ter, mas não é o que vende.
- HTML semântico limpo: é onde Webflow se destaca hoje — e no seu caso já
  é uma vantagem *de graça* por usar Astro (SSG) em vez de um DOM montado
  por um builder visual genérico. Vale medir e comunicar isso, mais do
  que construir.
- **O que ninguém no-code entrega hoje**: conteúdo estruturado pra
  extração por IA (FAQ/definição/estatística como bloco de primeira
  classe no editor) + llms.txt + um score que soma sinais de SEO
  tradicional *e* de citabilidade por IA num número só. Isso é
  genuinamente novo — a maioria dos concorrentes trata "otimização pra
  IA" como produto separado e caro (os $250/mês que você mencionou),
  não como recurso nativo do builder.

Ou seja: as fases 2 (llms.txt) e 3 (conteúdo estruturado) do roadmap
abaixo são as que realmente diferenciam. As fases 0/1 (robots.txt, mais
JSON-LD) são "dever de casa" que falta fechar antes de vender a
diferenciação.

## Roadmap em 6 fases

Ordenado por impacto/esforço, não por dependência estrita — várias podem
rodar em paralelo se você tiver mais de uma pessoa.

| Fase | O quê | Esforço | Por quê nessa ordem |
|---|---|---|---|
| **0** | `robots.txt` automático | Baixo (poucas horas) | Gap crítico e vergonhoso de deixar aberto; reusa 100% do padrão já validado do `sitemap_xml` |
| **1** | Expandir JSON-LD: `FAQPage`, `Person`, `Product`, `Article` + schema validado por `page_type` (sai do JSON livre) | Médio | Reusa a arquitetura de camadas; maior parte do trabalho é modelagem de dados, não infra nova |
| **2** | `llms.txt` por projeto | Baixo–médio | Baixo esforço técnico, alto valor de posicionamento ("suporte nativo a llms.txt" é uma frase de venda forte hoje) |
| **3** | Conteúdo estruturado pra extração (blocos de FAQ/definição/estatística no editor) | Alto | É o item de maior diferenciação real, mas depende de decidir como o editor de conteúdo representa "blocos" (ver decisões abaixo) |
| **4** | Core Web Vitals: medir + expor no admin | Médio | Depende de decidir onde rodar a medição (ver decisões abaixo); a vantagem estrutural do Astro já existe, isso só a torna visível/vendável |
| **5** | AI Visibility Score (substitui o checklist de texto) | Médio | Deve vir por último porque agrega sinais das fases 1–4 — fazer antes delas produz um score vazio |

## Detalhamento técnico por fase

### Fase 0 — `robots.txt` automático

Mesma receita do `sitemap_xml` (`core/views.py`): endpoint Django
servindo `/robots.txt` dinamicamente, com regra:

```
User-agent: *
Allow: /
Sitemap: {site_url}/sitemap.xml
Disallow: /admin/
Disallow: /preview/
```

- Reusa `resolve_seo()`/`Project.all_objects` só pra montar o `Sitemap:`
  com o domínio certo por projeto (mesmo cuidado multi-tenant do
  sitemap — não esquecer o guard de `all_objects` + `is_removed=False`
  documentado no guia principal).
- Adicionar rota no nginx (mesmo padrão de `/sitemap.xml`) — dá pra fazer
  no mesmo passo de infra que já está pendente pro sitemap.
- Considerar um campo em `PageSeoSettings` (ou reaproveitar `noindex`)
  pra permitir bloquear paths específicos por página, não só via
  `<meta robots>`.

### Fase 1 — Mais tipos de JSON-LD, com schema validado

Hoje `type_specific_data` é `JSONField` livre — funciona, mas não
escala pra mais tipos sem virar bagunça, e é a peça que mais precisa de
disciplina pra o "usuário não precisar saber o que é JSON-LD" ser
verdade.

Proposta:
1. Formalizar um schema por `page_type` (dataclass Python ou Pydantic,
   não precisa ser JSON Schema formal) — ex.:
   `FAQPageData(questions: list[{question, answer}])`,
   `PersonData(name, job_title, image_url, sameAs: list[url])`,
   `ProductData(name, price, currency, availability, image_url,
   rating?, review_count?)`.
2. Cada schema vira **campos reais no admin** (não JSON cru) —
   via `formfield` custom ou um inline por tipo, não um textarea. Isso é
   o que fecha a promessa de "sem o usuário saber o que é JSON-LD": ele
   preenche "Pergunta 1 / Resposta 1", não um objeto JSON.
3. Novos componentes Astro: `JsonLdFaqBlock.astro`, `JsonLdPersonBlock.astro`,
   `JsonLdProductBlock.astro`, `JsonLdArticleBlock.astro` — seguindo o
   padrão existente (props explícitas, sem `siteConfig`).
4. Novos `page_type` choices: `faq`, `person`/`team_member`, `product`,
   `article` (separado de `blog_post` se a semântica for diferente pro
   seu caso de uso — ou reaproveitar `blog_post` → `Article`/`BlogPosting`
   conforme um campo extra).
5. Adicionar toggle condicional no admin por `page_type` — isso já está
   no backlog do guia atual ("Sem toggle JS condicional no admin"); vale
   resolver junto, porque com mais tipos a ausência do toggle fica mais
   dolorosa.

### Fase 2 — `llms.txt`

Formato é simples (markdown com seções `# Nome do site`, `## Páginas`,
lista de links + descrição curta) — o esforço real é decidir a fonte de
verdade, não o parsing.

- Endpoint novo, mesmo padrão do `sitemap_xml`/`robots.txt`:
  `/llms.txt`, gerado do banco.
- Conteúdo: nome do site/organização (`PlatformSeoDefaults`/
  `ProjectSeoSettings`), uma descrição curta do projeto (novo campo, ou
  reaproveitar `seo_description` da home), e a lista de páginas
  publicadas com `title` + `seo_description` de cada uma (já existem via
  `resolve_seo()` — nenhum dado novo necessário pra uma v1).
- v2 (depois da Fase 3): incluir os FAQs/definições estruturados
  extraídos das páginas, porque é exatamente o tipo de conteúdo que
  `llms.txt` foi pensado pra expor.

### Fase 3 — Conteúdo estruturado pra extração (a peça que mais diferencia)

Este é o item que conecta diretamente ao estudo que você mencionou:
FAQs, definições e estatísticas destacadas aumentam a chance de citação
por IA. A implementação depende de como o editor de conteúdo do
projeto representa conteúdo hoje (rich text livre? blocos?) — isso não
está no guia de SEO, então é a primeira decisão a confirmar antes de
codar (ver seção de decisões).

Independente da resposta, a peça de SEO precisa de:
1. Um novo tipo de bloco de conteúdo "FAQ" — que serve **dois
   propósitos ao mesmo tempo**: renderiza como `<details>`/acordeão
   visível pro visitante *e* alimenta `JsonLdFaqBlock` automaticamente
   (mesma fonte de dado, sem o usuário duplicar informação em dois
   lugares — mesmo princípio de "single source of truth" do
   `resolve_seo()`).
2. Um bloco "estatística/citação destacada" — visualmente um callout
   (`<blockquote>`/card), semanticamente marcado de forma que fique
   fácil de extrair (heading claro + texto curto e autocontido, não
   espalhado em parágrafo longo).
3. Um bloco "definição" (padrão pergunta-resposta curto, tipo glossário)
   — mesma lógica: bom pra leitor humano, bom pra ser citado como
   resposta direta por um agente de IA.

### Fase 4 — Core Web Vitals

- Medição real (LCP/CLS/INP) precisa vir de dado de campo, não só de
  lab — via `web-vitals` JS injetado no `Layout.astro`, reportando pra
  um endpoint Django (`api_report_vitals` ou similar), agregado por
  projeto/página.
- Alternativa mais barata pra v1: rodar Lighthouse/PageSpeed Insights
  API sob demanda (botão "checar performance" no admin) em vez de
  telemetria contínua — menos preciso, mas zero código de coleta em
  produção.
- Expor no checklist/score (Fase 5) como mais um sinal, não como
  dashboard separado.

### Fase 5 — AI Visibility Score

Substitui `_seo_checklist_html()` por um score numérico (0–100, ou
semáforo com peso) que agrega:

- Sinais clássicos já existentes (título/descrição preenchidos,
  canonical, imagem OG, favicon) — o que o checklist já cobre.
- Presença de JSON-LD correto pro `page_type` (Fase 1).
- Presença de conteúdo estruturado extraível — tem FAQ? Tem
  estatística/definição destacada? (Fase 3).
- `llms.txt` existe e inclui a página (Fase 2).
- Sinal de performance (Fase 4).

Importante manter a filosofia Yoast já documentada: **orienta, não
bloqueia** — o score não deveria impedir publicar, só mostrar o que
falta.

## Decisões de arquitetura a tomar agora

Antes de codar a Fase 3 (a mais valiosa), vale confirmar 3 pontos que
não aparecem no guia de SEO porque são do domínio do editor de
conteúdo, não do SEO:

1. **Como o conteúdo da página é representado hoje?** Rich text
   HTML livre num campo `content`, ou já existe algum sistema de blocos?
   Isso muda inteiramente como um "bloco FAQ" seria implementado (parser
   de HTML pra extrair estrutura vs. campo estruturado nativo).
2. **`type_specific_data` vira schema formal (Pydantic/dataclass) ou
   continua JSON livre com convenção em comentário?** Formalizar destrava
   o toggle condicional no admin e a validação, mas é um refactor do que
   já existe — vale decidir antes de adicionar os 4 tipos novos da Fase 1,
   pra não ter que migrar duas vezes.
3. **Onde roda a medição de Core Web Vitals?** Telemetria de campo real
   (mais fiel, mais código) vs. PageSpeed Insights sob demanda (mais
   simples, menos preciso) — escolha muda o esforço da Fase 4 de "médio"
   pra "baixo" ou vice-versa.

## O que não fazer

- **Não reescrever a resolução em camadas.** `resolve_seo()` já é o
  ponto certo pra plugar tudo isso — o padrão "adicionar campo → incluir
  fallback em `resolve_seo()` → aparece automático na API/Astro" descrito
  no guia continua valendo pra cada item novo.
- **Não tratar "AI visibility score" como produto separado.** É
  justamente o contraste que diferencia — pré-requisito é os sinais
  serem nativos do builder (Fases 1–4), senão o score é só um wrapper de
  IA sem substância atrás.
- **Não bloquear publicação com base no score.** Mantém a filosofia
  Yoast já em uso — mudar isso agora quebraria uma decisão consciente já
  documentada e testada.
- **Não compartilhar componentes JSON-LD com o legado ainda.** A decisão
  de duplicar (`_saas/components/` vs. `emprego/components/`) foi
  consciente por causa do custo de infra de workspace compartilhado —
  os novos componentes das Fases 1–2 devem seguir o mesmo padrão
  duplicado, não é o momento de resolver os dois problemas juntos.

## Métricas de sucesso

Pra saber se cada fase entregou valor, não só "foi implementada":

- Fase 0/1: % de projetos com `robots.txt` válido e ≥1 tipo de JSON-LD
  além de `WebPage`/`Organization` (hoje é ~0% além do básico).
- Fase 2: % de projetos com `llms.txt` acessível e não vazio.
- Fase 3 (a que mais importa): % de páginas publicadas com pelo menos um
  bloco de FAQ/definição/estatística — e, se possível depois, taxa de
  aparição em respostas de ferramentas de IA (mais difícil de medir
  diretamente, mas dá pra amostrar manualmente perguntando a
  ChatGPT/Perplexity sobre tópicos dos projetos-piloto).
- Fase 4: LCP/CLS/INP médios por projeto, comparado à média do
  mercado de sites no-code (esse comparativo é material de venda).
- Fase 5: correlação entre score alto e as métricas acima — se o score
  não correlacionar com resultado real, ele está pesando o sinal errado.
