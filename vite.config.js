import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // Importa VitePWA

// https://vitejs.dev/config/
export default defineConfig({
  // Añade esta línea para incluir los archivos .glb como assets
  assetsInclude: ['**/*.glb'], //
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Padel Pro Ranking',
        short_name: 'PadelPro Ranking',
        description: 'Segui los torneos, tus estadisticas y mucho mas con nosotros',
        background_color: '#75B9E4',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: './public/PadelProArg.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './public/PadelProArg.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: './public/PadelProArg.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})