import { defineConfig } from 'astro/config';

export default defineConfig({
  publicDir: './estaticos',
  compressHTML: true,
  outDir: './publico',
  site: 'https://enflujo.com',
  base: '/',
  build: {
    assets: 'estaticos',
  },
});
