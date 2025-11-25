### **Development with Auto-Sync** (Recommended)

```bash
# Start development with automatic sync on file changes
npm run dev:watch:fastvistos      # FastVistos with auto-sync
npm run dev:watch:conceptvistos   # ConceptVistos with auto-sync
npm run dev:watch:vibecode       # VibeCode with auto-sync
```

### **Regular Development**

```bash
# Start development with initial sync only
npm run dev:fastvistos           # FastVistos
npm run dev:conceptvistos        # ConceptVistos
npm run dev:vibecode            # VibeCode
```

### **Production Build**

```bash
npm run build:fastvistos         # Build FastVistos
npm run build:conceptvistos      # Build ConceptVistos
npm run build:vibecode          # Build VibeCode
npm run build:all               # Build all sites
```




## 🎯 **Current Status: FULLY WORKING**

**✅ All systems operational** - Multi-site architecture with simplified site configuration and auto-sync development:

- **✅ Simplified Site Configuration**: Clean, type-safe site configs with centralized interface and helper functions
- **✅ Auto-Sync Development**: File watcher automatically syncs shared templates when core files change
- **✅ Site-Specific Content**: Each site maintains its own markdown content in dedicated directories
- **✅ Shared Templates**: Blog templates automatically synced and localized for each site
- **✅ Content Collections**: Proper Astro content collections with schema validation
- **✅ Site-Specific Public Assets**: Independent public directories for each site
- **✅ Dynamic Styling**: Site-specific Tailwind configurations with automatic loading
- **✅ Multi-Site Blog Service**: Business-aware blog service with automatic business_id filtering
- **✅ Blog Content Generation**: Automated scripts for database-to-markdown content generation with HTML conversion




## � **Recent Updates & Improvements**

### **Latest Critical Fixes** (September 2025)

#### **Blog System Bug Fixes**

- **🐛 Fixed Server-Side Window Error**: Resolved "window is not defined" error in blog article pages
    - **Issue**: `window.location.href` and `encodeURIComponent` were being used during server-side rendering in share button functionality
    - **Solution**: Moved share button functionality to client-side script with proper browser API checks and null safety
    - **Impact**: Blog articles now load successfully without SSR errors, share functionality works properly
- **🔧 Dynamic Routing Fix**: Corrected `[...slug].astro` vs `[slug].astro` routing conflicts
    - **Issue**: Conflicting route files causing template rendering problems and 404 errors
    - **Solution**: Standardized on `[...slug].astro` for proper dynamic routing, updated sync scripts
    - **Impact**: Blog article URLs now work correctly with Astro's getStaticPaths(), no more routing conflicts

#### **Template Synchronization Improvements**

- **🔄 Auto-Sync Core Templates**: File watcher detects changes in core templates and automatically syncs to all sites
- **🔧 Sync Script Updates**: Updated `sync-blog.js` to handle `[...slug].astro` properly across all sites
- **✅ Real-Time Development**: Edit core files → instant sync → hot reload in browser

### **Blog System Enhancements** (Latest)

- **🆕 Multi-Site Blog Service**: Implemented business-aware `blog-service.ts` with automatic `business_id` filtering
- **🆕 Site Configuration Helpers**: Split `SiteConfigHelper` utilities into separate file for better organization
- **🆕 Blog Content Generation**: Two powerful scripts for database-to-markdown content automation:
    - `generate-blog-content.js` - Basic content generation with multi-site support
    - `generate-blog-advanced.js` - Advanced generation with HTML-to-Markdown conversion
- **🔧 Business ID Integration**: Proper UUID format handling and site-specific content filtering
- **✅ Tested & Working**: All scripts tested with real data (5 articles for FastVistos, proper filtering for all sites)

### **Architecture Improvements**

- **📁 SiteConfigHelper**: Extracted from site-config.ts for better modularity and reusability
- **🔍 Business ID Debugging**: Resolved UUID format issues (database format vs config format)
- **�🚀 Content Automation**: Streamlined workflow from database articles to site-specific markdown files
- **🛡️ Error Handling**: Comprehensive error handling in all content generation scripts

### **Developer Experience**

- **📖 Enhanced Documentation**: Updated README with detailed usage examples and troubleshooting
- **⚡ Script Standardization**: Consistent command-line interface across all generation scripts
- **🎯 Progress Reporting**: Clear feedback and status reporting in all automation tools
- **🔧 Help Documentation**: Built-in help commands with examples and feature descriptions



