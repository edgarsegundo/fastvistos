# Spec de Produto — v1
## SaaS de Migração + Criação de Sites com Hospedagem e SEO/GEO/AEO

**Status:** v1 (MVP de lançamento) — revisão 4
**Stack de referência:** Astro (páginas estáticas) + hospedagem própria (VPS)
**ICP decidido (Perfil 1):** migração de sites locais existentes (ruins/desatualizados) + conversão de quem não tem site — profissionais liberais e pequenos negócios locais no Brasil (advogados, dentistas, contadores, consultores, comércio local), unidos pela mesma urgência: **precisam aparecer no Google e ser citados por ferramentas de IA (ChatGPT, Perplexity, AI Overviews), e hoje não conseguem.**
**Princípio central:** zero trabalho de design manual por cliente. Toda decisão de escopo abaixo resolve a favor desse princípio quando há conflito — o fundador não desenha sites, o sistema converte e monta.

---

## 1. Visão geral da arquitetura

O produto tem duas portas de entrada que convergem para a mesma arquitetura de saída:

- **Entrada A — Migração** (caminho principal de vendas): usuário já tem um site (ruim, antigo, lento) e quer modernizar mantendo o domínio.
- **Entrada B — Criação do zero** (caminho secundário): usuário não tem site nenhum.

As duas entradas alimentam o mesmo pipeline de saída, construído sobre três camadas:

1. **Templates** — pontos de partida completos por nicho (Advocacia, Odontologia, Contabilidade, etc.).
2. **Blocos componíveis** — catálogo finito e curado de seções (Header, Hero, Features, Depoimentos, Preço, FAQ, CTA, Footer, Blog Listing, Blog Post, Agendamento). Todo template é uma sequência pré-montada desses blocos.
3. **IA guiada** — preenche o conteúdo dentro dos blocos já definidos. Na Entrada A, a fonte de conteúdo é o site antigo (via Importador Inteligente, seção 4). Na Entrada B, a fonte é o questionário guiado (seção 6).

Em ambas as entradas, depois do preenchimento automático (IA ou Importador), o usuário sempre tem um **editor manual direto sobre os blocos** — no mesmo espírito do Mobirise e do Carrd: adicionar, remover, reordenar e editar o conteúdo de qualquer bloco por clique direto na página, sem precisar passar de novo pelo questionário ou pela IA. O preenchimento automático acelera o ponto de partida; o editor manual é sempre a camada final de ajuste, disponível em qualquer momento, nas duas entradas.

**Sobre fidelidade visual na migração:** o Importador não reconstrói o site antigo pixel a pixel — isso continua fora de alcance realista. Mas o objetivo é ir além de só recriar o conteúdo dentro de um template genérico: o sistema tenta ativamente encontrar, para cada seção do site antigo, a correspondência mais próxima dentro do catálogo de blocos e variações do produto (tipo de bloco, posição de imagem, número de colunas, cores, fontes), de forma que o site novo fique o mais visualmente parecido possível com o original, mas já no padrão técnico novo (Astro, otimizado, semântico, pronto para SEO/GEO/AEO). O que o sistema não conseguir corresponder automaticamente com confiança cai para revisão humana finalizar dentro do próprio editor manual — nunca é descartado, nunca é publicado sem chance de ajuste.

### 1.1 Referência de mercado: Mobirise AI vs. Carrd

Comparação que embasou as decisões de escopo acima — por que o produto
segue a filosofia do Carrd (catálogo pequeno, zero canvas livre, edição
inline) e não a do Mobirise (catálogo grande, customização profunda por
bloco), mesmo usando IA de forma parecida com o Mobirise:

| Dimensão | Mobirise AI | Carrd | Este produto |
|---|---|---|---|
| Modelo de página | Multi-página, blocos por coluna | One-page (scroll único) | Multi-página, blocos empilhados verticalmente |
| Catálogo de blocos | Muito grande, com extensões pagas | Muito pequeno e curado (~15 tipos) | Pequeno e fechado (12 blocos, seção 2) |
| Liberdade de posicionamento | Semi-livre (arrasta blocos, ajusta colunas) | Zero | Zero — reordena blocos, escolhe entre variações do catálogo (seção 4.6) |
| Edição do conteúdo | Formulário/painel lateral por bloco | Clique direto no elemento (inline) | Clique direto no elemento (inline) — seção 1 e 5 |
| Customização visual | Profunda por bloco | Rasa e global | Global por site (tema, seção 3.3), nunca por bloco |
| IA | Gera site inteiro, decide estrutura | Não tem | Preenche blocos já definidos, via questionário (Entrada B) ou Importador Inteligente (Entrada A) — nunca decide estrutura |
| Importar de site existente | Não existe | Não existe | Importador Inteligente (seção 4) — diferencial sem equivalente nos dois |
| Escape hatch de código | Sim | Sim | Code Embed sandboxed (seção 7) |
| Público real | Agências/freelancers | Landing pages pessoais simples | Pequeno negócio local sem conhecimento técnico, migrando de site ruim |

