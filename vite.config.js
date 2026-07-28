import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { execFileSync } from 'node:child_process';

const buildCommit = process.env.VERCEL_GIT_COMMIT_SHA
  || process.env.GUMMY_BUILD_COMMIT
  || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const buildEnvironment = process.env.VERCEL_ENV || process.env.GUMMY_BUILD_ENVIRONMENT || 'local';

export default defineConfig({
  define: {
    __GUMMY_BUILD_COMMIT__: JSON.stringify(buildCommit),
    __GUMMY_BUILD_ENVIRONMENT__: JSON.stringify(buildEnvironment)
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      format: { comments: false }
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['schemas/*.json', 'registry/*.json', 'brand/gummy/web/*.webp', 'brand/gummy/favicons/*.png'],
      manifest: {
        name: 'Gummy OS',
        short_name: 'Gummy',
        description: 'A governed personal AI computer you can open.',
        theme_color: '#4B187A',
        background_color: '#100817',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/brand/gummy/favicons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/brand/gummy/favicons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        sourcemap: false,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly' },
          { urlPattern: ({ url }) => url.pathname.startsWith('/schemas/'), handler: 'CacheFirst', options: { cacheName: 'gummy-schemas-v1' } },
          { urlPattern: ({ url }) => url.pathname.startsWith('/registry/'), handler: 'CacheFirst', options: { cacheName: 'gummy-product-registry-v1' } }
        ]
      }
    })
  ]
});
