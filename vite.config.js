import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: { outDir: 'build', sourcemap: true, emptyOutDir: true },
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