## 🔧 **Site Configuration System**

### **Simple, Type-Safe Configuration**

Each site has its own configuration file with a centralized interface:

```typescript
// multi-sites/sites/fastvistos/site-config.ts
import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
    id: 'fastvistos',
    domain: 'fastvistos.com.br',
    name: 'Fast Vistos',
    primaryColor: '#FF6B35',
    // ... site-specific data
};
```

### **Helper Functions for Common Tasks**

```typescript
// In any Astro component
import { siteConfig } from '../site-config.ts';
import { SiteConfigHelper } from '../../core/lib/site-config.ts';

// Get metadata
const metadata = SiteConfigHelper.getMetadata(siteConfig, 'Page Title');

// Get CSS variables
const cssVars = SiteConfigHelper.getCssVariables(siteConfig);

// Check features
const hasBooking = SiteConfigHelper.hasFeature(siteConfig, 'booking');

// Generate WhatsApp link
const whatsappLink = SiteConfigHelper.getWhatsAppLink(siteConfig, 'Hello!');
```

## ⚡ **Auto-Sync Development Environment**

### **Real-Time Template Synchronization**

The development environment includes a file watcher that automatically syncs shared templates when core files change:

- **Watches**: `multi-sites/core/pages/blog/**/*`, `multi-sites/core/layouts/**/*`, `multi-sites/core/components/**/*`
- **Triggers**: Automatic `sync-blog.js` execution on file changes
- **Result**: Edit core files → instant sync → hot reload in browser

### **Manual Sync Operations**

```bash
npm run sync-blog              # Manual sync all sites
npm run watch-sync            # Just run the file watcher
```


## 🏗️ Architecture Overview

This project implements a **Multi-Site Architecture** using Astro v5.13.5 with content collections, supporting multiple websites with shared templates and site-specific content.

## � **Current Status: FULLY WORKING**

**✅ All systems operational** - Multi-site architecture with content collections successfully implemented:

- **Site-Specific Content**: Each site maintains its own markdown content in dedicated directories
- **Shared Templates**: Blog templates automatically synced and localized for each site
- **Content Collections**: Proper Astro content collections with schema validation
- **Site-Specific Public Assets**: Independent public directories for each site
- **Dynamic Styling**: Site-specific Tailwind configurations with automatic loading

## 🏗️ Architecture Overview

```
fastvistos/
├── multi-sites/                    # Multi-site architecture root
│   ├── core/                      # Shared core components and services
│   │   ├── components/            # Shared JSON-LD SEO components
│   │   │   ├── JsonLdArticle.astro
│   │   │   ├── JsonLdBreadcrumb.astro
│   │   │   ├── JsonLdLocalBusiness.astro
│   │   │   ├── JsonLdOrganization.astro
│   │   │   ├── JsonLdReview.astro
│   │   │   ├── JsonLdService.astro
│   │   │   └── JsonLdWebPage.astro
│   │   ├── layouts/               # Shared layouts
│   │   │   └── SharedBlogLayout.astro
│   │   ├── lib/                   # Core business logic & configuration
│   │   │   ├── site-config.ts           # 🆕 Site config interface & helpers
│   │   │   ├── site-config-helper.ts    # 🆕 Site configuration utility functions
│   │   │   ├── blog-service.ts          # 🆕 Multi-site blog service with business_id filtering
│   │   │   └── blog-service-integration.test.js # 🆕 Blog service integration tests
│   │   └── pages/                 # Shared page templates
│   │       └── blog/              # Blog templates (synced to sites)
│   │           ├── index.astro    # Blog listing template
│   │           └── [slug].astro   # Blog article template
│   └── sites/                     # Site-specific implementations
│       ├── fastvistos/            # FastVistos site
│       │   ├── site-config.ts     # 🆕 FastVistos configuration
│       │   ├── components/        # FastVistos-specific components
│       │   ├── content/           # Site-specific content
│       │   │   ├── config.ts      # Content collection schema
│       │   │   └── blog/          # Markdown articles for FastVistos
│       │   ├── layouts/           # FastVistos BaseLayout
│       │   ├── pages/             # FastVistos pages (auto-synced from core)
│       │   └── content.config.ts  # Astro content configuration
│       ├── conceptvistos/         # ConceptVistos site
│       │   ├── site-config.ts     # 🆕 ConceptVistos configuration
│       │   ├── content/           # Site-specific content
│       │   │   ├── config.ts      # Content collection schema
│       │   │   └── blog/          # Markdown articles for ConceptVistos
│       │   └── ...                # Similar structure
│       └── vibecode/              # VibeCode site
│           ├── site-config.ts     # 🆕 VibeCode configuration
│           └── ...                # Similar structure
├── public-sites/                  # Site-specific public assets
│   ├── fastvistos/               # FastVistos assets
│   ├── conceptvistos/            # ConceptVistos assets
│   └── vibecode/                 # VibeCode assets
├── dev-with-sync.js              # 🆕 Development environment with auto-sync
├── watch-and-sync.js             # 🆕 File watcher for auto-sync
├── sync-blog.js                  # Template synchronization script
├── generate-blog-content.js      # 🆕 Basic blog content generator (database → markdown)
├── generate-blog-advanced.js     # 🆕 Advanced blog content generator with HTML conversion
└── multi-sites.config.mjs        # Astro multi-site configuration
```

