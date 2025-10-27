4 Passos

https://chat.deepseek.com/a/chat/s/8c703b97-626c-4333-978e-320bdeaf0ff3







4 Passos

https://chat.deepseek.com/a/chat/s/8c703b97-626c-4333-978e-320bdeaf0ff3


Quero que você **analise semanticamente** a lista de termos a seguir e **agrupá-los por similaridade de tema**.

As regras são:

* Agrupe juntos todos os termos que **têm o mesmo sentido, tema ou intenção de busca**, mesmo que a redação varie (plural, acento, sinônimos, ordem das palavras etc.).
* Cada grupo deve representar **um único conceito ou intenção de pesquisa** (por exemplo, “agendamento de visto americano”, “formulário DS-160”, “entrevista do visto americano”, etc.).
* Dê **um nome curto e representativo para cada grupo** (exemplo: “Agendamento de Visto”, “Formulário DS-160”, “Entrevista Consulado”, etc.).
* Liste os termos **dentro de cada grupo** em formato de lista com bullets.
* Não repita termos em grupos diferentes.
* Ignore pequenas variações de acento ou maiúsculas/minúsculas.

**Formato de resposta esperado:**

```markdown
## [Nome do Grupo 1]
- termo 1
- termo 2
- termo 3

## [Nome do Grupo 2]
- termo 4
- termo 5
...
```

Eis a lista de termos para agrupar:

```
160 visto americano
214b visto negado
221g visto americano
a embaixada americana esta emitindo visto
a entrevista do visto americano é em ingles
a entrevista no consulado americano é em português
a entrevista para o visto americano é em ingles
acessar ds 160
acessar formulario ds 160
acessar formulario ds 160 preenchido
acessoria de visto americano
acessoria visto americano
agencia de turismo visto americano
agencia de visto americano
agência de visto americano
agencia imigração estados unidos
agencia para tirar visto americano
agência para tirar visto americano
agencia para visto americano
agencia que ajuda a tirar visto
agencia visto americano
agência visto americano
agenda casv
agenda consulado americano
agenda consulado americano sp
agenda de entrevista para visto americano
agenda de visto americano
agenda de visto americano sp
agenda do consulado americano
agenda para entrevista visto americano
agenda para visto americano
agenda para visto americano 2022
agenda visto americano 2022
agenda visto americano 2023
agenda visto americano brasilia
agenda visto americano porto alegre
agenda visto americano sp
agendamento americano
agendamento casv
agendamento casv 2022
agendamento casv datas
agendamento casv e consulado
agendamento casv e consulado mesmo dia
agendamento casv porto alegre
agendamento casv sao paulo
agendamento casv são paulo
agendamento casv sp
agendamento casv visto
agendamento casv visto americano
agendamento consulado americano
agendamento consulado americano em sao paulo
agendamento consulado americano porto alegre
agendamento consulado americano sao paulo
agendamento consulado americano são paulo
agendamento consulado americano sp
agendamento consulado americano visto
agendamento consulado brasileiro em nova york
agendamento consulado estados unidos
agendamento consulado sao paulo
agendamento consular e casv
agendamento consular visto americano
agendamento da entrevista do visto americano
agendamento de entrevista consulado americano
agendamento de entrevista consulado americano sp
agendamento de entrevista de visto
agendamento de entrevista de visto americano
agendamento de entrevista no consulado americano
agendamento de entrevista para passaporte
agendamento de entrevista para visto americano
agendamento de entrevista para visto americano em brasilia
agendamento de entrevista visto
agendamento de entrevista visto americano
agendamento de passaporte americano
agendamento de renovação de visto americano
agendamento de visto
agendamento de visto americano
agendamento de visto americano 2022
agendamento de visto americano 2023
agendamento de visto americano brasilia
agendamento de visto americano casv
agendamento de visto americano datas
agendamento de visto americano em brasilia
agendamento de visto americano em brasília
agendamento de visto americano em porto alegre
agendamento de visto americano em sao paulo
agendamento de visto americano em são paulo
agendamento de visto americano em sp
agendamento de visto americano porto alegre
agendamento de visto americano sao paulo
agendamento de visto americano site
agendamento de visto americano sp
agendamento de visto consulado americano
agendamento de visto consulado americano sp
agendamento de visto em porto alegre
agendamento de visto em sao paulo
agendamento de visto em sp
agendamento de visto estados unidos
agendamento de visto na embaixada americana em brasilia
agendamento de visto no consulado americano
agendamento de visto para estados unidos
```









## PROMPT 3

Você é um especialista em SEO e copywriting.  
Receberá uma lista de termos de busca relacionados a um mesmo tema (podendo conter variações, sinônimos, erros ortográficos e diferentes intenções dentro do mesmo tópico).

Sua tarefa é **analisar semanticamente a lista** e, com base nela, **gerar metadados SEO completos**, que capturem a **intenção central** e também englobem as **principais variações de busca**, sem parecer forçado.

### Regras:

1. **Analise a lista** e identifique o **tema principal e suas variações secundárias**.
2. Gere os seguintes campos em formato JSON:
   - `title`: um título chamativo e natural, que contenha o termo principal e desperte interesse;
   - `metaTitle`: versão otimizada para SEO (até 60 caracteres), contendo a palavra-chave mais importante;
   - `metaDesc`: meta description envolvente (até 155 caracteres), que capture o sentido de todas as variações de busca (mesmo que alguns termos não apareçam literalmente);
   - `keywords`: lista das principais palavras-chave e sinônimos relevantes extraídos da lista;
   - `slug`: URL amigável (baseada no título, em letras minúsculas e separada por hifens);
   - `intent`: descrição curta da intenção de busca (ex: "agendar entrevista", "preencher formulário", "contratar assessoria").
