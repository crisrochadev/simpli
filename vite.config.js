import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      },
      manifest: {
        name: 'Simpli',
        short_name: 'Simpli',
        description: 'Seu organizador pessoal simples e elegante',
        theme_color: '#7B5EA7',
        background_color: '#FDFAF8',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['productivity', 'lifestyle'],
        lang: 'pt-BR',
        shortcuts: [
          {
            name: 'Agenda',
            url: '/agenda',
            description: 'Ver minha agenda',
            icons: [{ src: '/icons/icon.svg', sizes: 'any' }]
          },
          {
            name: 'Planner',
            url: '/planner',
            description: 'Ver tarefas da semana',
            icons: [{ src: '/icons/icon.svg', sizes: 'any' }]
          },
          {
            name: 'Contas',
            url: '/bills',
            description: 'Ver minhas contas',
            icons: [{ src: '/icons/icon.svg', sizes: 'any' }]
          }
        ],
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
