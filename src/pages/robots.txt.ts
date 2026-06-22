import type { APIRoute } from "astro";

// Answer-engine and AI crawlers we explicitly welcome, so the site can be
// retrieved and cited as a source. General crawlers are covered by `*`.
const AI_USER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
] as const;

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const sitemap = site
    ? new URL(`${base}sitemap-index.xml`, site).href
    : `${base}sitemap-index.xml`;

  const lines = [
    "# Welcome to general search and AI answer-engine crawlers.",
    ...AI_USER_AGENTS.flatMap((ua) => [`User-agent: ${ua}`, "Allow: /", ""]),
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemap}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