**Leitura:** o produto é filosoficamente muito mais próximo do Carrd em
quase toda dimensão — inclusive no padrão de edição inline, não formulário
lateral. O único traço herdado do Mobirise é a geração de conteúdo por IA,
de forma restrita (preenche, não estrutura), com uma segunda fonte de
entrada que nenhum dos dois concorrentes tem: extração automática de site
existente.

---

## 2. Catálogo de Blocos

*(inalterado da revisão anterior — ver histórico)*

Blocos do v1: Header/Nav, Hero, Sobre/Apresentação, Features/Cards de serviço, Prova social/Depoimentos, Preço/Planos, Agendamento/Contato, FAQ, CTA final, Footer, Blog Listing, Blog Post. Cada bloco é um componente Astro pré-otimizado (semântica HTML correta, lazy loading, responsivo, acessível) com schema de campos editáveis. Header/Footer/Nav são configuração de nível de **Site**, não instância duplicada por página.

---

## 3. Sistema de Templates

*(inalterado da revisão anterior)*

Templates oficiais por nicho + "Salvar site como template" privado (reuso dentro da própria conta, com anonimização automática de dados pessoais antes de salvar).

---

## 4. Importador Inteligente (motor da Entrada A — migração): conteúdo, identidade visual e correspondência de layout

### 4.1 Objetivo
Extrair o máximo possível de um site existente do cliente — conteúdo (copy, imagens, estrutura de seções), identidade visual (cores, fontes, logo) e padrão de layout (posição de imagem, número de colunas, estilo de cards, etc.) — e reconstituir tudo isso automaticamente dentro do catálogo de blocos e variações do v1, buscando a maior semelhança visual possível com o site original, já no padrão técnico novo. Isso elimina o trabalho de design manual por cliente: o fundador nunca desenha nada do zero; o sistema tenta corresponder o máximo automaticamente, e o que não conseguir cai para revisão humana finalizar dentro do editor manual (seção 1).

### 4.2 Pipeline técnico

1. **Captura da página renderizada.** Navegador headless (ex: Playwright) carrega a URL informada pelo usuário e captura o HTML final já renderizado — funciona mesmo em sites que montam conteúdo via JavaScript, sem exigir entender esse JS.
2. **Segmentação por marcadores estruturais.** O HTML capturado é cortado em blocos de conteúdo usando headings (`h1`–`h3`) e elementos estruturais (`section`, `header`, `footer`, `nav`) como pontos de corte — convenção forte o suficiente mesmo em HTML malformado, sem depender de interpretar CSS/posicionamento.
3. **Classificação por IA.** Cada segmento extraído é enviado ao mesmo pipeline de IA da seção 6, mas com uma instrução diferente: "classifique este trecho como Hero / Sobre / Serviços / Depoimentos / Contato / Rodapé / Outro, e preencha os campos do bloco correspondente." Reaproveita a mesma infraestrutura de IA já prevista para o preenchimento guiado — muda só a fonte de entrada.
4. **Extração de imagens.** Toda imagem (`<img src>`) dentro de um segmento é capturada junto com ele e associada ao bloco correspondente, para reuso direto (com confirmação do usuário antes de publicar).
5. **Fallback de baixa confiança → revisão humana.** Todo segmento que a IA não conseguir classificar com confiança suficiente cai numa fila de "não identificamos automaticamente, revise aqui" dentro do próprio fluxo de edição — nunca é descartado silenciosamente nem publicado sem revisão. Mantém o princípio geral do produto: IA sugere, humano confirma antes de publicar.

### 4.3 Fontes de dados complementares
- **Google Meu Negócio / Google Business Profile**, quando disponível: nome, endereço, telefone, horário, categoria e descrição já estruturados — fonte mais confiável que raspar HTML solto, e diretamente relevante para AEO (uma das fontes mais citadas por buscadores de IA para confiar num negócio local).
- **Colar conteúdo manualmente**, sempre disponível como alternativa/complemento quando a extração automática falhar ou for parcial.
- **Sitemap.xml antigo** (quando existir), usado para o mapeamento de redirecionamentos (seção 4.4).

