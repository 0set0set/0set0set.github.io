import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPublishedArticles } from "@/lib/articles";
import { SITE } from "@/config/site";

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();
  const base = import.meta.env.BASE_URL;

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? "https://example.com",
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.date,
      link: `${base}articles/${article.id}`,
    })),
    customData: `<language>${SITE.locale}</language>`,
    trailingSlash: false,
  });
}
