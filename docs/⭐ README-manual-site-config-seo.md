# Manual: Como Configurar o `site-config.ts` para SEO

> Este guia é um passo a passo para configurar um novo site na plataforma multi-site.
> Cada campo é explicado com sua função técnica e sua importância para SEO.

---

## O que é o `site-config.ts`?

O arquivo `site-config.ts` é a **fonte central de verdade** de um site.
Ele alimenta todos os componentes automaticamente: meta tags, Open Graph, Twitter Cards, Schema.org (JSON-LD), sitemap, e outros.

Editar este arquivo corretamente é o ato mais importante de SEO técnico em um novo site.
Tudo o que o Google, o Bing, e os sistemas de IA (ChatGPT, Perplexity, Gemini) usam para entender quem é o site vem daqui.

---

## Passo a Passo

### 1. `site.business_id`

```ts
business_id: '47f72bb76ec74a078337e38f54ebc213',
```

**O que é:** Identificador único do negócio no banco de dados da plataforma. Gerado automaticamente ao criar o site com `node create-site.js`.

**Importância para SEO:** Nenhuma direta. É usado internamente para filtrar artigos do blog por negócio. Não altere após a criação.

---

### 2. `site.id`

```ts
id: 'emprego',
```

**O que é:** O identificador do site dentro da plataforma. Deve ser idêntico ao nome da pasta em `multi-sites/sites/`.

**Importância para SEO:** Nenhuma direta. Usado pelos scripts de build e sync.

---

### 3. `site.siteName`

```ts
siteName: 'Emprego Aqui',
```

**O que é:** O nome público do site, como aparece para os usuários.

**Importância para SEO:** Alta. Este valor é usado em:
- `og:site_name` (Open Graph)
- O campo `name` do Schema.org `WebSite` e `Organization`
- Título das abas do navegador como sufixo

Escreva o nome exatamente como você quer que apareça no Google, nas redes sociais e nos resultados de IA.

---

### 4. `site.locale`

```ts
locale: 'pt-BR',
```

**O que é:** O idioma e região do site no padrão IETF (idioma-PAÍS).

**Importância para SEO:** Alta. Usado em:
- `og:locale` — indica ao Facebook/LinkedIn o idioma do conteúdo
- `inLanguage` no Schema.org — indica ao Google o idioma das entidades
- Atributo `lang` da tag `<html>` — usado por leitores de tela e mecanismos de busca

Valores comuns: `pt-BR` (português do Brasil), `en-US`, `es-ES`.

---

### 5. `site.domain` e `site.canonical`

```ts
domain: 'empregoaqui.com.br',
canonical: 'https://empregoaqui.com.br/',
```

**O que é:** O domínio do site e sua URL canônica completa (sempre com `https://` e com barra no final).

**Importância para SEO:** Crítica. A URL canônica é a referência que o Google usa para:
- Evitar conteúdo duplicado
- Consolidar sinais de PageRank
- Definir qual versão do site é a "oficial"

**Regras:**
- Sempre use `https://`
- Sempre termine com `/`
- Use o domínio principal sem `www` (ou com, desde que seja consistente com o DNS)

---

### 6. `site.authorName`

```ts
authorName: 'Edgar Rezende',
```

**O que é:** Nome do autor ou responsável pelo site.

**Importância para SEO:** Média. Aparece na meta tag `author` e nos artigos do blog. Contribui para o conceito de **E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness) do Google, especialmente em nichos que exigem autoridade (saúde, finanças, direito).

---

### 7. `site.primaryImage`

```ts
primaryImage: {
    url: 'https://empregoaqui.com.br/assets/images/ld-json/primary-image/home-page-main-image-emprego.webp',
    width: 1200,
    height: 630,
    type: 'image/webp',
    alt: 'Emprego Aqui — Conexão direta entre pequenos empresários e candidatos disponíveis para trabalhar agora'
},
```

**O que é:** A imagem principal do site, usada como preview em compartilhamentos.

**Importância para SEO:** Alta. Esta imagem aparece:
- Quando o site é compartilhado no WhatsApp, Facebook, LinkedIn, Twitter/X
- No Schema.org como `primaryImageOfPage` e `ImageObject`
- Nos resultados enriquecidos do Google (quando aplicável)

**Regras:**
- Dimensão ideal: **1200×630px** (proporção 1.91:1)
- Formato: `webp` para melhor performance
- O campo `alt` deve descrever a imagem E o negócio — é lido pelo Google e por leitores de tela
- Use o caminho padrão `/assets/images/ld-json/primary-image/` para organização

