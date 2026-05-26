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
npm run dev
```

`npm run dev` serves the UI only. **Smart generation** (`/api/generate-plan`) runs on Vercel. To test Gemini locally:

```bash
cp .env.example .env.local
# Add your GEMINI_API_KEY from https://aistudio.google.com/apikey
npx vercel dev
```

Without the API key, **Згенерувати тиждень** falls back to the built-in random picker.

## Smart generation (Gemini)

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. In the Vercel project → **Settings → Environment Variables**, add `GEMINI_API_KEY`.
3. Redeploy. The generate button calls Gemini to pick recipe ids from `src/data/recipes.ts`, then the app computes nutrition from USDA data in `src/domain/nutrition.ts` (not from the model).

Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`).

## Deploy

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Framework preset: Vite (auto-detected)
4. Deploy

Pushing to `main` triggers production deploys; other branches get preview URLs.

### iOS install

On iPhone, open the deployed URL in Safari (not Chrome), tap Share → Add to Home Screen. The icon should appear automatically. If you see a screenshot instead of the icon, clear Safari's cache (Settings → Safari → Clear History and Website Data) and try again — Safari aggressively caches apple-touch-icons.
