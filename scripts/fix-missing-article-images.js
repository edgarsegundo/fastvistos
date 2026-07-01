/**
 * fix-missing-article-images.js
 *
 * Finds all published articles for a given site that have no image set,
 * then randomly assigns an image from the site's gallery to each one.
 *
 * Usage:
 *   node scripts/fix-missing-article-images.js <site_id> [--dry-run]
 *
 * Examples:
 *   node scripts/fix-missing-article-images.js centraldevistos
 *   node scripts/fix-missing-article-images.js fastvistos --dry-run
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { prisma } from '../multi-sites/core/dist/lib/prisma.js';

const SITE_MAP = {
  'centraldevistos':  '3cfe8493907c488480f55c9ee10f8c05',
  'emprego':          '47f72bb76ec74a078337e38f54ebc213',
  'fastvistos':       '41a5c7f95e924d54b120ab9a0e1843c8',
  'flyfred':          'f2f289b919c74d769d6237bb8717e043',
  'revistadoturismo': 'e3bbe77b68c44b81b69d1573a264ede8',
  'zapsim':           '41a5c7f95e924d54b120ab9a0e1843c8',
  'zenith':           '5770497882464a4ab0bda055d011113b',
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const args = process.argv.slice(2);
  const siteId = args.find(a => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');

  if (!siteId) {
    console.error('Uso: node scripts/fix-missing-article-images.js <site_id> [--dry-run]');
    console.error('Sites disponíveis:', Object.keys(SITE_MAP).join(', '));
    process.exit(1);
  }

  const businessId = SITE_MAP[siteId];
  if (!businessId) {
    console.error(`Site desconhecido: "${siteId}". Disponíveis: ${Object.keys(SITE_MAP).join(', ')}`);
    process.exit(1);
  }

  console.log(`\nSite: ${siteId} (business_id: ${businessId})`);
  if (dryRun) console.log('DRY RUN — nenhuma alteração será salva\n');

  // 1. Fetch published articles without image
  const now = new Date();
  const articles = await prisma.blog_article.findMany({
    where: {
      business_id: businessId,
      is_removed: false,
      published: { lte: now },
      OR: [{ image: null }, { image: '' }],
    },
    select: { id: true, title: true, slug: true },
    orderBy: { published: 'desc' },
  });

  console.log(`Artigos publicados sem imagem: ${articles.length}`);

  if (articles.length === 0) {
    console.log('Todos os artigos publicados já têm imagem!');
    await prisma.$disconnect();
    return;
  }

  // 2. Fetch gallery images
  // Images are stored globally (no site/business filter) with topic-based groups.
  // Accept an optional --group=<name> arg to restrict to a specific topic group.
  const groupArg = args.find(a => a.startsWith('--group='))?.split('=')[1];

  const imageWhere = groupArg
    ? { group: groupArg, image: { not: null } }
    : { image: { not: null } };

  if (groupArg) console.log(`Filtrando imagens por group="${groupArg}"`);

  let images = await prisma.blog_image.findMany({
    where: imageWhere,
    select: { id: true, image: true, alt: true, filename: true, group: true },
  });

  // Filter out empty image paths just in case
  images = images.filter(img => img.image && img.image.trim() !== '');

  if (images.length === 0) {
    console.error(`Nenhuma imagem encontrada na galeria para "${siteId}". Faça upload de imagens primeiro.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Imagens disponíveis na galeria: ${images.length}\n`);

  // 3. Assign a random gallery image to each article without one
  let updatedCount = 0;

  for (const article of articles) {
    const chosen = pickRandom(images);
    const shortTitle = article.title.length > 65
      ? article.title.slice(0, 65) + '...'
      : article.title;

    if (dryRun) {
      console.log(`  [DRY] "${shortTitle}"`);
      console.log(`         -> ${chosen.image}\n`);
    } else {
      await prisma.blog_article.update({
        where: { id: article.id },
        data: { image: chosen.image, modified: new Date() },
      });
      console.log(`  OK "${shortTitle}"`);
      console.log(`      -> ${chosen.image}\n`);
      updatedCount++;
    }
  }

  if (dryRun) {
    console.log(`DRY RUN concluído — ${articles.length} artigos seriam atualizados.`);
  } else {
    console.log(`Concluído! ${updatedCount} artigo(s) atualizados com imagem.`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
