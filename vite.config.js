import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: { outDir: 'build', sourcemap: true, emptyOutDir: true },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['schemas/*.json'],
      manifest: {
        name: 'Gummy OS',
        short_name: 'Gummy',
        description: 'A governed personal AI computer you can open.',
        theme_color: '#4B187A',
        background_color: '#100817',
        display: 'standalone',
        start_url: '/'
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly' },
          { urlPattern: ({ url }) => url.pathname.startsWith('/schemas/'), handler: 'CacheFirst', options: { cacheName: 'gummy-schemas-v1' } }
        ]
      }
    })
  ]
});
