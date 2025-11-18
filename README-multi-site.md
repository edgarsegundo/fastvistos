# Multi-Site Architecture with Astro Content Collections

This project implements a **Multi-Site Architecture** using Astro v5.13.5 with content collections, supporting multiple websites with shared templates and site-specific content.

## 🚀 **QUICK START - Essential Commands**

> **⚠️ IMPORTANT**: These are the key commands you need to know for working with this multi-site project!

### **🆕 Create a New Site**

```bash
node create-site.js
# Interactive script to create a new site with all necessary configuration files
# Creates site structure, config files, and registers the site automatically
```

### **⚡ Development with Auto-Sync (RECOMMENDED)**

```bash
npm run dev:watch:fastvistos      # FastVistos with auto-sync on file changes
npm run dev:watch:conceptvistos   # ConceptVistos with auto-sync on file changes
npm run dev:watch:vibecode       # VibeCode with auto-sync on file changes

# For any new site you create:
npm run dev:watch:mysite          # Replace 'mysite' with your site ID
```

### **🔨 Production Builds**

```bash
npm run build:fastvistos          # Build FastVistos for production
npm run build:conceptvistos       # Build ConceptVistos for production
npm run build:vibecode           # Build VibeCode for production

# For any new site you create:
# Add to package.json: "build:mysite": "node sync-blog.js mysite && SITE_ID=mysite astro build --config multi-sites.config.mjs"
```

### **Deployment/Publish to Server**

Deploy and Publish using `publish-from-remote.sh` script. It will automatically run dploy-site.js and other scripts necessary for publishing in production correctly.

```bash
./publish-from-remote.sh [siteid]

#  or using the alias
pub
```

### **Local Pre-Deployment**

To do a pre-deployment, run the alias pubpre which calls the script `publish-pre.sh`.

Ex: 

```bash
pubpre [siteid]
```

🚨 **DO NOT RUN `deploy-site.js` UNTIL YOU HAVE BUILT YOUR SITE!** 🚨  
> **Why?**  
> - `deploy-site.js` ONLY deploys the contents of your `./dist/<siteid>/` folder.
> - If you haven't built, that folder will be missing, outdated, or just plain wrong!

### **Local Deployment**

node generate-blog-content.js fastvistos
npm run download-images:fastvistos
npm run build:fastvistos

#### **Bash Nginx Configuration Script**

```bash
# It creates the certificate, the respective volume at docker-compose.yml and the [siteid].conf file at sites/
# This plugin is in the reverse-proxy-config/ repo
./create-astro-site-conf.sh
```

The templares for the [siteid].conf is at astro/

astro.nginx.http.template.conf  
astro.nginx.https.template.conf

```bash
# It can be used to create the respective [siteid] volume but the `create-astro-site-conf.sh` already does that.
./create-vol.sh
```

Pay Attention to the final instructions:

```bash
# 1️⃣  Ensure your project folder exists and has correct permissions:
  sudo mkdir -p $APP_PATH
  sudo chown -R $USER_NAME:www-data $APP_PATH

# 2️⃣  Copy your built project (dist) into this folder:
  cp -r ./dist/* $APP_PATH/
  # This ensures that Nginx serves your static files correctly.

# 3️⃣  Ensure DNS is pointing correctly:
  A      $DOMAIN      → <server IP>
  CNAME  www.$DOMAIN  → <server IP>

# 4️⃣  Commit & push to GitHub
  git add docker-compose.yml $FINAL_CONF
  git commit -m "Add auto-generated Nginx config"
  git push
```

#### **Example Usage:**

```bash
# Interactive mode - shows menu of available sites
node deploy-site.js
./deploy-site.sh

# Direct deployment by site name
node deploy-site.js fastvistos
./deploy-site.sh p2digital

# Build and deploy workflow
npm run build:fastvistos
node deploy-site.js fastvistos

# Show available sites
node deploy-site.js --help
```

#### **Key Features:**

✅ **Auto-Detection** - Automatically discovers sites from `./dist/` folder  
✅ **Interactive Mode** - Shows numbered menu when no site specified  
✅ **Site-Specific** - Only deploys the specific site folder (`./dist/sitename/`)  
✅ **Dynamic Paths** - Automatically maps sites to `/var/www/sitename`  
✅ **No Configuration** - No need to edit scripts when adding new sites

#### **What the deployment scripts do:**

