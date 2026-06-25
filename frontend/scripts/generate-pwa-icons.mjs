import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'public', 'favicon.svg');
const outDir = path.join(root, 'public', 'icons');

await mkdir(outDir, { recursive: true });

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512, padding: 0.1 },
];

for (const { name, size, padding = 0 } of sizes) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);
  const resized = await sharp(svgPath)
    .resize(inner, inner, { fit: 'contain', background: { r: 79, g: 70, b: 229, alpha: 1 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 79, g: 70, b: 229, alpha: 1 },
    },
  })
    .composite([{ input: resized, left: offset, top: offset }])
    .png()
    .toFile(path.join(outDir, name));

  console.log(`Wrote ${name}`);
}
