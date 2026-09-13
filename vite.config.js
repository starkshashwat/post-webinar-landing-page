import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        thankyou: resolve(__dirname, 'thankyou.html'),
        notfound: resolve(__dirname, '404.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        refund: resolve(__dirname, 'refund.html'),
        contact: resolve(__dirname, 'contact.html'),
        disclaimer: resolve(__dirname, 'disclaimer.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
