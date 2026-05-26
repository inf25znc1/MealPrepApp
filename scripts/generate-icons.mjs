import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svg = readFileSync(join(publicDir, 'icon-source.svg'));

const outputs = [
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

for (const { file, size } of outputs) {
  await sharp(svg)
    .resize(size, size)
    .flatten({ background: '#1a1a1a' })
    .png()
    .toFile(join(publicDir, file));
  console.log(`Wrote public/${file} (${size}×${size})`);
}
