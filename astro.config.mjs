import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  publicDir: './estaticos',
  compressHTML: true,
  outDir: './publico',
  site: 'http://haciendocaminos.uniandes.edu.co',
  base: '',
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