1. **Auto-detect sites** - Scan `./dist/` folder for available built sites
2. **Validate selection** - Check if chosen site exists and is built
3. **Setup remote directory** - `ssh edgar@72.60.57.150 "sudo mkdir -p /var/www/sitename && sudo chown edgar:edgar /var/www/sitename"`
4. **Sync files** - `rsync -avz --delete ./dist/sitename/ edgar@72.60.57.150:/var/www/sitename`
5. **Fix permissions** - `ssh edgar@72.60.57.150 "sudo chown -R www-data:www-data /var/www/sitename"`
6. **Provide feedback** - Clear success/error messages with colored output

#### **Supported Sites:**

Sites are **automatically detected** from your `./dist/` folder. Any site you build will be available for deployment:

- `fastvistos` → `fastvistos.com` (`/var/www/fastvistos`)
- `p2digital` → `p2digital.com` (`/var/www/p2digital`)
- Any new site you create → `sitename.com` (`/var/www/sitename`)

> **Note:** No configuration needed! Sites are discovered automatically when you build them.

#### **Troubleshooting Deployment Issues**

**Permission Denied Error:**

```bash
rsync: [Receiver] mkdir "/var/www/sitename" failed: Permission denied (13)
```

**Solution:** Create the directory and set proper permissions on the server:

```bash
# SSH into your server
ssh edgar@72.60.57.150

# Create the directory with proper permissions
sudo mkdir -p /var/www/p2digital
sudo chown edgar:edgar /var/www/p2digital

# Or for FastVistos
sudo mkdir -p /var/www/fastvistos
sudo chown edgar:edgar /var/www/fastvistos

# Verify permissions
ls -la /var/www/
```

**SSH Key Setup (Recommended):**

To avoid password prompts, set up SSH key authentication:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "your_email@domain.com"

# Copy public key to server
ssh-copy-id edgar@72.60.57.150

# Test connection
ssh edgar@72.60.57.150
```

### **📝 Blog Content Generation**

Generate blog post/articles
Script to create/generate blog post/articles

```bash
node generate-blog-content.js fastvistos     # Generate blog content for specific site
node generate-blog-advanced.js all           # Generate for all sites with HTML conversion
npm run generate-blog                         # Alternative command for content generation
```

### **� Blog Image Downloads**

Generate/create Images/assets

```bash
npm run download-images                       # Download images for all sites
# Using npm scripts
npm run download-images:fastvistos
# All images
npm run download-images
```

```bash
# Download images for a specific site
node download-blog-images.js fastvistos

# Download images for all sites
node download-blog-images.js all

# Get help
node download-blog-images.js --help
```

### \*\*\* Syncing files

```bash
npm run sync-blog                 # Sync shared templates to all sites manually
npm run watch-sync               # Start file watcher for template synchronization
```

### **🧪 Testing**

```bash
npm run test:blog                 # Test blog service functionality
npm run test:blog:integration     # Integration tests with real database
```

---

## How to Allow passwordless sudo for specific commands

On the VPS, run: sudo visudo

Add this line (replace edgar with your username):

edgar ALL=(ALL) NOPASSWD: /bin/mkdir, /bin/chown, /bin/rsync

Now sudo mkdir / sudo chown / sudo rsync won’t ask for a password.
After this, your script will run non-interactively (ideal for automation).

**SSH Key Setup For Better Script Automation (Recommended):**

To avoid password prompts, set up SSH key authentication:

```bash
# Check if you already have SSH keys
ls ~/.ssh/

# If you see id_rsa and id_rsa.pub, you already have keys!
# Skip key generation and go directly to copying your public key:

# Copy your existing public key to the server
ssh-copy-id edgar@72.60.57.150

# Test connection (should not ask for password)
ssh edgar@72.60.57.150

# If you don't have SSH keys, generate them first:
# ssh-keygen -t rsa -b 4096 -C "your_email@domain.com"
# Then run ssh-copy-id edgar@72.60.57.150
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

## 🚀 Future Enhancements

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

## 📝 **Blog Content Generation Scripts**

### **Multi-Site Blog Content Automation**

The project includes two powerful scripts for generating markdown blog content from your database with multi-site support and business_id filtering:

#### **1. Basic Content Generator** (`generate-blog-content.js`)

Generates markdown files from database articles with basic content processing:

```bash
# Generate content for specific site
node generate-blog-content.js fastvistos
node generate-blog-content.js conceptvistos
node generate-blog-content.js vibecode

# Generate content for all sites
node generate-blog-content.js all

# Show help
node generate-blog-content.js --help
```

