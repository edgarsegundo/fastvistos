# `llms.txt` v2 — incluir blocos de FAQ/estatística/definição (`ContentBlock`)

**Data**: 2026-07-24
**Status**: 🔵 Spec pronta pra implementar — bloqueada até o model
`ContentBlock` existir (Fase 3 do roadmap SEO/GEO/AEO)
**Achado durante**: Fase 2 do roadmap SEO/GEO/AEO (`/llms.txt` por
projeto, [guia-seo-projetos-paginas.md](../seo/guia-seo-projetos-paginas.md)),
ver também o item em [../backlog.md](../backlog.md).

Diferente de [robots-txt-per-page-disallow.md](robots-txt-per-page-disallow.md)
e [import-json-type-specific-data.md](import-json-type-specific-data.md)
(ambos "em aberto", sem decisão de implementação), este documento **é um
spec fechado** — só não foi codado agora porque depende de uma peça que
ainda não existe (`ContentBlock`, Fase 3). Quando a Fase 3 for
implementada, dá pra seguir este documento quase literalmente pra
estender o `llms.txt`.

## Contexto

A v1 do `/llms.txt` (`core/views.py::project_llms_txt`, Fase 2, já em
produção) lista só **título + descrição** por página, 100% vindo de
`resolve_seo()`:

```
# Projeto 1

## Páginas

- [Faq](https://saas.fastvistos.com.br/app/projeto-renamed-4-1/faq/)
- [Home](https://saas.fastvistos.com.br/app/projeto-renamed-4-1/)
```

Isso já é válido e funcional, mas pobre pro propósito real do
`llms.txt`: dar a um agente de IA um resumo direto o suficiente pra
responder perguntas sem precisar fazer scraping de HTML. Um agente
perguntando "quanto tempo demora o processo de visto?" não acha resposta
nenhuma só com título+descrição — a resposta está dentro do conteúdo da
página, hoje invisível pro `llms.txt`.

O plano já previa isso explicitamente
(`vitrine/docs/seo/plano-evolucao-seo-geo-aeo.md`, seção Fase 2):

> v2 (depois da Fase 3): incluir os FAQs/definições estruturados
> extraídos das páginas, porque é exatamente o tipo de conteúdo que
> `llms.txt` foi pensado pra expor.

## Dependência: `ContentBlock` (Fase 3, ainda não implementado)

Fase 3 (mesmo doc, seção "Conteúdo estruturado pra extração") prevê criar:

```python
# core/models.py (Fase 3 — ainda não existe)
class ContentBlock(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='content_blocks')
    block_type = models.CharField(choices=[('faq', ...), ('stat_highlight', ...), ('definition', ...)])
    order = models.PositiveIntegerField(default=0)
    data = models.JSONField()  # validado por dataclass, mesmo padrão de type_specific_data
```

Reaproveita as dataclasses já existentes em `core/seo_schemas.py`
(`FaqPageData` já existe desde a Fase 1) pra `block_type='faq'`, e a
Fase 3 cria `StatHighlightData(stat_text, source_name, source_url?)` e
`DefinitionData(term, definition)` novas — ver
`prompts-claude-code-seo-geo-aeo.md`, seção Fase 3, item 1.

**Este spec não redefine o `ContentBlock`** — só consome o que a Fase 3
já desenhou. Se o formato do model mudar durante a implementação da Fase
3, ajustar a query abaixo de acordo, o resto do spec continua válido.

## Formato de saída proposto

Estender o markdown por página com uma sub-lista indentada, agrupando
por `block_type`, na ordem (`order`) em que os blocos aparecem na
página:

```
# Projeto 1

## Páginas

- [Faq](https://saas.fastvistos.com.br/app/projeto-renamed-4-1/faq/): Perguntas frequentes sobre vistos
  - P: Quanto tempo demora o processo?
    R: Entre 30 e 60 dias úteis.
  - P: Preciso de advogado?
    R: Não é obrigatório.

- [Sobre](https://saas.fastvistos.com.br/app/projeto-renamed-4-1/sobre/): Nossa empresa
  - Estatística: 98% de aprovação em 2025 (fonte: Ministério das Relações Exteriores)
  - Definição — Visto de trabalho: autorização que permite exercer atividade remunerada no país de destino.

- [Home](https://saas.fastvistos.com.br/app/projeto-renamed-4-1/)
```

Regras:
- Só entra bloco de página que já passaria no filtro atual (`noindex`
  continua excluindo a página inteira, blocos incluídos).
- Uma página sem `ContentBlock` nenhum continua exatamente como hoje
  (só `- [title](url): description`) — não força a sub-lista vazia.
- `block_type='faq'`: uma linha `- P: {question}` +
  `    R: {answer}` por pergunta, na ordem em que estão em
  `FaqPageData.questions`.
- `block_type='stat_highlight'`: uma linha
  `- Estatística: {stat_text} (fonte: {source_name})` — omitir o
  parêntese de fonte se `source_name` vazio.
- `block_type='definition'`: uma linha
  `- Definição — {term}: {definition}`.

## Implementação (esboço, quando `ContentBlock` existir)

Em `core/views.py::project_llms_txt`, dentro do loop de `pages` (depois
do `if seo['noindex']: continue`), adicionar:

```python
blocks = page.content_blocks.order_by('order')  # ContentBlock, Fase 3
if blocks:
    for block in blocks:
        if block.block_type == 'faq':
            faq_data = FaqPageData.from_dict(block.data)
            for item in faq_data.questions:
                lines.append(f"  - P: {item.question}")
                lines.append(f"    R: {item.answer}")
        elif block.block_type == 'stat_highlight':
            stat = StatHighlightData.from_dict(block.data)
            suffix = f" (fonte: {stat.source_name})" if stat.source_name else ""
            lines.append(f"  - Estatística: {stat.stat_text}{suffix}")
        elif block.block_type == 'definition':
            defn = DefinitionData.from_dict(block.data)
            lines.append(f"  - Definição — {defn.term}: {defn.definition}")
```

Sem query extra por página além da já existente — `select_related`/
`prefetch_related('content_blocks')` na query principal de `pages` evita
N+1 (mesmo cuidado que `sitemap_xml`/`api_project_pages` já têm com
`resolve_seo()` por página, só que ali o custo é aceito porque já é
assim há tempo; aqui, com prefetch, dá pra evitar desde o início).

## Testes a adicionar (mesmo arquivo `test_llms_txt.py`)

- Página com bloco `faq` (1+ perguntas) aparece com sub-lista `P:`/`R:`.
- Página com bloco `stat_highlight` com/sem `source_name` (2 casos, com
  e sem parêntese de fonte).
- Página com bloco `definition` aparece com `Definição — {term}:`.
- Página sem nenhum `ContentBlock` continua no formato v1 (sem
  sub-lista) — não regressão do comportamento atual.
- Ordem dos blocos respeita `ContentBlock.order`.
- Página com `noindex=True` continua excluída inteira, blocos incluídos
  (não vaza um bloco de uma página que não deveria aparecer).

## Por que não implementar agora

`ContentBlock` não existe — é o entregável da Fase 3, que por sua vez
depende de decidir como o editor de conteúdo representa blocos (rich
text livre vs. sistema de blocos), decisão já sinalizada como pendente
em `plano-evolucao-seo-geo-aeo.md`, seção "Decisões de arquitetura a
tomar agora", item 1. Implementar a v2 do `llms.txt` antes da Fase 3
não é possível — não tem de onde ler os blocos. Revisitar assim que a
Fase 3 estiver implementada e testada.
