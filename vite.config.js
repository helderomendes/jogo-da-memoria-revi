import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA / Service Worker: precache do app shell (o totem abre 100% offline) e
    // cache das leituras do Supabase. Escritas (partidas/premiação) NÃO passam
    // pelo SW — a fila offline vive no dataStore (localStorage) e sincroniza
    // quando a internet volta.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Jogo da Memória Revi',
        short_name: 'Memória Revi',
        description: 'Totem do Jogo da Memória Revi',
        theme_color: '#05091f',
        background_color: '#05091f',
        display: 'fullscreen',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,ico}'],
        navigateFallback: '/index.html',
        // /admin depende de rede (auth + escrita); não force o fallback do SPA
        // pra ele quando offline — o totem público é o alvo do modo offline.
        navigateFallbackDenylist: [/^\/admin/],
        runtimeCaching: [
          {
            // Leituras REST (cartas, config, brindes): rede primeiro, cai no
            // cache quando offline.
            urlPattern: ({ url }) => url.hostname.endsWith('supabase.co') && url.pathname.startsWith('/rest/'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'sb-rest',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Imagens do Storage (capas dos cards e fotos dos brindes): cache
            // primeiro pra ficarem disponíveis offline.
            urlPattern: ({ url }) => url.hostname.endsWith('supabase.co') && url.pathname.startsWith('/storage/'),
            handler: 'CacheFirst',
            method: 'GET',
            options: {
              cacheName: 'sb-storage',
              // Limite alto e validade longa: guardamos TODAS as capas e fotos
              // de brindes; elas persistem entre sessões, reboots e deploys.
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 180 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
})
