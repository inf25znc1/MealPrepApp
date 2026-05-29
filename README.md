# Meal Prep App

A mobile-first PWA that plans a week of meals across two cook sessions (A: Sun→Mon-Thu, B: Thu→Fri-Sun), scales portions per person based on individual calorie goals, and auto-generates a shopping list.

## Stack

- **Vite + React + TypeScript** — app shell
- **Tailwind CSS** — styling, mobile-first
- **vite-plugin-pwa** — installable, offline-capable
- **Vaul** — bottom sheets
- **Tabler Icons React** — iconography
- **localStorage** — persistence
- **Vercel** — hosting + Gemini API (smart plan generation)
- **Google Gemini** — suggests recipes from the catalog (server-side only)

## Docs

- `BUILD_PLAN.md` — phase-by-phase implementation plan, written for Cursor
- `.cursor/rules/project.md` — always-on rules for the AI (design tokens, conventions, guardrails)
- `src/domain/types.ts` — canonical data model
- `src/styles/tokens.css` — design tokens (CSS variables, light + dark)

## How to use this with Cursor

1. Open this folder in Cursor.
2. The rules in `.cursor/rules/project.md` load automatically into every prompt.
3. Work through `BUILD_PLAN.md` one phase at a time. Each phase has a prompt you can paste verbatim and acceptance criteria you can verify before moving on.
4. After each phase, run the app (`npm run dev`) and check the criteria. Don't move to the next phase until the current one works.

## Run locally

```bash
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY from https://aistudio.google.com/apikey
npm run dev
```

Open **http://localhost:5174/** (port 5173 may be another app).

`npm run dev` runs Vite **and** local `/api/*` routes (same handlers as on Vercel). You need `GEMINI_API_KEY` in `.env.local`.

Alternative: `npx vercel dev` if you prefer the full Vercel dev environment.

Without a valid API key or when generation fails, **Згенерувати тиждень** shows a specific error message.

The request includes household targets, **package products** (whole-pack hints), and **Улюблені рецепти**.

## Smart generation (Gemini)

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. In the Vercel project → **Settings → Environment Variables**, add `GEMINI_API_KEY`.
3. Redeploy. The generate button calls Gemini to create **full meal-prep recipes** (ingredients in grams, steps). The app recomputes nutrition from `src/data/foods.ts` where possible. Locked meals are kept when you regenerate the week.

Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`).

## Deploy

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Framework preset: Vite (auto-detected)
4. Deploy

Pushing to `main` triggers production deploys; other branches get preview URLs.

### iOS install

On iPhone, open the deployed URL in Safari (not Chrome), tap Share → Add to Home Screen. The icon should appear automatically. If you see a screenshot instead of the icon, clear Safari's cache (Settings → Safari → Clear History and Website Data) and try again — Safari aggressively caches apple-touch-icons.
