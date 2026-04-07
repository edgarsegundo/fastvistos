/**
 * image-service/server.js
 * Local image processing service for blog-image-editor.
 * Receives image uploads, converts to WebP via Sharp, saves to ./public/{siteId}/assets/images/blog/{slug}/
 * Also exposes /preview for live transform previews (no save).
 *
 * Start: node server.js  (from repo root or image-service/ dir)
 * Requires: npm i sharp  (no ffmpeg needed)
 */

import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_BASE_DIR = process.env.OUTPUT_BASE_DIR
  ? path.resolve(process.env.OUTPUT_BASE_DIR)
  : path.resolve(__dirname, '..', 'public');

const PORT = parseInt(process.env.IMAGE_SERVICE_PORT || process.env.PORT || '8091', 10);

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/bmp', 'image/tiff', 'image/avif',
]);

const app = express();

// CORS — local use only
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Multer: store uploads in OS temp dir
const upload = multer({
  dest: path.join(process.env.TMPDIR || '/tmp', 'img-uploads'),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Arquivo não é uma imagem suportada'));
  },
});

// ─── Parse transform params from request ──────────────────────────────────────
// All optional. Defaults: max 1200×800, quality 82, no adjustments.
function parseTransforms(body) {
  const t = {};
  t.width    = body.width    ? Math.min(parseInt(body.width,  10), 3000) : null;
  t.height   = body.height   ? Math.min(parseInt(body.height, 10), 3000) : null;
  t.fit      = body.fit      || 'inside';   // inside | cover | fill | contain
  t.quality  = body.quality  ? Math.min(Math.max(parseInt(body.quality, 10), 1), 100) : 82;
  // crop: { left, top, width, height } — pixel values relative to original
  if (body.cropLeft !== undefined) {
    t.crop = {
      left:   Math.max(0, parseInt(body.cropLeft,   10)),
      top:    Math.max(0, parseInt(body.cropTop,    10)),
      width:  Math.max(1, parseInt(body.cropWidth,  10)),
      height: Math.max(1, parseInt(body.cropHeight, 10)),
    };
  }
  // Adjustments (-100..+100 normalized to sharp ranges)
  t.brightness  = body.brightness  !== undefined ? parseFloat(body.brightness)  : 0;  // -100..+100 → multiplier
  t.contrast    = body.contrast    !== undefined ? parseFloat(body.contrast)    : 0;  // -100..+100
  t.saturation  = body.saturation  !== undefined ? parseFloat(body.saturation)  : 0;  // -100..+100
  t.sharpen     = body.sharpen === 'true' || body.sharpen === true;
  t.grayscale   = body.grayscale === 'true' || body.grayscale === true;
  return t;
}

// ─── Apply transforms via Sharp ───────────────────────────────────────────────
function applyTransforms(pipeline, t) {
  // 1. Crop first (before resize — coordinates relative to original)
  if (t.crop) {
    pipeline = pipeline.extract(t.crop);
  }

  // 2. Resize
  const resizeOpts = { fit: t.fit, withoutEnlargement: true };
  if (t.width || t.height) {
    pipeline = pipeline.resize(t.width || null, t.height || null, resizeOpts);
  } else {
    // Default max dimensions
    pipeline = pipeline.resize(1200, 800, resizeOpts);
  }

  // 3. Colour adjustments
  // brightness: 0 = no change. +100 → multiplier=2, -100 → multiplier=0
  const bMult = 1 + (t.brightness / 100);
  // contrast: sharp modLinear(a, b). a=slope, b=offset.  0 = identity (a=1,b=0)
  // +100 → a=2, -100 → a=0.1
  const cSlope = t.contrast >= 0 ? 1 + (t.contrast / 100) : Math.max(0.05, 1 + (t.contrast / 110));

  if (t.brightness !== 0 || t.contrast !== 0) {
    pipeline = pipeline.linear(cSlope * bMult, -(128 * (cSlope * bMult - 1)));
  }
  if (t.saturation !== 0) {
    pipeline = pipeline.modulate({ saturation: Math.max(0, 1 + (t.saturation / 100)) });
  }
  if (t.grayscale) {
    pipeline = pipeline.grayscale();
  }
  if (t.sharpen) {
    pipeline = pipeline.sharpen();
  }
  return pipeline;
}

// ─── Serve processed files (used by blog-image-editor to fetch WebP before uploading to Django) ──
// Accessible via Vite proxy: /image-upload/files/{siteId}/assets/images/blog/{slug}/{file}
app.use('/files', express.static(OUTPUT_BASE_DIR));

// ─── POST /upload ─────────────────────────────────────────────────────────────
app.post('/upload', upload.single('file'), async (req, res) => {
  const { siteId, slug } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Campo "file" ausente' });
  if (!siteId)   return res.status(400).json({ error: 'Campo "siteId" ausente' });
  if (!slug)     return res.status(400).json({ error: 'Campo "slug" ausente' });

  const safeSiteId = siteId.replace(/[^a-zA-Z0-9_\-]/g, '');
  const safeSlug   = slug.replace(/[^a-zA-Z0-9_\-]/g, '');
  if (!safeSiteId || !safeSlug) {
    await cleanupTmp(req.file.path);
    return res.status(400).json({ error: 'siteId ou slug inválidos' });
  }

  const t = parseTransforms(req.body);
  const timestamp = Date.now();
  const filename = `${safeSlug}-${timestamp}.webp`;
  const outputDir  = path.join(OUTPUT_BASE_DIR, safeSiteId, 'assets', 'images', 'blog', safeSlug);
  const outputPath = path.join(outputDir, filename);

  try {
    await fs.mkdir(outputDir, { recursive: true });

    let pipeline = sharp(req.file.path);
    pipeline = applyTransforms(pipeline, t);
    const info = await pipeline.webp({ quality: t.quality }).toFile(outputPath);

    await cleanupTmp(req.file.path);

    const publicUrl = `/assets/images/blog/${safeSlug}/${filename}`;
    console.log(`✅ [image-service] Saved: ${outputPath} (${info.width}x${info.height})`);
    res.json({ url: publicUrl, width: info.width, height: info.height });
  } catch (err) {
    console.error('[image-service] Error:', err.message);
    await cleanupTmp(req.file.path);
    res.status(500).json({ error: `Falha no processamento: ${err.message}` });
  }
});

// ─── POST /preview ─────────────────────────────────────────────────────────────
// Returns processed WebP bytes directly (no save). Used for live preview in the editor.
app.post('/preview', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Campo "file" ausente' });

  const t = parseTransforms(req.body);
  // Preview: cap at 600px wide for speed
  if (!t.width && !t.height) { t.width = 600; }

  try {
    let pipeline = sharp(req.file.path);
    pipeline = applyTransforms(pipeline, t);
    const buf = await pipeline.webp({ quality: t.quality }).toBuffer({ resolveWithObject: true });

    await cleanupTmp(req.file.path);

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'no-store');
    res.send(buf.data);
  } catch (err) {
    await cleanupTmp(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, outputBaseDir: OUTPUT_BASE_DIR, port: PORT });
});

async function cleanupTmp(filePath) {
  try { await fs.unlink(filePath); } catch (_) {}
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🖼  image-service running on http://localhost:${PORT}`);
  console.log(`   Output dir: ${OUTPUT_BASE_DIR}`);
});
