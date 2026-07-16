# Tutorial: Rastreamento de Cliques no WhatsApp (CTA Inline + CTA Fixo Flutuante) via GTM → GA4

fastvistos: https://claude.ai/chat/e6d64588-bd7d-452d-b262-e5a40830ff54 (claude)

**Projeto:** fastvistos.com.br
**Contexto:** páginas de blog (artigos), duas versões de CTA de WhatsApp
**Objetivo:** medir separadamente quantas pessoas clicam no CTA dentro do artigo (inline) vs. no botão fixo flutuante, e marcar isso como evento-chave (conversão) no GA4.

---

## 1. Propósito / Por que isso foi feito

O relatório do GA4 (Páginas e Telas) mostrava que **100% dos eventos-chave** vinham da home, e **0% do blog**, mesmo com os posts de blog somando milhares de visualizações. Isso não significava que o blog não convertia — significava que **os cliques nos CTAs do blog não estavam sendo capturados como evento** no GA4.

Decisão importante tomada na conversa: as páginas de blog são conteúdo informacional (tipo "como fazer"), buscado por pessoas que querem resolver o visto sozinhas (DIY). Por isso **não faz sentido forçar CTA de "contrate uma assessoria"** ali — mas ainda assim vale medir quem clica no WhatsApp mesmo assim, para entender se aquele conteúdo gera algum interesse em suporte pago.

Também foi decidido **separar a métrica em dois tipos de CTA**, em vez de unificar:
- `inline_artigo` → CTA que aparece dentro do texto do artigo (se repete 3-4x por artigo)
- `fixo_flutuante` → botão fixo no canto inferior direito, aparece só nas páginas de blog

Separar permite decidir depois se vale manter as repetições do CTA inline, ou se o botão fixo (que pode incomodar leitura em mobile) está performando melhor ou pior.

---

## 2. Visão geral da arquitetura

```
Usuário clica em qualquer <a class="cta-whatsapp"> na página
        ↓
GTM (Google Tag Manager) — Trigger "Click - CTA WhatsApp" detecta o clique
        ↓
GTM lê o atributo data-cta-tipo do link clicado
        ↓
GTM dispara a Tag "GA4 - Click WhatsApp (Blog CTAs)"
        ↓
Evento click_whatsapp é enviado ao GA4, com os parâmetros:
   - cta_tipo: "inline_artigo" ou "fixo_flutuante"
   - pagina: caminho da página onde ocorreu o clique
        ↓
No GA4, o evento click_whatsapp é marcado como "Evento-chave" (conversão)
```

---

## 3. Mudanças feitas no código (HTML/Astro)

### 3.1. CTA inline (dentro do conteúdo do artigo, vindo do banco de dados MySQL)

O CTA inline é markdown/HTML armazenado no campo de conteúdo de cada artigo. Formato usado (pode variar — versão em tabela ou versão em `<a>` direto):

**Antes:**
```html
<a href=https://wa.me/551920422785 target=_blank>WhatsApp ↗</a>
```

**Depois:**
```html
<a href=https://wa.me/551920422785 target=_blank class="cta-whatsapp" data-cta-tipo="inline_artigo">WhatsApp ↗</a>
```

Regra: **toda** tag `<a>` que aponta para `wa.me/551920422785` dentro do artigo precisa ter `class="cta-whatsapp"` e `data-cta-tipo="inline_artigo"` — inclusive se o CTA se repetir várias vezes ao longo do texto.

### 3.2. Atualização em massa no banco (milhares de artigos)

Como o conteúdo fica no MySQL (via Django ORM), foi criado um **management command Django** para adicionar os atributos automaticamente em todos os artigos de uma vez, sem precisar editar manualmente.

Características do script:
- Usa regex para encontrar qualquer `<a>` que contenha `wa.me/551920422785`
- **Idempotente**: se rodar duas vezes, não duplica os atributos (pula links que já têm `data-cta-tipo`)
- Não depende da ordem dos atributos existentes no `<a>`
- Preserva qualquer `class` já existente, concatenando em vez de sobrescrever
- Suporta modo `--dry-run` para simular sem gravar no banco
- Suporta `--limit N` para testar em poucos artigos antes de rodar em todos

Comandos usados:
```bash
# Backup antes de qualquer coisa
mysqldump -u usuario -p nome_do_banco > backup_antes_cta.sql

# Testar em modo simulação, poucos artigos
python manage.py atualizar_cta_inline --dry-run --limit 5

# Simulação completa (sem gravar)
python manage.py atualizar_cta_inline --dry-run

# Execução real
python manage.py atualizar_cta_inline
```

> ⚠️ **Pitfall:** sempre rodar o dry-run antes de gravar em produção, e sempre fazer backup do banco. O script é seguro/idempotente, mas alterações em massa em milhares de registros merecem cautela.

