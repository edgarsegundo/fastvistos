// Carrega variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
dotenv.config();
// To add a new lib, always import fom dist like for example: `../../dist/lib/libname.js`

import rateLimit from 'express-rate-limit';
import { extractReadableText } from '../../dist/lib/txtify.js';
import { WebPageService } from '../../dist/lib/webpage-service.js';
import { reescreverArtigo } from './news-article-generator.js';
import { openai } from '../openai-client.js'; // adjust path as needed
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

const { BlogService } = await import('../../dist/lib/blog-service.js');

import express from 'express';
import bodyParser from 'body-parser';

// Middleware para autenticação por chave de API
function apiKeyAuth(req, res, next) {
    // A chave pode ser passada via header x-api-key ou query param api_key
    const apiKey = req.header('x-api-key') || req.query.api_key;
    const validKey = process.env.MYSITESAPP_API_KEY || 'minha-chave-secreta';
    if (apiKey !== validKey) {
        return res.status(403).json({ error: 'Acesso negado: chave de API inválida.' });
    }
    next();
}

const app = express();

app.use(bodyParser.json());

// Add request logging for debugging
app.use((req, res, next) => {
    if (process.env.DEBUG_VERBOSE === 'true') {
        console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
        if (req.body) {
            console.log('Request body:', JSON.stringify(req.body, null, 2));
        }
    }
    next();
});

// Rate limiting for /next-articles
const nextArticlesLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 requests per minute
    message: { error: "Too many requests, please try again later." }
});

app.use('/next-articles', nextArticlesLimiter);

// São muitos os domínios que podem usar este endpoint, 
// então desabilitei a verificação de origem e vou pensar numa
// solução mais robusta no futuro
// // Restrict by origin (CORS-like, but for abuse monitoring)
// app.use('/next-articles', (req, res, next) => {
//     const allowedOrigin = 'https://fastvistos.com.br';
//     if (req.headers.origin && req.headers.origin !== allowedOrigin) {
//         return res.status(403).json({ error: 'Forbidden origin.' });
//     }
//     next();
// });

app.get('/ping', (req, res) => {
    res.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
    });
});