---

### 8. `site.logo`

```ts
logo: {
    url: 'https://empregoaqui.com.br/assets/images/ld-json/logo/logo-emprego-aqui.png',
    alt: 'Emprego Aqui — Conexão direta entre pequenos empresários e candidatos...',
    width: 300,
    height: 60,
},
```

**O que é:** O logotipo do site/empresa.

**Importância para SEO:** Alta. O Google usa a logo definida no Schema.org para:
- Exibir no **Knowledge Panel** da empresa no Google Search
- Identificar visualmente a marca nos resultados
- Associar a marca a sua entidade no grafo de conhecimento do Google

**Regras:**
- Use `.png` (fundo transparente) ou `.webp`
- Informe `width` e `height` corretamente — o Google valida isso
- Use o caminho padrão `/assets/images/ld-json/logo/`

---

### 9. `site.primaryColor` e `site.secondaryColor`

```ts
primaryColor: '#0070f3',
secondaryColor: '#1c1c1e',
```

**O que é:** As cores principais da identidade visual.

**Importância para SEO:** Baixa diretamente, mas `primaryColor` alimenta o `theme-color` das meta tags, que define a cor da barra do navegador em mobile — impacta a experiência do usuário.

---

### 10. `site.thumbnailUrl`

```ts
thumbnailUrl: 'https://empregoaqui.com.br/assets/images/ld-json/primary-image/home-page-main-image-emprego.webp',
```

**O que é:** URL da miniatura do site. Normalmente o mesmo valor de `primaryImage.url`.

**Importância para SEO:** Média. Usada em contextos de preview e feeds de conteúdo.

---

### 11. `site.assetsUrlBase`

```ts
assetsUrlBase: 'https://empregoaqui.com.br/assets/images/blog/',
```

**O que é:** URL base para imagens dos artigos do blog.

**Importância para SEO:** Técnica. Os artigos do blog referenciam imagens com caminhos relativos; este prefixo garante que as URLs absolutas sejam geradas corretamente para o Schema.org e Open Graph dos posts.

---

### 12. `site.priceRange`

```ts
priceRange: 'R$',
```

**O que é:** Faixa de preço do serviço no padrão Schema.org `LocalBusiness`.

**Importância para SEO:** Baixa. Aparece nos resultados enriquecidos de negócios locais. O valor deve seguir a convenção de símbolos: `R$`, `R$R$`, `R$R$R$` — **não use valores numéricos** como `R$ 9,99`, pois quebra a semântica.

> ⚠️ Só é incluído no Schema quando o negócio está configurado como `LocalBusiness`. Negócios 100% online devem usar `disableLocalBusiness={true}` no componente JsonLd.

---

### 13. `site.openingHoursSpecification`

```ts
openingHoursSpecification: [
    {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        "opens": "09:00",
        "closes": "18:00"
    },
    {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "13:00"
    }
],
```

**O que é:** Horário de funcionamento em formato Schema.org.

**Importância para SEO:** Média para negócios locais. O Google exibe os horários diretamente nos resultados de busca e no Google Maps. Use `openingHoursSpecification` (formato estruturado) — nunca combine com `openingHours` (formato legado).

> ⚠️ Só relevante se o negócio tiver atendimento presencial ou por horário fixo.

---

### 14. `site.sameAs`

```ts
sameAs: [
    'https://www.facebook.com/empregoaqui/',
    'https://x.com/EmpregoAqui',
    'https://www.instagram.com/empregoaqui/',
    'https://www.youtube.com/@EmpregoAqui',
],
```

**O que é:** Lista de URLs de perfis oficiais do negócio nas redes sociais.

**Importância para SEO:** Alta. O `sameAs` é um dos sinais mais importantes para o Google construir o **Knowledge Panel** de uma marca. Ele conecta a entidade `Organization` no Schema.org às suas representações externas, aumentando a confiança e a autoridade da marca no grafo de conhecimento do Google.

**Regras:**
- Use apenas URLs de perfis que você realmente controla
- Inclua todas as redes onde o negócio tem presença ativa
- Use a URL canônica de cada perfil (sem parâmetros, sem `?`, sem redirecionamentos)

---

### 15. `site.geo`

```ts
geo: {
    latitude: -22.8807734,
    longitude: -47.0596895,
},
```

**O que é:** Coordenadas geográficas do negócio.

**Importância para SEO:** Alta para negócios locais. O Google usa as coordenadas para:
- Exibir o pin no Google Maps
- Posicionar o negócio em buscas com intenção local ("perto de mim", "em Campinas")
- Calcular proximidade para resultados do Google Business Profile

