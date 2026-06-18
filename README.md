# Articles website

A static website for publishing articles, built with [Astro](https://astro.build/).
A self-contained project inside `web/`, ready to be published via GitHub Pages.

Design references: visual identity inspired by
[impeccable.style](https://impeccable.style/); editorial structure inspired by
[darioamodei.com](https://darioamodei.com/).

## Requirements

- Node 22+ (see `.nvmrc`)
- [`just`](https://github.com/casey/just) for the task shortcuts

## Commands

```sh
just            # list the available tasks
just setup      # install dependencies
just dev        # local server at http://localhost:4321
just check      # type-check content and components
just build      # generate the static site into dist/
just preview    # preview the production build
just all        # setup + check + build
just clean      # remove dist/, node_modules/ and .astro/
```

Without `just`, the same steps exist as npm scripts (`npm run dev`, etc).

## Writing articles

Create a `.md` or `.mdx` file in `src/content/articles/`. The file name becomes
the URL slug (`/articles/<slug>`). Supported frontmatter:

```yaml
---
title: Article title
description: Short summary used in lists, SEO and RSS.
date: 2026-06-18
updated: 2026-06-20   # optional
category: essay        # "essay" (Essays) or "note" (Short notes)
draft: false           # true hides it from the production build
---
```

Drafts (`draft: true`) appear in `just dev`, but are omitted from the build.

## Structure

```
web/
├── astro.config.mjs        # Astro config (site/base via env), MDX, sitemap
├── justfile                # task shortcuts
├── src/
│   ├── components/         # small, reusable pieces
│   ├── config/site.ts      # site metadata (single source of truth)
│   ├── content/articles/   # articles in Markdown/MDX
│   ├── content.config.ts   # typed schema + categories
│   ├── layouts/            # BaseLayout and ArticleLayout
│   ├── lib/articles.ts     # DRY helpers (sort, filter, group, dates)
│   ├── pages/              # index, articles, 404, rss.xml
│   └── styles/global.css   # design tokens + editorial styles
└── public/                 # static assets (favicon)
```

## Supply-chain security

Dependency installation is hardened against supply-chain attacks (e.g. the
Shai-Hulud npm worm class). The controls live in version-controlled config:

- `.npmrc`
  - `ignore-scripts=true` — dependency lifecycle scripts (`preinstall`/
    `postinstall`/`install`) never run automatically. This neutralizes the most
    common npm worm loader. The build does not depend on any install script
    (esbuild/sharp ship prebuilt binaries via optional dependencies).
  - `min-release-age=14` — prefer package versions at least 14 days old, so
    freshly-published malicious releases are not pulled in before the registry
    can take them down.
- `package.json`
  - `packageManager: npm@11.10.0` — pins the package manager (use Corepack to
    honor it).
- `package-lock.json` is committed and never hand-edited. `just setup` runs
  `npm ci` (frozen install) so builds are reproducible from the lockfile.

If a future dependency genuinely needs its install script, run it explicitly
and deliberately (`npm rebuild <pkg>`), rather than disabling the global guard.

The project has no CI workflows or Dockerfile here (deploy lives in a separate
GitHub Pages repository). When you add CI/CD, keep the same posture: pin any
third-party GitHub Action to a 40-char commit SHA, pin Docker `FROM` lines by
`sha256` digest, and set Dependabot `cooldown` to at least 14 days.

## Publishing to GitHub Pages

The build is fully static (`dist/`). `site` and `base` are read from the
environment so it works in any repository without touching the code:

- User/organization page (`https://<user>.github.io`):

  ```sh
  SITE_URL="https://<user>.github.io" just build
  ```

- Project page (`https://<user>.github.io/<repo>/`):

  ```sh
  SITE_URL="https://<user>.github.io" BASE_PATH="/<repo>" just build
  ```

Then publish the contents of `dist/` to the target GitHub Pages repository.