│ │ ├── layouts/ # ConceptVistos BaseLayout
│ │ ├── pages/ # ConceptVistos pages
│ │ └── content.config.ts # Astro content configuration
│ └── vibecode/ # VibeCode site
│ ├── content/ # 🆕 Site-specific content
│ │ ├── config.ts # Content collection schema
│ │ └── blog/ # Markdown articles for VibeCode
│ ├── layouts/ # VibeCode BaseLayout
│ ├── pages/ # VibeCode pages
│ └── content.config.ts # Astro content configuration
├── public-sites/ # 🆕 Site-specific public assets
│ ├── fastvistos/ # FastVistos assets (favicons, images, etc.)
│ ├── conceptvistos/ # ConceptVistos assets
│ └── vibecode/ # VibeCode assets
├── sync-blog.js # 🆕 Blog template synchronization script
├── multi-sites.config.mjs # Multi-site Astro configuration
└── package.json # Project dependencies

````

## 🌐 Supported Websites

| Site | Domain | Description | Status | Content Articles |
|------|--------|-------------|--------|------------------|
| **FastVistos** | fastvistos.com.br | Assessoria para visto americano | ✅ **Working** | 3 visa articles |
| **ConceptVistos** | conceptvistos.com.br | Consultoria premium para vistos | ✅ **Working** | 3 visa articles |
| **VibeCode** | vibecode-lovable.com.br | Desenvolvimento de software | ✅ **Working** | 3 tech articles |

## 🚀 Quick Start

### Development - All Sites Working

Run a specific site in development mode using the dedicated npm scripts:

```bash
# FastVistos (blue/orange theme)
npm run dev:fastvistos

# ConceptVistos (gold/luxury theme)
npm run dev:conceptvistos

# VibeCode (tech blue/green theme)
npm run dev:vibecode
````

Each site automatically:

- ✅ Loads its own content from `multi-sites/sites/{site}/content/blog/`
- ✅ Uses site-specific Tailwind configuration and theme
- ✅ Serves assets from `public-sites/{site}/`
- ✅ Syncs shared blog templates via `sync-blog.js`
- ✅ Validates content with Astro content collections

### Build & Deploy

Each site builds independently with its own content and theme:

```bash
# Build specific sites (automatically runs sync-blog.js first)
npm run build:fastvistos    # → dist/fastvistos/ with 5 pages
npm run build:conceptvistos # → dist/conceptvistos/ with 5 pages
npm run build:vibecode      # → dist/vibecode/ with 5 pages
```

Build output structure:

```
dist/
├── fastvistos/        # FastVistos build (5 pages: home + blog + 3 articles)
├── conceptvistos/     # ConceptVistos build (5 pages: home + blog + 3 articles)
└── vibecode/          # VibeCode build (5 pages: home + blog + 3 articles)
```

## 🏛️ Core Architecture Components

### Site-Specific Tailwind Architecture

**Revolutionary Multi-Site Styling System**: Each site maintains complete design autonomy through dedicated Tailwind configurations while sharing core components.

#### Dynamic Configuration Loading

```javascript
// multi-sites.config.mjs - Automatic Tailwind config selection
const CURRENT_SITE = process.env.SITE_ID || 'fastvistos';

