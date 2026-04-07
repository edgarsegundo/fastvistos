/**
 * image-service/server.js
 * Local image processing service for blog-image-editor.
 * Receives image uploads, converts to WebP via FFmpeg, saves to ./public/{siteId}/assets/images/blog/{slug}/
 *
 * Start: node server.js  (from repo root or image-service/ dir)
 * Requires: brew install ffmpeg
 */

import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OUTPUT_BASE_DIR resolves to repo-root/public when started from either:
//   - repo root: `node image-service/server.js`
//   - image-service dir: `node server.js`
const OUTPUT_BASE_DIR = process.env.OUTPUT_BASE_DIR
  ? path.resolve(process.env.OUTPUT_BASE_DIR)
  : path.resolve(__dirname, '..', 'public'); // repo-root/public

const PORT = parseInt(process.env.IMAGE_SERVICE_PORT || process.env.PORT || '8091', 10);

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/bmp', 'image/tiff',
]);

// Max dimensions (preserving aspect ratio)
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;

const app = express();

// CORS — local use only
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Multer: store uploads in OS temp dir
const upload = multer({
  dest: path.join(process.env.TMPDIR || '/tmp', 'img-uploads'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Arquivo não é uma imagem suportada'));
  },
});

// ─── POST /upload ─────────────────────────────────────────────────────────────
app.post('/upload', upload.single('file'), async (req, res) => {
  const { siteId, slug } = req.body;

  if (!req.file) return res.status(400).json({ error: 'Campo "file" ausente' });
  if (!siteId) return res.status(400).json({ error: 'Campo "siteId" ausente' });
  if (!slug) return res.status(400).json({ error: 'Campo "slug" ausente' });

  // Sanitize path segments — only allow alphanumerics, hyphens, underscores, dots
  const safeSiteId = siteId.replace(/[^a-zA-Z0-9_\-]/g, '');
  const safeSlug = slug.replace(/[^a-zA-Z0-9_\-]/g, '');
  if (!safeSiteId || !safeSlug) {
    await cleanupTmp(req.file.path);
    return res.status(400).json({ error: 'siteId ou slug inválidos' });
  }

  const timestamp = Date.now();
  const filename = `${safeSlug}-${timestamp}.webp`;
  const outputDir = path.join(OUTPUT_BASE_DIR, safeSiteId, 'assets', 'images', 'blog', safeSlug);
  const outputPath = path.join(outputDir, filename);

  try {
    await fs.mkdir(outputDir, { recursive: true });

    const { width, height } = await convertToWebP(req.file.path, outputPath);

    await cleanupTmp(req.file.path);

    const publicUrl = `/assets/images/blog/${safeSlug}/${filename}`;
    console.log(`✅ [image-service] Saved: ${outputPath} (${width}x${height})`);

    res.json({ url: publicUrl, width, height });
  } catch (err) {
    console.error('[image-service] Error:', err.message);
    await cleanupTmp(req.file.path);
    res.status(500).json({ error: `Falha no processamento: ${err.message}` });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, outputBaseDir: OUTPUT_BASE_DIR, port: PORT });
});

// ─── FFmpeg conversion ────────────────────────────────────────────────────────
function convertToWebP(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Scale: fit within MAX_WIDTH x MAX_HEIGHT, preserve aspect ratio
    // scale=w:h:force_original_aspect_ratio=decrease
    const scaleFilter = `scale='min(${MAX_WIDTH},iw)':'min(${MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease`;

    ffmpeg(inputPath)
      .outputOptions([
        '-vf', scaleFilter,
        '-c:v', 'libwebp',
        '-quality', '82',
        '-an', // strip audio if any
      ])
      .output(outputPath)
      .on('end', () => {
        // Read actual dimensions from output
        getImageDimensions(outputPath).then(resolve).catch(reject);
      })
      .on('error', reject)
      .run();
  });
}

function getImageDimensions(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find((s) => s.codec_type === 'video');
      resolve({
        width: stream?.width || 0,
        height: stream?.height || 0,
      });
    });
  });
}

async function cleanupTmp(filePath) {
  try { await fs.unlink(filePath); } catch (_) {}
}

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🖼  image-service running on http://localhost:${PORT}`);
  console.log(`   Output dir: ${OUTPUT_BASE_DIR}`);
  console.log(`   Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}`);
});
