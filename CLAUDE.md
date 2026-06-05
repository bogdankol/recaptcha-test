# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — ESLint (flat config via `eslint-config-next`)

There is no test runner configured in this project.

## Architecture

A minimal Next.js 16 (App Router, React 19) demo comparing the two reCAPTCHA flows. The whole app is three pages under [app/](app/); there is no backend — token *verification* (the server-side `siteverify` call) is intentionally not implemented, so the pages only obtain tokens client-side.

- [app/page.tsx](app/page.tsx) — landing page linking to the demos. **When adding a new page, also add a `<Link>` to it here**, matching the styling of the existing demo links.
- [app/recaptcha2/page.tsx](app/recaptcha2/page.tsx) — **v2** ("I'm not a robot" checkbox) via `react-google-recaptcha`. Renders the `<ReCAPTCHA>` widget in a modal; user solves a challenge and `onChange` yields a token. Falls back to Google's official always-pass test key (`6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`) so it works out of the box.
- [app/recaptcha3/page.tsx](app/recaptcha3/page.tsx) — **v3** (invisible, score-based) via `react-google-recaptcha-v3`. Wraps the inner component in `<GoogleReCaptchaProvider>` and calls `executeRecaptcha(action)` to fetch a token silently. v3 has **no** public always-pass key, so the page renders a "set the key" message unless `NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY` is provided.

Both demo pages are `"use client"` components (reCAPTCHA needs the browser).

### Site keys

Site keys come from `process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY` / `..._V3_SITE_KEY`, read at module scope. Set them in `.env.local` to use real keys; the `NEXT_PUBLIC_` prefix is required for them to reach the client bundle.

### Styling

Tailwind CSS v4 (config-less, imported via `@import "tailwindcss"` in [app/globals.css](app/globals.css)). Theme tokens `--background`/`--foreground` are defined there and exposed to Tailwind as the `bg-background` / `bg-foreground` utilities, with automatic light/dark via `prefers-color-scheme`. Geist fonts are loaded in [app/layout.tsx](app/layout.tsx).

The `@/*` import alias maps to the repo root (see [tsconfig.json](tsconfig.json)).
