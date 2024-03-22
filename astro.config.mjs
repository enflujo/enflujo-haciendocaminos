import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
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
    ssr: {
      noExternal: ['@enflujo/alquimia']
    }
  },
  integrations: [sitemap(), robotsTxt()]
});
