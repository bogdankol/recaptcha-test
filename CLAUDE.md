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

A Next.js 16 (App Router, React 19) demo of reCAPTCHA flows, mirroring a real app's architecture. There is no real backend — the server-side score verification is **simulated** (see below), so a true score is never obtained; everything else matches production.

Pages under [app/](app/) (all `"use client"` — reCAPTCHA needs the browser):
- [app/page.tsx](app/page.tsx) — landing page linking to the demos. **When adding a new page, also add a `<Link>` to it here**, matching the styling of the existing demo links.
- [app/recaptcha2/page.tsx](app/recaptcha2/page.tsx) — **v2** checkbox via `react-google-recaptcha`, in a modal.
- [app/recaptcha3/page.tsx](app/recaptcha3/page.tsx) — **v3** (invisible, score-based); consumes `useRecaptchaScore` and shows the score.
- [app/login/page.tsx](app/login/page.tsx) — the real flow: v3 score on load, and the v2 checkbox appears **only as a fallback** when the score is suspicious.
- [app/testkey-always-0.9/page.tsx](app/testkey-always-0.9/page.tsx) — reCAPTCHA **Enterprise** (raw `grecaptcha.enterprise.execute`, script loaded with a `render` key); buttons show simulated scores.

### reCAPTCHA flow (mirrors the real app)

- **Keys** live hardcoded in [etc/config.ts](etc/config.ts): `recaptchaKey` (v3) and `recaptchaKeyForV2` (v2). (The real app injects these per-environment; here they're inline. `recaptchaKey` is currently empty — fill it to run the live v3 flow.)
- **Global provider**: [app/providers.tsx](app/providers.tsx) wraps the whole app in `<GoogleReCaptchaProvider>` (wired into [app/layout.tsx](app/layout.tsx)), like the real app's single provider in `_app.tsx`.
- **v3 score**: [app/hooks/useRecaptchaScore.ts](app/hooks/useRecaptchaScore.ts) mints a token via `executeRecaptcha` and calls `checkRecaptchaToken` → `validRecaptchaToken` ([app/lib/recaptcha.ts](app/lib/recaptcha.ts)), which POSTs to `v3/auth/recaptcha/verify` through [app/lib/apiClient.ts](app/lib/apiClient.ts). **`apiClient` is a stub that simulates the backend** (returns a random score) — swap it for the real api client in production. Scores below the threshold set `isSuspiciousScore`.
- **v2 fallback**: [app/hooks/useRecaptchaV2Handler.ts](app/hooks/useRecaptchaV2Handler.ts) reveals the v2 checkbox when `isSuspiciousScore` is true and tracks the v2 token.

A real score requires a server holding the secret key; it can never be obtained client-side. That's why the backend call is stubbed here.

### Styling

Tailwind CSS v4 (config-less, imported via `@import "tailwindcss"` in [app/globals.css](app/globals.css)). Theme tokens `--background`/`--foreground` are defined there and exposed to Tailwind as the `bg-background` / `bg-foreground` utilities, with automatic light/dark via `prefers-color-scheme`. Geist fonts are loaded in [app/layout.tsx](app/layout.tsx).

The `@/*` import alias maps to the repo root (see [tsconfig.json](tsconfig.json)).