export default defineConfig({
    vite: {
        plugins: [
            tailwindcss({
                config: `./tailwind.${CURRENT_SITE}.config.js`,
            }),
        ],
    },
});
```

#### Site-Specific Themes

| Site              | Theme                 | Primary Colors                    | Font Family      | Design Focus                     |
| ----------------- | --------------------- | --------------------------------- | ---------------- | -------------------------------- |
| **FastVistos**    | Business/Professional | Blue (#3b95fa) + Orange (#ff6b35) | Source Sans Pro  | Visa services, trust, efficiency |
| **ConceptVistos** | Luxury/Premium        | Gold (#d4af37) + Dark (#1a1a1a)   | Playfair Display | Premium consulting, elegance     |
| **VibeCode**      | Tech/Modern           | Blue/Green/Purple tech palette    | JetBrains Mono   | Development, innovation, code    |

#### Component Inheritance Model

```astro
---
// Shared component with site-specific styling
import { getCurrentSite } from '../core/lib/site-manager.js';
const site = getCurrentSite();
---

<!-- Component automatically inherits site-specific Tailwind classes -->
<div class="bg-primary-500 text-white">
  <h1 class="font-sans">{site.name}</h1>
  <!-- FastVistos: blue bg, Source Sans Pro -->
  <!-- ConceptVistos: gold bg, Playfair Display -->
  <!-- VibeCode: tech blue bg, JetBrains Mono -->
</div>
```

### SiteManager (`multi-sites/core/lib/site-manager.ts`)

Central service that manages site configuration and context:

```typescript
import { getCurrentSite, getSiteConfig } from '../core/lib/site-manager.js';

// Get current site configuration
const site = getCurrentSite();
console.log(site.name, site.primaryColor, site.features);

// Get specific site configuration
const fastvistos = getSiteConfig('fastvistos');
```

**Key Features:**

- Automatic site detection based on `SITE_ID` environment variable
- Site-specific configurations (colors, features, contact info)
- Centralized site management
- Type-safe site configurations

### Site-Specific BaseLayouts

Each site has its own BaseLayout with unique styling and functionality:

- **FastVistos**: `/multi-sites/sites/fastvistos/layouts/BaseLayout.astro`
    - Visa-focused styling with business schema
    - Enhanced navigation with visa-specific components
    - Custom animations for visa cards and success badges

- **ConceptVistos**: `/multi-sites/sites/conceptvistos/layouts/BaseLayout.astro`
    - Premium consultancy styling with luxury design
    - Playfair Display fonts and gold accents
    - Professional service schema for high-end consulting

- **VibeCode**: `/multi-sites/sites/vibecode/layouts/BaseLayout.astro`
    - Modern tech styling with developer focus
    - JetBrains Mono fonts and code syntax highlighting
    - Organization schema with technical expertise

### Shared Blog System with Site-Specific Content

**Revolutionary Architecture**: Shared blog templates with site-specific content using Astro content collections.

```
Blog Architecture:
├── multi-sites/core/pages/blog/           # Shared templates (synced to all sites)
│   ├── index.astro                        # Blog listing template
│   └── [slug].astro                       # Article page template
├── multi-sites/sites/fastvistos/content/blog/    # FastVistos articles
│   ├── como-preparar-documentacao-visto-americano.md
│   ├── dicas-entrevista-visto-americano.md
│   └── tipos-visto-americano.md
├── multi-sites/sites/conceptvistos/content/blog/ # ConceptVistos articles
│   └── (same articles, can be customized per site)
└── multi-sites/sites/vibecode/content/blog/      # VibeCode articles
    └── (same articles, can be customized per site)
