// generate-favicons.js
// Gera favicon.svg (copiado), favicon.png, favicon-16x16.png, favicon-32x32.png
// e favicon.ico a partir de um SVG de origem, para um site do multi-sites.
//
// Uso:
//   node generate-favicons.js <siteId> [caminho/para/logo.svg]
//
// Se o caminho de origem não for informado, usa por padrão:
//   multi-sites/sites/<siteId>/assets/logo/favicon-source.svg
//
// Saída: public/<siteId>/favicon.svg, favicon.png, favicon-16x16.png,
// favicon-32x32.png, favicon.ico

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const siteId = args[0] ?? null;
const sourceArg = args[1] ?? null;

if (!siteId) {
    console.error('❌ Uso: node generate-favicons.js <siteId> [caminho/para/logo.svg]');
    process.exit(1);
}

const sourceSvg =
    sourceArg ?? `multi-sites/sites/${siteId}/assets/logo/favicon-source.svg`;
const outputDir = `public/${siteId}`;

if (!fs.existsSync(sourceSvg)) {
    console.error(`❌ SVG de origem não encontrado: ${sourceSvg}`);
    process.exit(1);
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
    console.log(`🎨 Gerando favicons para "${siteId}" a partir de ${sourceSvg}`);

    // favicon.svg — cópia direta do SVG de origem
    fs.copyFileSync(sourceSvg, path.join(outputDir, 'favicon.svg'));
    console.log('OK: favicon.svg');

    const svgBuffer = fs.readFileSync(sourceSvg);

    // favicon.png — 512x512 (fallback maior)
    const pngPath = path.join(outputDir, 'favicon.png');
    await sharp(svgBuffer, { density: 384 }).resize(512, 512).png().toFile(pngPath);
    console.log('OK: favicon.png');

    // favicon-32x32.png
    const png32Path = path.join(outputDir, 'favicon-32x32.png');
    await sharp(svgBuffer, { density: 384 }).resize(32, 32).png().toFile(png32Path);
    console.log('OK: favicon-32x32.png');

    // favicon-16x16.png
    const png16Path = path.join(outputDir, 'favicon-16x16.png');
    await sharp(svgBuffer, { density: 384 }).resize(16, 16).png().toFile(png16Path);
    console.log('OK: favicon-16x16.png');

    // favicon.ico — empacota 16x16 + 32x32 + 48x48
    const png48Buffer = await sharp(svgBuffer, { density: 384 })
        .resize(48, 48)
        .png()
        .toBuffer();
    const icoBuffer = await pngToIco([
        fs.readFileSync(png16Path),
        fs.readFileSync(png32Path),
        png48Buffer,
    ]);
    fs.writeFileSync(path.join(outputDir, 'favicon.ico'), icoBuffer);
    console.log('OK: favicon.ico');

    console.log(`✅ Favicons gerados em ${outputDir}/`);
}

generate().catch((err) => {
    console.error('❌ Erro ao gerar favicons:', err);
    process.exit(1);
});
