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
npm run dev:watch:fastvistos        # FastVistos with auto-sync on file changes
npm run dev:watch:conceptvistos     # ConceptVistos with auto-sync on file changes
npm run dev:watch:revistadoturismo  # VibeCode with auto-sync on file changes

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

### Automated Image Resizing and Metadata Generation

This JS script processes all base images for a given site ID, generating multiple optimized versions (WebP and JPEG) at predefined breakpoints and retina scales, creates a blurred base64 placeholder for each image, saves the resized outputs in a structured directory, and produces a JSON index mapping each image to its responsive variants for use in the site’s frontend.

```bash
node generate-images.js revistadoturismo
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

### Remote Image Sync and Deployment for Site Assets

This following command logs the start of an image-sync operation, connects to the VPS, loads the correct Node.js environment, and runs a script that validates the site ID, then uses rsync to copy all image folders matching that ID from the server’s Docker media volume (microservicesadm) into the site's public blog image directory, ensuring proper permissions and capturing all output to the local log file.

```bash
./sync-site-images.sh fastvistos
```

### **Bash Nginx Configuration Script**

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

## 🤝 Contributing

When adding features:

1. **Shared functionality** → `multi-sites/core/`
2. **Site-specific features** → `multi-sites/sites/{site}/`
3. **Test across all sites** using different `SITE_ID` values
4. **Update documentation** for significant architectural changes





⚠️ DISCLAIMER: THE MATERIAL BELOW IS AI-GENERATED AND SHOULD BE METICULOUSLY VERIFIED FOR TECHNICAL AND FACTUAL ACCURACY PRIOR TO RELIANCE.


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
- **Solution**: Site-specific directories in `/public/{site}/`
- **Configuration**: Astro config uses `publicDir: ./public/${CURRENT_SITE}`
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



## � Future Enhancements

- **Multi-tenancy**: Add site_id columns to database tables for complete data separation
- **Advanced Analytics**: Site-specific tracking and performance monitoring
- **A/B Testing**: Site-specific feature flags and experimentation
- **Internationalization**: Multi-language support for global expansion
- **Advanced Deployment**: CI/CD pipelines for independent site deployments