```

**Key Features:**

- ✅ **Astro Content Collections**: Proper schema validation and type safety
- ✅ **Site-Specific Content**: Each site maintains its own markdown files
- ✅ **Shared Templates**: Blog templates automatically synced via `sync-blog.js`
- ✅ **Dynamic Styling**: Templates inherit site-specific branding automatically
- ✅ **SEO Optimization**: JSON-LD structured data with site-specific information

### Blog Sync System (`sync-blog.js`)

Automated template synchronization system that keeps shared blog functionality in sync:

```javascript
// sync-blog.js - Runs before each build
syncBlogToSite(siteId) {
  // Copy and localize blog templates from core to each site
  // - Replace imports with site-specific paths
  // - Inject site-specific branding variables
  // - Update library dependencies for local usage
}
```

**What gets synced:**

- `multi-sites/core/pages/blog/index.astro` → `multi-sites/sites/{site}/pages/blog/index.astro`
- `multi-sites/core/pages/blog/[slug].astro` → `multi-sites/sites/{site}/pages/blog/[slug].astro`
- `multi-sites/core/lib/multi-blog-service.js` → `multi-sites/sites/{site}/lib/blog-service.js`

**What stays site-specific:**

- Content: `multi-sites/sites/{site}/content/blog/*.md`
- Styling: Each site's Tailwind configuration
- Public assets: `public-sites/{site}/`

### JSON-LD SEO Components (`multi-sites/core/components/`)

Shared structured data components for SEO optimization:

- `JsonLdArticle.astro` - Blog article schema
- `JsonLdLocalBusiness.astro` - Business information
- `JsonLdOrganization.astro` - Company details
- `JsonLdService.astro` - Service offerings
- `JsonLdFAQ.astro` - Frequently asked questions
- `JsonLdWebPage.astro` - Page-specific schema



## 🎨 Site Customization

### Site-Specific Tailwind Configurations

Each site has its own dedicated Tailwind CSS configuration for complete design autonomy:

```
├── tailwind.fastvistos.config.js     # FastVistos blue/orange theme
├── tailwind.conceptvistos.config.js  # ConceptVistos gold/luxury theme
└── tailwind.vibecode.config.js       # VibeCode tech blue/green theme
```

**FastVistos Theme** (`tailwind.fastvistos.config.js`):

```javascript
// Blue/orange visa service theme
colors: {
  primary: {
    500: '#3b95fa',  // Bright blue
    600: '#2575ef',  // Deeper blue
  },
  secondary: {
    500: '#ff6b35',  // Orange accent
    600: '#e85d2c',  // Darker orange
  }
},
fontFamily: {
  sans: ['Source Sans Pro', 'system-ui', 'sans-serif'],
}
```

**ConceptVistos Theme** (`tailwind.conceptvistos.config.js`):

```javascript
// Gold/luxury premium theme
colors: {
  primary: {
    500: '#d4af37',  // Luxury gold
    600: '#b8941f',  // Deeper gold
  },
  secondary: {
    500: '#1a1a1a',  // Premium dark
    600: '#000000',  // Pure black
  }
},
fontFamily: {
  sans: ['Playfair Display', 'serif'],
}
```

**VibeCode Theme** (`tailwind.vibecode.config.js`):

```javascript
// Tech blue/green/purple theme
colors: {
  primary: {
    500: '#3b82f6',  // Tech blue
    600: '#2563eb',  // Deeper blue
  },
  secondary: {
    500: '#10b981',  // Tech green
    600: '#059669',  // Deeper green
  },
  accent: {
    500: '#8b5cf6',  // Purple accent
  }
},
fontFamily: {
  mono: ['JetBrains Mono', 'monospace'],
}
```

### Dynamic Tailwind Loading

The build system automatically loads the correct Tailwind config based on `SITE_ID`:

```javascript
// multi-sites.config.mjs
plugins: [
    tailwindcss({
        config: `./tailwind.${process.env.SITE_ID || 'fastvistos'}.config.js`,
    }),
];
```

### Site-Specific Public Assets

Each site has its own public folder with independent assets:

```
public-sites/
├── fastvistos/        # FastVistos assets (favicons, images, etc.)
├── conceptvistos/     # ConceptVistos assets
└── vibecode/          # VibeCode assets
```

- Centralized site management
- Type-safe site configurations

### MultiBlogService (`multi-sites/core/lib/multi-blog-service.ts`)

Site-aware blog service that filters content by current site:

```typescript
import { getPublishedArticles, getTopicsWithArticles } from '../core/lib/multi-blog-service.js';

// Get articles for current site
const articles = await getPublishedArticles(10);
const topics = await getTopicsWithArticles(3);
```

**Features:**

- Site-aware content filtering
- Backward compatibility with existing blog service
- Proper TypeScript types
- Future-ready for multi-tenancy

### BaseLayout (`multi-sites/core/layouts/BaseLayout.astro`)

Multi-site aware base layout with automatic SEO and styling:

```astro
---
import BaseLayout from '../multi-sites/core/layouts/BaseLayout.astro';
---

<BaseLayout
  title="Custom Page Title"
  description="Page description"
>
  <h1>Your content here</h1>
</BaseLayout>
```

**Features:**

- Automatic site-specific meta tags
- Dynamic CSS variables for site theming
- Site-specific structured data
- Responsive footer with site-specific links

### Navigation (`multi-sites/core/components/Navigation.astro`)

Site-aware navigation component:

```astro
---
import Navigation from '../multi-sites/core/components/Navigation.astro';
---

<Navigation transparent={true} fixed={false} />
```

**Features:**

- Site-specific navigation links
- Dynamic logo and branding
- Site-specific CTA buttons
- Mobile-responsive design

## ⚙️ Site Configuration

Each site has its own configuration file in `multi-sites/sites/{site}/config.ts`:

```typescript
// Example: FastVistos configuration
export const HOME_CONFIG = {
  hero: {
    title: 'Seu Visto Americano Aprovado',
    subtitle: 'Assessoria completa...',
    ctaText: 'Quero Meu Visto',
    ctaLink: '#contato'
  },
  services: [
    {
      id: 'visto-turismo',
      title: 'Visto de Turismo',
      description: 'Assessoria completa para visto B1/B2',
      icon: '✈️',
      price: 'A partir de R$ 599',
      features: ['Análise de perfil', 'Preenchimento do DS-160']
    }
  ],
  testimonials: [...],
  faq: [...]
};
```

## 🎨 Styling & Theming

Each site has automatic CSS variables applied:

```css
:root {
    --primary-color: #ff6b35; /* Site-specific primary color */
    --secondary-color: #1e3a8a; /* Site-specific secondary color */
}

