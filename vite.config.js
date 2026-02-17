import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import pkg from './package.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/eshop_admin/' : '/',
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  }
});


