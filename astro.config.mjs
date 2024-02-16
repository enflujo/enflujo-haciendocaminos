import { defineConfig } from 'astro/config';

export default defineConfig({
  publicDir: './estaticos',
  compressHTML: true,
  outDir: './publico',
  site: 'https://enflujo.github.io',
  base: '/enflujo-haciendocaminos',
  build: {
    assets: 'estaticos'
  },
  vite: {
    ssr: { noExternal: ['@enflujo/alquimia'] }
  }
});