.site-primary-bg {
    background-color: var(--primary-color);
}
.site-primary-text {
    color: var(--primary-color);
}
.site-gradient {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}
```

## 🔄 Migration Guide

### From Single-Site to Multi-Site

1. **Update imports** in your components:

    ```astro
    <!-- Old -->
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { getPublishedArticles } from '../lib/blog-service.ts';

    <!-- New -->
    import BaseLayout from '../multi-sites/core/layouts/BaseLayout.astro';
    import { getPublishedArticles } from '../multi-sites/core/lib/multi-blog-service.ts';
    ```

2. **Set site context**:
    ```bash
    # Set environment variable
    SITE_ID=fastvistos astro dev
    ```

## 🚀 Deployment

### Environment Variables

Set the appropriate site ID for each deployment:

```bash
# Production deployment
SITE_ID=fastvistos npm run build
SITE_ID=conceptvistos npm run build
SITE_ID=vibecode npm run build
```

### Multi-Site Deployment Structure

Each site builds to its own directory:

```
dist/
├── fastvistos/        # FastVistos build output
├── conceptvistos/     # ConceptVistos build output
└── vibecode/          # VibeCode build output
```

### Deployment Scripts

You can deploy each site independently:

```bash
# Deploy FastVistos to production
SITE_ID=fastvistos npm run build
# Upload dist/fastvistos/ to fastvistos.com.br

# Deploy ConceptVistos to production
SITE_ID=conceptvistos npm run build
# Upload dist/conceptvistos/ to conceptvistos.com.br

# Deploy VibeCode to production
SITE_ID=vibecode npm run build
# Upload dist/vibecode/ to vibecode-lovable.com.br
```


## 🧪 Current Testing Results - ALL WORKING ✅

**Latest Test Results (September 11, 2025)**: All systems operational after implementing content collections.

| Test                  | FastVistos    | ConceptVistos | VibeCode      | Status   |
| --------------------- | ------------- | ------------- | ------------- | -------- |
| Development Server    | ✅ Working    | ✅ Working    | ✅ Working    | **PASS** |
| Content Collections   | ✅ Working    | ✅ Working    | ✅ Working    | **PASS** |
| Site-Specific Content | ✅ 3 Articles | ✅ 3 Articles | ✅ 3 Articles | **PASS** |
| Blog Sync System      | ✅ Working    | ✅ Working    | ✅ Working    | **PASS** |
| Public Assets         | ✅ Working    | ✅ Working    | ✅ Working    | **PASS** |
| Build Process         | ✅ 5 Pages    | ✅ 5 Pages    | ✅ 5 Pages    | **PASS** |
| Site-Specific Styling | ✅ Applied    | ✅ Applied    | ✅ Applied    | **PASS** |

### Build Output Verification

Each site successfully builds with proper content collections:

```bash
# FastVistos Build Output
npm run build:fastvistos
# ✅ 5 pages: home + blog listing + 3 articles
# ✅ Content from: multi-sites/sites/fastvistos/content/blog/
# ✅ Assets from: public-sites/fastvistos/