### 4.4 Preservação de SEO existente
- O domínio do cliente é **mantido** (apontado para o novo servidor) — não há troca de domínio, o que evita o risco grave de perda de autoridade.
- URLs importantes do site antigo (extraídas do sitemap ou informadas pelo usuário) são mapeadas para as URLs novas equivalentes; onde a estrutura de caminho não puder ser preservada, o sistema gera automaticamente redirecionamentos 301 antes da publicação.

### 4.5 Extração de identidade visual (cores, fontes, logo)

Cor e tipografia são valores isolados, não relações espaciais — extraíveis com confiabilidade razoável e mapeáveis direto para o sistema de tema já previsto (seção 3.3):

1. **Cores computadas via navegador headless.** Leitura de `getComputedStyle()` dos elementos principais do site de origem (cor de fundo do header, cor de botões de CTA, cor de texto).
2. **Paleta dominante extraída da logo/imagens principais**, via algoritmo de cor dominante (ex: k-means) — mais confiável que o CSS quando o site de origem está inconsistente.
3. **Fonte usada**, via `font-family` computado, mapeada para a fonte mais próxima disponível no catálogo de fontes pré-aprovadas do sistema (catálogo a ser expandido ao longo do tempo para aumentar taxa de match).
4. **Aplicação com o mesmo modelo de confiança do conteúdo (4.2.5):** extração limpa e consistente → auto-aplica no tema do site; extração ruidosa/inconsistente (comum em sites antigos remendados) → cai para escolha manual, com as cores/fontes extraídas aparecendo como sugestões pré-preenchidas em vez de escolha do zero.

### 4.6 Correspondência de padrão de layout

Além de classificar *o que* cada seção do site antigo é (Hero, Features, Depoimentos, etc. — seção 4.2.3), o Importador tenta identificar *como* ela está montada visualmente, para escolher a variação do catálogo mais parecida, em vez de sempre cair na variação padrão:

1. **Sinais de layout extraídos do DOM renderizado**, via propriedades computadas: posição da imagem em relação ao texto (esquerda/direita/fundo/ausente), direção de flex/grid, número de colunas (contagem de itens irmãos com estrutura repetida — cards, colunas de preço, etc.), presença de carrossel vs. lista estática, quantidade de itens visíveis por seção.
2. **Correspondência contra o catálogo de variações.** Cada bloco do catálogo (seção 2) tem um conjunto finito de variações pré-construídas e otimizadas; o sistema seleciona a variação cujo padrão estrutural mais se aproxima dos sinais extraídos do site original.
3. **Modelo de confiança igual ao resto do pipeline:** sinais claros e consistentes → seleciona a variação automaticamente; sinais ambíguos ou conflitantes → aplica a variação padrão do template e sinaliza o bloco para revisão humana escolher manualmente entre as variações disponíveis.
4. **O que isso não é:** o sistema nunca gera uma variação nova, arbitrária, fora do catálogo — a correspondência sempre escolhe entre opções já construídas, testadas e otimizadas para performance/SEO. É isso que permite tentar o máximo de fidelidade visual sem abrir mão da garantia técnica que sustenta a promessa de SEO/GEO/AEO. Reconstrução pixel-perfect (espaçamento exato, animações, CSS arbitrário do site de origem) continua fora de alcance realista — o ganho de fidelidade visual vem de ampliar e refinar o catálogo de variações ao longo do tempo (item de roadmap contínuo), não de tentar reproduzir qualquer CSS livremente.

### 4.7 Limites realistas remanescentes
- Reconstrução pixel-perfect (espaçamento exato, animações customizadas, CSS arbitrário do site de origem) não é objetivo do v1 — o esforço vai para ampliar o catálogo de variações, não para replicar CSS livre.
- Sites com estrutura muito fora do padrão comum de negócio local tendem a gerar mais itens na fila de revisão humana — não é um erro do sistema, é o funcionamento esperado do modelo de confiança (4.2.5).

---

## 5. Fluxo de criação/migração de site (jornada do usuário)

