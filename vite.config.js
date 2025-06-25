import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // Importa VitePWA

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // Agrega el plugin VitePWA aquí
      registerType: 'autoUpdate', // O 'prompt', dependiendo de cómo quieras que se actualice el SW
      injectRegister: 'auto', // Para que el plugin inyecte el código de registro
      workbox: {
        // Esto precachea los archivos estáticos de tu aplicación.
        // Asegúrate de incluir todos los tipos de archivos relevantes.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        // Configuración del manifiesto de la aplicación
        name: 'Padel Pro Ranking', // Nombre completo de tu aplicación
        short_name: 'PPK',    // Nombre corto para la pantalla de inicio
        description: 'Segui los torneos, tus estadisticas y mucho mas con nosotros',
        theme_color: '#ffffff',  // Color de la barra de título/tema
        background_color: '#0a3d73', // Color de fondo al cargar
        display: 'standalone',   // Cómo se muestra (fullscreen, standalone, minimal-ui, browser)
        scope: '/',              // Alcance de la PWA
        start_url: '/',          // URL de inicio
        icons: [
          // Aquí defines los íconos de tu PWA. Deben estar en la carpeta 'public'.
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
            purpose: 'any maskable' // Para íconos adaptativos en Android
          }
        ]
      }
    })
  ],
})