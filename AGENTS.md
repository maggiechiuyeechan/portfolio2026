# AGENTS.md

## Cursor Cloud specific instructions

This is a password-protected portfolio site built with **Astro 7** (Vercel adapter), **Tailwind CSS v4**, React islands, and Motion. It's a single frontend app — there is no separate backend service. Standard commands live in `package.json` `scripts` and the setup steps are in `README.md`.

### Environment / runtime
- The cloud VM's default `node` is v22 (from `/exec-daemon/node`, which takes PATH precedence and shadows `nvm`). The repo's `.nvmrc` pins Node 20, but Node 22 satisfies Astro 7's engine requirements and is what the update script and all checks were validated against. Don't fight PATH to force Node 20 unless you hit a concrete version-specific failure.
- The update script runs `npm ci` and `npx astro sync` on startup, so dependencies and Astro's generated types are already in place for new agents.

### Required env vars (`.env`)
- The auth flow needs `SITE_PASSWORD` and `AUTH_SECRET`; PostHog vars are optional. The dev server, `astro check`, and `build` all run fine without a `.env`, but the login/`/api/auth` flow and any manual unlock test require it.
- `.env` is gitignored, so it does NOT persist in the repo and each new agent must recreate it if testing auth. Create it with:
  ```bash
  printf 'SITE_PASSWORD=hunter2\nAUTH_SECRET=%s\n' "$(openssl rand -hex 32)" > .env
  ```
  Then the site password is `hunter2` for manual unlock testing.

### Gotcha: `npm run typecheck` needs generated types first
- `npm run typecheck` (raw `tsc --noEmit`) and `npm run verify` will FAIL with errors like `Cannot find module 'astro:content'` / `Property 'env' does not exist on ImportMeta` unless Astro's `.astro/` types have been generated. Run `npx astro sync` first (the update script already does this). `npm run check` (astro check) and `npm run build` run sync automatically, so they don't need the extra step.

### Running / testing
- Dev server: `npm run dev` → serves on `http://localhost:4321`. `/` is the public password gate; `/work`, `/blog`, `/prototypes` redirect (302) to `/` until the auth cookie is set (see `src/middleware.ts`, `src/config/auth.ts`).
- Tests: `npm test` (Node's built-in test runner with `--experimental-strip-types`, covers `tests/*.test.ts`).
- Full gate: `npm run verify` (typecheck + astro check + test + build) — remember the `astro sync` prerequisite above.
