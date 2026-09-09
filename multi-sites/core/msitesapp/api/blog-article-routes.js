import express from 'express';
import multer from 'multer';

const router = express.Router();

// Multer com memoryStorage: o buffer fica em memória e é repassado
// integralmente ao Django via BlogService.uploadArticleImage.
// Sem gravar nada em disco neste Express.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

export default (BlogService) => {

  // GET content_md
  router.get('/image-editor/articles/:blog_article_id/content-md/', async (req, res) => {
    const { blog_article_id } = req.params;
    if (!blog_article_id) return res.status(400).json({ error: 'blog_article_id é obrigatório.' });
    try {
      const article = await BlogService.getBlogArticleById(blog_article_id);
      if (!article) return res.status(404).json({ error: 'Artigo não encontrado.' });
      res.json({ content_md: article.content_md });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET meta (título e outros metadados)
  router.get('/image-editor/articles/:blog_article_id/meta/', async (req, res) => {
    const { blog_article_id } = req.params;
    if (!blog_article_id) return res.status(400).json({ error: 'blog_article_id é obrigatório.' });
    try {
      const article = await BlogService.getBlogArticleById(blog_article_id);
      if (!article) return res.status(404).json({ error: 'Artigo não encontrado.' });
      res.json({
        title: article.title || '',
        slug: article.slug || '',
        seo_description: article.seo_description || '',
        metatitle: article.metatitle || '',
        // Imagem principal (coluna `image`). Usado pelo publish-article (.l2)
        // para marcar quais artigos já têm imagem definida no CMS.
        image: article.image || null,
        has_image: Boolean(article.image),
        business_id: article.business_id || null,
        blog_topic_id: article.blog_topic_id || null,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST content_md
  router.post('/image-editor/articles/:blog_article_id/save-content-md/', async (req, res) => {
    const { blog_article_id } = req.params;
    const { content_md, main_image_url } = req.body;
    
    // body: JSON.stringify({ blog_article_id: articleId, content_md, main_image_url: mainImageUrl }),

    if (!blog_article_id || typeof content_md !== 'string') {
      return res.status(400).json({ error: 'blog_article_id e content_md são obrigatórios.' });
    }
    try {
      console.log(`** Updating content_md for article ${blog_article_id}...`);
      console.log(`** New content_md preview: ${content_md.substring(0, 100)}...`);
      const updated = await BlogService.updateBlogArticleContentMd(blog_article_id, content_md, main_image_url);
      console.log(`Updated content_md for article ${blog_article_id}`);
      res.json({ success: true, updated });
    } catch (err) {
      console.error(`Error updating content_md for article ${blog_article_id}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /image-editor/articles/:blog_article_id/set-main-image/
   *
   * Define a imagem principal do artigo (campo `image`) sem alterar o content_md.
   * Usado pelo botão "Salvar" do image-uploader.html para tornar a imagem recém
   * salva automaticamente a imagem principal, sem precisar abrir "Editar artigo".
   */
  router.post('/image-editor/articles/:blog_article_id/set-main-image/', async (req, res) => {
    const { blog_article_id } = req.params;
    const { image_url } = req.body;

    if (!blog_article_id || !image_url) {
      return res.status(400).json({ error: 'blog_article_id e image_url são obrigatórios.' });
    }
    try {
      const updated = await BlogService.updateBlogArticleImage(blog_article_id, image_url);
      res.json({ success: true, updated });
    } catch (err) {
      console.error(`Error setting main image for article ${blog_article_id}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /image-editor/articles/:blog_article_id/upload-image/
   *
   * Proxy de upload de imagem para o Django.
   *
   * Contexto: o image-uploader.html envia a imagem diretamente para cá
   * (sem passar pelo pipeline de processamento do Express que o blog-image-editor.js usa).
   * Este endpoint apenas bufferiza via multer e repassa ao Django como multipart idêntico.
   *
   * Fluxo:
   *   browser -> multipart/form-data (campo "image") -> multer (memoryStorage)
   *   -> BlogService.uploadArticleImage -> fetch Django -> { image_url }
   */
  router.post(
    '/image-editor/articles/:blog_article_id/upload-image/',
    upload.single('image'),
    async (req, res) => {
      const { blog_article_id } = req.params;
      if (!blog_article_id) {
        return res.status(400).json({ error: 'blog_article_id é obrigatório.' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada (campo "image" ausente).' });
      }

      try {
        const result = await BlogService.uploadArticleImage(blog_article_id, req.file);
        res.json(result); // { image_url }
      } catch (err) {
        console.error(`Error uploading image for article ${blog_article_id}:`, err);
        res.status(500).json({ error: err.message });
      }
    }
  );


  /**
   * GET /image-editor/gallery/
   *
   * Lista imagens do banco filtradas por group, com paginação simples.
   *
   * Query params:
   *   group  {string}  obrigatório
   *   page   {number}  opcional, default 1
   *   limit  {number}  opcional, default 24 (máx 100)
   *
   * Resposta:
   *   { images: [...], total, page, limit, pages }
   *
   * O campo `image` em cada item é o path relativo do Django.
   * O frontend monta a URL absoluta com MEDIA_BASE.
   */
  router.get('/image-editor/gallery/', async (req, res) => {
    const { group } = req.query;
    if (!group) return res.status(400).json({ error: 'O parâmetro "group" é obrigatório.' });

    const limit  = Math.min(parseInt(req.query.limit) || 24, 100);
    const page   = Math.max(parseInt(req.query.page)  || 1,  1);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    try {
      const { images, total } = await BlogService.getBlogImagesByGroup(group, offset, limit, search);
      res.json({ images, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (err) {
      console.error('Erro ao buscar galeria:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /image-editor/images/:image_id/rename/
   *
   * Renomeia apenas o label de exibição (`filename`) de uma imagem da galeria
   * (tabela blog_image). Não altera o arquivo físico/URL, então não afeta
   * a imagem principal de artigos nem markdown já colado em content_md.
   */
  router.post('/image-editor/images/:image_id/rename/', async (req, res) => {
    const { image_id } = req.params;
    const { filename } = req.body;

    if (!image_id || !filename || !filename.trim()) {
      return res.status(400).json({ error: 'image_id e filename são obrigatórios.' });
    }
    try {
      const updated = await BlogService.renameBlogImage(image_id, filename.trim());
      res.json({ success: true, updated });
    } catch (err) {
      console.error(`Error renaming image ${image_id}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /image-editor/businesses/
   *
   * Lista todos os businesses, para popular o dropdown da navegação de artigos.
   * Resposta: { businesses: [{ id, name, display_name }] }
   */
  router.get('/image-editor/businesses/', async (req, res) => {
    try {
      const businesses = await BlogService.listBusinesses();
      res.json({ businesses });
    } catch (err) {
      console.error('Erro ao listar businesses:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /image-editor/blog-topics/?business_id=
   *
   * Lista os blog_topics de um business, para popular o dropdown da navegação de artigos.
   * Resposta: { topics: [{ id, title, slug }] }
   */
  router.get('/image-editor/blog-topics/', async (req, res) => {
    const { business_id } = req.query;
    if (!business_id) return res.status(400).json({ error: 'O parâmetro "business_id" é obrigatório.' });
    try {
      const topics = await BlogService.listBlogTopicsByBusiness(business_id);
      res.json({ topics });
    } catch (err) {
      console.error('Erro ao listar blog_topics:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /image-editor/articles-list/
   *
   * Lista artigos com filtros opcionais de business/topic/busca por título,
   * com paginação. Usado pela navegação de troca de artigo no admin.
   *
   * Query params:
   *   business_id     {string}  opcional
   *   blog_topic_id   {string}  opcional
   *   search          {string}  opcional, busca por título
   *   page            {number}  opcional, default 1
   *   limit           {number}  opcional, default 20 (máx 100)
   *
   * Resposta:
   *   { articles: [...], total, page, limit, pages }
   */
  router.get('/image-editor/articles-list/', async (req, res) => {
    const { business_id, blog_topic_id, search } = req.query;

    const limit  = Math.min(parseInt(req.query.limit) || 20, 100);
    const page   = Math.max(parseInt(req.query.page)  || 1,  1);
    const offset = (page - 1) * limit;

    try {
      const { articles, total } = await BlogService.listBlogArticles({
        businessId: business_id,
        blogTopicId: blog_topic_id,
        search,
        offset,
        limit,
      });
      res.json({ articles, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (err) {
      console.error('Erro ao listar artigos:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};