> ⚠️ Só incluído no Schema quando `disableLocalBusiness={false}`.

---

### 16. `site.serviceArea`

```ts
serviceArea: {
    name: 'Brazil',
},
```

**O que é:** A área geográfica de atendimento do negócio.

**Importância para SEO:** Média. Informa ao Google o alcance do serviço. Use `'Brazil'` para negócios nacionais online; use o nome da cidade para negócios locais (`'Campinas'`, `'São Paulo'`).

---

### 17. `site.aggregateRating`

```ts
aggregateRating: {
    ratingValue: 5,
    reviewCount: 277,
},
```

**O que é:** A avaliação média do negócio com base em avaliações reais.

**Importância para SEO:** Alta — mas **perigosa se mal usada**. O Google pode exibir estrelas nos resultados de busca (rich snippets), o que aumenta o CTR (taxa de cliques) significativamente.

**Regras críticas:**
- Os valores devem refletir avaliações **reais e verificáveis** (Google Business Profile, por exemplo)
- Se `reviews: []` estiver vazio, o componente **não deve incluir** `aggregateRating` no Schema — o Google penaliza ratings sem reviews correspondentes
- Nunca invente ou infle números de avaliações

---

### 18. `site.reviews`

```ts
reviews: [],
```

**O que é:** Lista de avaliações individuais para compor o `AggregateRating`.

**Importância para SEO:** Alta quando preenchido. Cada review no Schema.org pode gerar rich snippets nos resultados. Se o array estiver vazio, o `aggregateRating` não é gerado automaticamente pelo componente.

---

### 19. `site.makesOffer`

```ts
makesOffer: [
    {
        service: 'Conexão Direta entre Pequenas Empresas e Candidatos Disponíveis',
        priceCurrency: 'BRL',
    },
    // ...
],
```

**O que é:** Lista de serviços ou produtos oferecidos pelo negócio.

**Importância para SEO:** Média. Aparece no Schema.org como `Offer > Service`, ajudando o Google a entender **o que** o negócio faz. Quanto mais específico, melhor — evite descrições genéricas como "Serviços de qualidade".

---

### 20. `site.address`

```ts
address: {
    streetAddress: 'Av. Júlio Diniz, 257',
    addressLocality: 'Taquaral, Campinas',
    addressRegion: 'SP',
    postalCode: '13075-420',
    addressCountry: 'BR',
},
```

**O que é:** Endereço físico do negócio em formato Schema.org `PostalAddress`.

**Importância para SEO:** Alta para negócios locais. O Google usa o endereço para:
- Confirmar a consistência com o Google Business Profile (NAP: Name, Address, Phone)
- Posicionar o negócio em buscas locais
- Exibir o endereço nos resultados enriquecidos

**NAP Consistency:** O nome, endereço e telefone no `site-config.ts` devem ser **idênticos** ao que está no Google Business Profile, Bing Places, e demais diretórios. Qualquer divergência enfraquece os sinais locais.

> ⚠️ Só incluído no Schema quando `disableLocalBusiness={false}`.

---

### 21. `site.contactPoint`

```ts
contactPoint: {
    telephone: '+551920422785',
    telephoneFormatted: '+55 (19) 2042-2785',
    contactType: 'customer service',
    areaServed: {
        "@type": "Country",
        "name": "Brazil"
    },
    availableLanguage: ["pt-BR"],
    email: 'contato@empregoaqui.com.br',
},
```

**O que é:** Ponto de contato principal do negócio.

**Importância para SEO:** Alta. O Schema.org `ContactPoint` permite que o Google exiba o telefone e e-mail diretamente nos resultados de busca para a marca. O campo `contactType` deve ser um valor reconhecido: `'customer service'`, `'sales'`, `'technical support'`.

**Regra do telefone:** Use o formato E.164 (`+55...`) no campo `telephone` — é o padrão internacional reconhecido pelo Schema.org.

---

### 22. `site.whatsapp`

```ts
whatsapp: {
    telephone: '+551920422785',
    telephoneFormatted: '+55 (19) 2042-2785',
    contactType: 'customer support',
    contactOption: "WhatsApp",
    url: 'https://wa.me/551920422785',
    areaServed: { "@type": "Country", "name": "Brazil" },
    availableLanguage: ["pt-BR"],
    email: 'contato@empregoaqui.com.br',
},
```

