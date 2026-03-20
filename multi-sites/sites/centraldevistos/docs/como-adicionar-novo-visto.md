# Como adicionar um novo país ao Guia de Vistos

Para cada novo país, você precisa editar **dois arquivos**:

1. `components/VisaGuide.astro` — aparece no grid/listagem
2. `pages/vistos/[slug].astro` — gera a página física do país

---

## 1. `VisaGuide.astro` — entrada no grid

Adicione um item no array `countries` no topo do arquivo:

```js
{ 
  slug: "mexico",           // URL: /vistos/mexico
  name: "México",           // Nome exibido no card
  flag: "🇲🇽",              // Emoji da bandeira
  type: "Isento de visto",  // Texto do tipo (livre)
  typeCode: "free",         // "free" | "eta" | "required"
  visaName: "Livre",        // Texto do badge
  desc: "até 90 dias sem visto",  // Subtítulo do card
  popular: true,            // true = aparece no filtro "Populares"
},
```

### Valores válidos para `typeCode`

| typeCode     | Badge cor   | Uso                                  |
|--------------|-------------|--------------------------------------|
| `"free"`     | Verde       | Entrada livre, sem visto             |
| `"eta"`      | Azul        | eTA, eVisitor, NZeTA (eletrônico)    |
| `"required"` | Amarelo     | Visto obrigatório no consulado       |

---

## 2. `[slug].astro` — dados da página de detalhes

Adicione um objeto no array `countries` dentro de `getStaticPaths()`:

```js
{
  slug: "mexico",
  name: "México",
  flag: "🇲🇽",
  typeCode: "free",         // igual ao VisaGuide.astro
  typeLabel: "Isento de visto",  // texto do badge na página
  visaName: "Entrada livre",
  summary: "Brasileiros não precisam de visto para o México para estadias de até 180 dias. Um dos destinos mais acessíveis para brasileiros.",
  prazo: "Imediato",
  validade: "180 dias",
  entrevista: false,        // true | false
  taxa: "Gratuito",
  docs: [
    "Passaporte válido",
    "Comprovante de hospedagem",
    "Passagem de retorno",
    "Comprovante financeiro",
  ],
  tipos: [
    { code: "FMM", label: "Turismo", desc: "Forma Migratória Múltiple. Gratuita para chegadas aéreas." },
    { code: "FM3", label: "Residência temporária", desc: "Para quem vai morar, estudar ou trabalhar no México." },
  ],
  whatsappText: "Olá! Preciso de informações sobre viagem ao México.",
},
```

### Campos obrigatórios

| Campo           | Tipo       | Descrição                                      |
|-----------------|------------|------------------------------------------------|
| `slug`          | `string`   | Identificador na URL. Só letras minúsculas e hífens. Ex: `"nova-zelandia"` |
| `name`          | `string`   | Nome do país                                   |
| `flag`          | `string`   | Emoji da bandeira                              |
| `typeCode`      | `string`   | `"free"` \| `"eta"` \| `"required"`           |
| `typeLabel`     | `string`   | Texto do badge na página de detalhes           |
| `visaName`      | `string`   | Nome oficial do visto                          |
| `summary`       | `string`   | Parágrafo de resumo (aparece abaixo do título) |
| `prazo`         | `string`   | Tempo médio de emissão                         |
| `validade`      | `string`   | Período de validade do visto                   |
| `entrevista`    | `boolean`  | Se exige entrevista consular                   |
| `taxa`          | `string`   | Valor da taxa consular                         |
| `docs`          | `string[]` | Lista de documentos necessários                |
| `tipos`         | `object[]` | Tipos de visto disponíveis (ver abaixo)        |
| `whatsappText`  | `string`   | Mensagem pré-preenchida no WhatsApp            |

### Estrutura de cada item em `tipos`

```js
{ 
  code: "B1/B2",                    // Código oficial do visto
  label: "Turismo e negócios",      // Nome curto (título do card)
  desc: "Descrição detalhada...",   // Texto explicativo
}
```

---

## Exemplo completo — Espanha

### Em `VisaGuide.astro`:

```js
{ slug: "espanha", name: "Espanha", flag: "🇪🇸", type: "Schengen", typeCode: "required", visaName: "Schengen", desc: "Acesso a 26 países", popular: true },
```

### Em `[slug].astro` (dentro de `getStaticPaths`):

```js
{
  slug: "espanha",
  name: "Espanha",
  flag: "🇪🇸",
  typeCode: "required",
  typeLabel: "Schengen",
  visaName: "Visto Schengen",
  summary: "A Espanha faz parte do espaço Schengen. O visto emitido pelo consulado espanhol dá acesso a 26 países europeus por até 90 dias.",
  prazo: "15 dias úteis",
  validade: "90 dias em 180 dias",
  entrevista: false,
  taxa: "€90",
  docs: [
    "Passaporte válido por 3 meses após a data de retorno",
    "Formulário Schengen preenchido",
    "Foto recente padrão",
    "Seguro de viagem com cobertura de €30.000",
    "Comprovante de hospedagem",
    "Extrato bancário dos últimos 3 meses",
    "Comprovante de emprego ou atividade",
  ],
  tipos: [
    { code: "Schengen C", label: "Turismo e negócios", desc: "Curta duração. Acesso a todos os países do espaço Schengen." },
    { code: "Visto Nacional D", label: "Longa duração", desc: "Para estudar, trabalhar ou reunião familiar na Espanha." },
  ],
  whatsappText: "Olá! Preciso de assessoria para o visto Schengen / Espanha.",
},
```

---

## Localização dos arquivos

```
multi-sites/sites/centraldevistos/
├── components/
│   └── VisaGuide.astro          ← array countries (grid)
└── pages/
    └── vistos/
        └── [slug].astro          ← getStaticPaths > countries (páginas)
```