// POST endpoint to create a WebPageSection and Version (for htmx or API)
app.post('/webpage-section', async (req, res) => {
    try {
        const {
            webpageRelativePath,
            title,
            updatableUuid,
            businessId,
            htmlContent,
            siteId,
            isFirstClone = false,
        } = req.body;
        if (
            !webpageRelativePath ||
            !title ||
            !updatableUuid ||
            !businessId ||
            !htmlContent ||
            !siteId
        ) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const result = await WebPageService.createSectionAndVersion({
            webpageRelativePath,
            title,
            updatableUuid,
            businessId,
            htmlContent,
            siteId,
            isFirstClone,
        });
        // If htmx, you can return HTML here, but JSON is fine for most cases
        res.json(result);
    } catch (error) {
        console.error('Error in /webpage-section:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST endpoint to update a WebPageSection and Version (for htmx or API)
app.post('/update-section-file-version', async (req, res) => {
    try {
        const { webPageSectionVersionId, siteId, htmlContent } = req.body;
        if (!webPageSectionVersionId || !siteId || !htmlContent) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const result = await WebPageService.updateSectionFileContent({
            webPageSectionVersionId,
            siteId,
            htmlContent,
        });
        res.json(result);
    } catch (error) {
        console.error('Error in /update-section-file-version:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST endpoint to publish a WebPageSection and Version (for htmx or API)
app.post('/publish-section', async (req, res) => {
    try {
        const { updatableUuid, webpageRelativePath, businessId, htmlContent, siteId, versionId } =
            req.body;
        if (!webpageRelativePath || !updatableUuid || !businessId || !htmlContent || !siteId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const result = await WebPageService.publishSection({
            webpageRelativePath,
            updatableUuid,
            businessId,
            versionId,
        });

        // Create a backup file with .original added before
        // the extension, keeping the rest of the name unchanged.

        const originalPath = webpageRelativePath.replace(/(\.[^/.]+)$/, '.original');
        const fs = await import('fs').then((mod) => mod.promises);

        // Only copy if backup does not already exist
        try {
            await fs.access(originalPath);
            console.log(`Backup already exists: ${originalPath}`);
        } catch {
            await fs.copyFile(webpageRelativePath, originalPath);
            console.log(`Created backup of original file at: ${originalPath}`);
        }

        // Replace only the content inside the matching
        // <div updatable-section-uuid="...">...</div> with htmlContent,
        // keeping the rest of the file unchanged.
        let fileData = await fs.readFile(webpageRelativePath, 'utf-8');
        // Robust regex: match <div ... updatable-section-uuid="..." ...>...</div> with any attribute order/whitespace
        const uuidRegex = new RegExp(
            `<div[^>]*\\bupdatable-section-uuid=["']${updatableUuid}["'][^>]*>([\\s\\S]*?)<\\/div>`,
            'i'
        );
        const beforeMatch = fileData.match(uuidRegex);
        if (beforeMatch) {
            console.log('[DEBUG] Found matching section for replacement.');
            console.log('[DEBUG] Before replacement snippet:', beforeMatch[0].slice(0, 500));
        } else {
            console.warn('[WARN] No matching section found for updatableUuid:', updatableUuid);
        }
        fileData = fileData.replace(uuidRegex, (match, innerContent) => {
            // Replace only the inner content, keep the original <div ...> and </div>
            return match.replace(innerContent, htmlContent);
        });
        const afterMatch = fileData.match(uuidRegex);
        if (afterMatch) {
            console.log('[DEBUG] After replacement snippet:', afterMatch[0].slice(0, 500));
        }

        // Debug log before writing file
        console.log(`[DEBUG] Writing updated content to: ${webpageRelativePath}`);
        try {
            await fs.writeFile(webpageRelativePath, fileData, 'utf-8');
            console.log(`[DEBUG] Successfully wrote to: ${webpageRelativePath}`);
        } catch (err) {
            console.error(`[ERROR] Failed to write to: ${webpageRelativePath}`);
            throw err;
        }

        // // keep a copy of the original inner content for reference
        // // Extract the inner content again for saving
        // const match = fileData.match(uuidRegex);
        // console.log('[DEBUG] Extracting original inner content for backup mathch:', match);
        // console.log('[DEBUG] Extracting original inner content for backup match:', JSON.stringify(match, null, 2));
        // if (match && match[1]) {
        //     const originalInnerContent = match[1]; // This is the inner HTML of the div
        //     // Write to a file, e.g.:
        //     await fs.writeFile(`${versionId}_0:original`, originalInnerContent, 'utf-8');

        //     // copy to /var/www/[siteId]/webpage_sections????
        //     console.log('Original inner content saved.');
        // } else {
        //     console.warn('No matching section found for updatableUuid:', updatableUuid);
        // }

        // Now run `npm run build:fastvistos` to regenerate the site
        const { exec } = await import('child_process');
        function runBuild() {
            return new Promise((resolve, reject) => {
                exec(
                    'npm run build:fastvistos',
                    {
                        cwd: process.cwd(),
                        env: process.env,
                    },
                    (error, stdout, stderr) => {
                        // Log full output for troubleshooting
                        console.log('[DEBUG] Build stdout (full):', stdout);
                        console.warn('[DEBUG] Build stderr (full):', stderr);
                        if (error) {
                            console.error('[ERROR] Build failed:', error);
                            return reject({ error: error.message, stdout, stderr });
                        }
                        resolve({ stdout, stderr });
                    }
                );
            });
        }
        let buildOutput = null;
        try {
            buildOutput = await runBuild();
            console.log('[DEBUG] Build output:', buildOutput.stdout.slice(0, 1000));
            if (buildOutput.stderr) {
                console.warn('[WARN] Build stderr:', buildOutput.stderr.slice(0, 1000));
            }
            // To allow passwordless sudo for deploy-site-vps.sh:
            // 1. Edit the sudoers file with visudo (for safety).
            // 2. Add this line (all on one line):
            //   edgar ALL=(ALL) NOPASSWD: /home/edgar/Repos/fastvistos/deploy-site-vps.sh
            //    (replace "edgar" with your username; check with `whoami`)
            //    (use the full script path; check with `realpath deploy-site-vps.sh`)
            // This lets only that script run as root, no password needed.
            // This allows only that script to be run as root without a password, improving security over a blanket NOPASSWD rule.
            // Next step: run deploy-site-vps.sh with sudo (requires passwordless sudo setup)
            const deployScriptPath = '/home/edgar/Repos/fastvistos/deploy-site-vps.sh';
            const deployCmd = `sudo ${deployScriptPath} ${siteId}`;
            await new Promise((resolve, reject) => {
                exec(
                    deployCmd,
                    {
                        cwd: process.cwd(),
                        env: process.env,
                    },
                    (error, stdout, stderr) => {
                        console.log('[DEBUG] Deploy stdout (full):', stdout);
                        console.warn('[DEBUG] Deploy stderr (full):', stderr);
                        if (error) {
                            console.error('[ERROR] Deploy failed:', error);
                            return reject({ error: error.message, stdout, stderr });
                        }
                        resolve({ stdout, stderr });
                    }
                );
            });
        } catch (buildErr) {
            console.error('[ERROR] Build process failed:', buildErr);
            // Optionally, you can return build error in the response
            return res.status(500).json({ ...result, buildError: buildErr });
        }

        res.json({ ...result, buildOutput });
    } catch (error) {
        console.error('Error in /publish-section:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET endpoint to fetch all versions for a section by uuid and businessId
// Best practice: use GET for idempotent, read-only queries (like this)
app.get('/page-section-versions', async (req, res) => {
    try {
        const { 'updatable-section-uuid': updatableSectionUuid, 'business-id': businessId } =
            req.query;
        if (
            !updatableSectionUuid ||
            typeof updatableSectionUuid !== 'string' ||
            !businessId ||
            typeof businessId !== 'string'
        ) {
            return res
                .status(400)
                .json({
                    error: 'Missing or invalid updatable-section-uuid or businessId query param.',
                });
        }
        const versions = await WebPageService.getPageSectionVersions({
            updatableSectionUuid,
            businessId,
        });
        res.json({ versions });
    } catch (error) {
        console.error('Error in /page-section-versions:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/page-section-version', async (req, res) => {
    try {
        // const { id, siteId } = req.query;
        const { 'site-id': siteId, id } = req.query;
        if (!id || typeof id !== 'string' || !siteId || typeof siteId !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid id or siteId query param.' });
        }
        const version = await WebPageService.getPageSectionVersionById({
            id,
            siteId,
        });
        res.json({ version });
    } catch (error) {
        console.error('Error in /page-section-version:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.delete('/page-section-version', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res
                .status(400)
                .json({ success: false, error: 'Missing or invalid id query param.' });
        }
        const result = await WebPageService.removePageSectionVersionById({ id });
        res.json(result);
    } catch (error) {
        console.error('Error in /page-section-version:', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});

// Endpoint protegido por chave de API
app.get("/test-hello", apiKeyAuth, async (req, res) => {
    res.json({ message: "Hello, world!" });
});

// Endpoint para criar um novo artigo de blog
app.post('/blog-article', apiKeyAuth, async (req, res) => {
    try {
        const {
            business_id,
            blog_topic_slug,
            title,
            seo_description,
            show_in_hero,
            content_md,
            faq_json,
            type = 'internal',
            slug,
            published,
            image
        } = req.body;

        // Validação básica
        if (!business_id || !blog_topic_slug || !title) {
            return res.status(400).json({ error: 'business_id, blog_topic_slug e title são obrigatórios.' });
        }

        // Buscar o id do blog_topic pelo slug
        let blog_topic_id;
        try {
            // Ajuste conforme seu BlogService: deve haver um método para buscar topic por slug
            const topic = await BlogService.getBlogTopicBySlug(blog_topic_slug, business_id);
            if (!topic || !topic.id) {
                return res.status(404).json({ error: 'Blog topic não encontrado para o slug informado.' });
            }
            blog_topic_id = topic.id;
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao buscar blog topic.', details: err.message });
        }

        // Validação de type
        const TYPE_CHOICES = ['internal', 'public', 'restricted'];
        if (type && !TYPE_CHOICES.includes(type)) {
            return res.status(400).json({ error: `type deve ser um dos: ${TYPE_CHOICES.join(', ')}` });
        }

        // Monta objeto para criação
        const articleData = {
            business_id,
            blog_topic_id,
            title,
            seo_description,
            show_in_hero: !!show_in_hero,
            content_md,
            faq_json: faq_json || [],
            type,
            slug,
            published: published ? new Date(published) : null,
            image
        };

        // Chama o serviço de criação (ajuste conforme seu BlogService)
        let created;
        try {
            created = await BlogService.createBlogArticle(articleData);
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao criar artigo.', details: err.message });
        }

        res.status(201).json({ success: true, article: created });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

app.post('/publish-article', async (req, res) => {
    try {
        const {
            url1,
            url2,
            topic_id,
            business_id,
            business_name,
            image_url,
            image_alt
        } = req.body;

        console.log('ℹ️ Received /publish-article request with body:', JSON.stringify(req.body, null, 2));

        // Validate required fields
        if (!url1 || !url2) {
            return res.status(400).json({success: false, error: 'Both url1 and url2 are required.' });
        }
        if (!topic_id) {
            return res.status(400).json({success: false, error: 'topic_id is required.' });
        }
        if (!business_id) {
            return res.status(400).json({success: false, error: 'business_id is required.' });
        }
        if (!business_name) {
            return res.status(400).json({success: false, error: 'business_name is required.' });
        }
        if (!image_url) {
            return res.status(400).json({success: false, error: 'image_url is required.' });
        }
        if (!image_alt) {
            return res.status(400).json({success: false, error: 'image_alt is required.' });
        }

        let artigo1 = null;
        let artigo2 = null;

        const timestamp = new Date().getTime();
        let newArticle =  {
            title: `Artigo Auto Gerado ${timestamp}`,
            "seoMetaDescription": "Descrição otimizada para SEO",
            "markdownText": "Texto completo do artigo em Markdown"
        };

        if (process.env.DEBUG === 'false') {
            try {
                artigo1 = await extractReadableText(url1);
            } catch (err) {
                console.error('❌ Error during article 1 extraction/rewrite:', err);
                return res.status(500).json({ success: false, error: 'Failed to extract article 1 from url1.' });
            }

            try {
                artigo2 = await extractReadableText(url2);
            } catch (err) {
                console.error('❌ Error during article 2 extraction/rewrite:', err);
                return res.status(500).json({ success: false, error: 'Failed to extract article 2 from url2.' });
            }

            try {
                newArticle =  await reescreverArtigo(openai, artigo1, artigo2);
            } catch (err) {
                console.error('❌ Error during article rewriting:', err);
                return res.status(500).json({ success: false, error: 'Failed to rewrite articles.' });
            }
        }

        // console.log('ℹ️ Extracted artigo1:', artigo1.slice(0, 500)); // log first 500 chars
        // console.log('ℹ️ Extracted artigo2:', artigo2.slice(0, 500)); // log first 500 chars

        // Validate the newArticle object
        if (!newArticle || !newArticle.title || !newArticle.seoMetaDescription || !newArticle.markdownText) {
            console.error('❌ Invalid article structure:', newArticle);
            return res.status(500).json({ success: false, error: 'Failed to generate article. Invalid response from AI.' });
        }

        // return { title, seoMetaDescription, markdownFinal };
        const fastVistosPromo = `
👉 **Fast Vistos** – Assessoria Especializada para Vistos e Passaportes

Sabemos que sua rotina é corrida. Se você não tem tempo para **trâmites com vistos de turismo**, nós cuidamos de tudo para você. Nossa equipe garante que cada etapa seja feita com **eficiência, segurança e atenção aos detalhes]**, para que você possa focar no que realmente importa.

💬 **Entre em contato e descubra como podemos ajudar você:**  
**Telefone/WhatsApp:** ☎ (19) 2042-2785  
**Site:** https://fastvistos.com.br  
**E-mail:** contato@fastvistos.com.br

[![Fast Vistos - Assessoria de Vistos](https://fastvistos.com.br/assets/images/blog/fastvistos__fastvistos-assessoria-de-vistos-com-sede-em-campinas.webp)](https://fastvistos.com.br/)  
**Entre em contato pelo nosso <a href="https://wa.me/551920422785" target="_blank">WhatsApp ↗</a> sem compromisso!**
        `;

        // Append to markdownFinal
        const content_md = `${newArticle.markdownText}\n\n${fastVistosPromo}`;
        // Generate UUID (v4) for id and remove dashes
        let id = uuidv4();
        id = id.replace(/-/g, '');
        const title = newArticle.title;
        const type = 'public';
        const slug = slugify(title, {
            lower: true,       // tudo minúsculo
            strict: true,      // remove caracteres não-alfanuméricos
            locale: 'pt'       // trata acentuação PT-BR corretamente
        });
        const published = new Date();
        const image = image_url;
        // Remove dashes from blog_topic_id and business_id if present
        const blog_topic_id = typeof topic_id === 'string' ? topic_id.replace(/-/g, '') : topic_id;
        const businessIdNoDash = typeof business_id === 'string' ? business_id.replace(/-/g, '') : business_id;
        const seo_description = newArticle.seoMetaDescription;
        const seo_image_caption = newArticle.title;
        const seo_image_height = 600;
        const seo_image_width = 800;

        console.log('ℹ️ Calling createBlogArticle with generated article data...');

        if (process.env.DEBUG === 'false') {

            try {
                const createdArticle = await BlogService.createBlogArticle({
                    id,
                    title,
                    content_md,
                    type,
                    slug,
                    published,
                    image,
                    business_id: businessIdNoDash,
                    blog_topic_id,
                    seo_description,
                    seo_image_caption,
                    seo_image_height,
                    seo_image_width,
                });
                console.log('ℹ️ Article created:', createdArticle?.id);
            } catch (err) {
                console.error('❌ Error during article creation:', err);
                return res.status(500).json({ success: false, error: 'Failed to create article.' });
            }
        }

        // Count characters in content_md
        const charCount = content_md ? content_md.length : 0;
        // Build the blog article URL
        const blogUrl = `https://fastvistos.com.br/blog/${slug}/?debug=true`;

        try {
            if (process.env.DEBUG === 'false') {
                await publishSiteFromVps(business_name);
            }
        } catch (err) {
            console.error('❌ Failed to execute publish-from-vps.sh:', err);
            return res.status(500).json({ success: false, error: 'Failed to execute publish-from-vps.sh' });
        }
        console.log('ℹ️ Article publishing simulated.'); // Placeholder for actual publishing logic

        res.json({
            success: true,
            charCount,
            blogUrl,
            title: newArticle.title
        });
    } catch (error) {
        console.error('❌ Error in /publish-article, Error: ', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});

async function publishSiteFromVps(siteId) {
    // Execute the shell script before publishing logic
    const { exec } = await import('child_process');
    const scriptPath = '/home/edgar/Repos/fastvistos/publish-from-vps.sh';
    await new Promise((resolve, reject) => {
        exec(`${scriptPath} ${siteId}`, {
            cwd: '/home/edgar/Repos/fastvistos',
            env: process.env,
        }, (error, stdout, stderr) => {
            console.log('[DEBUG] publish-from-vps.sh stdout:', stdout);
            if (stderr) console.warn('[DEBUG] publish-from-vps.sh stderr:', stderr);
            if (error) {
                console.error('[ERROR] publish-from-vps.sh failed:', error);
                return reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
}

// POST endpoint to receive email data from Postfix/Go pipeline
app.post('postfix/receive-email', async (req, res) => {
    try {
        const { from, subject, body, nome, valor, data } = req.body;
        
        // Validate required fields
        if (!from || !subject || !body) {
            return res.status(400).json({ error: 'Missing required fields: from, subject, body.' });
        }

        // Log received email data
        console.log('Received email from Postfix:', {
            from,
            subject,
            nome: nome || 'N/A',
            valor: valor || 'N/A',
            data: data || 'N/A'
        });

        // TODO: Process the email data (save to database, send notification, etc.)
        // Example:
        // await EmailService.processPixTransfer({
        //     from,
        //     subject,
        //     body,
        //     nome,
        //     valor,
        //     data
        // });

        // Return success response
        res.status(200).json({ 
            success: true, 
            message: 'Email received and processed successfully.' 
        });
    } catch (error) {
        console.error('Error in /postfix/receive-email:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET endpoint to fetch next articles for carousel (dynamic loading)
const DEBUG_NEXT_ARTICLES = process.env.DEBUG_NEXT_ARTICLES === 'true';
// const DEBUG_NEXT_ARTICLES = true;
app.get('/next-articles', async (req, res) => {
    try {
        const { business_id, blog_topic_id, offset, limit } = req.query;
        // Strict param validation
        if (
            typeof business_id !== 'string' ||
            typeof blog_topic_id !== 'string' ||
            isNaN(Number(offset)) ||
            isNaN(Number(limit)) ||
            Number(limit) > 20 || Number(limit) < 1 ||
            Number(offset) < 0
        ) {
            console.warn(`Suspicious request: invalid params from IP ${req.ip}`, req.query);
            return res.status(400).json({ error: 'Invalid query parameters.' });
        }
        if (Number(limit) > 10) {
            console.warn(`Suspicious request: limit=${limit} from IP ${req.ip}`);
        }

        // Mock data for debug
        if (DEBUG_NEXT_ARTICLES) {
            const articles = Array.from({ length: Number(limit) }, (_, i) => {
                const idx = Number(offset) + i + 1;
                return {
                    id: `mock-${blog_topic_id}-${idx}`,
                    slug: `article-${blog_topic_id}-${idx}`,
                    title: `Artigo ${idx} do Tópico ${blog_topic_id}`,
                    image: '',
                    published: new Date().toISOString(),
                    seo_description: `SEO description for artigo ${idx}`,
                };
            });
            return res.json({ articles });
        }

        // Fetch articles for topic, sorted by published desc, skip offset, take limit
        const articles = await BlogService.getArticlesByTopicIdWithOffset(business_id, blog_topic_id, Number(offset), Number(limit));

        console.log(`**** Fetched ${articles.length} articles for topic ${blog_topic_id} (offset: ${offset}, limit: ${limit})`);
        console.log('**** Article IDs:', articles.map(a => a.id).join(', '));
        return res.json({ articles });
    } catch (error) {
        console.error('Error in /next-articles:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /article-image — save hero image fields on blog_article (local dev only)
app.post('/article-image', async (req, res) => {
    const { businessId, slug, image, seo_image_url, seo_image_caption, seo_image_width, seo_image_height } = req.body;
    if (!businessId || !slug) {
        return res.status(400).json({ error: 'businessId e slug são obrigatórios' });
    }
    try {
        const result = await BlogService.updateArticleImage(businessId, slug, {
            image,
            seo_image_url,
            seo_image_caption: seo_image_caption || null,
            seo_image_width:  seo_image_width  ? Number(seo_image_width)  : undefined,
            seo_image_height: seo_image_height ? Number(seo_image_height) : undefined,
        });
        res.json({ ok: true, count: result.count });
    } catch (err) {
        console.error('[/article-image]', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/execute-publish-script', async (req, res) => {
    try {
        const {
            site_id,
        } = req.body;

        const { exec } = await import('child_process');
        const scriptPath = '/home/edgar/Repos/fastvistos/publish-from-vps-v2.sh';
        await new Promise((resolve, reject) => {
            exec(`${scriptPath} ${site_id}`, {
                cwd: '/home/edgar/Repos/fastvistos',
                env: process.env,
            }, (error, stdout, stderr) => {
                console.log('[DEBUG] publish-from-vps-v2 stdout:', stdout);
                if (stderr) console.warn('[DEBUG] publish-from-vps-v2 stderr:', stderr);
                if (error) {
                    console.error('[ERROR] publish-from-vps-v2 failed:', error);
                    return reject(error);
                }
                resolve({ stdout, stderr });
            });
        });
    } catch (error) {
        console.error('❌ Error in /execute-publish-script, Error: ', error);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});


export default app;

