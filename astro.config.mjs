// @ts-check
import { defineConfig } from "astro/config";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

const CV_URL = "https://raw.githubusercontent.com/egelja/resume/refs/heads/master/cv/cv-Nikola_Maruszewski.pdf";
const CV_FILENAME = CV_URL.split("/").at(-1);
const CV_OUT = new URL(`./public/${CV_FILENAME}`, import.meta.url);

/** @returns {import("astro").AstroIntegration} */
function downloadCV() {
  return {
    name: "download-cv",
    hooks: {
      "astro:config:done": async ({ logger }) => {
        logger.info("Downloading CV PDF...");
        const res = await fetch(CV_URL);
        if (!res.ok) throw new Error(`CV download failed: ${res.status}`);
        writeFileSync(fileURLToPath(CV_OUT), Buffer.from(await res.arrayBuffer()));
        logger.info(`CV PDF saved to public/${CV_FILENAME}`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://marusz.com",
  base: "/",
  trailingSlash: "always",

  integrations: [sitemap(), preact(), mdx(), icon(), downloadCV()],

  vite: {
    plugins: [tailwindcss()],
  },
});