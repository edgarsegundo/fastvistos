// Gera um novo sprite sheet reduzido em resolução e quantidade de frames
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const framesDir = path.join(__dirname, 'plane-frames');
const outputImage = path.join(__dirname, 'plane-sprite-optimized.png');
const outputJson = path.join(__dirname, 'plane-sprite-optimized.json');

const REDUCE_FACTOR = 3; // Usa 1 a cada 3 frames
const TARGET_WIDTH = 860; // Largura desejada de cada frame
const TARGET_HEIGHT = 490; // Altura desejada de cada frame

async function main() {
  const allFiles = fs.readdirSync(framesDir)
    .filter(f => f.match(/^plane-\d{4}\.png$/))
    .sort();
  const files = allFiles.filter((_, i) => i % REDUCE_FACTOR === 0);

  if (files.length === 0) throw new Error('Nenhum frame encontrado!');

  // Lê o tamanho do primeiro frame
  const firstFrameMeta = await sharp(path.join(framesDir, files[0])).metadata();
  const origWidth = firstFrameMeta.width;
  const origHeight = firstFrameMeta.height;
  const width = TARGET_WIDTH;
  const height = TARGET_HEIGHT;

  // Parâmetros da grade
  const columns = 20;
  const rows = Math.ceil(files.length / columns);

  // Carrega e redimensiona todos os buffers
  const images = await Promise.all(
    files.map(f => sharp(path.join(framesDir, f)).resize(width, height, { fit: 'cover' }).toBuffer())
  );

  // Cria o sprite sheet em grade
  const sprite = sharp({
    create: {
      width: width * columns,
      height: height * rows,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  let composite = images.map((img, i) => ({
    input: img,
    left: (i % columns) * width,
    top: Math.floor(i / columns) * height
  }));

  await sprite.composite(composite).png({ compressionLevel: 9 }).toFile(outputImage);

  // Gera o JSON de frames reduzido
  const frames = files.map((f, i) => ({
    x: (i % columns) * width,
    y: Math.floor(i / columns) * height,
    width,
    height
  }));

  fs.writeFileSync(outputJson, JSON.stringify({ frames }, null, 2));
  console.log('Sprite sheet otimizado e JSON reduzido gerados!');
}

main().catch(console.error);