**O que é:** Contato via WhatsApp, declarado como um `ContactPoint` separado no Schema.org.

**Importância para SEO:** Média. Permite que o Google identifique o WhatsApp como canal oficial de atendimento. Em contextos de IA e buscas conversacionais, ter o canal explícito no Schema aumenta a chance de ser citado como opção de contato.

---

### 23. `organization`

```ts
organization: {
    id: 'https://empregoaqui.com.br/#organization',
    name: 'Emprego Aqui',
    url: 'https://empregoaqui.com.br',
    canonical: 'https://empregoaqui.com.br/',
    logo: {
        url: '...',
        alt: '...',
        width: 300,
        height: 60,
    },
},
```

**O que é:** Dados da organização/empresa que opera o site (pode ser diferente do site em si, como em casos onde uma empresa opera múltiplos sites).

**Importância para SEO:** Alta. O bloco `organization` gera a entidade `Organization` no Schema.org, que é a âncora do grafo de conhecimento da marca. Todos os outros elementos (WebSite, WebPage, ImageObject) se conectam a esta entidade via `@id`.

**Quando `organization` é diferente de `site`:** Um exemplo é o `centraldevistos.com`, operado pela empresa `Fast Vistos`. O `site.siteName` é "Central de Vistos", mas `organization.name` é "Fast Vistos". Isso permite ao Google entender a relação entre os dois.

---

### 24. `homePageConfig.seo`

```ts
homePageConfig: {
    seo: {
        title: 'Emprego Aqui — Precisa Contratar pra Ontem? Fale Direto com Quem Quer Trabalhar',
        description: 'Sem currículo. Sem anúncio. Sem enrolação. O Emprego Aqui conecta pequenos empresários...',
        themeColor: '#0070f3',
        openGraph: {
            type: 'website',
            image: { url: '...', width: 1200, height: 630, type: 'image/webp', alt: '...' },
            title: 'Emprego Aqui — Quando é pra agora.',
            description: 'Você não publica vaga. Você vê pessoas disponíveis agora...',
        }
    },
},
```

**O que é:** Configurações de SEO específicas da página inicial.

#### `title`

**Importância para SEO:** Crítica. O `<title>` é o fator on-page mais importante. Aparece:
- Na aba do navegador
- No resultado da busca (azul, clicável)
- No compartilhamento em redes sociais (como fallback)

**Regras:**
- Entre 50 e 60 caracteres para não ser cortado no Google
- Coloque a palavra-chave principal no início
- Inclua o nome do site
- Escreva para o usuário, não para o robô

#### `description`

**Importância para SEO:** Média (não é fator de ranking direto, mas impacta o CTR). Aparece como o texto cinza abaixo do título nos resultados do Google.

**Regras:**
- Entre 120 e 155 caracteres
- Deve resumir o valor do site em uma frase
- Inclua um verbo de ação ("encontre", "conecte", "descubra")

#### `openGraph.title` e `openGraph.description`

**Importância para SEO:** Alta para redes sociais. São os textos que aparecem quando o link é compartilhado. Podem (e devem) ser diferentes do `title` e `description` do Google — nas redes sociais, tom mais humano e direto converte melhor.

---

### 25. `blogPageConfig.seo`

```ts
blogPageConfig: {
    seo: {
        title: 'Blog | Vagas, Currículo, Entrevista e Carreira | Emprego Aqui',
        description: 'Dicas práticas para pequenos empresários contratarem rápido...',
        themeColor: '#0070f3',
        canonical: 'https://empregoaqui.com.br/',
        openGraph: {
            type: 'website',
            tags: ['contratar funcionário rápido', 'pequeno empresário contratar', ...],
        }
    },
    pagination: { postsPerPage: 10 },
},
```

**O que é:** Configurações de SEO para a página de listagem do blog.

**Sobre `canonical` no blog:** Em alguns casos, a página do blog aponta para a homepage como canônica — isso é uma decisão de arquitetura de SEO. Se o blog for uma seção importante do site, use a URL própria do blog como canônica (`https://empregoaqui.com.br/blog/`).

**Sobre as `tags`:** As tags do Open Graph ajudam plataformas sociais a categorizar o conteúdo. Use os termos que melhor descrevem os temas do blog.

---

### 26. `blogPostConfig.seo`

```ts
blogPostConfig: {
    seo: {
        themeColor: '#0070f3',
        openGraph: {
            type: 'article',
            author: 'Emprego Aqui',
            section: 'Contratação Rápida, Pequenos Negócios e Mercado de Trabalho Real',
            tags: ['contratar funcionário rápido', ...],
        }
    },
    readingTime: true,
    showAuthor: true,
    relatedPosts: true,
},
```

