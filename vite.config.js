import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function cleanUrlsPlugin() {
  const routes = {
    '/thankyou': '/thankyou.html',
    '/privacy': '/privacy.html',
    '/terms': '/terms.html',
    '/terms-of-service': '/terms.html',
    '/refund': '/refund.html',
    '/refund-policy': '/refund.html',
    '/contact': '/contact.html',
    '/contact-us': '/contact.html',
    '/disclaimer': '/disclaimer.html'
  };
  return {
    name: 'clean-urls-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url.split('?')[0];
        if (routes[url]) {
          req.url = routes[url] + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
        }
        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  publicDir: 'public',
  plugins: [cleanUrlsPlugin()],
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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
});
