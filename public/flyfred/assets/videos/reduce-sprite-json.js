// Gera um novo plane-sprite-reduced.json apenas com x, y, width, height
const fs = require('fs');
const input = 'plane-sprite.json';
const output = 'plane-sprite-reduced.json';

const sprite = JSON.parse(fs.readFileSync(input));
const reduced = {
  frames: sprite.frames.map(f => ({ x: f.x, y: f.y, width: f.width, height: f.height }))
};
fs.writeFileSync(output, JSON.stringify(reduced, null, 2));
console.log('Novo plane-sprite-reduced.json gerado:', reduced.frames.length, 'frames');
