// Build the Mini App static site: copy web/ -> dist/ and place the
// (placeholder) logo as dist/logo.webp. Run before every push —
// `push` uploads dist/ as-is and never runs the build.
import { cpSync, copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, 'web'), dist, { recursive: true });

const logo = join(
  root,
  'assets',
  'media-generation-fontstory-logo-v1-0-e9fcb181-6fa1-4b90-a663-1751c3080354.webp',
);
if (existsSync(logo)) {
  copyFileSync(logo, join(dist, 'logo.webp'));
  console.log('logo: v1 placeholder -> dist/logo.webp');
} else {
  console.warn('logo: v1 file not found, dist/logo.webp not written');
}
console.log('build: web/ -> dist/ done');
