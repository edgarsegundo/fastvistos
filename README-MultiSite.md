# Multi-Site Micro-Frontend Architecture

This project implements a **Micro-Frontend Architecture** using Astro that supports multiple websites with shared core components while maintaining site-specific customization.

## 🏗️ Architecture Overview

```
fastvistos/
├── multi-sites/                    # Multi-site architecture root
│   ├── core/                      # Shared core components and services
│   │   ├── components/            # Shared JSON-LD SEO components
│   │   │   ├── JsonLdArticle.astro
│   │   │   ├── JsonLdBreadcrumb.astro
│   │   │   ├── JsonLdFAQ.astro
│   │   │   ├── JsonLdLocalBusiness.astro
│   │   │   ├── JsonLdOrganization.astro
│   │   │   ├── JsonLdReview.astro
│   │   │   ├── JsonLdService.astro
│   │   │   └── JsonLdWebPage.astro
│   │   ├── lib/                   # Core business logic
│   │   │   └── site-manager.ts    # Site configuration manager
│   │   └── pages/                 # Shared pages
│   │       └── blog/              # Shared blog functionality
│   │           ├── index.astro    # Blog listing page
│   │           └── [...slug].astro # Blog article page
│   └── sites/                     # Site-specific implementations
│       ├── fastvistos/            # FastVistos site
│       │   ├── components/        # FastVistos-specific components
│       │   ├── layouts/           # FastVistos BaseLayout
│       │   └── pages/             # FastVistos pages
│       ├── conceptvistos/         # ConceptVistos site  
│       │   ├── layouts/           # ConceptVistos BaseLayout
│       │   └── pages/             # ConceptVistos pages
│       └── vibecode/              # VibeCode site
│           ├── layouts/           # VibeCode BaseLayout
│           └── pages/             # VibeCode pages
├── public-sites/                  # Site-specific public assets
│   ├── fastvistos/               # FastVistos assets
│   ├── conceptvistos/            # ConceptVistos assets  
│   └── vibecode/                 # VibeCode assets
├── src/                          # Main routing and legacy compatibility
├── multi-sites.config.mjs        # Multi-site Astro configuration
└── package.json                  # Project dependencies
```

## 🌐 Supported Websites

| Site | Domain | Description | Status | Features |
|------|--------|-------------|--------|----------|
| **FastVistos** | fastvistos.com.br | Assessoria para visto americano | ✅ **Working** | Full components, Blog, Payments |
| **ConceptVistos** | conceptvistos.com.br | Consultoria premium para vistos | ✅ **Working** | Simple homepage, Blog |
| **VibeCode** | vibecode-lovable.com.br | Desenvolvimento de software | ✅ **Working** | Simple homepage, Blog |

## 🚀 Quick Start

### Development - Tested & Working

Run a specific site in development mode using environment variables:

```bash
# FastVistos (default)
npm run dev

# ConceptVistos  
SITE_ID=conceptvistos npm run dev

# VibeCode
SITE_ID=vibecode npm run dev
```

All sites successfully tested with:
- ✅ Proper site detection
- ✅ Database connectivity  
- ✅ Blog functionality
- ✅ Site-specific styling  

### Build & Deploy

Each site builds to its own directory using environment variables:

```bash
# Build specific sites
SITE_ID=fastvistos npm run build
SITE_ID=conceptvistos npm run build  
SITE_ID=vibecode npm run build
```

Build output structure:
```
dist/
├── fastvistos/        # FastVistos build output
├── conceptvistos/     # ConceptVistos build output
└── vibecode/          # VibeCode build output
```

## 🏛️ Core Architecture Components

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

### Shared Blog System (`multi-sites/core/pages/blog/`)

Site-aware blog system that works across all sites:

```astro
<!-- Shared blog index -->
/multi-sites/core/pages/blog/index.astro

<!-- Shared article page -->  
/multi-sites/core/pages/blog/[...slug].astro
```

**Features:**

- Site-aware content filtering via Prisma database
- Shared blog functionality across all sites
- Site-specific styling through BaseLayout inheritance
- SEO optimization with JSON-LD structured data

### JSON-LD SEO Components (`multi-sites/core/components/`)

Shared structured data components for SEO optimization:

- `JsonLdArticle.astro` - Blog article schema
- `JsonLdLocalBusiness.astro` - Business information  
- `JsonLdOrganization.astro` - Company details
- `JsonLdService.astro` - Service offerings
- `JsonLdFAQ.astro` - Frequently asked questions
- `JsonLdWebPage.astro` - Page-specific schema

## 🎨 Site Customization

### Site-Specific Public Assets

Each site has its own public folder with independent assets:

```
public-sites/
├── fastvistos/        # FastVistos assets (favicons, images, etc.)
├── conceptvistos/     # ConceptVistos assets  
└── vibecode/          # VibeCode assets
```

### Dynamic CSS Variables

Each BaseLayout generates site-specific CSS variables:

