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
 
    try {
      const { images, total } = await BlogService.getBlogImagesByGroup(group, offset, limit);
      res.json({ images, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (err) {
      console.error('Erro ao buscar galeria:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};