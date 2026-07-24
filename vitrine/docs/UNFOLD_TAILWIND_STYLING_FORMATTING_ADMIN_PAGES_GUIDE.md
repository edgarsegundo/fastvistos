# Por que Páginas Admin Customizadas Ficam Sem Estilo no Unfold (e Como Consertar)

## ⚠️ O Problema Real (Causa Raiz)

O CSS do Unfold (`unfold/static/unfold/css/styles.css`) é um **bundle Tailwind PRÉ-COMPILADO**, gerado uma única vez pelo autor do pacote Unfold, escaneando **apenas os templates do próprio pacote Unfold** (dentro de `site-packages/unfold/templates/`). Ele **não é regenerado dinamicamente** a partir dos templates do seu projeto.

Isso significa: **qualquer classe Tailwind que você escrever no seu template, que não seja usada literalmente em algum template do Unfold, não existe no CSS e não renderiza nada** — nem erro, nem fallback, silenciosamente sem estilo.

### Prova (rode isso pra confirmar no seu ambiente)

```bash
CSS=$(python -c "import unfold, os; print(os.path.join(os.path.dirname(unfold.__file__), 'static/unfold/css/styles.css'))")

grep -c '\.bg-blue-600'      "$CSS"   # → 0 (NÃO existe!)
grep -c '\.rounded-lg'       "$CSS"   # → 0 (NÃO existe!)
grep -c '\.shadow\b'         "$CSS"   # → 0 (NÃO existe!)
grep -c '\.bg-gradient-to-br' "$CSS"  # → 0 (NÃO existe!)

grep -c '\.bg-primary-600'   "$CSS"   # → 1 (existe)
grep -c '\.bg-base-50'       "$CSS"   # → 1 (existe)
```

Apenas duas famílias de cor têm o **palette completo com todas as variantes** (`dark:`, `hover:`, `focus:`) compiladas: `primary-*` e `base-*` — são os tokens de design do próprio Unfold. Qualquer outra cor (`blue`, `green`, `red`, `indigo`...) só existe se, por acaso, algum template interno do Unfold usar exatamente aquele shade — o que é imprevisível e nunca deve ser assumido.

## ✅ A Solução: CSS Real, Não Classes Tailwind Adivinhadas

Não tente adivinhar quais classes Tailwind existem. Em vez disso, escreva **CSS de verdade** em `{% block extrastyle %}`, com um prefixo de classe próprio pra evitar conflito, e suporte a dark mode via seletor `.dark` (Unfold aplica a classe `dark` no `<html>`, estratégia padrão do Tailwind `darkMode: 'class'` — não é `prefers-color-scheme`).

### Padrão a seguir

```django
{% extends "admin/base_site.html" %}
{% load admin_urls static %}

{% block extrastyle %}
{{ block.super }}
<style>
  .minhapagina-section { padding: 1.5rem; border-radius: .5rem; border: 1px solid #e5e7eb; background: #f9fafb; }
  .dark .minhapagina-section { background: #1f2937; border-color: #374151; }

  .minhapagina-btn { padding: .5rem 1rem; border-radius: .5rem; background: #2563eb; color: #fff; border: none; }
  .minhapagina-btn:hover { background: #1d4ed8; }
</style>
{% endblock %}

{% block content %}
<div class="minhapagina-section">
  <button class="minhapagina-btn">Ação</button>
</div>
{% endblock %}
```

Use **hex colors direto** (`#2563eb`), não `bg-blue-600`. Prefixe suas classes com o nome da página (`.minhapagina-*`) pra não colidir com nada do Unfold.

## Exceção: `primary-*` e `base-*` SÃO seguros

Se quiser reaproveitar a paleta de cor do tema (que muda conforme o `business`/branding), essas classes Tailwind funcionam de verdade, incluindo `dark:`/`hover:`/`focus:`:

```django
<h1 class="text-primary-700 dark:text-primary-600">Título</h1>
<div class="bg-base-50 dark:bg-base-900 border-base-200 dark:border-base-700">...</div>
```

Mas **não confie cegamente** — sempre confira com o grep acima antes de usar uma combinação nova (ex: `focus:ring-primary-200` não existe, mesmo `focus:ring-primary-300` existindo).

## Regra geral por trás da exceção: qualquer classe usada em `unfold/widgets.py` é segura

O motivo de `primary-*`/`base-*` funcionarem não é "cor especial" — é que o bundle CSS do Unfold foi compilado escaneando o **código-fonte Python do próprio pacote**, e `unfold/widgets.py` referencia essas classes literalmente para estilizar os widgets nativos (`<select>`, `<input>`, `<textarea>`, checkbox, radio). Ou seja: **toda classe usada nas listas `*_CLASSES` desse arquivo está garantidamente no bundle**, não é chute.

Prova (mesma técnica do grep acima, mas apontando pro arquivo fonte):

```bash
WIDGETS=$(python -c "import unfold, os; print(os.path.join(os.path.dirname(unfold.__file__), 'widgets.py'))")
grep -n "_CLASSES = \[" "$WIDGETS"
# BASE_CLASSES, BASE_INPUT_CLASSES, INPUT_CLASSES, SELECT_CLASSES, TEXTAREA_CLASSES, CHECKBOX_CLASSES, RADIO_CLASSES...
```

### `<select>`/`<input>` desformatado numa página custom? Use as classes literais do widget

Um `<select>`/`<input>` criado à mão (estático no template ou via `document.createElement` em JS) **não passa pelo widget Python do Unfold**, então não ganha nenhuma classe automaticamente — fica com a aparência padrão feia do navegador. A solução é colar manualmente as mesmas classes que `UnfoldAdminSelectWidget`/`UnfoldAdminTextInputWidget` usam, copiadas direto de `unfold/widgets.py` (`SELECT_CLASSES` e `INPUT_CLASSES`, ambas derivadas de `BASE_INPUT_CLASSES` = `BASE_CLASSES + px-3/py-2/w-full`):

