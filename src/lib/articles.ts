import { getCollection, type CollectionEntry } from "astro:content";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
} from "@/content.config";

export type Article = CollectionEntry<"articles">;

const includeDrafts = import.meta.env.DEV;

const byNewestFirst = (a: Article, b: Article): number =>
  b.data.date.getTime() - a.data.date.getTime();

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection("articles", ({ data }) =>
    includeDrafts ? true : !data.draft,
  );
  return articles.sort(byNewestFirst);
}

export interface CategorySection {
  readonly category: Category;
  readonly label: string;
  readonly articles: Article[];
}

export async function getArticlesByCategory(): Promise<CategorySection[]> {
  const articles = await getPublishedArticles();
  return CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    articles: articles.filter((article) => article.data.category === category),
  })).filter((section) => section.articles.length > 0);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
