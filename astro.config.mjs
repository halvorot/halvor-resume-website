import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://halvorteigen.no",
  integrations: [
    icon(),
    sitemap({
      filter: (page) => page !== "https://halvorteigen.no/privacy-policy/",
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
