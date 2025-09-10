# Multi-Site Micro-Frontend Architecture

This project implements a **Micro-Frontend Architecture** using Astro that supports multiple websites with shared core components while maintaining site-specific customization.

## 🎨 **NEW: Site-Specific Tailwind Architecture**

**Revolutionary styling system** where each site maintains its own dedicated Tailwind configuration for complete design autonomy:

- **FastVistos**: Blue/orange professional theme with Source Sans Pro
- **ConceptVistos**: Gold/luxury premium theme with Playfair Display  
- **VibeCode**: Tech blue/green theme with JetBrains Mono

**Key Innovation**: Dynamic Tailwind config loading based on `SITE_ID` environment variable, allowing shared components to automatically inherit site-specific styling without code duplication.

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
│   │   │   ├── JsonLdService.astr## 🚀 Future Enhancements

- **Multi-tenancy**: Add site_id columns to database tables for complete data separation
- **Advanced Analytics**: Site-specific tracking and performance monitoring  
- **A/B Testing**: Site-specific feature flags and experimentation
- **Internationalization**: Multi-language support for global expansion
- **Advanced Deployment**: CI/CD pipelines for independent site deployments
- **Theme Variants**: Seasonal themes and dark/light mode support within each site's brand
- **Component Library**: Expand shared component system with site-specific variants   │   └── JsonLdWebPage.astro
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

Run a specific site in development mode using the dedicated npm scripts:

```bash
# FastVistos (blue/orange theme)
npm run dev:fastvistos

# ConceptVistos (gold/luxury theme)
npm run dev:conceptvistos

# VibeCode (tech blue/green theme)  
npm run dev:vibecode
```

Each site automatically loads its own:
- ✅ Site-specific Tailwind configuration and theme
- ✅ Proper site detection and environment  
- ✅ Database connectivity and blog functionality
- ✅ Brand-specific styling and components

### Build & Deploy

Each site builds with its own Tailwind configuration:

```bash
# Build specific sites with their themes
npm run build:fastvistos    # Blue/orange FastVistos theme
npm run build:conceptvistos # Gold/luxury ConceptVistos theme  
npm run build:vibecode      # Tech VibeCode theme
```

Build output structure:
```
dist/
├── fastvistos/        # FastVistos build output
├── conceptvistos/     # ConceptVistos build output
└── vibecode/          # VibeCode build output
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
        config: `./tailwind.${CURRENT_SITE}.config.js` 
      })
    ]
  }
});
```

#### Site-Specific Themes

| Site | Theme | Primary Colors | Font Family | Design Focus |
|------|-------|---------------|-------------|--------------|
| **FastVistos** | Business/Professional | Blue (#3b95fa) + Orange (#ff6b35) | Source Sans Pro | Visa services, trust, efficiency |
| **ConceptVistos** | Luxury/Premium | Gold (#d4af37) + Dark (#1a1a1a) | Playfair Display | Premium consulting, elegance |
| **VibeCode** | Tech/Modern | Blue/Green/Purple tech palette | JetBrains Mono | Development, innovation, code |

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
    config: `./tailwind.${process.env.SITE_ID || 'fastvistos'}.config.js` 
  })
]
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
# Test FastVistos with blue/orange theme
npm run dev:fastvistos
# Open: http://localhost:3000

# Test ConceptVistos with gold/luxury theme
npm run dev:conceptvistos
# Open: http://localhost:3000

# Test VibeCode with tech theme
npm run dev:vibecode
# Open: http://localhost:3000

# Test Blog (works on all sites with site-specific styling)
# Open: http://localhost:3000/blog
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
# Work on FastVistos with blue/orange theme
npm run dev:fastvistos

# Work on ConceptVistos with gold/luxury theme
npm run dev:conceptvistos

# Work on VibeCode with tech theme
npm run dev:vibecode
```

### Before Committing

Test all sites to ensure changes don't break other sites:

```bash
# Test FastVistos
npm run dev:fastvistos
# Verify functionality and blue/orange theme

# Test ConceptVistos
npm run dev:conceptvistos
# Verify functionality and gold/luxury theme

# Test VibeCode
npm run dev:vibecode
# Verify functionality and tech theme
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
