# Portfolio 2026

Password-protected portfolio built with Astro, Tailwind CSS v4, and Motion (Framer), deployed on Vercel.

## Stack

- Astro with the Vercel adapter — public pages are prerendered, protected pages render on the server.
- Tailwind CSS v4 (CSS-first config; design tokens live in `src/styles/tokens.css` and are mapped to utilities in `src/styles/global.css`).
- Motion (`motion/react`) via small React islands for nav hover and password form feedback.
- Content collections (`src/content/`) for work, blog, and prototypes.

## Getting started

```bash
npm install
cp .env.example .env   # then set SITE_PASSWORD and AUTH_SECRET
npm run dev
```

Generate a secret with `openssl rand -hex 32`.

## How it works

- `/` is the public password hero. Submitting the password posts to `/api/auth`, which validates it against `SITE_PASSWORD` and sets an HMAC-signed, httpOnly cookie.
- `src/middleware.ts` redirects any request under `/work`, `/blog`, or `/prototypes` back to `/` unless the cookie verifies. Add new protected prefixes in `src/config/auth.ts`.
- `/work` renders every entry in `src/content/work/`, sorted by `order`. The left nav links are generated from the same entries.

## Editing content

Each case study is a folder in `src/content/work/<slug>/` with an `index.md` (title, meta, subtitle, nav label, order, anchor) and co-located images. Edit the frontmatter to change copy — several subtitles are placeholders carried over from Figma and should be finalized. Site-wide copy (hero bio, social links) lives in `src/config/site.ts`.

## Design system

Tokens are a 1:1 translation of the Figma design system
(`2026 Design Portfolio Design System`): gray scale, semantic
backgrounds/typography/borders, spacing, and radii in `src/styles/tokens.css`;
the typescale in `src/styles/typography.css`. Bagoss is self-hosted in
`public/fonts/bagoss/`; Inter and Atkinson Hyperlegible Mono load from Google Fonts.

Note: the Figma nav wordmark uses Bagoss Standard Medium, but only the
w230 (Condensed Thin) and w320 (Standard Light) weights were licensed, so the
wordmark uses w320.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel — the Astro adapter needs zero config.
2. Set `SITE_PASSWORD` and `AUTH_SECRET` environment variables for Production and Preview.
3. Every push to `main` deploys production; branches get preview URLs.
