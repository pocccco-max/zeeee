import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/zeeee/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    headers: { 'Service-Worker-Allowed': '/' },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@screens':    path.resolve(__dirname, 'src/screens'),
      '@hooks':      path.resolve(__dirname, 'src/hooks'),
      '@utils':      path.resolve(__dirname, 'src/utils'),
    },
  },
});
