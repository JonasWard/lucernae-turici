import dns from 'node:dns';
import { defineConfig } from 'vite';
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3010,
  },
  build: {
    outDir: './build',
  },
  base: '/para-slim-shady/',
});
