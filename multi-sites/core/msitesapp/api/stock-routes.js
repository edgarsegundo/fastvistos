// stock-routes.js — Rotas para busca de imagens stock (Pexels + Pixabay)
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createClient } from 'pexels';

const router = express.Router();

const PEXELS_PER_PAGE  = 20;
const PIXABAY_PER_PAGE = 20;

// ---------------------------------------------------------------------------
// GET /image-editor/stock/pexels/
//
// Query params:
//   q      {string}  query de busca (obrigatório)
//   page   {number}  página (default 1)
//
// Resposta:
//   { photos: [...], total_results, page, per_page, pages }
//
// Cada photo:
//   { id, photographer, photographer_url, src_medium, src_large, src_original, width, height, alt }
// ---------------------------------------------------------------------------
router.get('/image-editor/stock/pexels/', async (req, res) => {
  const { q, page = 1 } = req.query;

  if (!q) return res.status(400).json({ error: 'O parâmetro "q" é obrigatório.' });

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'PEXELS_API_KEY não configurada.' });

  try {
    const client = createClient(apiKey);
    const result = await client.photos.search({
      query:    q,
      per_page: PEXELS_PER_PAGE,
      page:     parseInt(page) || 1,
    });

    const photos = (result.photos || []).map(photo => ({
      id:                 photo.id,
      photographer:       photo.photographer,
      photographer_url:   photo.photographer_url,
      src_medium:         photo.src.medium,
      src_large:          photo.src.large,
      src_original:       photo.src.original,
      width:              photo.width,
      height:             photo.height,
      alt:                photo.alt || '',
    }));

    const totalResults = result.total_results || 0;
    const currentPage  = parseInt(page) || 1;

    res.json({
      photos,
      total_results: totalResults,
      page:          currentPage,
      per_page:      PEXELS_PER_PAGE,
      pages:         Math.ceil(totalResults / PEXELS_PER_PAGE),
    });
  } catch (err) {
    console.error('Pexels search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /image-editor/stock/pixabay/
//
// Query params:
//   q      {string}  query de busca (obrigatório)
//   page   {number}  página (default 1)
//
// Resposta:
//   { photos: [...], total_results, page, per_page, pages }
//
// Cada photo:
//   { id, user, preview_url, medium_url, large_url, width, height, tags }
// ---------------------------------------------------------------------------
router.get('/image-editor/stock/pixabay/', async (req, res) => {
  const { q, page = 1 } = req.query;

  if (!q) return res.status(400).json({ error: 'O parâmetro "q" é obrigatório.' });

  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'PIXABAY_API_KEY não configurada.' });

  try {
    const currentPage = parseInt(page) || 1;
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(q)}&per_page=${PIXABAY_PER_PAGE}&page=${currentPage}&image_type=photo&safesearch=true`;

    const response = await fetch(url);
    const data     = await response.json();

    if (!response.ok) throw new Error(data.message || `Erro ${response.status}`);

    const photos = (data.hits || []).map(hit => ({
      id:          hit.id,
      user:        hit.user,
      preview_url: hit.previewURL,
      medium_url:  hit.webformatURL,
      large_url:   hit.largeImageURL,
      width:       hit.imageWidth,
      height:      hit.imageHeight,
      tags:        hit.tags || '',
    }));

    const totalResults = data.totalHits || 0;

    res.json({
      photos,
      total_results: totalResults,
      page:          currentPage,
      per_page:      PIXABAY_PER_PAGE,
      pages:         Math.ceil(totalResults / PIXABAY_PER_PAGE),
    });
  } catch (err) {
    console.error('Pixabay search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /image-editor/stock/proxy/
//
// Proxy para download de imagem stock sem CORS no frontend.
//
// Query params:
//   url  {string}  URL da imagem (obrigatório)
//
// Retorna o binário da imagem com o Content-Type original.
// ---------------------------------------------------------------------------
router.get('/image-editor/stock/proxy/', async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: 'O parâmetro "url" é obrigatório.' });

  // Permite apenas domínios de provedores de stock conhecidos
  const ALLOWED_HOSTS = [
    'images.pexels.com',
    'www.pexels.com',
    'cdn.pixabay.com',
    'pixabay.com',
  ];

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL inválida.' });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return res.status(403).json({ error: `Host não permitido: ${parsed.hostname}` });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Erro ao buscar imagem: ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer      = await response.arrayBuffer();

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Stock proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
