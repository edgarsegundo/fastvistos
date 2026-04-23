import express from 'express';
const router = express.Router();

export default (BlogService) => {

  // GET content_md
  // api/admin
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
    const { content_md } = req.body;
    if (!blog_article_id || typeof content_md !== 'string') {
      return res.status(400).json({ error: 'blog_article_id e content_md são obrigatórios.' });
    }
    try {
      console.log(`** Updating content_md for article ${blog_article_id}...`);
      console.log(`** New content_md preview: ${content_md.substring(0, 100)}...`);
      const updated = await BlogService.updateBlogArticleContentMd(blog_article_id, content_md);
      console.log(`✅ Updated content_md for article ${blog_article_id}`);
      res.json({ success: true, updated });
    } catch (err) {
      console.error(`Error updating content_md for article ${blog_article_id}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
