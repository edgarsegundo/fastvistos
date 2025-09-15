# Analytics Components

Este diretório contém componentes reutilizáveis para gerenciar diferentes tipos de analytics e tracking scripts.

## 📋 **Componentes Disponíveis**

### `AnalyticsHead.astro`

Componente para scripts de analytics que devem ser carregados no `<head>` da página.

**Suporte:**

- ✅ Google Tag Manager (GTM)
- ✅ Google Analytics 4 (GA4)
- ✅ Facebook Pixel

**Uso:**

```astro
---
import AnalyticsHead from '../components/AnalyticsHead.astro';
import { SiteConfigHelper } from '../lib/site-config-helper.ts';

const siteConfig = await SiteConfigHelper.loadSiteConfig();
---

<head>
    <AnalyticsHead siteConfig={siteConfig} />
</head>
```

### `AnalyticsBody.astro`

Componente para elementos analytics que devem ser carregados no `<body>` (como noscript tags).

**Suporte:**

- ✅ Google Tag Manager noscript
- ✅ Facebook Pixel noscript

**Uso:**

```astro
<body>
    <AnalyticsBody siteConfig={siteConfig} />
    <!-- resto do conteúdo -->
</body>
```

## 🔧 **Configuração**

Configure os analytics no `site-config.ts`:

```typescript
export const siteConfig: SiteConfig = {
    // ... outras configurações
    analytics: {
        gtmId: 'GTM-XXXXXXX',      // Google Tag Manager
        gtagId: 'G-XXXXXXXXXX',    // Google Analytics 4
        facebookPixelId: '123456789' // Facebook Pixel
    }
}
```

## ✨ **Vantagens da Solução**

1. **Reutilização**: Evita duplicação de código entre layouts
2. **Flexibilidade**: Suporte a múltiplas plataformas de analytics
3. **Condicional**: Só carrega scripts se configurados
4. **Manutenção**: Centralizada em componentes específicos
5. **Performance**: Scripts otimizados e carregamento assíncrono

## 🚀 **Implementação nos Layouts**

Ambos `SharedBlogLayout.astro` e `SharedHomeLayout.astro` agora usam estes componentes ao invés de código duplicado:

```astro
<!-- No head -->
<AnalyticsHead siteConfig={siteConfig} />

<!-- No body -->
<AnalyticsBody siteConfig={siteConfig} />
```

## 📈 **Futuras Extensões**

Facilmente extensível para outros analytics:
- Google Ads Conversion Tracking
- LinkedIn Insight Tag
- Twitter Pixel
- Custom analytics solutions