### 3.3. CTA fixo flutuante (componente Astro, layout global do blog)

Esse componente é reutilizável, renderizado em toda página de blog (mas **não** na home — isso foi confirmado antes de aplicar a mudança, para evitar conflito com uma tag antiga do GTM que já rastreia o ícone de chat da home).

Arquivo: componente de "Fale com especialista" (ex: `FloatingWhatsApp.astro` ou similar).

**Antes:**
```astro
<a href={whatsappLink} target="_blank" class="absolute inset-0 z-[3]"></a>
```

**Depois:**
```astro
<a
  href={whatsappLink}
  target="_blank"
  class="cta-whatsapp absolute inset-0 z-[3]"
  data-cta-tipo="fixo_flutuante"
></a>
```

> ⚠️ **Pitfall importante:** antes de aplicar `class="cta-whatsapp"` em qualquer componente global (usado em várias páginas), **sempre confirme em quais páginas esse componente aparece**. Se o mesmo componente também aparecesse na home, o clique nele dispararia **duas tags ao mesmo tempo** (a nova do blog + a antiga da home já existente), gerando eventos duplicados e distorcendo a leitura de conversões.

---

## 4. Configuração no Google Tag Manager (GTM)

### 4.1. Variável — captura o tipo de CTA

- **Nome:** `DLV - CTA Tipo`
- **Tipo de variável:** Auto-Event Variable
  - Dentro dela, **Variable Type:** Element Attribute
  - **Attribute name:** `data-cta-tipo`

> ⚠️ **Pitfall:** o GTM não tem um tipo de variável chamado literalmente "Click Element" na lista principal — é preciso escolher **Auto-Event Variable**, e dentro dela configurar o subtipo **Element Attribute**. Isso confunde bastante quem está procurando pelo nome errado.

### 4.2. Trigger (gatilho) — detecta o clique

- **Nome:** `Click - CTA WhatsApp`
- **Trigger Type:** **Click — Just Links** (⚠️ ver pitfall abaixo — NÃO usar "All Elements")
- **Fires on:** Some Clicks
- **Condição:** `Click Classes` **contains** `cta-whatsapp`

> ⚠️ **PITFALL MAIS IMPORTANTE DE TODOS:** inicialmente o trigger foi configurado como **"Click - All Elements"**, e os primeiros testes falharam — a tag não disparava.
>
> **Causa raiz:** quando o usuário clica em um link, o navegador registra o clique no elemento exato tocado (ex: o texto "Fast Vistos" dentro de um `<span><b>`), e não necessariamente no `<a>` pai que tem a classe `cta-whatsapp`. Com "All Elements", o GTM captura os atributos do elemento exato clicado (que não tem classe nenhuma), não do link em si.
>
> **Solução:** trocar o tipo de trigger para **"Click - Just Links"**. Esse tipo especial do GTM sobe automaticamente na árvore do DOM até encontrar o `<a>` mais próximo e usa os atributos *dele* — resolvendo o problema de cliques em elementos filhos (texto, imagem, ícone dentro do link) que não carregam a classe.
>
> Por que a condição `contains` (e não `equals`): a classe do CTA fixo tem múltiplos valores (`class="cta-whatsapp absolute inset-0 z-[3]"`), então `equals` nunca daria match. `contains` funciona em qualquer combinação de classes.

### 4.3. Tag — envia o evento pro GA4

- **Nome:** `GA4 - Click WhatsApp (Blog CTAs)`
  - ⚠️ Nome escolhido deliberadamente diferente da tag antiga `GA4 – WhatsApp Click` (que já existia e rastreia o clique no ícone de chat da **home**, com travessão no nome). Renomear para deixar claro que essa é sobre CTAs de **artigos de blog**, evitando confundir as duas no futuro.
- **Tag Type:** Google Analytics: GA4 Event
- **Configuration:** usa o Measurement ID já existente (`G-1Q7XT8TMGF`), reconhecido automaticamente pelo GTM como "Google tag found in this container"
- **Event Name:** `click_whatsapp`
- **Event Parameters:**
  | Parâmetro | Valor |
  |---|---|
  | `cta_tipo` | `{{DLV - CTA Tipo}}` |
  | `pagina` | `{{Page Path}}` |
- **Triggering:** `Click - CTA WhatsApp`

> Nota: a mesma variável, gatilho e tag cobrem **os dois tipos de CTA automaticamente** — não é preciso criar configuração separada para `inline_artigo` e `fixo_flutuante`. O valor de `cta_tipo` é dinâmico: ele reflete o que estiver escrito no atributo `data-cta-tipo` do elemento clicado, seja qual for.

---

## 5. Como testar antes de publicar (Preview Mode)

