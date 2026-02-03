# How to create an article

## How to create a link

Ex:

🔗 **Acesse o site oficial para consultar seu status** <a href="https://ceac.state.gov/CEACStatTracker/Status.aspx" target="_blank">aqui ↗</a>

## How to add an image

Ex:

![Exemplo de visto americano aprovado no site oficial CEAC.](https://fastvistos.com.br/assets/images/blog/01-visto-americano-aprovado.webp)


## How to reference a related article

Ex: 

<!--
<RelatedArticle>
<id>0684909c488e4aa6a4ed027957eb9c85</id>
<text>Para mais detalhes sobre como acompanhar a entrega do seu passaporte, confira o guia completo [aqui](<<ARTICLE-URL>>).</text>
</RelatedArticle>
-->

## How to add howto

Ex:

<!--
<HowTo>
<name>É possível acompanhar o andamento do meu visto americano?</name>
<text>Sim, existe um site oficial do consulado americano para consultar, rastrear, verificar e acompanhar o status do visto.</text>
</HowTo>
-->

<!--
<HowToStep>
<name>Não esqueça de contratar um seguro viagem para os Estados Unidos</name>
<text>Contratar um seguro viagem internacional é importante para cobrir emergências médicas, atrasos de voo, extravio de bagagem e outros imprevistos durante sua estadia nos EUA. Alguns consulados recomendam ter seguro válido durante toda a estadia.</text>
</HowToStep>
-->




















## How to semi-automate an article creation with chapgpt

---

### PROMPT 1

Acesse **cada artigo nos links abaixo** e extraia **todos os títulos de nível H2** (ou seja, todos os subtítulos com a tag `<h2>` que aparecem no conteúdo principal do texto).

**Instruções:**

* Ignore títulos de outros níveis (H1, H3, etc.).
* **Desconsidere títulos que apareçam em menus, barras laterais, rodapés ou seções promocionais.**
* **Elimine títulos repetidos ou muito semelhantes**, mantendo apenas uma versão de cada tópico.
* Liste os H2 **exatamente na ordem em que aparecem** no conteúdo principal.
* Organize o resultado da seguinte forma:

```
[título do artigo]
- Título H2 nº1
- Título H2 nº2
- ...
```



### v2

Extraia todos os tópicos do artigo que passarei no final

**Instruções:**

* **Elimine títulos repetidos ou muito semelhantes**, mantendo apenas uma versão de cada tópico.
* Organize o resultado da seguinte forma:

```
Tópico 1
Tópico 2
...
```


**Links dos artigos:**

https://www.dicasdeviagem.com/seguro-viagem-para-gestante/
https://www.eurodicas.com.br/melhor-seguro-viagem-para-gestante/
https://www.maladeaventuras.com/melhor-seguro-viagem-para-gestantes/
https://seguroviagempro.com.br/melhor-seguro-viagem-para-gestante/
https://dicasdeseguro.com.br/seguro-viagem-para-gravida/
https://prefiroviajar.com.br/dicas-de-viagem/seguro-viagem/seguro-viagem-gestante-como-escolher
https://www.turistandocomalu.com.br/seguro-viagem-para-gestante/
https://www.essemundoenosso.com.br/seguro-viagem-para-gestante/

---

### PROMPT 2

Analise a lista de títulos abaixo e faça o seguinte:

Compare cada título com os outros da lista.

- Remova todos os títulos repetidos ou muito semelhantes, mantendo apenas versões únicas e diferentes.
- Considere títulos com pequenas variações de palavras, pontuação ou ordem de palavras como semelhantes, e mantenha apenas uma versão representativa.
- Retorne a lista final somente com títulos únicos, mantendo a essência de cada tópico.
- Liste os resultados em formato de item, sem números adicionais ou explicações.

**Lista de títulos a analisar:**

Afinal, é contraindicado viajar grávida? Quais cuidados tomar?
Como acionar o seguro viagem gestante
Como comparar os planos de seguro viagem
Como contratar o seguro viagem gestante?
Como contratar um seguro de viagem para gestante
Como escolher o seu seguro viagem para grávida
Como escolher seu seguro viagem gestante
Como faço se precisar utilizar o seguro na viagem
Como funciona o seguro viagem?
Como o seguro viagem para gestante funciona?
Considerações na escolha do seguro viagem para gestantes
Desconto no seu Seguro Viagem
Dúvidas frequentes
Melhor seguro viagem para gestante para América do Sul
Melhor seguro viagem para gestante para América do Sul
Melhor seguro viagem para gestante para o resto do mundo
Melhor seguro viagem para gestante para o resto do mundo
Melhores seguradoras
O que considerar na escolha do melhor seguro viagem para gestante?
O que considerar na escolha do melhor seguro viagem para gestante?
O que é o seguro viagem para gestante?
O que os planos de seguro viagem para gestante cobrem?
O seguro viagem na gravidez vale a pena?
Onde contratar o melhor seguro viagem para gestantes?
Onde contratar o melhor seguro viagem para gestantes?
Onde contratar seu seguro viagem para grávida
Para quais destinos preciso do seguro viagem gestante?
Perguntas frequentes sobre seguro viagem para grávidas
Por que contratar um Seguro Viagem para gestante?
Porque contratar um seguro viagem para grávida?
Quais são as coberturas de um seguro viagem para grávidas?
Quais são as limitações do seguro viagem para gestante?
Quais são os melhores seguros viagem para gestantes?
Qual é o melhor seguro viagem para gestante?
Qual o melhor seguro viagem para gestante para Estados Unidos ou Canadá?
Qual o melhor seguro viagem para gestante para Estados Unidos ou Canadá?
Qual o melhor seguro viagem para gestante para Europa?
Qual o melhor seguro viagem para gestante para Europa?
Qual o melhor seguro viagem para grávidas?
Qual seguro viagem escolher para gestante?
Quanto custa um seguro viagem para gestante?
Recomendação do Seguro Viagem Pro
Recomendação do Seguro Viagem Pro
Seguro viagem de cartão de crédito cobre gestante?
Seguro viagem gestante 2024: qual é o melhor? quanto custa?
Tipos de seguro viagem

---

### PROMPT 3

Você é um especialista em criação de conteúdos originais para blogs e sites de viagem. Quero que você pegue a lista de títulos abaixo e os parafraseie completamente, mantendo o mesmo sentido e tema, mas de forma única, natural e envolvente. Os títulos não podem parecer cópia uns dos outros nem gerar a impressão de que foram criados por inteligência artificial. Mantenha o tom informativo e atraente, adequado para leitores humanos interessados em seguro viagem para gestantes.

Retorne apenas a lista de títulos parafraseados, mantendo o formato de lista com um título por linha, sem explicações adicionais.

**Aqui está a lista de títulos:**

* Afinal, é contraindicado viajar grávida? Quais cuidados tomar?
* Como acionar o seguro viagem gestante
* Como comparar os planos de seguro viagem
* Como contratar um seguro de viagem para gestante
* Como escolher seu seguro viagem gestante
* Como faço se precisar utilizar o seguro na viagem
* Como funciona o seguro viagem?
* Considerações na escolha do seguro viagem para gestantes
* Desconto no seu Seguro Viagem
* Dúvidas frequentes
* Melhor seguro viagem para gestante para América do Sul
* Melhor seguro viagem para gestante para o resto do mundo
* Melhores seguradoras
* O que é o seguro viagem para gestante?
* O que os planos de seguro viagem para gestante cobrem?
* O seguro viagem na gravidez vale a pena?
* Onde contratar seu seguro viagem para grávida
* Para quais destinos preciso do seguro viagem gestante?
* Perguntas frequentes sobre seguro viagem para grávidas
* Por que contratar um seguro viagem para gestante?
* Quais são as coberturas de um seguro viagem para grávidas?
* Quais são as limitações do seguro viagem para gestante?
* Quais os melhores seguros viagem para gestantes?
* Qual o melhor seguro viagem para gestante para Estados Unidos ou Canadá?
* Qual o melhor seguro viagem para gestante para Europa?
* Qual o melhor seguro viagem para grávidas?
* Qual seguro viagem escolher para gestante?
* Quanto custa um seguro viagem para gestante?
* Recomendação do Seguro Viagem Pro
* Seguro viagem de cartão de crédito cobre gestante?
* Seguro viagem gestante 2024: qual é o melhor? Quanto custa?
* Tipos de seguro viagem

---

### PROMPT 4

Você é um especialista em marketing de conteúdo e copywriting. Tenho uma lista de tópicos que quero usar em um artigo, mas preciso que você organize a ordem deles para criar a sequência mais lógica, fluida e envolvente possível.

Regras importantes:

- O objetivo é criar um fluxo que capture a atenção do leitor, mantenha o interesse e conduza de forma natural até a conclusão.

-Não é necessário usar todos os tópicos se incluí-los prejudicar a fluidez do artigo.

- Você pode acrescentar novos tópicos se achar que isso melhora a sequência ou mantém o fluxo lógico.

Explique brevemente por que cada grupo de tópicos foi colocado naquela posição.

Organize-os de forma estraté

**Aqui está a lista de tópicos:**

* Viajar durante a gravidez: é seguro? Cuidados essenciais
* Passo a passo para acionar o seguro viagem para gestantes
* Dicas para comparar planos de seguro viagem antes de viajar
* Como contratar um seguro de viagem pensado para gestantes
* Orientações para escolher o seguro viagem ideal para grávidas
* O que fazer se precisar usar o seguro durante a viagem
* Entenda o funcionamento do seguro viagem
* Fatores importantes ao selecionar seguro viagem para gestantes
* Como conseguir desconto no seu seguro viagem
* Perguntas comuns sobre seguro viagem para grávidas
* Melhor seguro viagem para gestantes na América do Sul
* Melhor seguro viagem para gestantes em destinos internacionais
* As principais seguradoras recomendadas para gestantes
* Seguro viagem para grávidas: o que você precisa saber
* O que os planos de seguro viagem para gestantes realmente cobrem
* Vale a pena contratar seguro viagem durante a gravidez?
* Onde encontrar e contratar seguro viagem para gestantes
* Destinos em que o seguro viagem para gestantes é indispensável
* Perguntas frequentes sobre seguro viagem para grávidas
* Por que gestantes devem contratar um seguro viagem
* Coberturas essenciais de um seguro viagem para grávidas
* Limitações que você precisa conhecer no seguro viagem para gestantes
* Principais opções de seguros viagem para gestantes
* Melhor seguro viagem para gestantes nos Estados Unidos e Canadá
* Melhor seguro viagem para gestantes na Europa
* Seguro viagem ideal para mulheres grávidas
* Como escolher o seguro viagem certo para gestantes
* Preço médio de um seguro viagem para gestantes
* Indicação do Seguro Viagem Pro para gestantes
* Cartão de crédito oferece cobertura de seguro viagem para gestantes?
* Seguro viagem gestante 2024: guia de melhores opções e valores
* Tipos de seguro viagem e suas diferenças

---

### PROMPT 5 (ITERATE)

Você é um especialista em marketing de conteúdo e copywriting. Elabore um ou dois parágrafos informativos sobre o seguinte tópico que eu vou fornecer, utilizando estatísticas recentes, informações de blogs especializados e sites de negócios na área de seguros. Requisitos adicionais:

O conteúdo precisa ser original e parafraseado, garantindo que não fique idêntico a nenhuma fonte usada.

Cada parágrafo deve ser claro, baseado em evidências e acessível ao público-alvo.

Inclua exemplos, dados relevantes e recomendações práticas sempre que possível.

Não inclua referências ou fontes no resultado final, pois o objetivo é que o conteúdo pareça original e não derivado de outras fontes.

**Atenção**: Não incluir as referências!!!

Tópico:

```markdown
### **1. Introdução – Contextualização**

**Objetivo:** Capturar atenção mostrando a relevância do tema para grávidas que desejam viajar.

* **Viajar durante a gravidez: é seguro? Cuidados essenciais** → Começa com a pergunta que muitas gestantes têm, gerando interesse imediato.
* **Vale a pena contratar seguro viagem durante a gravidez?** → Complementa o questionamento inicial e introduz o tema do seguro viagem.
* **Por que gestantes devem contratar um seguro viagem** → Reforça a necessidade e cria urgência.
```

### PROMPT 6

Você é um blogueiro profissional, exímio curador e escritor de conteúdo com profundo conhecimento em técnicas de SEO, marketing de conteúdo e engajamento online. Sua missão é transformar os tópicos e conteúdos que eu fornecer em um **artigo completo, impactante e envolvente**, estruturado em **Markdown**, pronto para publicação em blog.

**Regras e diretrizes para produção do artigo:**

1. **Título e subtítulos:** Crie um título chamativo e envolvente, seguido de subtítulos claros (H2 e H3) que organizem o conteúdo de forma lógica.
2. **Introdução:** A introdução deve prender a atenção do leitor imediatamente, contextualizando o tema e destacando a relevância do conteúdo.
3. **SEO:** Inclua palavras-chave de forma natural ao longo do texto, otimize headings, utilize meta-descrições, bullet points, listas numeradas e links internos e externos quando pertinente.
4. **Tom e estilo:** Use um tom profissional, porém próximo e conversacional; varie frases curtas e longas para manter o ritmo; inclua exemplos e dados sempre que possível.
5. **Engajamento:** Insira chamadas à ação estratégicas, perguntas retóricas e convites à interação.
6. **Imagens estratégicas:** Sugira imagens usando a tag `[INSERIR IMAGE: descrição da imagem]` em locais estratégicos que aumentem a beleza do artigo e o engajamento do leitor.
7. **Conclusão:** Conclua reforçando os principais pontos e incentivando o leitor a continuar interagindo, seja compartilhando, comentando ou explorando outros conteúdos do blog.
8. **Markdown:** Utilize Markdown corretamente para títulos, subtítulos, listas, negrito, itálico, links, citações e códigos quando relevante.

No final, garanta que o artigo seja **coeso, fluido, visualmente agradável** e otimizado tanto para leitores quanto para motores de busca.

**Atenção:** Todos os tópicos e conteúdos necessários para a produção serão fornecidos por mim abaixo. Utilize esses materiais, pois já foram cuidadosamente selecionados, mas sinta-se à vontade para acrescentar informações complementares quando necessário, a fim de tornar o artigo completo e coeso. Estruture o texto com base nesses conteúdos e siga rigorosamente as diretrizes mencionadas acima.

**Tópicos e conteúdos:**




Este é o meu artigo, pesquise e faça um faq bem completo de perguntas e respostas de duvidas que nao foram abordadas no artigo:




Convert this faq to this json format:
[
    {
        question: '...',
        answer: '...',
    },
]


https://www.quora.com/search?q=insurance%20travel%20pregnance&type=question
https://www.quora.com/unanswered/Do-you-need-travel-insurance-for-pregnancy-if-travelling-abroad-USA

https://www.reddit.com/r/travel/comments/1nx2ggp/insurance_for_international_travel_when_pregnant/https://www.reddit.com/r/travel/comments/1nx2ggp/insurance_for_international_travel_when_pregnant/









---



## New

### PROMPT #1: Criando o título

Faça uma pesquisa na web sobre o tema “Orientação para Tirar Visto - Como Passar no Consulado”.

Estude os principais artigos e páginas que aparecem na primeira página do Google.

Analise os padrões dos títulos encontrados (tom, estilo, estrutura, palavras-chave e foco de conteúdo).

Em seguida, parafraseie o tema original e crie 1 novo título origian, que seja:

Claro, chamativo e relevante;

Otimizado para SEO;

Distinto dos títulos pesquisados e do próprio título que lhe foi passado (sem copiar estilo ou estrutura);

Totalmente coerente com o tema “orientação para tirar visto” e “como passar no consulado”.

### PROMPT #1-b: Criando meta title e meta description

Agora adapte esse título em variações para meta title (≤60 caracteres) e meta description (140–160 caracteres) otimizadas para SEO. Quer que eu faça isso agora?

### PROMPT #1-c: Extraindo o resultado em um formato

Você é um assistente de SEO especializado em criação de metadados otimizados para mecanismos de busca e alta taxa de cliques (CTR).

Com base no título que você criou, **gere um bloco JSON contendo os seguintes campos SEO**:

* `title`: o novo título criado, claro e atrativo;
* `metaTitle`: uma versão otimizada para SEO (até 60 caracteres), com foco em palavras-chave principais;
* `metaDesc`: uma meta description envolvente (até 155 caracteres), que incentive o clique;
* `slug`: a URL amigável derivada do título, em letras minúsculas e com hífens.

**Formato de rxsposta obrigatório (não adicione explicações ou texto fora do JSON):**

**Regras:**

* Retorne **apenas o JSON válido**, sem comentários ou texto adicional.
* Não inclua aspas duplas fora do JSON.
* Use português natural e humano.
* O JSON deve estar **sempre nesse formato exato**:


```json
{
  "seoData": {
    "title": "Novo título aqui...",
    "metaTitle": "Meta title otimizado aqui...",
    "metaDesc": "Meta description atraente e informativa aqui...",
    "slug": "url-amigavel-aqui"
  }
}
```












## 🧩 ESTRUTURA DE PROMPTS EM ETAPAS

### **1️⃣ Prompt de Contexto e Diretriz Geral**

👉 Objetivo: definir o *tema*, o *público*, o *tom de voz* e o *objetivo do artigo*.
**Exemplo:**

> Quero criar um artigo completo sobre **[tema]**.
> O público são **[perfil do público]**.
> O objetivo é **[ensinar, convencer, inspirar, vender, etc.]**.
> Use um tom de voz **[ex: profissional, inspirador, informal, técnico]** e adote uma estrutura SEO-friendly.
> Gere um **resumo do que o artigo deve abordar** e uma **estrutura de tópicos sugerida (H1, H2, H3)**.

💡 *Resultado esperado*: uma estrutura clara de tópicos, com breve descrição de cada parte.

---

### **2️⃣ Prompt de Expansão de Tópicos**

👉 Objetivo: aprofundar cada seção com conteúdo rico, dados e exemplos.

**Exemplo:**

> Expanda o tópico **[coloque aqui o título do tópico]** com:
>
> * Uma introdução envolvente
> * 2 a 3 parágrafos de explicação aprofundada
> * Exemplos práticos e analogias
> * Se possível, dados ou referências atuais (até 2025)
> * Um parágrafo de fechamento que prepare para o próximo tópico

💡 *Resultado esperado*: cada seção com corpo textual denso e natural, sem parecer gerado por IA.

---

### **3️⃣ Prompt de Transição e Coesão**

👉 Objetivo: melhorar o fluxo entre seções.

**Exemplo:**

> Analise o texto abaixo e sugira **melhores transições** entre os parágrafos e seções para deixá-lo mais fluido e natural.
> Também verifique se há **repetições** e **inconsistências de tom**.
> Texto:
> [cole aqui o artigo ou parte dele]

💡 *Resultado esperado*: um texto com ritmo e leitura agradável.

---

### **4️⃣ Prompt de Revisão Estilística e SEO**

👉 Objetivo: refinar o artigo para publicação.

**Exemplo:**

> Revise o texto a seguir para:
>
> * Clareza e legibilidade
> * Otimização SEO (palavras-chave, headings, meta descrição, intertítulos)
> * Tom consistente com o público e o objetivo definidos
> * Substitua clichês por frases mais naturais
> * Sinalize pontos que poderiam ser fortalecidos com dados ou citações

💡 *Resultado esperado*: versão final pronta para blog, LinkedIn ou Medium.

---

### **5️⃣ Prompt de Título e Chamadas**

👉 Objetivo: gerar títulos e descrições atraentes.

**Exemplo:**

> Gere **5 opções de títulos** para este artigo que:
>
> * Sejam cativantes e claros
> * Tenham até 60 caracteres
> * Contenham a palavra-chave principal
> * Transmitam benefício ou curiosidade
>
> Em seguida, gere **3 opções de meta descrição (até 155 caracteres)**.

---

## 🧠 DICA EXTRA — Prompt Mestre (se quiser condensar tudo)

> Quero que você me ajude a criar um artigo top-notch sobre **[tema]**.
> Siga este fluxo:
>
> 1. Crie uma estrutura de tópicos lógica e atrativa
> 2. Expanda cada tópico com profundidade, exemplos e fluidez
> 3. Garanta transições suaves e coesão geral
> 4. Otimize para SEO
> 5. Finalize com sugestões de título e meta descrição

---

Se quiser, posso te ajudar a montar um **template dinâmico** (em Markdown ou Notion) para gerar esses prompts automaticamente, bastando trocar o tema e o público.
Quer que eu monte isso pra você?
