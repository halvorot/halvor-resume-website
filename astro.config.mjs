import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  site: 'https://halvorteigen.no',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [icon(), sitemap(
    {
      filter: (page) => page !== 'https://halvorteigen.no/privacy-policy/',
    }
  ), solidJs()]
});