#### **2. Advanced Content Generator** (`generate-blog-advanced.js`)

Enhanced version with HTML-to-Markdown conversion and content prioritization:

```bash
# Generate content for specific site with HTML conversion
node generate-blog-advanced.js fastvistos

# Generate content for all sites with advanced processing
node generate-blog-advanced.js all

# Show help and features
node generate-blog-advanced.js --help
```

### **Key Features**

- **🏢 Multi-Tenant Support**: Automatically filters content by `business_id` from site configurations
- **📁 Site-Specific Output**: Creates markdown files in correct site content directories
- **🔄 HTML Conversion**: Advanced script converts HTML content to clean Markdown
- **📊 Content Prioritization**: `content_md` > `content_html` > `content_raw`
- **🛡️ Error Handling**: Graceful handling of missing configurations and content
- **📈 Progress Reporting**: Clear feedback on generation progress and results

### **Content Generation Workflow**

```
Database Article → Business ID Filter → Content Processing → Markdown Output
                      ↓                        ↓                   ↓
               (41a5c7f95e924...)    (HTML→Markdown)    (site/content/blog/)
```

### **Example Output**

```bash
🚀 Generating blog content for: fastvistos

🔍 Fetching articles from database for site: fastvistos...
🏢 Business ID: 41a5c7f95e924d54b120ab9a0e1843c8
📁 Content directory: /multi-sites/sites/fastvistos/content/blog
📝 Found 5 published articles for fastvistos
✅ Generated: fechamento-do-consulado-de-porto-alegre.md
✅ Generated: como-treinar-para-a-entrevista.md
✅ Generated: como-tirar-o-visto-americano.md
✅ Generated: o-consulado-agora-esta-olhando-para-as-redes-socia.md
✅ Generated: nova-taxa-a-partir-de-outubro.md

🎉 Content generation complete! Generated 5 articles for fastvistos
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

## 🔧 **Available Scripts**

### **Development**

- `npm run dev:watch:fastvistos` - FastVistos with auto-sync
- `npm run dev:watch:conceptvistos` - ConceptVistos with auto-sync
- `npm run dev:watch:vibecode` - VibeCode with auto-sync
- `npm run dev:fastvistos` - FastVistos (sync once at start)
- `npm run dev:conceptvistos` - ConceptVistos (sync once at start)
- `npm run dev:vibecode` - VibeCode (sync once at start)

### **Build & Deploy**

- `npm run build:all` - Build all sites
- `npm run build:fastvistos` - Build FastVistos only
- `npm run build:conceptvistos` - Build ConceptVistos only
- `npm run build:vibecode` - Build VibeCode only

### **Maintenance**

- `npm run sync-blog` - Manual template sync
- `npm run watch-sync` - File watcher only
- `npm run generate-site-registry` - Update site registry (if using centralized approach)

### **Database Schema Updates with Prisma**

When you add new fields to your MySQL database and Django models, update the Prisma schema:

```bash
# 1. Pull latest database structure
npx prisma db pull

# 2. Generate updated client
npx prisma generate

# 3. Check what changed
git diff prisma/schema.prisma

