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
5. Copie o valor do atributo `content` da meta tag exibida. Exemplo:
   ```
   oeOHclcLj3XHEl3bt5vhv3ZAGb0E3bV7o3rVAFIEz9I
   ```
6. Cole esse valor no `site-config.ts`:
   ```typescript
   verification: {
       googleSiteVerification: 'oeOHclcLj3XHEl3bt5vhv3ZAGb0E3bV7o3rVAFIEz9I',
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
| Páginas indexadas | — | — |
| Impressões totais (últimos 28 dias) | — | — |
| Cliques totais (últimos 28 dias) | — | — |
| CTR médio | — | — |
| Posição média | — | — |
| Sitemaps submetidos | — | — |

---

#### Status

- [ ] Domínio verificado no GSC
- [ ] Código preenchido em `site-config.ts`
- [ ] Deploy realizado
- [ ] Sitemap submetido
- [ ] Baseline exportado e registrado na tabela acima

---