```js
// Idêntico ao que unfold.widgets.UnfoldAdminSelectWidget aplica em Python
const UNFOLD_SELECT_CLASS = 'border border-base-200 bg-white font-medium min-w-20 placeholder-base-400 rounded shadow-sm text-font-default-light text-sm focus:ring focus:ring-primary-300 focus:border-primary-600 focus:outline-none dark:bg-base-900 dark:border-base-700 dark:text-font-default-dark dark:focus:border-primary-600 dark:focus:ring-primary-700 dark:focus:ring-opacity-50 px-3 py-2 w-full pr-8 max-w-2xl appearance-none';

// Idêntico ao que unfold.widgets.UnfoldAdminTextInputWidget aplica em Python
const UNFOLD_INPUT_CLASS = 'border border-base-200 bg-white font-medium min-w-20 placeholder-base-400 rounded shadow-sm text-font-default-light text-sm focus:ring focus:ring-primary-300 focus:border-primary-600 focus:outline-none dark:bg-base-900 dark:border-base-700 dark:text-font-default-dark dark:focus:border-primary-600 dark:focus:ring-primary-700 dark:focus:ring-opacity-50 px-3 py-2 w-full max-w-2xl';

select.className = `minha-classe-de-layout ${UNFOLD_SELECT_CLASS}`;
```

No HTML estático é a mesma ideia — cola a string inteira no `class=""`. Isso garante paridade pixel-a-pixel com os campos nativos do admin (borda, fundo, `border-radius`, `focus:ring` na cor `primary` do tema, dark mode), sem escrever uma linha de CSS customizado pra aparência.

Convenção: mantenha uma classe própria (ex: `.aq-select`) só para **layout** (`flex`, `min-width` dentro de um `.aq-row`) e delegue toda a **aparência** pras classes literais do Unfold — não duplique border/background/focus em CSS próprio, porque diverge silenciosamente do resto do admin quando o tema/branding mudar as variáveis de cor.

Exemplo real consertado: `blogging2/templates/admin/blogging2/analytics_query.html` — os `<select>` de condições (criados via JS) e os de ordenação (estáticos) usam exatamente esse padrão.

## Checklist ao criar/revisar uma página admin customizada

- [ ] `{% block extrastyle %}` com `<style>` e CSS real (hex colors), não classes Tailwind adivinhadas
- [ ] Prefixo de classe único pra página (evita colisão com Unfold/outras páginas)
- [ ] Dark mode via `.dark .minha-classe { ... }`, não `dark:` Tailwind (a menos que seja `primary-*`/`base-*` ou uma classe literal de `unfold/widgets.py`)
- [ ] `<select>`/`<input>`/`<textarea>` criados à mão (template estático ou `document.createElement`) usam as classes literais de `SELECT_CLASSES`/`INPUT_CLASSES` de `unfold/widgets.py`, não CSS customizado — ver seção acima
- [ ] Testado visualmente no navegador em **light e dark mode** — não confiar só em "o HTML renderizou" (o servidor sempre retorna 200 mesmo sem nenhum CSS aplicado)
- [ ] CSRF token disponível globalmente na página se houver `fetch()`/JS fazendo POST — não depender de um form condicional (`{% if lista %}`) ser a única fonte do token; coloque `{% csrf_token %}` solto logo no início do `{% block content %}`

## Referências no Projeto

| Página | Path | O que reaproveitar |
|--------|------|---------------------|
| **analytics_query** | `blogging2/templates/admin/blogging2/analytics_query.html` | CSS real com prefixo `.aq-*` só pra layout, `<select>`/`<input>` estilizados com as classes literais de `unfold/widgets.py` (`UNFOLD_SELECT_CLASS`/`UNFOLD_INPUT_CLASS`), builder dinâmico com JS, dark mode via `.dark` |
| **analytics_query_results** | `blogging2/templates/admin/blogging2/analytics_query_results.html` | Partial retornado via `fetch()`, também com `<style>` próprio (prefixo `.aqr-*`) |
| **processar_artigos** | `templates/admin/blogging2/processar_artigos.html` | Exemplo mais antigo que usa classes Tailwind adivinhadas (`bg-blue-600` etc.) — **NÃO copiar esse padrão**, provavelmente também está com estilo quebrado sem que ninguém tenha percebido |

## Registrar a View + URL (sem mudanças, isso já funciona)

```python
@staff_member_required
def blogging2_sua_pagina_view(request):
    context = dict(admin.site.each_context(request))
    return TemplateResponse(request, "admin/blogging2/sua_pagina.html", context)

def _wrap_admin_urls(get_urls_func):
    def get_urls():
        urls = get_urls_func()
        custom_urls = [
            path('blogging2/sua-pagina/', admin.site.admin_view(blogging2_sua_pagina_view), name="blogging2_sua_pagina"),
        ]
        return custom_urls + urls
    return get_urls
```

---

**TL;DR:** O CSS do Unfold é estático e só cobre `primary-*`/`base-*`, mais qualquer classe literalmente usada em `unfold/widgets.py` (inclui `SELECT_CLASSES`/`INPUT_CLASSES` — use essas pra estilizar `<select>`/`<input>` custom igual ao resto do admin). Para tudo mais, escreva `<style>` com CSS real (hex colors) em vez de adivinhar classes Tailwind — senão o botão/seção simplesmente não terá estilo nenhum, silenciosamente.
