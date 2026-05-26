# Meal Prep App

A mobile-first PWA that plans a week of meals across two cook sessions (A: Sun→Mon-Thu, B: Thu→Fri-Sun), scales portions per person based on individual calorie goals, and auto-generates a shopping list.

## Stack

- **Vite + React + TypeScript** — app shell
- **Tailwind CSS** — styling, mobile-first
- **vite-plugin-pwa** — installable, offline-capable
- **Vaul** — bottom sheets
- **Tabler Icons React** — iconography
- **localStorage** — persistence (no backend in v1)
- **Vercel** — hosting

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

## Deploy

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Framework preset: Vite (auto-detected)
4. Deploy

Pushing to `main` triggers production deploys; other branches get preview URLs.

### iOS install

On iPhone, open the deployed URL in Safari (not Chrome), tap Share → Add to Home Screen. The icon should appear automatically. If you see a screenshot instead of the icon, clear Safari's cache (Settings → Safari → Clear History and Website Data) and try again — Safari aggressively caches apple-touch-icons.
