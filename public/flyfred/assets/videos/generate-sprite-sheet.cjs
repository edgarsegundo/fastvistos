const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const framesDir = '/Users/edgar/Repos/fastvistos/public/flyfred/assets/videos/plane-frames';
const outputImage = '/Users/edgar/Repos/fastvistos/public/flyfred/assets/videos/plane-sprite.png';
const outputJson = '/Users/edgar/Repos/fastvistos/public/flyfred/assets/videos/plane-sprite.json';

async function main() {
  // Lista e ordena os frames

  // Usa 1 a cada 3 frames para otimizar
  const allFiles = fs.readdirSync(framesDir)
    .filter(f => f.match(/^plane-\d{4}\.png$/))
    .sort();
  const files = allFiles.filter((_, i) => i % 3 === 0);

  if (files.length === 0) throw new Error('Nenhum frame encontrado!');

  // Lê o tamanho do primeiro frame
  const firstFrame = await sharp(path.join(framesDir, files[0])).metadata();
  const width = firstFrame.width;
  const height = firstFrame.height;


  // Parâmetros da grade
  const columns = 20;
  const rows = Math.ceil(files.length / columns);

  // Carrega todos os buffers
  const images = await Promise.all(
    files.map(f => sharp(path.join(framesDir, f)).toBuffer())
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

  await sprite.composite(composite).png().toFile(outputImage);


  // Gera o JSON de frames
  const frames = files.map((f, i) => ({
    filename: f,
    x: (i % columns) * width,
    y: Math.floor(i / columns) * height,
    width,
    height
  }));

  fs.writeFileSync(outputJson, JSON.stringify({ frames, width, height, columns, rows, count: files.length }, null, 2));
  console.log('Sprite sheet otimizado e JSON gerados!');
}

main().catch(console.error);