import { defineConfig } from 'astro/config';

export default defineConfig({
  publicDir: './estaticos',
  compressHTML: true,
  outDir: './publico',
  site: 'https://enflujo.com',
  base: '/enflujo-haciendocaminos',
  build: {
    assets: 'estaticos',
  },
  vite: {
    ssr: { noExternal: ['@enflujo/alquimia'] },
  },
});
