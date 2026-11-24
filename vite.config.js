import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { target: 'safari17', sourcemap: false },
  plugins: [{
    name: 'notes-offline-shell',
    apply: 'build',
    async writeBundle(_options, output) {
      const artwork = await readFile('assets/notes-icon.jpg');
      const sizes = [180, 192, 512];
      const icons = sizes.map((size) => `icons/notes-v2-${size}.png`);
      const maskable = 'icons/notes-v2-maskable.png';
      const padded = await sharp(artwork).resize(416, 416).extend({
        top: 48, bottom: 48, left: 48, right: 48, background: '#070875',
      }).png().toBuffer();
      await Promise.all([
        ...sizes.map((size, index) => sharp(artwork).resize(size, size)
          .png({ palette: true, colours: 256 }).toFile('dist/' + icons[index])),
        sharp(padded).png({ palette: true, colours: 256 }).toFile('dist/' + maskable),
      ]);
      const assets = ['index.html', 'manifest.webmanifest', ...icons, maskable,
        'fonts/figtree-latin-600-normal.woff2', 'fonts/figtree-latin-700-normal.woff2',
        'fonts/figtree-latin-800-normal.woff2', ...Object.keys(output).filter((name) => name.startsWith('assets/'))];
      const version = createHash('sha256').update(assets.join('\n')).update(artwork).digest('hex').slice(0, 16);
      await writeFile('dist/sw.js', `
const prefix = 'notes-shell-';
const cacheName = prefix + '${version}';
const scope = self.registration.scope;
const files = new Set(${JSON.stringify(assets)}.map((file) => new URL(file, scope).href));
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll([...files])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith(prefix) && key !== cacheName)
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const nav = request.mode === 'navigate' && request.url.startsWith(scope);
  if (!nav && !files.has(request.url)) return;
  event.respondWith(caches.open(cacheName).then(async (cache) => {
    const hit = await cache.match(nav ? new URL('index.html', scope).href : request);
    return hit || fetch(request);
  }));
});
`);
    },
  }],
});