3. Use **apenas a forma correta dos termos**, mas capture o significado dos erros (ex: “acessoria” = “assessoria”).
4. O texto deve soar **natural, confiável e profissional**, adequado a um site sobre vistos, imigração ou serviços de viagem.
5. Nunca repita a mesma palavra desnecessariamente.
6. Evite menções explícitas a erros ortográficos — apenas leve em conta o significado por trás deles.
7. Os textos devem ser otimizados para **CTR (atrair cliques)** e **semântica (rankear em buscas diversas)**.

### Formato de resposta:

```json
{
  "seoData": {
    "title": "Título atrativo e natural aqui...",
    "metaTitle": "Versão curta e otimizada aqui...",
    "metaDesc": "Descrição envolvente que capture as variações de busca...",
    "keywords": ["palavra1", "palavra2", "palavra3"],
    "slug": "url-amigavel-baseada-no-titulo",
    "intent": "descrição da intenção principal da busca"
  }
}
```

### Exemplo de entrada:

```
## Formulário DS-160
- 160 visto americano
- acessar ds 160
- acessar formulario ds 160
- acessar formulario ds 160 preenchido

## Tipos e Status do Visto
- 214b visto negado
- 221g visto americano
- a embaixada americana esta emitindo visto
...
```

### Exemplo de saída:

```json
{
  "seoData": {
    "title": "Agendamento de Visto Americano — Como Marcar Sua Entrevista no Consulado",
    "metaTitle": "Agendamento de Visto Americano | CASV e Consulado",
    "metaDesc": "Aprenda como agendar o visto americano no CASV e consulado. Passo a passo atualizado para São Paulo, Brasília e Porto Alegre.",
    "keywords": ["agendamento visto americano", "agenda consulado americano", "CASV", "entrevista visto"],
    "slug": "agendamento-visto-americano",
    "intent": "agendar entrevista e marcar visto americano"
  }
}
```

Agora gere o JSON com os metadados SEO para a lista a seguir:

```
[cole aqui sua lista de termos]
```
## Formulário DS-160
- 160 visto americano
- acessar ds 160
- acessar formulario ds 160
- acessar formulario ds 160 preenchido

## Tipos e Status do Visto
- 214b visto negado
- 221g visto americano
- a embaixada americana esta emitindo visto

## Entrevista para Visto Americano
- a entrevista do visto americano é em ingles
- a entrevista no consulado americano é em português
- a entrevista para o visto americano é em ingles
- agendamento da entrevista do visto americano
- agendamento de entrevista consulado americano
- agendamento de entrevista consulado americano sp
- agendamento de entrevista de visto
- agendamento de entrevista de visto americano
- agendamento de entrevista no consulado americano
- agendamento de entrevista para visto americano
- agendamento de entrevista para visto americano em brasilia
- agendamento de entrevista visto
- agendamento de entrevista visto americano
- agenda de entrevista para visto americano
- agenda para entrevista visto americano

## Agendamento de Visto Americano
- agenda de visto americano
- agenda de visto americano sp
- agenda para visto americano
- agenda para visto americano 2022
- agenda visto americano 2022
- agenda visto americano 2023
- agenda visto americano brasilia
- agenda visto americano porto alegre
- agenda visto americano sp
- agendamento americano
- agendamento de visto
- agendamento de visto americano
- agendamento de visto americano 2022
- agendamento de visto americano 2023
- agendamento de visto americano brasilia
- agendamento de visto americano casv
- agendamento de visto americano datas
- agendamento de visto americano em brasilia
- agendamento de visto americano em brasília
- agendamento de visto americano em porto alegre
- agendamento de visto americano em sao paulo
- agendamento de visto americano em são paulo
- agendamento de visto americano em sp
- agendamento de visto americano porto alegre
- agendamento de visto americano sao paulo
- agendamento de visto americano site
- agendamento de visto americano sp
- agendamento de visto consulado americano
- agendamento de visto consulado americano sp
- agendamento de visto em porto alegre
- agendamento de visto em sao paulo
- agendamento de visto em sp
- agendamento de visto estados unidos
- agendamento de visto na embaixada americana em brasilia
- agendamento de visto no consulado americano
- agendamento de visto para estados unidos

## Agendamento CASV e Consulado
- agenda casv
- agenda consulado americano
- agenda consulado americano sp
- agenda do consulado americano
- agendamento casv
- agendamento casv 2022
- agendamento casv datas
- agendamento casv e consulado
- agendamento casv e consulado mesmo dia
- agendamento casv porto alegre
- agendamento casv sao paulo
- agendamento casv são paulo
- agendamento casv sp
- agendamento casv visto
- agendamento casv visto americano
- agendamento consulado americano
- agendamento consulado americano em sao paulo
- agendamento consulado americano porto alegre
- agendamento consulado americano sao paulo
- agendamento consulado americano são paulo
- agendamento consulado americano sp
- agendamento consulado americano visto
- agendamento consular e casv
- agendamento consular visto americano
- agendamento consulado estados unidos
- agendamento consulado sao paulo

## Renovação e Passaporte
- agendamento de passaporte americano
- agendamento de renovação de visto americano
- agendamento de entrevista para passaporte

## Agências e Assessoria para Visto
- acessoria de visto americano
- acessoria visto americano
- agencia de turismo visto americano
- agencia de visto americano
- agência de visto americano
- agencia imigração estados unidos
- agencia para tirar visto americano
- agência para tirar visto americano
- agencia para visto americano
- agencia que ajuda a tirar visto
- agencia visto americano
- agência visto americano

## Agendamento de Outros Consulados
- agendamento consulado brasileiro em nova york
```
