# Implementação GEO + AEO + SEO — Diário de Bordo do Projeto-Cobaia

> **O que é este documento:** registro cronológico e fiel de tudo que foi implementado
> no `empregoaqui.com.br` como caso real para o livro sobre SEO vs GEO vs AEO.
>
> **Formato de cada entrada:** contexto → o que existia → o que foi feito → como validar → resultado medido (preenchido depois).

---

## Índice

- [Fase 0 — Baseline e instrumentação](#fase-0--baseline-e-instrumentação)
- [Fase 1 — Fundação técnica e crawlability](#fase-1--fundação-técnica-e-crawlability)
- [Fase 2 — Dados estruturados (Schema)](#fase-2--dados-estruturados-schema)
- [Fase 3 — Estrutura e formato do conteúdo](#fase-3--estrutura-e-formato-do-conteúdo)
- [Fase 4 — Autoridade e entidades](#fase-4--autoridade-e-entidades)
- [Fase 5 — Estratégia de conteúdo](#fase-5--estratégia-de-conteúdo)
- [Fase 6 — Camada AI-nativa](#fase-6--camada-ai-nativa)
- [Fase 7 — Monitoramento e métricas](#fase-7--monitoramento-e-métricas)

---

## Fase 0 — Baseline e instrumentação

> Antes de qualquer otimização, é preciso saber onde se está. Sem baseline, não há prova de causa e efeito — e sem prova, não há livro.

---

### 0.1 — Google Search Console: verificação e configuração

**Data de implementação:** 2026-06-25

**Tipo:** GEO+AEO

---

#### O que é e por que é o primeiro passo

O Google Search Console (GSC) é o painel de controle que o Google oferece gratuitamente para donos de sites. Ele é a única fonte de dados diretos do Google sobre o seu site: quais páginas estão indexadas, quais queries geram impressões, qual é o CTR médio, quais erros de cobertura existem.

Para o SEO tradicional, o GSC é obrigatório. Para GEO e AEO, ele é igualmente essencial porque é onde você vê:
- Se as suas páginas aparecem em AI Overviews (relatório de "pesquisa Google" com filtro de tipo de resultado)
- Se os dados estruturados (Schema) foram reconhecidos e estão gerando rich results
- Se há erros que impedem páginas específicas de serem indexadas e, portanto, citadas

**Resumindo:** sem GSC verificado, você está operando no escuro.

---

#### O que verificamos no código

A plataforma `empregoaqui.com.br` usa Astro com um sistema de multi-sites. A verificação do GSC é configurada em um campo específico do arquivo `site-config.ts`:

```typescript
// multi-sites/sites/emprego/site-config.ts
verification: {
    googleSiteVerification: '', // ← estava vazio
},
```

O componente `HeadBasics.astro` (no core) consome esse valor e, quando preenchido, injeta automaticamente a meta tag de verificação no `<head>` de todas as páginas:

```html
<!-- Renderizado automaticamente quando o campo está preenchido -->
<meta name="google-site-verification" content="SEU_CODIGO_AQUI" />
```

A lógica no componente verifica se o valor está preenchido antes de renderizar — então deixar em branco simplesmente suprime a tag, sem erros.

**Status encontrado:** campo `googleSiteVerification` vazio → verificação do GSC **não realizada**.

---

#### Como verificar o domínio no Google Search Console (passo a passo)

**Método recomendado: Tag HTML** (mais simples para sites com acesso ao código-fonte)

1. Acesse [search.google.com/search-console](https://search.google.com/search-console)
2. Clique em **"Adicionar propriedade"**
3. Escolha **"Prefixo de URL"** (não "Domínio") e digite `https://empregoaqui.com.br/`
4. Escolha o método **"Tag HTML"**
5. Copie o valor do atributo `content` da meta tag exibida:
   ```html
   <meta name="google-site-verification" content="4mijW5761WZ6vWOjZQUEWgweTpAfpAzSNAjfZLSXyxk" />
   ```
   → Copie apenas o valor dentro de `content="..."`, não a tag inteira.

6. Cole esse valor no `site-config.ts`:
   ```typescript
   verification: {
       googleSiteVerification: '4mijW5761WZ6vWOjZQUEWgweTpAfpAzSNAjfZLSXyxk',
   },
   ```
7. Faça o deploy do site
8. Volte ao GSC e clique em **"Verificar"**

> **Alternativa sem redeploy:** usar o método de **registro DNS** (adicionar um TXT record no provedor de DNS). Tem a vantagem de não depender do código do site — útil quando há demora entre commit e deploy.

---

#### Como o código implementa a tag

O componente `HeadBasics.astro` em `multi-sites/core/components/HeadBasics.astro` contém:

```astro
{
  siteConfig.verification?.googleSiteVerification &&
  siteConfig.verification.googleSiteVerification.trim() !== '' && (
    <meta
      name="google-site-verification"
      content={siteConfig.verification.googleSiteVerification}
    />
  )
}
```

Esse componente é incluído automaticamente em todos os layouts do site. Ou seja: preencher o campo no `site-config.ts` + fazer deploy = verificação ativa em todas as páginas.

---

#### O que configurar depois de verificar

Assim que a verificação for confirmada, configure dentro do GSC:

1. **Sitemap:** vá em *Sitemaps* e submeta `https://empregoaqui.com.br/sitemap-index.xml` (já está declarado no `robots.txt`)
2. **Relatório de cobertura:** veja quais páginas estão indexadas e se há erros
3. **Relatório de desempenho:** exporte as impressões, cliques, CTR e posição média por página — esse é o baseline do projeto

---

#### Baseline a registrar (preencher após verificação)

| Métrica | Valor | Data |
|---------|-------|------|
| Páginas indexadas | ⚠️ a verificar | 2026-06-25 |
| Páginas não indexadas | ⚠️ a verificar | 2026-06-25 |
| Impressões totais (últimos 28 dias) | — | — |
| Cliques totais (últimos 28 dias) | — | — |
| CTR médio | — | — |
| Posição média | — | — |
| Sitemaps submetidos | — | — |

---

#### Status

- [x] Domínio verificado no GSC — método: Tag HTML — data: 2026-06-25
- [x] Código preenchido em `site-config.ts` — valor: `4mijW5761WZ6vWOjZQUEWgweTpAfpAzSNAjfZLSXyxk`
- [x] Deploy realizado
- [ ] Sitemap submetido ← próximo passo manual no GSC
- [ ] Baseline de indexação a verificar ← revisar no GSC após 48h do primeiro deploy

---

### 0.2 — GA4 + GTM + Canal de tráfego de IA

**Data de implementação:** 2026-06-25

**Tipo:** GEO+AEO

---

#### O que é e por que é o segundo passo

O Google Analytics 4 (GA4) é a plataforma de análise de tráfego do Google. Sem ele, você sabe que o site existe no Google (via GSC), mas não sabe quem visita, de onde vem, quanto tempo fica, nem o que faz.

Para o projeto GEO/AEO, o GA4 tem uma função extra: isolar o tráfego vindo de ferramentas de IA. Por padrão, uma visita vinda do ChatGPT entra no GA4 como "Referral" genérico, misturada com qualquer outro site. Sem um canal customizado, é impossível medir se o GEO está funcionando.

O **Google Tag Manager (GTM)** é o intermediário: em vez de colar o código do GA4 diretamente no HTML do site, o GTM gerencia todos os scripts de rastreamento em um único lugar, sem precisar de deploy a cada mudança.

---

#### O que foi criado

| Ferramenta | ID | Data |
|------------|-----|------|
| GTM — container `empregoaqui.com.br` | `GTM-TDVVKHKB` | 2026-06-25 |
| GA4 — propriedade `empregoaqui.com.br` | `G-FKRY70CH06` | 2026-06-25 |
| GA4 — stream Web | `15153376892` | 2026-06-25 |

---

#### Como foi configurado

**Ordem correta de criação:** GTM primeiro, GA4 depois, tag GA4 dentro do GTM por último.

1. Criou-se o container GTM → ID `GTM-TDVVKHKB`
2. O ID foi atualizado no `site-config.ts` (campo `analytics.gtmId`) e o site foi redeploy-ado — os componentes `AnalyticsHead.astro` e `AnalyticsBody.astro` injetam automaticamente os dois snippets do GTM no `<head>` e no `<body>`
3. Criou-se a propriedade GA4 com fuso horário de Brasília e moeda BRL
4. Objetivos de negócio selecionados: **Gerar leads** + **Entender o tráfego da Web**
5. Criou-se a tag **"GA4 - Configuração"** no GTM:
   - Tipo: `Tag do Google`
   - ID da tag: `G-FKRY70CH06`
   - Acionador: `Initialization - All Pages`
6. Container publicado como versão `v1 - GA4 Configuração inicial`

---

#### Canal customizado de tráfego de IA

No GA4 → Admin → Data display → Channel groups → **"AI Traffic"** criado em 2026-06-25 com os seguintes canais:

| Canal | Condição |
|-------|----------|
| ChatGPT | Session source contains `chatgpt.com` |
| Perplexity | Session source contains `perplexity.ai` |
| Gemini | Session source contains `gemini.google.com` |
| Copilot | Session source contains `copilot.microsoft.com` |
| Claude | Session source contains `claude.ai` |

Para usar: em qualquer relatório do GA4, troque o "Default Channel Group" para "AI Traffic" no seletor de dimensões secundárias.

---

#### Por que esse canal é estratégico para o livro

Sem segmentação, o tráfego de IA fica invisível. Com o canal "AI Traffic", é possível:
- Medir quantas sessões vieram de cada plataforma de IA por mês
- Comparar o comportamento do usuário de IA vs. orgânico (tempo na página, taxa de rejeição, conversão)
- Calcular o **Response Inclusion Rate** — quantas visitas de IA chegam em relação ao total de queries testadas

Este é o mecanismo de medição que torna o projeto-cobaia um experimento científico e não apenas uma opinião.

---

#### Status

- [x] GTM criado (`GTM-TDVVKHKB`) e configurado no `site-config.ts`
- [x] GA4 criado (`G-FKRY70CH06`) com fuso e moeda corretos
- [x] Tag GA4 configurada no GTM e container publicado (v1)
- [x] Site redeploy-ado com novo GTM ID
- [x] Canal "AI Traffic" criado no GA4 com 5 fontes de IA
- [ ] Aguardando primeiras sessões aparecerem no GA4 (até 24h)

---

### 0.3 — Ranking atual das queries-alvo (baseline)

**Data de implementação:** 2026-06-25

**Tipo:** GEO+AEO

---

#### O que é e por que fazer antes de otimizar

Queries de teste são as perguntas que representam a intenção do usuário-alvo. Defini-las antes de qualquer otimização é obrigatório: sem o "antes", não há como provar que as otimizações funcionaram.

O conjunto de queries abaixo foi definido com base no posicionamento real do empregoaqui — **não é um portal de vagas tradicional**, mas uma plataforma de conexão direta entre pequenos empresários e candidatos disponíveis. Por isso as queries refletem a dor do empresário que quer contratar rápido, não do candidato que busca vaga.

---

#### Conjunto fixo de queries do projeto

| # | Query | Intenção |
|---|-------|----------|
| 1 | `como contratar funcionário rápido` | Intenção principal do usuário |
| 2 | `site para contratar funcionário rápido` | Busca direta pelo produto |
| 3 | `como contratar sem publicar vaga` | Diferencial do negócio |
| 4 | `candidatos disponíveis para trabalhar agora` | Proposta de valor central |
| 5 | `como pequeno empresário contratar funcionário` | Público-alvo explícito |
| 6 | `aplicativo para contratar funcionário` | Busca mobile comum |

---

#### Como testar

| Plataforma | Como abrir | Por quê |
|------------|------------|---------|
| **Google** | Aba anônima | Evita personalização por histórico de buscas |
| **ChatGPT** | Nova conversa | Evita herdar contexto de chats anteriores |
| **Perplexity** | Nova busca | Mesma lógica |
| **Gemini** | Nova conversa | Mesma lógica |

Para cada query, anote:
- **Google:** posição do empregoaqui.com.br nos resultados orgânicos (ou "não aparece") + se há AI Overview e se cita o empregoaqui
- **ChatGPT / Perplexity / Gemini:** se o empregoaqui é citado na resposta (sim/não) e em qual contexto

---

#### Baseline — resultados do teste inicial (preencher)

**Data do teste:** 2026-06-25

| Query | Google (posição) | AI Overview | ChatGPT | Perplexity | Gemini |
|-------|-----------------|-------------|---------|------------|--------|
| como contratar funcionário rápido | não aparece | não aparece | não aparece | não aparece | não aparece |
| site para contratar funcionário rápido | não aparece | não aparece | não aparece | não aparece | não aparece |
| como contratar sem publicar vaga | não aparece | não aparece | não aparece | não aparece | não aparece |
| candidatos disponíveis para trabalhar agora | não aparece | não aparece | não aparece | não aparece | não aparece |
| como pequeno empresário contratar funcionário | não aparece | não aparece | não aparece | não aparece | não aparece |
| aplicativo para contratar funcionário | não aparece | não aparece | não aparece | não aparece | não aparece |

> **Nota:** teste realizado no Google em aba anônima em 2026-06-25, antes de qualquer otimização de GEO/AEO. Site recém-configurado — indexação ainda em progresso (116 páginas indexadas de 321 totais). Este é o ponto zero do experimento.

---

#### Status

- [x] Queries definidas
- [x] Teste realizado no Google (aba anônima) — resultado: não aparece em nenhuma query
- [x] Teste realizado no ChatGPT — resultado: não aparece em nenhuma query
- [x] Teste realizado no Perplexity — resultado: não aparece em nenhuma query
- [x] Teste realizado no Gemini — resultado: não aparece em nenhuma query
- [x] Tabela de baseline preenchida

---
