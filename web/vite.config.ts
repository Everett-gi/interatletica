import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * O público chega por link de WhatsApp, então a primeira visita não pode
 * depender de instalar nada — e a segunda não pode depender de rede boa no
 * ginásio. Daí PWA em vez de app nativo.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Interatlética',
        short_name: 'Interatlética',
        description: 'Eventos entre atléticas universitárias',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0B1220',
        theme_color: '#0B1220',
        // SVG único enquanto não há arte definitiva. Apontar para PNGs que
        // não existem produziria 404 no manifest e um prompt de instalação
        // silenciosamente quebrado no Android — pior que um ícone simples.
        // Quando a arte chegar: exportar 192 e 512 em PNG, acrescentar aqui,
        // e incluir uma entrada `purpose: 'maskable'`, que é o que evita o
        // ícone recortado em círculo no Android.
        icons: [
          {
            src: '/icone.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // O app é uma SPA: qualquer rota funda (/a/dragoes/eventos) precisa
        // devolver o index.html, senão abrir o link direto dá 404 offline.
        navigateFallback: '/index.html',
        // /api e o fluxo OAuth NUNCA podem ser servidos do cache: uma
        // resposta de sessão em cache mostraria o usuário errado, e um
        // redirect de OAuth cacheado trava o login.
        navigateFallbackDenylist: [/^\/api/, /^\/oauth2/, /^\/login/],
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // A página pública do evento é a que mais abre em rede ruim, na
            // porta do ginásio. Mostra o que tem em cache e atualiza atrás.
            urlPattern: /^.*\/api\/publico\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'interatletica-publico',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    // Em desenvolvimento a API roda em outra porta. O proxy mantém tudo na
    // mesma origem, que é como as coisas funcionam em produção atrás do
    // Caddy — sem isso o cookie de sessão seria cross-site e o login local
    // se comportaria diferente do de produção.
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/oauth2': { target: 'http://localhost:8080', changeOrigin: true },
      '/login': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
