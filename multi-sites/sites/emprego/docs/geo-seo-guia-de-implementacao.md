# Manual de Implementação GEO + AEO — empregoaqui.com.br

> **Para quem é este documento:** este é um guia operacional para ser usado pelo Claude dentro do VS Code (Claude Code) para implementar, passo a passo, otimizações de GEO (Generative Engine Optimization) e AEO (Answer Engine Optimization) no site de empregos `empregoaqui.com.br`.
>
> **Objetivo do projeto:** usar o empregoaqui.com.br como caso real (cobaia) para implementar, testar e medir cada ação, documentando resultados que servirão de base empírica para um livro/curso sobre SEO vs GEO vs AEO.
>
> **Como usar com o Claude Code:** trabalhe uma seção por vez. Para cada ação, o Claude deve (1) localizar onde aplicar no código, (2) implementar, (3) sugerir como validar, e (4) registrar a data da implementação na seção de log no final do documento.

---

## Índice

1. [Contexto e princípios](#1-contexto-e-princípios)
2. [Glossário rápido: SEO vs AEO vs GEO](#2-glossário-rápido)
3. [Metodologia de teste para o projeto-cobaia](#3-metodologia-de-teste)
4. [Fase 0 — Baseline e instrumentação](#fase-0--baseline-e-instrumentação)
5. [Fase 1 — Fundação técnica e crawlability](#fase-1--fundação-técnica-e-crawlability)
6. [Fase 2 — Dados estruturados (Schema)](#fase-2--dados-estruturados-schema)
7. [Fase 3 — Estrutura e formato do conteúdo](#fase-3--estrutura-e-formato-do-conteúdo)
8. [Fase 4 — Autoridade e entidades](#fase-4--autoridade-e-entidades)
9. [Fase 5 — Estratégia de conteúdo](#fase-5--estratégia-de-conteúdo)
10. [Fase 6 — Camada AI-nativa (llms.txt e crawlers)](#fase-6--camada-ai-nativa)
11. [Fase 7 — Monitoramento e métricas](#fase-7--monitoramento-e-métricas)
12. [Apêndice A — Snippets prontos de Schema](#apêndice-a--snippets-prontos-de-schema)
13. [Apêndice B — Template de llms.txt](#apêndice-b--template-de-llmstxt)
14. [Log de implementação](#log-de-implementação)

---

## 1. Contexto e princípios

A busca está migrando de um modelo baseado em cliques para um modelo baseado em respostas. Os dados recentes que sustentam a urgência deste trabalho:

- A fatia de buscas no Google que terminam **sem clique** (zero-click) subiu de cerca de 56% em 2024 para perto de 69% em 2025.
- A presença de AI Overviews no Google saltou de ~6% das queries em janeiro de 2025 para mais de 30% no fim de 2025.
- O tráfego vindo de buscas com IA cresceu mais de 40% ano a ano, e estudos indicam que esses visitantes convertem a uma taxa significativamente maior que o orgânico tradicional, por chegarem mais avançados na jornada de decisão.
- O estudo acadêmico que cunhou o termo GEO (Aggarwal et al., Princeton, ACM KDD 2024, ~10.000 queries) mostrou que adicionar **estatísticas, citações e fontes** ao conteúdo aumenta a visibilidade em motores generativos em até **40%**. Em contraste, keyword stuffing teve efeito mínimo.

**Princípio mestre:** GEO e AEO **não substituem** o SEO — eles se assentam sobre uma base de SEO bem feita. Conteúdo bem estruturado, autoridade real e higiene técnica continuam sendo o alicerce. A diferença é uma camada adicional: tornar cada trecho independentemente compreensível e cada fato independentemente citável.

**Importante sobre honestidade científica (relevante para o livro):** algumas táticas (como o `llms.txt`) ainda **não têm comprovação estatística** de impacto direto — nenhuma das grandes plataformas (OpenAI, Google, Anthropic) confirmou oficialmente usar o arquivo em produção até o início de 2026, e estudos controlados (ex.: Semrush) não encontraram correlação estatística clara. Marcamos essas ações como **[experimental]** ao longo do documento. Como este é um projeto-cobaia, justamente testar e documentar essas hipóteses é parte do valor.

---

## 2. Glossário rápido

| Sigla | Nome | Otimiza para | Métrica de sucesso |
|-------|------|--------------|--------------------|
| **SEO** | Search Engine Optimization | Ranking em links azuis tradicionais | Posição, cliques, tráfego orgânico |
| **AEO** | Answer Engine Optimization | Ser a resposta direta citada (AI Overviews, featured snippets, voz) | Citações, share of answer, aparição em snippets |
| **GEO** | Generative Engine Optimization | Ser citado/recomendado por motores generativos (ChatGPT, Perplexity, Gemini, Copilot) | Citation rate, share of voice em LLMs, menções |

Na prática, AEO e GEO se sobrepõem muito. A convenção neste documento:
- **(AEO)** — ações focadas em ser a resposta direta extraível e em rich results de busca.
- **(GEO)** — ações focadas em ser citado dentro de respostas geradas por LLMs em múltiplas superfícies.
- **(GEO+AEO)** — ações que servem aos dois objetivos.

---

## 3. Metodologia de teste

Para que os resultados sirvam de prova no livro, cada ação deve seguir este protocolo:

1. **Registrar baseline** antes de implementar (print, número, data).
2. **Implementar** uma mudança isolada (ou um lote coeso) por vez.
3. **Datar** a implementação no [log](#log-de-implementação).
4. **Aguardar janela de medição** — mínimo 2 a 4 semanas para reindexação e re-citação.
5. **Medir o delta** com as mesmas métricas do baseline.
6. **Documentar** hipótese, ação, resultado e conclusão.

> Dica metodológica: nunca implemente 10 coisas no mesmo dia se quiser atribuir causa a efeito. Para o livro, lotes pequenos e datados geram narrativas de causa-efeito muito mais convincentes.

Defina um **conjunto fixo de queries de teste** (prompts) que você vai consultar repetidamente em cada plataforma. Exemplos para um site de empregos brasileiro:

- "melhores sites de emprego no Brasil"
- "como encontrar vagas de [cargo] em [cidade]"
- "sites de vaga de emprego confiáveis"
- "onde procurar emprego online no Brasil"
- "qual a média salarial de [cargo] no Brasil"

Consulte essas queries semanalmente no Google (AI Overview), ChatGPT, Perplexity e Gemini, e registre se/onde o empregoaqui.com.br aparece.

---

## Fase 0 — Baseline e instrumentação

> Sem baseline, não há prova. Esta fase é obrigatória antes de qualquer otimização.

- [x] **(GEO+AEO)** Configurar/verificar Google Search Console e exportar relatório de impressões, cliques e CTR atuais por página. → *Implementado em 2026-06-25. Ver `docs/livro-implementacao-geo-aeo-seo.md` § 0.1*
- [ ] **(GEO+AEO)** Configurar GA4 e criar um segmento/canal customizado para tráfego de IA (referrals de `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`).
- [ ] **(GEO+AEO)** Documentar o ranking atual das queries-alvo no Google (posição orgânica + presença em AI Overview).
- [ ] **(GEO)** Fazer a rodada-zero de testes manuais nas 4 plataformas com o conjunto fixo de queries e salvar os prints.
- [ ] **(GEO+AEO)** Registrar baseline de métricas de negócio: vagas indexadas no Google for Jobs, candidaturas/dia, páginas indexadas.

---

## Fase 1 — Fundação técnica e crawlability

> Se os crawlers (de busca e de IA) não conseguem ler o conteúdo, nada mais importa.

- [ ] **(GEO+AEO)** Garantir que o conteúdo principal (texto das vagas, descrições, respostas) seja renderizado em **HTML no servidor (SSR/SSG)** e não dependa de JavaScript no cliente para existir. Crawlers de IA frequentemente não executam JS.
- [ ] **(GEO)** Auditar o `robots.txt` para **não bloquear** bots de IA legítimos: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Claude-Web`, `Google-Extended`, `Applebot-Extended`, `CCBot`. (Decisão estratégica: bloquear bloqueia citação.)
- [ ] **(GEO)** Usar HTML5 semântico: `<header>`, `<main>`, `<article>`, `<section>`, `<nav>`, `<footer>`. Eliminar "div soup".
- [ ] **(GEO+AEO)** Garantir Core Web Vitals saudáveis: **LCP < 2,5s**, **CLS < 0,1**, **INP < 200ms**. Crawlers de IA penalizam páginas lentas e pesadas.
- [ ] **(GEO+AEO)** Manter sitemap XML atualizado e segmentado (um sitemap só para vagas, outro para conteúdo editorial).
- [ ] **(AEO)** Implementar a **Google Indexing API** especificamente para as páginas de vagas — para um site de empregos, é o método recomendado pelo Google e acelera muito a indexação de conteúdo time-sensitive.
- [ ] **(GEO+AEO)** Usar URLs canônicas corretas e evitar conteúdo duplicado (vagas que aparecem em múltiplas categorias).
- [ ] **(GEO+AEO)** Garantir HTTPS em todo o site, sem erros 404 em massa e sem cadeias longas de redirecionamento.
- [ ] **(GEO)** Auditar logs do servidor (ou Cloudflare Analytics) para confirmar quais AI crawlers já visitam o site e com que frequência — isso vira dado para o livro.
- [ ] **(GEO+AEO)** Implementar breadcrumbs navegáveis e com Schema `BreadcrumbList` (estrutura clara ajuda extração).

---

## Fase 2 — Dados estruturados (Schema)

> Para um site de empregos, esta é a fase de maior impacto imediato. Schema é "o megafone, não a fonte" — ele amplifica conteúdo que já existe na página.

### Schema essencial para site de empregos

- [ ] **(AEO)** Implementar **`JobPosting`** em JSON-LD em **cada página de vaga individual** (nunca em páginas de listagem/resultado de busca — isso viola a política do Google e pode gerar manual action).
- [ ] **(AEO)** Incluir as **5 propriedades obrigatórias** do JobPosting: `title`, `description` (HTML completo), `datePosted`, `hiringOrganization`, `jobLocation`.
- [ ] **(AEO)** Incluir propriedades recomendadas de alto valor: `validThrough` (data de expiração), `employmentType`, `baseSalary`, `jobLocationType` (`TELECOMMUTE` para remoto), `identifier`.
- [ ] **(AEO)** Garantir que **todo dado do schema também esteja visível na página** ao usuário (regra de ouro do Google: schema deve refletir o conteúdo visível, sem exceção).
- [ ] **(AEO)** Usar `title` com o nome exato do cargo que o candidato buscaria — sem prefixar com nome da empresa, código interno ou localização.
- [ ] **(AEO)** Adicionar `baseSalary` com `MonetaryAmount` (use `minValue`/`maxValue` quando faixa salarial) — salário visível melhora CTR e elegibilidade.
- [ ] **(AEO)** Remover a vaga (ou marcar expirada via `validThrough`) quando preenchida — vagas inativas com schema geram penalidade.
- [ ] **(AEO)** **[forward-looking]** Implementar as propriedades beta de skills-first hiring: `educationRequirements` e `experienceRequirements` (sinaliza alinhamento com a tendência de remover exigência de diploma; pode virar ranking signal).
- [ ] **(AEO)** **Atenção à depreciação:** o Google descontinuou o rich result de `Estimated Salary` (junho/2025). A salvaguarda é ter o salário **impecável dentro do `JobPosting`** e visível na página.

### Schema de suporte (todo o site)

- [ ] **(AEO+GEO)** Implementar `Organization` no site inteiro, com `name`, `logo`, `url`, e **`sameAs`** apontando para todos os perfis oficiais (LinkedIn, Instagram, Wikidata, Crunchbase).
- [ ] **(AEO)** Implementar `FAQPage` nas páginas que tenham seção de perguntas frequentes (ex.: "como funciona o empregoaqui", "como me candidatar").
- [ ] **(AEO)** Implementar `BreadcrumbList` em todas as páginas hierárquicas.
- [ ] **(AEO)** Implementar `Article` + `Person` (autor) no blog/conteúdo editorial, com o `Person` linkado a perfis externos via `sameAs` (sinal de E-E-A-T).
- [ ] **(GEO)** Empilhar schemas relevantes na mesma página quando fizer sentido (ex.: `Article` + `FAQPage` + `Organization`) — pesquisas de GEO recomendam "stacked JSON-LD".
- [ ] **(AEO)** Validar **todos** os schemas com o Google Rich Results Test e o Schema.org Validator antes de publicar e após qualquer mudança de template.
- [ ] **(AEO)** Monitorar o relatório de "Job postings" (Enhancements) no Search Console para erros e warnings.

---

## Fase 3 — Estrutura e formato do conteúdo

> Como o texto é escrito determina se a IA consegue extrair e citar. Vale para páginas editoriais, páginas de categoria e conteúdo informativo.

- [ ] **(GEO+AEO)** Escrever a **resposta principal nas primeiras 50–60 palavras** de cada página/artigo, antes de qualquer introdução. (Pesquisa da CXL: 55% das citações em AI Overview vêm do primeiro terço da página.)
- [ ] **(GEO+AEO)** Usar cabeçalhos **H2/H3 em formato de pergunta** ("Como encontrar vagas de TI em São Paulo?", "Quanto ganha um auxiliar administrativo?").
- [ ] **(GEO)** Aplicar a técnica **"Definition Lead"**: começar cada seção com uma frase-definição autossuficiente e curta, que a IA possa extrair isolada.
- [ ] **(GEO+AEO)** Criar blocos **"Quick Answer"**: respostas diretas de 1 a 3 frases logo abaixo de cada subtítulo.
- [ ] **(GEO)** Atingir **densidade de "answer nuggets"**: pelo menos 6 respostas diretas e autossuficientes a cada 1.000 palavras.
- [ ] **(AEO)** Adicionar seções de **FAQ com perguntas reais** ao fim das páginas-chave (e marcar com `FAQPage`).
- [ ] **(GEO+AEO)** Manter parágrafos curtos (até ~3 linhas), usar listas e usar tabelas para dados comparáveis (faixas salariais por cargo, por exemplo) — formatos que LLMs extraem com facilidade.
- [ ] **(GEO)** Adicionar **âncoras de fragmento** (`id` em headings, ex.: `#media-salarial-2026`) para que IAs possam citar trechos específicos da página.
- [ ] **(GEO)** Enriquecer com **estatísticas e dados com fonte citada** — é a alavanca de maior impacto comprovado (até +40% de visibilidade).
- [ ] **(GEO)** Incluir **3 a 5 citações de fontes externas reconhecidas** por artigo (IBGE, MTE, pesquisas salariais, etc.).
- [ ] **(GEO+AEO)** Escrever em **linguagem natural e conversacional**, espelhando como as pessoas perguntam por voz e em chat.
- [ ] **(GEO+AEO)** Otimizar mídia: `alt` text descritivo que declare a intenção da resposta; transcrição de vídeos; legendas estruturadas.
- [ ] **(GEO)** Definir entidades claramente: nomear, definir e relacionar conceitos ("empregoaqui.com.br → portal de vagas de emprego → conecta candidatos e empresas no Brasil").

---

## Fase 4 — Autoridade e entidades

> IAs precisam reconhecer o empregoaqui como uma entidade estável e confiável antes de citá-lo.

- [ ] **(AEO+GEO)** Criar uma **página canônica da entidade** ("Sobre"): nome oficial, logo, descrição curta, ano de fundação, fatos canônicos sobre o portal — uma fonte única para a IA citar.
- [ ] **(AEO+GEO)** Criar/verificar a presença em **Wikidata**, **Google Business Profile**, **Crunchbase** e **LinkedIn** com dados idênticos.
- [ ] **(AEO)** Garantir **consistência total de NAP** (nome, endereço, contato) em todos os perfis e no site.
- [ ] **(GEO+AEO)** Publicar **bios de autores** com credenciais verificáveis no conteúdo editorial (E-E-A-T), linkadas a perfis externos.
- [ ] **(GEO+AEO)** Buscar **menções da marca** em publicações reconhecidas do setor de RH/empregos (guest posts, entrevistas, citações em reportagens).
- [ ] **(GEO)** Construir **backlinks de domínios de alta autoridade** — ainda funciona como sinal de confiança para LLMs.
- [ ] **(GEO)** Publicar **pesquisa original e dados próprios** (ex.: "Relatório anual de vagas e salários no Brasil pelo empregoaqui") — conteúdo de dados único gera citações espontâneas e é altamente "linkável" por IAs. **Esta é provavelmente a ação de maior potencial para o seu caso.**
- [ ] **(GEO)** Fortalecer a **presença multicanal** (Reddit, LinkedIn, YouTube, fóruns de carreira) — LLMs treinam e recuperam dados dessas fontes.
- [ ] **(GEO)** **[experimental]** Monitorar como os LLMs descrevem a marca e enviar correções via os mecanismos de feedback das plataformas quando houver erro factual.

---

## Fase 5 — Estratégia de conteúdo

> O motor que alimenta tudo: produzir o conteúdo certo, na estrutura certa, de forma contínua.

- [ ] **(AEO+GEO)** Mapear **perguntas reais** do público com AnswerThePublic, AlsoAsked e o bloco "As pessoas também perguntam" do Google.
- [ ] **(GEO)** Construir **clusters de conteúdo**: página pilar (ex.: "Guia de carreira em [setor]") + artigos satélite interligados.
- [ ] **(GEO+AEO)** Priorizar **queries long-tail e conversacionais** — o formato dominante em busca por IA e voz.
- [ ] **(GEO+AEO)** Atualizar conteúdo a cada **~90 dias** para manter "freshness signals" — páginas desatualizadas perdem citações a uma taxa muito mais alta.
- [ ] **(GEO)** Adicionar sinais de **versão/histórico** ("Atualizado em [data]") no conteúdo editorial.
- [ ] **(GEO+AEO)** Criar **variantes por uso/local** das páginas (vagas por cidade, por cargo, por setor) com respostas atômicas em cada uma.
- [ ] **(GEO+AEO)** Criar **conteúdo de comparação** ("empregoaqui vs outros portais", "CLT vs PJ vs estágio") — formato que IAs adoram resumir.
- [ ] **(GEO)** Não confundir extensão com qualidade — cada frase deve ter propósito; conteúdo inchado prejudica a extração.

---

## Fase 6 — Camada AI-nativa

> Táticas de fronteira (2026). Marcadas como experimentais — testá-las e documentar é parte do valor do projeto-cobaia.

- [ ] **(GEO) [experimental]** Criar `/llms.txt` na raiz do domínio: um arquivo Markdown curado descrevendo o que o site é, com links para as páginas mais importantes. Adoção atual estimada em apenas 5–15% dos sites — janela de first-mover.
- [ ] **(GEO) [experimental]** Opcionalmente criar `/llms-full.txt` com o conteúdo completo das páginas-chave em Markdown, para ingestão em uma única requisição.
- [ ] **(GEO) [experimental]** **Não** gerar cópias Markdown indexáveis de cada página (cria conteúdo duplicado em escala e dilui o SEO, que continua sendo o sinal primário de credibilidade para as IAs).
- [ ] **(GEO) [experimental]** Inserir um "honeypot link" no `llms.txt` (uma URL que só um leitor automático seguiria) e monitorar acessos a ela para medir se os bots realmente leem o arquivo — gera dado mensurável para o livro.
- [ ] **(GEO)** Validar o `llms.txt`: UTF-8, sem HTML, sintaxe correta. Monitorar nos logs requisições a `/llms.txt` por user-agents de IA.
- [ ] **(GEO) [experimental]** Avaliar a estratégia de acesso de crawlers à luz da economia "pay-per-crawl" da Cloudflare (decisão de negócio: monetizar dados servidos a bots vs. maximizar citação).

---

## Fase 7 — Monitoramento e métricas

> O que não é medido não vira prova. Esta fase roda em loop contínuo.

- [ ] **(GEO+AEO)** Monitorar **citações da marca** no Google AI Overviews, ChatGPT, Perplexity e Gemini semanalmente, usando o conjunto fixo de queries.
- [ ] **(GEO+AEO)** Calcular **AI Share of Voice**: % de prompts relevantes em que o empregoaqui é citado entre os 3 primeiros.
- [ ] **(GEO)** Calcular **Citation Rate**: páginas citadas ÷ páginas monitoradas.
- [ ] **(GEO)** Calcular **Response Inclusion Rate**: prompts que mencionam a marca ÷ total de prompts testados.
- [ ] **(GEO+AEO)** Acompanhar **tráfego referenciado por IA** no GA4 (canal customizado criado na Fase 0).
- [ ] **(AEO)** Vigiar no Search Console páginas com **alta impressão e baixo clique** em queries de pergunta — sinal de que estão aparecendo em snippets/AI Overview.
- [ ] **(AEO)** Monitorar presença em **featured snippets** e "As pessoas também perguntam" (Semrush, Ahrefs).
- [ ] **(GEO+AEO)** Avaliar ferramentas de rastreamento de menções em LLMs (Profound, Otterly.ai, etc.) — registrar custo/benefício para o livro.
- [ ] **(GEO+AEO)** Acompanhar o **GEO Adoption Rate** interno: % de páginas que cumprem pelo menos 8 itens deste checklist (meta: ≥70%).
- [ ] **(AEO)** Acompanhar métricas específicas do Google for Jobs: vagas indexadas, impressões e cliques no relatório de Job postings.

---

## Apêndice A — Snippets prontos de Schema

> Estes são templates de referência. O Claude Code deve adaptá-los aos dados reais de cada página e **garantir que todo valor também apareça visível ao usuário**.

### A.1 — JobPosting (página de vaga individual)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "Auxiliar Administrativo",
  "description": "<p>Descrição completa em HTML: responsabilidades, requisitos, benefícios e como se candidatar.</p>",
  "identifier": {
    "@type": "PropertyValue",
    "name": "empregoaqui.com.br",
    "value": "VAGA-12345"
  },
  "datePosted": "2026-06-25",
  "validThrough": "2026-07-25T23:59",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Empresa Contratante Ltda",
    "sameAs": "https://www.empresacontratante.com.br",
    "logo": "https://www.empresacontratante.com.br/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Exemplo, 1000",
      "addressLocality": "Campinas",
      "addressRegion": "SP",
      "postalCode": "13000-000",
      "addressCountry": "BR"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "BRL",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 1800,
      "maxValue": 2400,
      "unitText": "MONTH"
    }
  }
}
</script>
```

Para vaga **remota**, adicione `"jobLocationType": "TELECOMMUTE"` e use `applicantLocationRequirements` no lugar (ou além) de `jobLocation`:

```json
"jobLocationType": "TELECOMMUTE",
"applicantLocationRequirements": {
  "@type": "Country",
  "name": "BR"
}
```

### A.2 — Organization (site inteiro)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EmpregoAqui",
  "url": "https://www.empregoaqui.com.br",
  "logo": "https://www.empregoaqui.com.br/logo.png",
  "description": "Portal brasileiro de vagas de emprego que conecta candidatos e empresas.",
  "sameAs": [
    "https://www.linkedin.com/company/empregoaqui",
    "https://www.instagram.com/empregoaqui",
    "https://www.wikidata.org/wiki/QXXXXXXX"
  ]
}
</script>
```

### A.3 — FAQPage

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Como me candidatar a uma vaga no EmpregoAqui?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Crie um perfil gratuito, busque a vaga desejada e clique em Candidatar-se. Seu currículo é enviado diretamente ao recrutador."
      }
    }
  ]
}
</script>
```

### A.4 — BreadcrumbList

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://www.empregoaqui.com.br" },
    { "@type": "ListItem", "position": 2, "name": "Vagas em São Paulo", "item": "https://www.empregoaqui.com.br/vagas/sp" },
    { "@type": "ListItem", "position": 3, "name": "Auxiliar Administrativo" }
  ]
}
</script>
```

---

## Apêndice B — Template de llms.txt

> Salvar como `/llms.txt` na raiz do domínio. UTF-8, Markdown puro, sem HTML.

```markdown
# EmpregoAqui

> EmpregoAqui (empregoaqui.com.br) é um portal brasileiro de vagas de emprego que
> conecta candidatos a oportunidades de trabalho e ajuda empresas a encontrar talentos
> em todo o Brasil. Cobre vagas CLT, PJ, estágio, temporárias e home office.

## Páginas principais

- [Sobre o EmpregoAqui](https://www.empregoaqui.com.br/sobre): história, missão e fatos canônicos sobre o portal.
- [Como funciona](https://www.empregoaqui.com.br/como-funciona): passo a passo para candidatos e empresas.
- [Buscar vagas](https://www.empregoaqui.com.br/vagas): busca de vagas por cargo, cidade e setor.
- [Para empresas](https://www.empregoaqui.com.br/empresas): como anunciar vagas.

## Conteúdo de referência

- [Guia de carreira](https://www.empregoaqui.com.br/blog): artigos sobre busca de emprego, currículo e entrevistas.
- [Relatório de salários](https://www.empregoaqui.com.br/salarios): dados de faixas salariais por cargo no Brasil.

## Optional

- [Central de ajuda](https://www.empregoaqui.com.br/ajuda)
- [Política de privacidade](https://www.empregoaqui.com.br/privacidade)
```

---

## Log de implementação

> O Claude Code deve atualizar esta tabela a cada ação implementada. É a matéria-prima do livro.

| Data | Fase | Ação implementada | Tipo | Baseline registrado? | Resultado medido (data + delta) | Observações |
|------|------|-------------------|------|----------------------|-------------------------------|-------------|
| | | | | | | |
| | | | | | | |
| | | | | | | |

---

### Resumo de contagem

- **Fase 0 — Baseline:** 5 ações
- **Fase 1 — Técnica:** 11 ações
- **Fase 2 — Schema:** 18 ações
- **Fase 3 — Conteúdo (formato):** 13 ações
- **Fase 4 — Autoridade:** 9 ações
- **Fase 5 — Conteúdo (estratégia):** 8 ações
- **Fase 6 — AI-nativa:** 6 ações
- **Fase 7 — Monitoramento:** 10 ações

**Total: 80 ações de implementação.**

---

*Documento gerado como guia operacional do projeto de estudo SEO vs GEO vs AEO. As táticas marcadas como [experimental] não têm comprovação estatística consolidada até o início de 2026 — testá-las e documentar os resultados é parte do objetivo do projeto-cobaia.*