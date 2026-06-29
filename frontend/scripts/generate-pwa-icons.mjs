import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const markPath = path.join(root, 'public', 'logo-mark.png');
const outDir = path.join(root, 'public', 'icons');

const BRAND_BG = { r: 245, g: 245, b: 245, alpha: 1 };

await mkdir(outDir, { recursive: true });

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512, padding: 0.1 },
];

for (const { name, size, padding = 0 } of sizes) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);
  const resized = await sharp(markPath)
    .resize(inner, inner, { fit: 'contain', background: BRAND_BG })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: resized, left: offset, top: offset }])
    .png()
    .toFile(path.join(outDir, name));

  console.log(`Wrote ${name}`);
}
