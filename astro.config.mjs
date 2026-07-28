// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-first: public pages are prerendered by default; protected routes
// opt out with `export const prerender = false` and render on Vercel.
export default defineConfig({
  site: "https://www.maggiechan.io",
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      // Only the public landing page should be discoverable; work is gated and
      // /versions/* are internal design explorations (also noindex).
      filter: (page) => {
        const path = new URL(page).pathname;
        return path === "/" || path === "";
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
