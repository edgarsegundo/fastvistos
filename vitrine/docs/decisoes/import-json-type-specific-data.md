# Importar `type_specific_data` de arquivo JSON — só FAQ hoje, generalizar pros outros 5 tipos

**Data**: 2026-07-24
**Status**: 🟡 Em aberto — recurso mínimo entregue pra FAQ, generalização pros outros tipos não decidida
**Achado durante**: extensão da Fase 1 do roadmap SEO/GEO/AEO (JSON-LD
por `page_type` com schema validado,
[guia-seo-projetos-paginas.md](../seo/guia-seo-projetos-paginas.md)),
ver também o item em [../backlog.md](../backlog.md).

Este documento **não é um spec fechado** — é o registro do que já existe,
do que falta decidir, e das opções cogitadas, pra quem pegar esse item
não precisar remapear o código do zero.

## Contexto

A Fase 1 formalizou `PageSeoSettings.type_specific_data` (antes JSON
livre) em dataclasses Python validadas, uma por `page_type`
(`core/seo_schemas.py`):

```python
# core/seo_schemas.py
PAGE_TYPE_SCHEMAS = {
    'contact': LocalBusinessData,
    'blog_post': BlogPostingData,
    'faq': FaqPageData,
    'person': PersonData,
    'product': ProductData,
    'article': ArticleData,
}
```

Cada dataclass já tem `from_dict()` (parsing tolerante, nunca levanta
exceção) e `to_dict()` (forma canônica) — ver `core/seo_schemas.py`.

Em cima disso, foi adicionado um botão "Importar JSON" no admin
(`PageAdmin.import_type_specific_json`, `core/admin.py`) que aceita um
arquivo `.json` enviado pelo usuário, faz o parse e salva direto em
`PageSeoSettings.type_specific_data` — **mas só quando
`page.page_type == 'faq'`**:

```python
# core/admin.py::PageAdmin.import_type_specific_json
if page.page_type != Page.PAGE_TYPE_FAQ:
    return JsonResponse(
        {'error': 'Importação de JSON só está disponível pra FAQ nesta fase.'},
        status=400,
    )
schema_cls = PAGE_TYPE_SCHEMAS[Page.PAGE_TYPE_FAQ]
```

O resto da função (ler o arquivo, decodificar, `json.loads`, normalizar
lista solta `[...]` pra `{"questions": [...]}`, chamar
`schema_cls.from_dict(raw).to_dict()`, salvar) **não depende de nada
específico de FAQ** — é só o `if` acima que trava o recurso pros outros
5 tipos.

## O problema

Tecnicamente, generalizar o endpoint pra qualquer `page_type` com schema
é quase trivial — trocar o `if` por um lookup em `PAGE_TYPE_SCHEMAS` já
funcionaria mecanicamente. O que **não** está decidido é o **formato de
arquivo que faz sentido pedir pro usuário, por tipo**:

- `FaqPageData.questions` e `PersonData.same_as` são **listas** — "solte
  um arquivo com uma lista de itens" é uma UX natural (é literalmente o
  caso do FAQ hoje).
- `PersonData`, `ProductData`, `ArticleData`, `LocalBusinessData`,
  `BlogPostingData` são, na maior parte, **objetos escalares únicos**
  (nome, preço, headline, telefone, etc.) — "importar um arquivo" pra
  preencher um objeto só, quando o usuário já tem os campos reais no
  admin (`django-jsonform`) logo ali, tem bem menos valor do que pra uma
  lista longa de perguntas. Vale perguntar se faz sentido pra esses
  tipos ou se o ganho é concentrado mesmo em listas.
- Mesmo pros tipos "objeto único", `PersonData.same_as` é uma lista
  *dentro* de um objeto que também tem campos escalares — um arquivo de
  import faria sentido só pra esse sub-campo, ou o objeto inteiro?

Outras perguntas que também não foram resolvidas:
- **Sobrescrever direto ou mostrar preview antes?** Hoje o import
  substitui `type_specific_data` inteiro sem confirmação/diff — pra FAQ
  isso é aceitável (poucas perguntas, fácil conferir depois), mas pode
  incomodar em tipos com mais dado.
- **Vale um template de exemplo pra download**, por tipo, reduzindo erro
  de formatação do usuário?

## Opções cogitadas (nenhuma decidida)

1. **Generalizar o endpoint pra qualquer `page_type` com schema em
   `PAGE_TYPE_SCHEMAS`**, mostrando o botão condicionalmente (mesmo
   padrão do `get_fields`/`get_readonly_fields` atual) — menor esforço
   técnico, mas empurra a pergunta "isso faz sentido pra Product?" pro
   usuário descobrir na hora, sem orientação.
2. **Generalizar só pros campos que são listas** (`FaqPageData.questions`,
   `PersonData.same_as`) — um botão de import específico por sub-campo,
   não pelo objeto inteiro. Resolve melhor a UX, mas exige uma
   convenção nova (import parcial de um campo, não do JSON inteiro),
   mais trabalho de design do endpoint/schema.
3. **Fornecer template de exemplo pra download**, por tipo, junto do
   botão de import (um `.json` pré-preenchido com a forma esperada) —
   reduz erro de formatação, independe de decidir 1 vs. 2 primeiro, pode
   ser feito em paralelo com qualquer opção acima.
4. **Preview/confirmação antes de sobrescrever** — endpoint passaria a
   ter 2 passos (parse+preview, depois confirmar+salvar) em vez de um
   POST único que já salva. Mais seguro pra tipos com mais dado, mas
   dobra a superfície do endpoint (e do JS no botão) sem caso de uso
   reportado ainda (FAQ nunca teve reclamação de sobrescrita acidental).

## Por que não decidir agora

O recurso pra FAQ é novo — vale ver uso real (quantas perguntas as
pessoas importam, se pedem formatos diferentes, se erram o formato) antes
de generalizar pros outros 5 tipos, que têm uma UX de import menos óbvia
que "lista de perguntas". Reavaliar quando o import de FAQ tiver uso
real registrado, ou quando um caso concreto pedir import pra outro tipo.
