export interface SocialLink {
  readonly label: string;
  readonly href: string;
}

export interface SiteConfig {
  readonly title: string;
  readonly author: string;
  readonly description: string;
  readonly tagline: string;
  readonly bio: readonly string[];
  readonly locale: string;
  readonly social: readonly SocialLink[];
}

export const SITE: SiteConfig = {
  title: "0set0set",
  author: "0set0set",
  description:
    "Software engineer and builder with 15+ years of experience. I write about software engineering, systems, and about life and spirituality.",
  tagline: "I build things. I have my whole life.",
  bio: [
    "Software engineer with 15+ years in the industry — though, honestly, I've been writing code since I was a kid. Building is how I make sense of the world.",
    "I write here about software engineering, systems, and about life and spirituality. Off the keyboard, you'll find me enjoying nature, taking walks with my family, and living the life God gave me — coffee in hand.",
  ],
  locale: "en-US",
  social: [{ label: "GitHub", href: "https://github.com/0set0set" }],
} as const;