1. **Ponto de entrada:** "Já tenho um site" (Entrada A → Importador Inteligente, seção 4) ou "Não tenho site" (Entrada B → questionário, seção 6).
2. **Escolha de nicho/template** — mesmo catálogo em ambos os casos.
3. **Preenchimento automático** — via Importador (Entrada A) ou via questionário guiado por IA (Entrada B).
4. **Revisão da fila de baixa confiança** (Entrada A) — usuário confirma/edita os segmentos, variações de layout e cores/fontes que o Importador não conseguiu corresponder com certeza.
5. **Editor manual direto sobre os blocos** (Mobirise/Carrd-style, disponível nas duas entradas) — ajustar textos, imagens, trocar variação de um bloco, reordenar/remover/adicionar blocos, tema. Sempre disponível, a qualquer momento, não só logo após o preenchimento automático.
6. **Preview responsivo.**
7. **Publicação** — build Astro, deploy, DNS apontado para o domínio existente do cliente (Entrada A) ou subdomínio novo (Entrada B).

**Meta de produto:** do início à publicação, ≤ 15 minutos mesmo na Entrada A (migração), descontado o tempo de revisão humana de itens de baixa confiança.

---

## 6. Camada de IA — preenchimento guiado

*(inalterado da revisão anterior, com uma adição)*

Além do questionário guiado (Entrada B), esta camada agora também recebe segmentos extraídos pelo Importador Inteligente (Entrada A, seção 4.2.3) como fonte de entrada — mesmo schema de saída por bloco (JSON estruturado, nunca HTML livre), mesmo botão de "gerar novamente" por bloco individual.

---

## 7. Bloco de Código Customizado (Code Embed) — Privado, v1

*(inalterado da revisão anterior — ver histórico: 100% privado, sandboxed, sem marketplace)*

**Nota de risco técnico a resolver antes da implementação:** o mecanismo de
iframe sandboxed já existe hoje em produção para `content_format = html_custom`
(`multi-sites/sites/_saas/pages/[project]/[...slug].astro`), usando
`sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`. A
combinação `allow-scripts` + `allow-same-origin` juntos neutraliza parte do
isolamento do sandbox (o iframe pode acessar o DOM/origin do documento pai).
Se o Code Embed reaproveitar esse mecanismo como base, essa configuração
precisa ser revista — não deve ser herdada como está.

---

## 8. Publicação e hospedagem

*(inalterado, com um acréscimo)*

Validação pré-publicação agora inclui checagem de redirecionamentos 301 mapeados (seção 4.4) antes de liberar a troca de DNS do domínio do cliente.

---

## 9. Requisitos não-funcionais

*(inalterado da revisão anterior — Core Web Vitals, SEO, AEO/GEO, acessibilidade, LGPD, segurança multi-tenant)*

---

## 10. Explicitamente fora de escopo do v1

- Canvas livre / posicionamento pixel-perfect por arrasto de elemento — edição continua sendo por blocos e variações do catálogo (seção 4.6), mesmo quando o objetivo é máxima fidelidade visual ao site de origem.
- Reconstrução pixel-perfect de sites migrados (espaçamento exato, animações, CSS arbitrário do site de origem) — o esforço de fidelidade visual vem de correspondência de layout dentro do catálogo (seção 4.6) e da ampliação contínua desse catálogo, não de reprodução livre de CSS.
- Marketplace público de templates ou de Code Embeds.
- Geração de imagem via IA.
- Chat de IA livre para geração de estrutura de página.
- Customização de tema por bloco individual (tema é sempre de nível de Site, seção 3.3).
- Garantia de suporte perfeito a qualquer estrutura de site de origem no Importador — casos muito fora do padrão comum de negócio local geram mais itens na fila de revisão humana, por desenho (seção 4.7), não por falha a corrigir caso a caso.

---

## 11. Modelo de dados (visão de alto nível, atualizado)

Entidades da revisão anterior (User, Site, Page, BlockDefinition, BlockInstance, CodeEmbedBlock, Template, AIGenerationRequest) **+ novas**:

- **ImportSession** (pertence a Site; URL de origem, status, timestamp)
- **ExtractedSegment** (pertence a ImportSession; HTML bruto do segmento, imagens associadas, classificação de tipo de bloco sugerida pela IA, **variação de layout sugerida + sinais de layout detectados (posição de imagem, nº de colunas, etc.) + score de confiança de layout**, status: auto-aceito / pendente-revisão / rejeitado)
- **RedirectMap** (pertence a Site; URL antiga → URL nova, gerado a partir do sitemap antigo ou input manual)
- **ExtractedTheme** (pertence a ImportSession; cores computadas, paleta dominante da logo, fonte detectada, score de confiança, status: auto-aplicado / sugestão-pendente)
- **BlockVariant** (pertence a BlockDefinition; cada variação pré-construída de um bloco carrega metadados estruturais próprios — posição de imagem, nº de colunas, etc. — usados como alvo de correspondência pelo Importador, seção 4.6)

