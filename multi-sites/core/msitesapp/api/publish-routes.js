import express from 'express';
import { apiKeyAuth } from './api.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

export default (BlogService) => {
  // Endpoint protegido para teste
  router.get('/test-hello', apiKeyAuth, async (req, res) => {
    res.json({ message: "Hello, world!" });
  });

  // Endpoint para criar um novo artigo de blog
  router.post('/blog-article', apiKeyAuth, async (req, res) => {
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
      if (!business_id || !blog_topic_slug || !title) {
        return res.status(400).json({ error: 'business_id, blog_topic_slug e title são obrigatórios.' });
      }
      let blog_topic_id;
      try {
        const topic = await BlogService.getBlogTopicBySlug(blog_topic_slug, business_id);
        if (!topic || !topic.id) {
          return res.status(404).json({ error: 'Blog topic não encontrado para o slug informado.' });
        }
        blog_topic_id = topic.id;
      } catch (err) {
        return res.status(500).json({ error: 'Erro ao buscar blog topic.', details: err.message });
      }
      const TYPE_CHOICES = ['internal', 'public', 'restricted'];
      if (type && !TYPE_CHOICES.includes(type)) {
        return res.status(400).json({ error: `type deve ser um dos: ${TYPE_CHOICES.join(', ')}` });
      }
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

  // POST /publish-article
  router.post('/publish-article', async (req, res) => {
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
        seoMetaDescription: "Descrição otimizada para SEO",
        markdownText: "Texto completo do artigo em Markdown"
      };
      if (process.env.DEBUG === 'false') {
        try {
          artigo1 = await extractReadableText(url1);
        } catch (err) {
          return res.status(500).json({ success: false, error: 'Failed to extract article 1 from url1.' });
        }
        try {
          artigo2 = await extractReadableText(url2);
        } catch (err) {
          return res.status(500).json({ success: false, error: 'Failed to extract article 2 from url2.' });
        }
        try {
          newArticle =  await reescreverArtigo(openai, artigo1, artigo2);
        } catch (err) {
          return res.status(500).json({ success: false, error: 'Failed to rewrite articles.' });
        }
      }
      const fastVistosPromo = `\n👉 **Fast Vistos** – Assessoria Especializada para Vistos e Passaportes\n\nSabemos que sua rotina é corrida. Se você não tem tempo para **trâmites com vistos de turismo**, nós cuidamos de tudo para você. Nossa equipe garante que cada etapa seja feita com **eficiência, segurança e atenção aos detalhes]**, para que você possa focar no que realmente importa.\n\n💬 **Entre em contato e descubra como podemos ajudar você:**  \n**Telefone/WhatsApp:** ☎ (19) 2042-2785  \n**Site:** https://fastvistos.com.br  \n**E-mail:** contato@fastvistos.com.br\n\n[![Fast Vistos - Assessoria de Vistos](https://fastvistos.com.br/assets/images/blog/fastvistos__fastvistos-assessoria-de-vistos-com-sede-em-campinas.webp)](https://fastvistos.com.br/)  \n**Entre em contato pelo nosso <a href=\"https://wa.me/551920422785\" target=\"_blank\">WhatsApp ↗</a> sem compromisso!**\n        `;
      const content_md = `${newArticle.markdownText}\n\n${fastVistosPromo}`;
      let id = uuidv4();
      id = id.replace(/-/g, '');
      const title = newArticle.title;
      const type = 'public';
      const slug = slugify(title, {
        lower: true,
        strict: true,
        locale: 'pt'
      });
      const published = new Date();
      const image = image_url;
      const blog_topic_id = typeof topic_id === 'string' ? topic_id.replace(/-/g, '') : topic_id;
      const businessIdNoDash = typeof business_id === 'string' ? business_id.replace(/-/g, '') : business_id;
      const seo_description = newArticle.seoMetaDescription;
      const seo_image_caption = newArticle.title;
      const seo_image_height = 600;
      const seo_image_width = 800;
      if (process.env.DEBUG === 'false') {
        try {
          await BlogService.createBlogArticle({
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
        } catch (err) {
          return res.status(500).json({ success: false, error: 'Failed to create article.' });
        }
      }
      const charCount = content_md ? content_md.length : 0;
      const blogUrl = `https://fastvistos.com.br/blog/${slug}/?debug=true`;
      try {
        if (process.env.DEBUG === 'false') {
          await publishSiteFromVps(business_name);
        }
      } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to execute publish-from-vps.sh' });
      }
      res.json({
        success: true,
        charCount,
        blogUrl,
        title: newArticle.title
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  });

  // POST endpoint to receive email data from Postfix/Go pipeline
  router.post('/postfix/receive-email', async (req, res) => {
    try {
      const { from, subject, body, nome, valor, data } = req.body;
      if (!from || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields: from, subject, body.' });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Email received and processed successfully.' 
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // Rate limiting for /next-articles
  const nextArticlesLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: "Too many requests, please try again later." }
  });

  // GET endpoint to fetch next articles for carousel
  router.get('/next-articles', nextArticlesLimiter, async (req, res) => {
    try {
      const { business_id, blog_topic_id, offset, limit } = req.query;
      if (
        typeof business_id !== 'string' ||
        typeof blog_topic_id !== 'string' ||
        isNaN(Number(offset)) ||
        isNaN(Number(limit)) ||
        Number(limit) > 20 || Number(limit) < 1 ||
        Number(offset) < 0
      ) {
        return res.status(400).json({ error: 'Invalid query parameters.' });
      }
      if (Number(limit) > 10) {
        // Optionally log suspicious requests
      }
      const DEBUG_NEXT_ARTICLES = process.env.DEBUG_NEXT_ARTICLES === 'true';
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
      const articles = await BlogService.getArticlesByTopicIdWithOffset(business_id, blog_topic_id, Number(offset), Number(limit));
      return res.json({ articles });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // POST /article-image
  router.post('/article-image', async (req, res) => {
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
      res.status(500).json({ error: err.message });
    }
  });

  // POST /execute-publish-script
  router.post('/execute-publish-script', async (req, res) => {
    try {
      const { site_id } = req.body;
      const { exec } = await import('child_process');
      const scriptPath = '/home/edgar/Repos/fastvistos/publish-from-vps-v2.sh';
      await new Promise((resolve, reject) => {
        exec(`${scriptPath} ${site_id}`, {
          cwd: '/home/edgar/Repos/fastvistos',
          env: process.env,
        }, (error, stdout, stderr) => {
          if (error) return reject(error);
          resolve({ stdout, stderr });
        });
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  });

  return router;
};