1. No GTM, clique em **Preview**
2. Cole a URL de um artigo de blog que já tenha os atributos aplicados
3. Clique em **Connect**
4. No site carregado (modo debug), clique no CTA inline (dentro do artigo)
5. No painel Tag Assistant, clique no evento mais recente (deve aparecer como **"Link Click"**, não "Click" — confirma que o trigger certo capturou)
6. Aba **Tags** → confirmar que `GA4 - Click WhatsApp (Blog CTAs)` está em **"Tags Fired"**
7. Aba **Variables** → confirmar que `DLV - CTA Tipo` retornou `inline_artigo`
8. Repetir o processo clicando no CTA fixo flutuante e confirmar que retorna `fixo_flutuante`
9. Só depois de validar os dois, fechar o Preview e publicar

> ⚠️ Pitfall de leitura do debug: a mensagem "Please select a page or a message in the left navigation bar to view variable information" na aba Variables só aparece quando você está na tela "Summary" — é preciso clicar no evento específico (ex: "Link Click") no menu à esquerda antes de olhar as variáveis.

---

## 6. Publicar no GTM

1. Fechar a janela de Preview
2. Na tela principal do GTM, clicar em **Submit** (canto superior direito)
3. Selecionar **"Publish and Create Version"** (opção padrão já vem selecionada)
4. Preencher **Version Name** com algo descritivo, ex: `Rastreamento CTA WhatsApp blog - inline e fixo`
5. Version Description é opcional
6. Conferir a lista em **"Workspace Changes"** — deve mostrar só os 3 itens criados (o trigger, a variável, a tag), confirmando que nada mais foi alterado sem querer
7. Clicar em **Publish**

---

## 7. Marcar como evento-chave no GA4

Isso só funciona depois de pelo menos 1 clique real acontecer no site **já publicado** (cliques feitos durante o modo Preview do GTM não contam para o GA4 real).

1. Clicar de verdade em algum CTA do site publicado
2. No GA4: **Admin → Events**
3. Esperar `click_whatsapp` aparecer na lista (ou conferir antes em **Reports → Realtime**)
4. Ativar o toggle **"Mark as key event"** ao lado do evento

Depois disso, o relatório de Páginas e Telas vai mostrar cliques reais na coluna "Eventos principais" para as páginas de blog — não mais 100% concentrado na home.

---

## 8. Resumo dos aprendizados / pitfalls (para lembrar rápido)

| # | Problema | Solução |
|---|---|---|
| 1 | Confundir "0 conversões no blog" com "CTA não existe" | O CTA existia, só não estava marcado como evento-chave — sempre checar Admin → Eventos-chave no GA4 antes de concluir que algo não converte |
| 2 | Variável tipo "Click Element" não existe na lista do GTM | Usar **Auto-Event Variable** → subtipo **Element Attribute** |
| 3 | Trigger "Click - All Elements" não capturava a classe do link | Trocar para **Click - Just Links**, que sobe no DOM até achar o `<a>` pai |
| 4 | Condição do trigger usando "equals" nunca dava match | Usar **"contains"**, porque a classe do CTA fixo tem múltiplos valores |
| 5 | Duas tags de nome parecido (`GA4 – WhatsApp Click` vs a nova) causando confusão | Renomear a nova para `GA4 - Click WhatsApp (Blog CTAs)`, deixando claro o escopo |
| 6 | Risco de aplicar a classe em componente usado também na home | Sempre confirmar em quais páginas um componente global aparece, antes de marcar para rastreamento — evita eventos duplicados |
| 7 | Atualizar milhares de artigos manualmente no banco | Script Django management command, idempotente, com dry-run e backup obrigatório antes de rodar |
| 8 | Achar que "gerar assessoria" é o objetivo certo pro blog DIY | Decidido manter CTA no blog, mas sem forçar linguagem de venda — o público busca fazer o processo sozinho |

---

## 9. Checklist rápido para replicar em outro CTA/projeto no futuro

- [ ] Adicionar `class="cta-whatsapp"` (ou nome de classe equivalente) + `data-cta-tipo="..."` no(s) link(s) que quer rastrear
- [ ] Confirmar em quais páginas cada CTA aparece (evitar sobreposição com tags já existentes)
- [ ] Criar variável no GTM: Auto-Event Variable → Element Attribute → nome do atributo customizado
- [ ] Criar trigger: **Click - Just Links** (não "All Elements") + condição `Click Classes contains <sua-classe>`
- [ ] Criar tag GA4 Event com nome de evento customizado + parâmetros usando a variável criada
- [ ] Testar tudo no modo Preview antes de publicar (conferir Tags Fired + valores das Variables)
- [ ] Publicar o container no GTM
- [ ] Marcar o evento como Key Event no GA4 (Admin → Events)