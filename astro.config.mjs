// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://marusz.com",
  base: "/",
  trailingSlash: "always",

  integrations: [sitemap(), preact(), mdx(), icon()],

  vite: {
    plugins: [tailwindcss()],
  },
});