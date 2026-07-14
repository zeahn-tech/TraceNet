import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/TraceNet/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'prompt',

      includeAssets: [
        'icon.svg',
        'icon-192.png',
        'icon-512.png',
        'apple-touch-icon.png',
        'offline.html',
      ],

      manifest: {
        name: 'TraceNet — Together for Safer Communities',
        short_name: 'TraceNet',
        description:
          'A public safety collaboration platform connecting citizens and law enforcement.',

        start_url: '/TraceNet/',
        scope: '/TraceNet/',

        display: 'standalone',
        orientation: 'portrait',

        background_color: '#0B1F3A',
        theme_color: '#0B1F3A',

        icons: [
          {
            src: '/TraceNet/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/TraceNet/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        navigateFallback: '/TraceNet/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],

  build: {
    target: 'es2020',
    sourcemap: false,
  },
});