# 4. Commit the changes
git add prisma/schema.prisma
git commit -m "Update Prisma schema with new blog fields"
```

**Why this approach:**

- ✅ **Automatic** - No manual editing required
- ✅ **Accurate** - Reflects exact database state
- ✅ **Safe** - Preserves existing schema configuration
- ✅ **Standard** - Official Prisma workflow

## 🎯 Recent Architecture Achievements

### ✅ **Content Collections Implementation (September 2025)**

Successfully migrated from file-system based blog to Astro content collections:

- **Issue Resolved**: Content schema validation errors with slug fields
- **Solution**: Removed explicit slug from schemas (Astro auto-generates from filename)
- **Result**: Proper content collections with type safety and validation

### ✅ **Site-Specific Content Architecture**

Implemented true site-specific content while maintaining shared templates:

- **Each site**: Own content directory at `multi-sites/sites/{site}/content/blog/`
- **Shared templates**: Synced from `multi-sites/core/pages/blog/` to each site
- **Dynamic imports**: Templates use `getCollection('blog')` for site-specific content

### ✅ **Public Assets Separation**

Fixed public directory structure for complete site independence:

- **Issue**: Sites shared a single `/public` directory causing asset conflicts
- **Solution**: Site-specific directories in `/public-sites/{site}/`
- **Configuration**: Astro config uses `publicDir: ./public-sites/${CURRENT_SITE}`
- **Result**: Each site serves assets independently

### ✅ **Blog Sync System**

Automated template synchronization ensuring consistency across sites:

```bash
# Before each build, sync-blog.js runs automatically:
npm run build:fastvistos  # Syncs templates → builds with FastVistos content
npm run build:conceptvistos  # Syncs templates → builds with ConceptVistos content
npm run build:vibecode  # Syncs templates → builds with VibeCode content
```

## 📋 Architecture Benefits

✅ **Content Collections**: Type-safe content with schema validation  
✅ **Site-Specific Content**: Each site maintains independent markdown files  
✅ **Shared Templates**: Blog functionality shared while content stays separate  
✅ **Independent Assets**: Site-specific public directories  
✅ **Automated Sync**: Template synchronization via sync-blog.js  
✅ **Zero Conflicts**: Complete separation between sites  
✅ **Easy Scaling**: Add new sites without affecting existing ones  
✅ **Performance**: Only loads what each site needs  
✅ **SEO Optimized**: Site-specific meta tags and structured data  
✅ **Developer Experience**: Clean development workflow with dedicated scripts

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

## 🔧 **Troubleshooting Common Issues**

### **Blog Article Errors**

#### "window is not defined" Error

- **Symptoms**: Error when loading blog article pages during SSR
- **Cause**: Client-side JavaScript (like `window.location.href`) running during server-side rendering
- **Solution**: Move client-side code to `<script>` tags or use proper browser API checks
- **Status**: ✅ Fixed in latest version

#### 404 Errors on Blog Articles

- **Symptoms**: Blog index loads but individual articles return 404
- **Cause**: Missing or incorrect `getStaticPaths()` implementation, conflicting route files
- **Solution**: Ensure `[...slug].astro` is used (not `[slug].astro`), check business_id filtering
- **Status**: ✅ Fixed in latest version

### **Development Issues**

#### Templates Not Syncing

- **Symptoms**: Changes to core templates not appearing in site-specific files
- **Cause**: File watcher not running or sync script issues
- **Solution**: Use `npm run dev:watch:siteid` instead of regular dev command
- **Manual Fix**: Run `npm run sync-blog` manually

#### Site Not Found Errors

- **Symptoms**: "Could not load configuration for site" warnings
- **Cause**: Missing site-config.ts file or incorrect site ID
- **Solution**: Create site with `node create-site.js` or check site-config.ts exists

#### Vite Cache Issues

- **Symptoms**: Build errors, compilation issues, hot reload not working, strange development server behavior
- **Cause**: Corrupted Vite compilation cache
- **Solution**: Clear cache and restart development server

```bash
# Clear Vite cache and restart dev server
rm -rf node_modules/.vite .astro && npm run dev

# For specific site development with auto-sync
rm -rf node_modules/.vite .astro && npm run dev:watch:fastvistos

# If cache clearing doesn't help, reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# Nuclear option - reset everything
rm -rf node_modules package-lock.json .astro node_modules/.vite && npm install
```

**When to use cache clearing:**

- ✅ Build errors unrelated to code changes
- ✅ Hot reload stops working
- ✅ Compilation errors after switching branches
- ✅ After major dependency updates
- ✅ Unexplained development server issues

### **Content Generation Issues**

#### No Articles Generated

- **Symptoms**: Script runs but no markdown files created
- **Cause**: Business ID mismatch between config and database
- **Solution**: Verify business_id in site-config.ts matches database records
- **Debug**: Use `npm run test:blog` to test database connectivity

#### HTML Not Converting to Markdown

- **Symptoms**: Raw HTML appearing in generated markdown
- **Cause**: Using basic script instead of advanced conversion
- **Solution**: Use `node generate-blog-advanced.js` for HTML-to-Markdown conversion

### **Build Issues**

#### Build Fails with Missing Files

- **Symptoms**: Build process fails with "file not found" errors
- **Cause**: Templates not synced before build
- **Solution**: Ensure sync runs before build (npm scripts handle this automatically)

### **Quick Fixes**

```bash
# Restart development with clean sync
npm run dev:watch:siteid

# Force sync all templates
npm run sync-blog

# Test blog service connection
npm run test:blog

# Regenerate content
node generate-blog-advanced.js siteid

# Create new site properly
node create-site.js
```

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

##