---

## 12. Métricas de sucesso do v1

- Tempo médio do início à publicação, separado por Entrada A (migração) e Entrada B (criação do zero).
- **Taxa de auto-classificação do Importador** (% de segmentos extraídos que a IA classifica com confiança suficiente, sem cair em revisão humana) — métrica central para saber se o pipeline da seção 4 está valendo o investimento de engenharia.
- **Taxa de correspondência automática de layout/tema** (% de segmentos onde a variação de bloco e/ou cor/fonte foi selecionada automaticamente com confiança, sem precisar de escolha manual) — mede diretamente se o esforço de fidelidade visual (seção 4.6) está funcionando na prática.
- % de sites publicados sem alertas de performance/SEO pendentes.
- % de sites migrados que mantêm ou melhoram posição de busca existente após 60-90 dias (proxy direto da promessa de venda).
- % de usuários que usam "Salvar como modelo" em pelo menos um site.
- % de sites que usam ao menos um Code Embed.
- Core Web Vitals médio dos sites publicados.

---

## 13. Ordem de construção sugerida (dentro do v1)

1. Catálogo de blocos (seção 2) + pipeline de build Astro + publicação básica.
2. Templates oficiais (seção 3) sobre o catálogo já pronto.
3. Camada de IA de preenchimento a partir de questionário (seção 6, Entrada B) — mais simples, valida o pipeline de IA antes de complicar com extração.
4. **Importador Inteligente (seção 4, Entrada A)** — captura headless + segmentação + classificação de conteúdo + extração de tema (cor/fonte/logo) + correspondência de variação de layout + fallback de revisão humana. Prioridade alta, dado que é o motor do ICP decidido, mas construído depois do 3 porque reaproveita a mesma infraestrutura de IA já validada. Dentro desse item, começar pela classificação de conteúdo (mais simples) antes de acoplar a correspondência de layout/tema (mais sinais, mais superfície de erro).
5. Preservação de SEO / redirecionamentos 301 (seção 4.4).
6. "Salvar como template" privado (seção 3).
7. Bloco de Código Customizado privado + guardrails (seção 7) — último, maior risco técnico/segurança, menor dependência do ICP principal.

---

## 14. Decisão técnica em aberto: mecânica do editor manual

O editor manual direto sobre os blocos (seção 1, "clique direto na página")
ainda não tem stack de implementação decidido. Registrado aqui pra retomar
antes de começar a construir essa parte (não bloqueia os itens 1-3 da ordem
de construção, seção 13, que não dependem disso).

A exigência de edição **inline sobre a página renderizada** (não um
formulário de admin separado) pesa a favor de opções com mais JS no
front-end e contra uma solução baseada só em Django Admin/Unfold
tradicional, que não foi desenhado pra edição inline sobre HTML renderizado.

| Alternativa | Prós | Contras |
|---|---|---|
| Django Admin/Unfold + JS pontual (Alpine/vanilla) | Zero stack novo; consistente com o resto do `vitrine/` | Edição inline é bem mais trabalhosa de montar à mão nesse modelo |
| React + Puck como ilha no admin | Puck já é block-based, sem canvas livre — filosoficamente alinhado | Introduz React pela primeira vez no admin |
| Vue como ilha no admin | Aproveita stack já familiar (outro projeto do autor usa Vue) | Não existe "Puck para Vue" pronto — componente de edição inline seria construído do zero |

Decisão adiada para quando a implementação dessa camada for de fato
desenhada.

---

*Documento complementar ao relatório de pesquisa de mercado (`pesquisa-mercado-saas-landing-pages.md`). Revisão 3: Importador Inteligente passa a tentar correspondência de layout (não só conteúdo e tema) dentro do catálogo de variações, buscando o máximo de fidelidade visual possível com o site original; editor manual estilo Mobirise/Carrd explicitado como camada sempre disponível nas duas entradas. Revisão 4: incorpora a comparação de mercado Mobirise/Carrd (seção 1.1), a decisão técnica em aberto sobre a mecânica do editor manual (seção 14) e a nota de risco do sandbox reaproveitado pelo Code Embed (seção 7) — consolidadas a partir de uma sessão de discussão paralela que comparou este documento com um plano de editor WYSIWYG independente.*