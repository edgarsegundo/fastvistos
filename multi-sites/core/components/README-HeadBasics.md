# HeadBasics Component

Componente que centraliza os elementos essenciais do `<head>` que devem aparecer primeiro em qualquer página HTML.

## 🎯 **Propósito**

Agrupa os elementos básicos e críticos que:
1. **Devem aparecer primeiro** no `<head>` para compatibilidade máxima
2. **São comuns a todos os layouts** (Blog, Home, etc.)
3. **São essenciais para o funcionamento** básico da página

## 📋 **Elementos Incluídos**

### ✅ **Elementos Críticos:**
- `<meta charset="UTF-8" />` - Codificação de caracteres (DEVE ser primeiro)
- `<meta name="viewport" />` - Configuração responsiva
- `<link rel="icon" />` - Favicon do site
- `<meta name="generator" />` - Meta tag do gerador (Astro)

### 🔧 **Props Opcionais:**
```typescript
interface Props {
    title?: string;           // Título opcional para páginas simples
    faviconPath?: string;     // Caminho customizado do favicon (padrão: "/favicon.svg")
    generator?: string;       // Conteúdo da meta tag generator
}
```

## 🚀 **Uso nos Layouts**

### `SharedBlogLayout.astro` e `SharedHomeLayout.astro`:
```astro
<head>
    <!-- Elementos essenciais (charset, viewport, etc.) -->
    <HeadBasics generator={Astro.generator} />
    
    <!-- Analytics Scripts -->
    <AnalyticsHead siteConfig={siteConfig} />
    
    <!-- SEO Meta Tags -->
    <SEOMeta ... />
    
    <!-- Outros elementos específicos -->
</head>
```

## ✅ **Vantagens**

1. **DRY (Don't Repeat Yourself)**: Elimina duplicação entre layouts
2. **Ordem Garantida**: Assegura que elementos críticos aparecem primeiro
3. **Manutenção Centralizada**: Mudanças em um lugar só
4. **Consistência**: Mesmos elementos básicos em todos os layouts
5. **Extensibilidade**: Fácil adicionar novos elementos básicos

## 🔄 **Antes vs Depois**

### ❌ **Antes (Duplicado)**
```astro
<!-- SharedBlogLayout.astro -->
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <!-- ... resto do conteúdo -->
</head>

<!-- SharedHomeLayout.astro -->
<head>
    <meta charset="UTF-8" />  <!-- Duplicado! -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />  <!-- Duplicado! -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />  <!-- Duplicado! -->
    <meta name="generator" content={Astro.generator} />  <!-- Duplicado! -->
    <!-- ... resto do conteúdo -->
</head>
```

### ✅ **Depois (Centralizado)**
```astro
<!-- Ambos os layouts -->
<head>
    <HeadBasics generator={Astro.generator} />
    <!-- ... resto do conteúdo específico -->
</head>
```

## 🎯 **Futuras Extensões**

Pode ser facilmente estendido para incluir:
- Preconnects essenciais
- Meta tags de segurança
- Progressive Web App manifests
- Outras configurações fundamentais

## 📦 **Sincronização Automática**

O componente é automaticamente copiado para todos os sites via `sync-blog.js` - nenhuma configuração adicional necessária! 🎉
