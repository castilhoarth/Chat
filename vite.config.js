import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://e7mufkrkytkmp2jp26if4canqq0fwezy.lambda-url.us-west-2.on.aws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    }
  }
});
