// stock-routes.js — Rotas para busca de imagens stock (Pexels + Pixabay + Google)
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createClient } from 'pexels';

const router = express.Router();

const PEXELS_PER_PAGE  = 20;
const PIXABAY_PER_PAGE = 20;
const GOOGLE_PER_PAGE  = 10; // limite fixo da API gratuita

// ---------------------------------------------------------------------------
// GET /image-editor/stock/pexels/
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
      id:               photo.id,
      photographer:     photo.photographer,
      photographer_url: photo.photographer_url,
      src_medium:       photo.src.medium,
      src_large:        photo.src.large,
      src_original:     photo.src.original,
      width:            photo.width,
      height:           photo.height,
      alt:              photo.alt || '',
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
// ---------------------------------------------------------------------------
router.get('/image-editor/stock/pixabay/', async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: 'O parâmetro "q" é obrigatório.' });

  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'PIXABAY_API_KEY não configurada.' });

  try {
    const currentPage = parseInt(page) || 1;
    const url = 'https://pixabay.com/api/?key=' + apiKey
      + '&q=' + encodeURIComponent(q)
      + '&per_page=' + PIXABAY_PER_PAGE
      + '&page=' + currentPage
      + '&image_type=photo&safesearch=true';

    const response = await fetch(url);
    const data     = await response.json();

    if (!response.ok) throw new Error(data.message || ('Erro ' + response.status));

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
// GET /image-editor/stock/google/
//
// Requer no .env:
//   GOOGLE_CSE_API_KEY  — chave do Google Cloud (Custom Search API)
//   GOOGLE_CSE_CX       — Search Engine ID (Programmable Search Engine)
//
// Limite gratuito: 100 queries/dia, 10 resultados por página, máx 100 resultados.
// ---------------------------------------------------------------------------
router.get('/image-editor/stock/google/', async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: 'O parâmetro "q" é obrigatório.' });

  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx     = process.env.GOOGLE_CSE_CX;
  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_CSE_API_KEY não configurada.' });
  if (!cx)     return res.status(500).json({ error: 'GOOGLE_CSE_CX não configurada.' });

  const currentPage = parseInt(page) || 1;
  const start       = (currentPage - 1) * GOOGLE_PER_PAGE + 1;

  try {
    const url = 'https://www.googleapis.com/customsearch/v1'
      + '?key='        + apiKey
      + '&cx='         + cx
      + '&q='          + encodeURIComponent(q)
      + '&searchType=' + 'image'
      + '&num='        + GOOGLE_PER_PAGE
      + '&start='      + start;

    const response = await fetch(url);
    const data     = await response.json();

    if (!response.ok) {
      const msg = (data && data.error && data.error.message) || ('Erro ' + response.status);
      throw new Error(msg);
    }

    const items  = data.items || [];
    const photos = items.map((item, i) => ({
      id:          String(start + i),
      title:       item.title || '',
      thumb_url:   (item.image && item.image.thumbnailLink) || '',
      large_url:   item.link || '',
      context_url: (item.image && item.image.contextLink)   || '',
      width:       (item.image && item.image.width)         || 0,
      height:      (item.image && item.image.height)        || 0,
      mime:        item.mime || 'image/jpeg',
    }));

    const totalRaw    = parseInt((data.searchInformation && data.searchInformation.totalResults) || '0');
    const totalCapped = Math.min(totalRaw, 100);

    res.json({
      photos,
      total_results: totalCapped,
      page:          currentPage,
      per_page:      GOOGLE_PER_PAGE,
      pages:         Math.ceil(totalCapped / GOOGLE_PER_PAGE),
    });
  } catch (err) {
    console.error('Google CSE search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /image-editor/stock/proxy/
// Proxy para Pexels e Pixabay (hosts em allowlist).
// ---------------------------------------------------------------------------
router.get('/image-editor/stock/proxy/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'O parâmetro "url" é obrigatório.' });

  const ALLOWED_HOSTS = [
    'images.pexels.com',
    'www.pexels.com',
    'cdn.pixabay.com',
    'pixabay.com',
  ];

  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'URL inválida.' });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return res.status(403).json({ error: 'Host não permitido: ' + parsed.hostname });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao buscar imagem: ' + response.status });
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

// ---------------------------------------------------------------------------
// GET /image-editor/stock/google-proxy/
// Proxy exclusivo para imagens do Google CSE.
// URLs de imagem do Google vêm de domínios externos variados, então não
// filtramos por host — apenas garantimos https e content-type de imagem.
// ---------------------------------------------------------------------------
router.get('/image-editor/stock/google-proxy/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'O parâmetro "url" é obrigatório.' });

  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'URL inválida.' });
  }

  const BLOCKED = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (BLOCKED.includes(parsed.hostname)) {
    return res.status(403).json({ error: 'Host não permitido.' });
  }

  if (parsed.protocol !== 'https:') {
    return res.status(403).json({ error: 'Apenas URLs https são permitidas.' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':     'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer':    parsed.origin,
      },
      signal: AbortSignal.timeout(10000),
    });

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.startsWith('image/')) {
      return res.status(415).json({ error: 'Resposta não é uma imagem: ' + contentType });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao buscar imagem: ' + response.status });
    }

    const buffer = await response.arrayBuffer();

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Google proxy error:', err.message);
    res.status(500).json({ error: 'Falha ao buscar imagem: ' + err.message });
  }
});

export default router;