```css
:root {
  --primary-color: #FF6B35;    /* Site-specific primary color */
  --secondary-color: #1E3A8A;  /* Site-specific secondary color */
  --site-font-family: "Inter", system-ui, sans-serif;
}

.site-primary-bg { background-color: var(--primary-color); }
.site-primary-text { color: var(--primary-color); }
.site-gradient { 
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); 
}
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
  --primary-color: #FF6B35;    /* Site-specific primary color */
  --secondary-color: #1E3A8A;  /* Site-specific secondary color */
}

.site-primary-bg { background-color: var(--primary-color); }
.site-primary-text { color: var(--primary-color); }
.site-gradient { background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); }
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

2. **Update Astro config**:
   ```bash
   # Use multi-site config
   astro dev --config multi-sites.config.mjs
   ```

3. **Set site context**:
   ```bash
   # Set environment variable
   SITE_ID=fastvistos astro dev --config multi-sites.config.mjs
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
     }
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

## 🧪 Testing Results

**All sites have been successfully tested and are working:**

| Test | FastVistos | ConceptVistos | VibeCode | Status |
|------|------------|---------------|----------|---------|
| Site Loading | ✅ Working | ✅ Working | ✅ Working | **PASS** |
| Environment Detection | ✅ Working | ✅ Working | ✅ Working | **PASS** |
| Database Connection | ✅ Connected | ✅ Connected | ✅ Connected | **PASS** |
| Blog Functionality | ✅ Working | ✅ Working | ✅ Working | **PASS** |
| Site-Specific Styling | ✅ Applied | ✅ Applied | ✅ Applied | **PASS** |

### How to Test Each Site

```bash
# Test FastVistos (default)
npm run dev
# Open: http://localhost:4321

# Test ConceptVistos
SITE_ID=conceptvistos npm run dev  
# Open: http://localhost:4321

# Test VibeCode
SITE_ID=vibecode npm run dev
# Open: http://localhost:4321

# Test Blog (works on all sites)
# Open: http://localhost:4321/blog
```

## � Deployment Strategy

### Environment-Based Builds

Each site can be built and deployed independently:

```bash
# Production builds
SITE_ID=fastvistos npm run build     # → dist/fastvistos/
SITE_ID=conceptvistos npm run build  # → dist/conceptvistos/  
SITE_ID=vibecode npm run build       # → dist/vibecode/
```

### Deployment Workflow

1. **Build the specific site**
2. **Upload to appropriate domain**
3. **Each site is completely independent**

```bash
# Example deployment commands
SITE_ID=fastvistos npm run build
# Deploy dist/fastvistos/ to fastvistos.com.br

SITE_ID=conceptvistos npm run build
# Deploy dist/conceptvistos/ to conceptvistos.com.br

SITE_ID=vibecode npm run build
# Deploy dist/vibecode/ to vibecode-lovable.com.br
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
     }
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

## 📋 Architecture Benefits

✅ **Tested & Working**: All three sites successfully tested and operational  
✅ **Shared Core**: JSON-LD components and blog system shared across sites  
✅ **Independent Layouts**: Each site has complete design autonomy  
✅ **Environment-Based**: Easy switching between sites via `SITE_ID`  
✅ **Database Integration**: Prisma blog service working across all sites  
✅ **SEO Optimized**: Site-specific meta tags and structured data  
✅ **Scalable**: Easy to add new sites to the architecture  
✅ **Maintainable**: Clean separation between shared and site-specific code  
✅ **Performance**: Only loads what each site needs  

## 🛠️ Development Workflow

### Daily Development

```bash
# Work on FastVistos (default)
npm run dev

# Work on ConceptVistos  
SITE_ID=conceptvistos npm run dev

# Work on VibeCode
SITE_ID=vibecode npm run dev
```

### Before Committing

Test all sites to ensure changes don't break other sites:

```bash
# Test FastVistos
npm run dev
# Verify functionality

# Test ConceptVistos
SITE_ID=conceptvistos npm run dev  
# Verify functionality

# Test VibeCode
SITE_ID=vibecode npm run dev

# Verify functionality
```

## 📚 Implementation Notes

### What's Shared

- **JSON-LD SEO Components**: All structured data components in `/multi-sites/core/components/`
- **Blog System**: Complete blog functionality in `/multi-sites/core/pages/blog/`
- **Site Manager**: Configuration and detection logic
- **Database Service**: Prisma blog service with site awareness

### What's Site-Specific

- **BaseLayouts**: Each site has unique layout with custom styling
- **Components**: FastVistos has full component library, others have simple pages
- **Public Assets**: Independent favicon, images, and manifest files
- **Styling**: Site-specific CSS variables and design systems

### Migration from Single-Site

The original FastVistos components have been moved to:

- **From**: `src/components/` 
- **To**: `multi-sites/sites/fastvistos/components/`

The core JSON-LD components are now shared:

- **Location**: `multi-sites/core/components/JsonLd*.astro`
- **Usage**: Available to all sites for SEO optimization

## 🤝 Contributing

When adding features:

1. **Shared functionality** → `multi-sites/core/`
2. **Site-specific features** → `multi-sites/sites/{site}/`  
3. **Test across all sites** using different `SITE_ID` values
4. **Update documentation** for significant architectural changes

## � Future Enhancements

- **Multi-tenancy**: Add site_id columns to database tables for complete data separation
- **Advanced Analytics**: Site-specific tracking and performance monitoring  
- **A/B Testing**: Site-specific feature flags and experimentation
- **Internationalization**: Multi-language support for global expansion
- **Advanced Deployment**: CI/CD pipelines for independent site deployments
