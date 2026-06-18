import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL ?? "https://example.com";
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  site,
  base,
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  integrations: [mdx(), sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