**O que é:** Configurações padrão para os artigos individuais do blog.

**`openGraph.type: 'article'`:** Para posts de blog, o tipo correto é `'article'` — não `'website'`. Isso ativa campos específicos no Open Graph: `author`, `section`, `published_time`, `tags`.

**`section`:** Descreve a categoria do artigo dentro do site. O Google usa isso para entender o contexto editorial.

**`readingTime`, `showAuthor`, `relatedPosts`:** Configurações de UX que impactam SEO indiretamente — aumentam o tempo na página e reduzem a taxa de rejeição.

---

### 27. `analytics`

```ts
analytics: {
    gtmId: 'GTM-59SRNCQD',
},
```

**O que é:** ID do Google Tag Manager para este site.

**Importância para SEO:** Alta indiretamente. O GTM carrega o Google Analytics, que alimenta o Google Search Console com dados de comportamento. Sem analytics, você não tem visibilidade sobre o que funciona.

**Como obter:** Crie uma conta no [Google Tag Manager](https://tagmanager.google.com/) e copie o ID do container (`GTM-XXXXXXX`).

---

### 28. `verification`

```ts
verification: {
    googleSiteVerification: 'oeOHclcLj3XHEl3bt5vhv3ZAGb0E3bV7o3rVAFIEz9I',
},
```

**O que é:** Código de verificação do Google Search Console.

**Importância para SEO:** Crítica. Sem verificar o domínio no Google Search Console, você não tem acesso a:
- Dados de indexação (quais páginas estão no índice do Google)
- Relatórios de performance (cliques, impressões, posição média)
- Alertas de penalidades e erros de cobertura
- Submissão de sitemap

**Como obter:** No [Google Search Console](https://search.google.com/search-console), escolha "Tag HTML" como método de verificação e copie o valor do atributo `content`.

---

### 29. `features`

```ts
features: {
    blog: true,
    booking: false,
    payments: false,
    multilingual: false,
},
```

**O que é:** Flags que ativam ou desativam funcionalidades do site.

**Importância para SEO:** Média. Ao desativar funcionalidades não usadas, você evita que o sistema gere páginas, rotas ou Schema.org desnecessários que poderiam confundir o Google ou criar conteúdo duplicado.

---

## Checklist para um Novo Site

Antes de publicar, confirme que cada item está preenchido corretamente:

- [ ] `business_id` gerado pelo `create-site.js`
- [ ] `siteName` exatamente como deve aparecer no Google
- [ ] `domain` e `canonical` com `https://` e barra final
- [ ] `primaryImage` com dimensão 1200×630 e `alt` descritivo
- [ ] `logo` com caminho correto e `width`/`height` reais
- [ ] `sameAs` com URLs de todas as redes sociais ativas
- [ ] `contactPoint.telephone` no formato E.164 (`+55...`)
- [ ] `organization` preenchido (especialmente quando a empresa é diferente do site)
- [ ] `homePageConfig.seo.title` entre 50–60 caracteres
- [ ] `homePageConfig.seo.description` entre 120–155 caracteres
- [ ] `analytics.gtmId` configurado
- [ ] `verification.googleSiteVerification` preenchido após verificar no Search Console
- [ ] `aggregateRating` preenchido **somente** se houver avaliações reais
- [ ] `priceRange` usando símbolo (`R$`, não `R$ 9,99`)
- [ ] Para negócios 100% online: usar `disableLocalBusiness={true}` no componente JsonLd

---

## Erros Comuns a Evitar

| Erro | Consequência |
|------|-------------|
| `canonical` sem barra final | Cria duplicata de URL com e sem barra |
| `aggregateRating` sem reviews reais | Penalidade do Google por dados estruturados enganosos |
| `priceRange: 'R$ 9,99'` | Schema inválido — o campo espera símbolo, não valor |
| `sameAs` com URLs de perfis que não existem | Sinal negativo de confiança para o Google |
| `title` com mais de 60 caracteres | Google corta e reescreve o título nos resultados |
| `description` com mais de 155 caracteres | Google trunca e pode reescrever a descrição |
| Misturar `Organization + LocalBusiness` em negócio online | Schema semanticamente incorreto |
| `openGraph.type: 'blog'` nos posts | Tipo inválido — use `'article'` para posts e `'website'` para listagens |
| NAP inconsistente entre site-config e Google Business Profile | Enfraquece sinais de SEO local |