# ConceptVistos Build Output
npm run build:conceptvistos
# ✅ 5 pages: home + blog listing + 3 articles
# ✅ Content from: multi-sites/sites/conceptvistos/content/blog/
# ✅ Assets from: public-sites/conceptvistos/

# VibeCode Build Output
npm run build:vibecode
# ✅ 5 pages: home + blog listing + 3 articles
# ✅ Content from: multi-sites/sites/vibecode/content/blog/
# ✅ Assets from: public-sites/vibecode/
```

### How to Test Each Site

```bash
# Test FastVistos with site-specific content
npm run dev:fastvistos
# ✅ Loads content from: multi-sites/sites/fastvistos/content/blog/
# ✅ Blog: http://localhost:3000/blog

# Test ConceptVistos with site-specific content
npm run dev:conceptvistos
# ✅ Loads content from: multi-sites/sites/conceptvistos/content/blog/
# ✅ Blog: http://localhost:3000/blog

# Test VibeCode with site-specific content
npm run dev:vibecode
# ✅ Loads content from: multi-sites/sites/vibecode/content/blog/
# ✅ Blog: http://localhost:3000/blog
```

### Content Collections Schema Validation

All sites use proper Astro content collections with validated schemas:

```typescript
// Each site: multi-sites/sites/{site}/content/config.ts
const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.string(),
        updatedDate: z.string().optional(),
        topic: z.string(),
        topicSlug: z.string(),
        image: z.string().default(''),
        type: z.string(),
        published: z.boolean(),
    }),
});
```

## � Deployment Strategy

### Environment-Based Builds with Site-Specific Theming

Each site builds with its dedicated Tailwind configuration and theme:

```bash
# Production builds with site-specific Tailwind configs
npm run build:fastvistos     # → dist/ with blue/orange theme
npm run build:conceptvistos  # → dist/ with gold/luxury theme
npm run build:vibecode       # → dist/ with tech theme
```

### Deployment Workflow

1. **Build the specific site with its theme**
2. **Tailwind automatically compiles site-specific styles**
3. **Upload to appropriate domain**
4. **Each site maintains complete design independence**

```bash
# Example deployment commands
npm run build:fastvistos
# Deploy dist/ to fastvistos.com.br (blue/orange theme)

npm run build:conceptvistos
# Deploy dist/ to conceptvistos.com.br (gold/luxury theme)

npm run build:vibecode
# Deploy dist/ to vibecode-lovable.com.br (tech theme)
```


## 🔧 Advanced Configuration

### Adding a New Site

1. **Add site to SiteManager**:

    ```typescript
    // multi-sites/core/lib/site-manager.ts
    export const SITES = {
        // ... existing sites
        newsite: {
            id: 'newsite',
            domain: 'newsite.com',
            name: 'New Site',
            // ... site configuration
        },
    };
    ```

2. **Create site configuration**:

    ```bash
    mkdir multi-sites/sites/newsite
    touch multi-sites/sites/newsite/config.ts
    ```

3. **Add build scripts**:
    ```json
    {
        "scripts": {
            "dev:newsite": "SITE_ID=newsite astro dev --config multi-sites.config.mjs",
            "build:newsite": "SITE_ID=newsite astro build --config multi-sites.config.mjs"
        }
    }
    ```

### Custom Components

Create site-specific components by checking the current site:

```astro
---
import { getCurrentSite } from '../multi-sites/core/lib/site-manager.js';

const site = getCurrentSite();
---

{site.id === 'fastvistos' && (
  <div class="fastvistos-specific-component">
    <!-- FastVistos specific content -->
  </div>
)}

