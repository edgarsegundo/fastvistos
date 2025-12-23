# Copilot Instructions for fastvistos

## Project Architecture
- **Multi-site Structure:** Sites are organized under `multi-sites/sites/`, each with its own Astro pages and assets. Shared logic lives in `multi-sites/core/`.
- **Core App:** The main Node.js app is in `multi-sites/core/msitesapp/`, started via PM2. See its README for setup and process management.
- **SEO & Structured Data:** JSON-LD and Schema.org are central for SEO. Reference `multi-sites/core/components/ld+json/README.md` for tools, learning resources, and strategic guidance.
- **Public Assets:** Site-specific assets are in `public/[site]/`. Shared scripts and automation live at the workspace root and in `scripts/`.

## Developer Workflows
- **Node Version:** Use Node.js 22.0.0 (see `.nvmrc`). Switch automatically with nvm when entering the project folder.
- **Install & Start:**
  - `npm install` in the core app directory.
  - Start with `pm2 start ./multi-sites/core/msitesapp/server.js --name msitesapp`.
  - Use PM2 for process management: `pm2 restart|stop|delete|logs msitesapp`.
  - For auto-restart on VPS reboot, run `pm2 startup` and follow the printed instructions.
- **Astro Pages:** Edit site content in `multi-sites/sites/[site]/pages/`. Use Astro conventions, but check for custom patterns in existing pages.

## Patterns & Conventions
- **SEO-first:** Prioritize structured data (JSON-LD, Schema.org) in all content. See `ld+json/README.md` for best practices and tools.
- **Automation Scripts:** Use scripts in the root and `scripts/` for tasks like image generation, blog syncing, and deployment. Review script headers for usage notes.
- **Image Placeholders:** Copilot may be used to insert image placeholders in articles (see `seo/prompts/README.md`).
- **Config Files:** Tailwind configs are site-specific (e.g., `tailwind.fastvistos.config.js`). Multi-site config is in `multi-sites.config.mjs`.

## Integration Points
- **External Services:** JSON-LD tools, Google Rich Results, and schema.org are referenced for validation and learning.
- **Process Management:** PM2 is required for running and managing the Node.js server.
- **Knowledge Graphs & AI:** Strategic focus on structured data for future-proofing SEO and AI integration (see `ld+json/README.md`).

## Key References
- `multi-sites/core/msitesapp/README.md` — Node/PM2 setup, process management
- `multi-sites/core/components/ld+json/README.md` — JSON-LD, Schema.org, SEO strategy
- `multi-sites/sites/[site]/pages/` — Site content (Astro)
- `public/[site]/` — Site assets
- `scripts/` — Automation and deployment scripts
- `multi-sites.config.mjs` — Multi-site configuration

---
For unclear workflows or missing conventions, review the referenced READMEs and script headers. Ask for feedback if any section needs clarification or expansion.