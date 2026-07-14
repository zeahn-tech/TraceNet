import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: "/TraceNet/"
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'offline.html'],
      manifest: {
        name: 'TraceNet — Together for Safer Communities',
        short_name: 'TraceNet',
        description:
          'A public safety collaboration platform connecting citizens and law enforcement to find missing persons, locate wanted individuals, report suspicious activity, and share verified safety alerts.',
        start_url: '/TraceNet/',
        scope: '/TraceNet/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B1F3A',
        theme_color: '#0B1F3A',
        categories: ['public-safety', 'government', 'utilities', 'news'],
        lang: 'en',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
        shortcuts: [
          {
            name: 'Report an incident',
            short_name: 'Report',
            url: '/app/report',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Missing persons',
            short_name: 'Missing',
            url: '/app/missing',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Alerts',
            short_name: 'Alerts',
            url: '/app/alerts',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/auth/, /^\/api/, /^\/rest/, /^\/functions/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/offline.html',
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          'motion-vendor': ['framer-motion'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
});