{site.id === 'vibecode' && (
  <div class="vibecode-specific-component">
    <!-- VibeCode specific content -->
  </div>
)}
```



## 🔧 Adding a New Site

To add a new site to the architecture:

1. **Add site configuration to SiteManager**:

    ```typescript
    // multi-sites/core/lib/site-manager.ts
    export const SITES = {
        // ... existing sites
        newsite: {
            id: 'newsite',
            domain: 'newsite.com',
            name: 'New Site',
            primaryColor: '#007acc',
            secondaryColor: '#005999',
            // ... additional configuration
        },
    };
    ```

2. **Create site directory structure**:

    ```bash
    mkdir -p multi-sites/sites/newsite/{layouts,pages,components}
    mkdir -p public-sites/newsite
    ```

3. **Create site-specific BaseLayout**:

    ```bash
    # Copy and customize from existing site
    cp multi-sites/sites/fastvistos/layouts/BaseLayout.astro \
       multi-sites/sites/newsite/layouts/BaseLayout.astro
    ```

4. **Create homepage**:

    ```bash
    # Create simple homepage
    touch multi-sites/sites/newsite/pages/index.astro
    ```

5. **Test the new site**:

    ```bash
    SITE_ID=newsite npm run dev
    ```

## 💻 **Development Workflow**

### **1. Auto-Sync Development (Recommended)**

Start development with automatic template synchronization:

```bash
npm run dev:watch:fastvistos
```

**What happens:**

1. **Initial sync**: Runs `sync-blog.js` to copy latest templates
2. **File watcher**: Monitors core template files for changes
3. **Auto-sync**: Automatically runs sync when core files change
4. **Hot reload**: Astro detects synced changes and reloads browser

**Files watched:**

- `multi-sites/core/pages/blog/**/*`
- `multi-sites/core/layouts/**/*`
- `multi-sites/core/components/**/*`

### **2. Site Configuration Usage**

Use the simple configuration system in your components:

```typescript
// Import site config and helpers
import { siteConfig } from '../site-config.ts';
import { SiteConfigHelper } from '../../core/lib/site-config.ts';

// Direct access to config
const siteName = siteConfig.name;
const primaryColor = siteConfig.primaryColor;

// Helper functions for common tasks
const metadata = SiteConfigHelper.getMetadata(siteConfig, 'Page Title');
const cssVars = SiteConfigHelper.getCssVariables(siteConfig);
const hasBooking = SiteConfigHelper.hasFeature(siteConfig, 'booking');
const whatsappLink = SiteConfigHelper.getWhatsAppLink(siteConfig, 'Hello!');
```

### **3. Adding New Sites**

1. **Create site directory structure**:

    ```bash
    mkdir -p multi-sites/sites/newsite/{components,content/blog,layouts,pages}
    ```

2. **Create site configuration**:

    ```typescript
    // multi-sites/sites/newsite/site-config.ts
    import type { SiteConfig } from '../../core/lib/site-config.ts';

    export const siteConfig: SiteConfig = {
        id: 'newsite',
        domain: 'newsite.com',
        name: 'New Site',
        // ... configure as needed
    };
    ```

3. **Add npm scripts**:

    ```json
    {
        "dev:newsite": "node sync-blog.js && SITE_ID=newsite astro dev --config multi-sites.config.mjs",
        "dev:watch:newsite": "node dev-with-sync.js newsite",
        "build:newsite": "node sync-blog.js && SITE_ID=newsite astro build --config multi-sites.config.mjs"
    }
    ```

4. **Create public assets directory**:

    ```bash
    mkdir -p public-sites/newsite
    # Add favicon, logo, etc.
    ```

### **4. Updating Templates**

To modify shared blog templates:

1. **Edit core templates** in `multi-sites/core/pages/blog/`
2. **Auto-sync (if using watch mode)**: Changes automatically sync to all sites
3. **Manual sync**: Run `npm run sync-blog` if not using watch mode
4. **Test**: Verify changes in all affected sites

### **5. Content Management**

Each site manages its own content:

```bash
# Add new blog post for FastVistos
touch multi-sites/sites/fastvistos/content/blog/new-post.md

# Add new blog post for ConceptVistos
touch multi-sites/sites/conceptvistos/content/blog/new-post.md
```

Content is automatically picked up by Astro's content collections system.

