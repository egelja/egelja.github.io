// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap(), preact(), mdx()],

  vite: {
    plugins: [tailwindcss()]
  }
});