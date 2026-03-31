// Gera um novo plane-keyframes-reduced.json com 1 a cada 3 keyframes
const fs = require('fs');
const input = 'plane-frames/plane-keyframes.json';
const output = 'plane-keyframes-reduced.json';

const keyframes = JSON.parse(fs.readFileSync(input));
const reduced = keyframes.filter((_, i) => i % 3 === 0);
fs.writeFileSync(output, JSON.stringify(reduced, null, 2));
console.log('Novo plane-keyframes-reduced.json gerado:', reduced.length, 'frames');
