# Project rules

These rules apply to every change in this repository. They are not suggestions.

## Design system

This app uses a single set of design tokens defined in `src/styles/tokens.css` as CSS variables. They are mapped into Tailwind via `tailwind.config.js`.

**Color rules:**
- Never hardcode hex, rgb, or hsl values in components. Use Tailwind classes that map to tokens (e.g. `bg-bg-secondary`, `text-text-info`) or, if absolutely necessary, `var(--color-...)`.
- Backgrounds: `bg-bg-primary` (white surface), `bg-bg-secondary` (soft cards), `bg-bg-info` (active states), `bg-bg-success/warning/danger` (semantic).
- Text: `text-text-primary` (default), `text-text-secondary` (subdued labels), `text-text-info/success/warning/danger` (semantic).
- Borders: always `border-[0.5px] border-border-tertiary` for normal borders. `border-2 border-border-info` is the only acceptable place to use a 2px border, and only for "featured" elements.

**Typography:**
- Default body 16px, line-height 1.7.
- Two weights only: 400 (regular) and 500 (medium). Never use `font-semibold`, `font-bold`, or any weight above 500.
- Sentence case for all UI strings. Never Title Case. Never ALL CAPS, except for 11px eyebrow labels with letter-spacing.
- Minimum font size: 11px.

**Component visual rules:**
- No gradients, no drop shadows, no blur, no glow effects, no neon.
- Corner radius: `rounded-md` (8px) for most things, `rounded-lg` (12px) for cards, `rounded-full` for pills.
- Cards: white background, 0.5px border, rounded-lg, padding `p-4` to `p-5`.
- All displayed numbers must be rounded (`Math.round` or `.toFixed`). Never show raw floats.

**Icons:**
- Use `@tabler/icons-react`, outline style only. Example: `<IconSparkles size={18} aria-hidden />`.
- Icon-only buttons get an `aria-label`.
- Decorative icons get `aria-hidden`.

## Code conventions

**File organization:**
- `src/data/` — static data (recipes, constants). Pure values, no logic.
- `src/domain/` — pure TypeScript functions. No React, no DOM, no side effects. Easy to test in isolation.
- `src/state/` — React state management (context, reducer, hooks).
- `src/components/` — React components. Thin: consume context, dispatch actions, render JSX.
- `src/styles/` — global CSS only (tokens, base resets).

**TypeScript:**
- Strict mode is on. Never use `any`. Use `unknown` and narrow, or define a proper type.
- All exported functions in `domain/` have explicit return types.
- All component props are typed via an interface, not inline.

**React:**
- Function components only. No class components.
- Hooks at the top of the component, JSX at the bottom. No early returns before hooks.
- Keep components under ~150 lines. If a component grows, extract sub-components.
- `useReducer` for the app state. Not Redux, not Zustand, not Jotai.
- Side effects in `useEffect`; never in render.

**State:**
- Single `AppState` object lives in a context, mutated only via reducer actions.
- Every action that changes meals or people triggers re-aggregation of the shopping list and intake math. Don't cache derived values in state — compute them in render or with `useMemo` if measured to be slow.
- Persistence: debounced (300ms) write to localStorage under key `mealprep:v1`. Load once on mount.

## What NOT to do

- Don't add libraries that aren't already in `package.json` without asking. Specifically: no Redux, no Zustand, no Jotai, no React Router, no Framer Motion, no Radix (we use Vaul for sheets), no Lucide (we use Tabler), no MUI/Chakra/Mantine, no date-fns (we don't deal with real dates).
- Don't add a backend. Everything is client-side in v1.
- Don't add authentication. There are no user accounts.
- Don't add a test framework yet. We'll add Vitest after v1 ships.
- Don't add animations beyond what Vaul provides for sheet transitions and simple Tailwind `transition-` classes for hover/active states.
- Don't generate recipe data with AI. Recipes are hand-authored in `src/data/recipes.ts` for v1.
- Don't try to be clever with TypeScript. Prefer simple types over conditional/mapped/branded types unless there's a concrete need.
- Don't write comments that restate what the code does. Only comment *why* when the reason isn't obvious from the code.

## Accessibility

- Every icon-only button has an `aria-label`.
- Decorative icons have `aria-hidden`.
- Bottom sheets (via Vaul) trap focus and close on Escape — Vaul handles this, don't override.
- Progress bars get `role="progressbar"` with `aria-valuenow`, `aria-valuemax`, `aria-valuemin`.
- Minimum tap target 44×44px on mobile.
- Color is never the only signal — locked meals use both icon shape and background color.

## Mobile-first

- Design for 360–430px viewports first. Test at 360px.
- On wider screens, content stays in a centered 420px column. Don't reflow into a multi-column layout.
- Use `min-h-svh` not `min-h-screen` to handle mobile browser chrome correctly.
