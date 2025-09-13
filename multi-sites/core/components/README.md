# SEO Meta Components

This directory contains modular SEO meta components that integrate with the site-config system.

## Components

### 1. **OpenGraph.astro**

Handles Facebook Open Graph meta tags.

```astro
---
import OpenGraph from '../core/components/OpenGraph.astro';
---

<OpenGraph 
    title="Page Title"
    description="Page description"
    url="https://example.com/page"
    image="https://example.com/image.jpg"
    siteName="Site Name"
    type="website"
    locale="pt_BR"
/>
```

### 2. **TwitterCard.astro**

Handles Twitter Card meta tags.

```astro
---
import TwitterCard from '../core/components/TwitterCard.astro';
---

<TwitterCard 
    title="Page Title"
    description="Page description"
    image="https://example.com/image.jpg"
    url="https://example.com/page"
    site="@sitehandle"
    card="summary_large_image"
/>
```

### 3. **SEOMeta.astro** (Recommended)

Complete SEO solution that uses site-config and includes both OpenGraph and TwitterCard.

```astro
---
import SEOMeta from '../core/components/SEOMeta.astro';
import { SiteConfigHelper } from '../core/lib/site-config-helper.ts';

const siteConfig = await SiteConfigHelper.loadSiteConfig();
---

<SEOMeta 
    siteConfig={siteConfig}
    title="Custom Page Title"
    description="Custom page description"
    pageUrl={Astro.url.href}
    ogImage="/custom-image.jpg"
    noIndex={false}
    canonical="https://example.com/canonical-url"
/>
```

## Integration with Site Config

All meta components now pull their default values from `site-config.ts`:

- **Title**: Falls back to `siteConfig.seo.title`
- **Description**: Falls back to `siteConfig.seo.description`
- **Image**: Falls back to `siteConfig.seo.ogImage`
- **Site Name**: Uses `siteConfig.name`
- **Domain**: Uses `siteConfig.domain`
- **Colors**: Uses `siteConfig.primaryColor` for theme color
- **Social Links**: Uses `siteConfig.socialMedia.*`

## Usage in Layouts

The `SharedHomeLayout.astro` now uses `SEOMeta` component:

```astro
---
import { SiteConfigHelper } from '../lib/site-config-helper.ts';
const siteConfig = await SiteConfigHelper.loadSiteConfig();
---

<html>
<head>
    <SEOMeta 
        siteConfig={siteConfig}
        title={title}
        description={description}
        pageUrl={pageUrl}
        ogImage={ogImage}
    />
</head>
```

## Benefits

✅ **Centralized**: All meta configuration in site-config.ts  
✅ **Modular**: Use individual components or complete SEOMeta  
✅ **Dynamic**: Automatically loads correct site config based on SITE_ID  
✅ **Fallbacks**: Page-specific values override site defaults  
✅ **Type Safe**: Full TypeScript support with proper interfaces  
✅ **Consistent**: Same SEO structure across all sites  

## Migration

Old manual meta tags:

```astro
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
```

New component approach:

```astro
<SEOMeta siteConfig={siteConfig} title={title} description={description} />
```
