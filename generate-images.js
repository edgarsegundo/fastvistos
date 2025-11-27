import sharp from "sharp";
import fs from "fs";
import path from "path";

// Recebe siteId via argumento CLI
const args = process.argv.slice(2);
const siteId = args[0];
if (!siteId) {
  console.error("❌ Usage: node generate-images.js <siteId>");
  process.exit(1);
}

const inputDir = `public/${siteId}/assets/images-base`;
const outDir = path.join("public", siteId, "assets", "images-base", "resized");

// const breakpoints = [608, 356, 315, 400, 485]; // você definiu
const breakpoints = [356, 485, 608];

const scales = [1, 2]; // retina
// const scales = [1, 2, 3]; // retina

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const images = fs.readdirSync(inputDir).filter(f => f.endsWith(".jpg"));

const outputIndex = {};

async function processImage(file) {
  const baseName = file.replace(/\.(jpg|jpeg|png)$/i, "");

  const inputPath = path.join(inputDir, file);
  const image = sharp(inputPath);

  // blur base64
  const blur = await image.resize(20).blur().toBuffer();
  const blurBase64 = `data:image/jpeg;base64,${blur.toString("base64")}`;

  outputIndex[baseName] = {
    blurDataURL: blurBase64,
    // avif: [],
    webp: [],
    jpeg: [],
  };

  for (const bp of breakpoints) {
    for (const scale of scales) {
      const width = bp * scale;

      const outName = `${baseName}-${bp}-${scale}x`;

    //   // AVIF
    //   const avifName = `${outName}.avif`;
    //   await image.clone().resize(width).avif({ quality: 55 }).toFile(path.join(outDir, avifName));
    //   outputIndex[baseName].avif?.push?.(`${avifName} ${width}w`);

      // WebP
      const webpName = `${outName}.webp`;
      await image.clone().resize(width).webp({ quality: 70 }).toFile(path.join(outDir, webpName));
      outputIndex[baseName].webp.push(`${webpName} ${width}w`);

      // JPEG
      const jpgName = `${outName}.jpg`;
      await image.clone().resize(width).jpeg({ quality: 80 }).toFile(path.join(outDir, jpgName));
      outputIndex[baseName].jpeg.push(`${jpgName} ${width}w`);
    }
  }

  console.log("OK:", file);
}

(async () => {
    for (const img of images) {
        await processImage(img);
    }

    // salva mapa para o Astro importar
    const mapPath = path.join(
        "multi-sites",
        "sites",
        siteId,
        "generated-image-map.json"
    );

    fs.writeFileSync(mapPath, JSON.stringify(outputIndex, null, 2));

    console.log(`✅ JSON gerado em ${mapPath}`);
})();
