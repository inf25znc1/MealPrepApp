# Build plan

This is the step-by-step plan to build the meal prep app. Work through the phases in order. Each phase has:

- **Goal** — what state the project is in when the phase is done
- **Prompt** — what to paste into Cursor's chat or composer
- **Files touched** — what should change on disk
- **Acceptance criteria** — what to verify before moving on

Don't skip ahead. Each phase depends on the previous one being correct.

> **Tip:** open the phase prompt in Cursor's Composer (Cmd+I), not the inline chat. Composer can create/edit multiple files in one shot, which fits how these phases are sized.

---

## Phase 0 — Scaffold the project

**Goal:** A fresh Vite + React + TypeScript project that runs `npm run dev` and shows the default Vite page.

This is the one phase you don't ask Cursor to do — just run the commands yourself.

```bash
npm create vite@latest meal-prep -- --template react-ts
cd meal-prep
npm install
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
npm install vaul @tabler/icons-react
```

Then copy the pre-built files from this package into the project:

- `README.md` → repo root
- `.cursor/rules/project.md` → repo `.cursor/rules/project.md`
- `BUILD_PLAN.md` → repo root
- `src/domain/types.ts` → as-is
- `src/data/constants.ts` → as-is
- `src/data/recipes.ts` → as-is
- `src/styles/tokens.css` → as-is

Open the project in Cursor. The rules file loads automatically.

**Acceptance:**
- [ ] `npm run dev` runs without errors
- [ ] The four `src/` files compile (no red squiggles)
- [ ] Cursor's chat sidebar shows the project rules are active

---

## Phase 1 — Wire up Tailwind and design tokens

**Goal:** Tailwind is configured with our design tokens mapped to utility classes. A simple test page uses them.

**Prompt to Cursor:**

```
Configure Tailwind CSS v4 in this Vite project.

1. Set up `@tailwindcss/vite` in `vite.config.ts`.
2. Create `src/styles/base.css` that imports Tailwind and `tokens.css`, sets the body to `font-sans antialiased text-text-primary bg-bg-primary`, and applies `min-h-svh`.
3. Import `base.css` from `src/main.tsx`.
4. In `tailwind.config.js` (or `@theme` block if using v4 native config), expose the CSS variables from `tokens.css` as Tailwind colors with these names:
   - bg-primary, bg-secondary, bg-tertiary, bg-info, bg-success, bg-warning, bg-danger
   - text-primary, text-secondary, text-tertiary, text-info, text-success, text-warning, text-danger
   - border-tertiary, border-secondary, border-primary, border-info
5. Also expose `rounded-md` as 8px and `rounded-lg` as 12px.
6. Replace the default Vite App.tsx with a temporary test page: a max-width 420px centered column, padding 4, showing one h1 "Meal prep", a paragraph in text-secondary, a button with bg-text-info class, and a card with bg-bg-secondary, rounded-lg, 0.5px border. The test page should let me see that all tokens are wired up.

Follow the rules in .cursor/rules/project.md. Do not hardcode colors.
```

**Files touched:** `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/styles/base.css`, `tailwind.config.js` (or `src/styles/tailwind.css` for v4 native).

**Acceptance:**
- [ ] `npm run dev` shows the test page with all elements visible
- [ ] Switching the system to dark mode flips the colors automatically
- [ ] The card has a hairline border, not a chunky one
- [ ] All text is in sentence case
- [ ] No hardcoded color values in any of the new files

---

## Phase 2 — Implement the domain layer

**Goal:** Pure TypeScript functions for portion scaling, daily targets, recipe picking, period building, shopping aggregation, and intake math. No React.

**Prompt to Cursor:**

```
Implement the domain layer in src/domain/. All functions are pure TypeScript with no React imports. Use the types from src/domain/types.ts and constants from src/data/constants.ts.

Create four files:

1. `src/domain/scaling.ts` — exports:
   - `personScale(person, recipe): number` — returns portion factor = (mealBudget / recipe.kcal), clamped between PORTION_MIN and PORTION_MAX. mealBudget comes from MEAL_BUDGETS[recipe.meal] * person.cals.
   - `personMacros(person, recipe): PersonMacros` — applies the factor to kcal, p, c, f. All output values rounded with Math.round.
   - `dailyTargetFor(person): DailyTargets` — uses DIET_MACRO_SPLITS for the person's diet style. Returns rounded kcal, p (grams = kcal*p%/4), c (kcal*c%/4), f (kcal*f%/9).

2. `src/domain/picker.ts` — exports:
   - `allExcludes(people: Person[]): Exclusion[]` — union of every person's exclusions.
   - `pickRecipe(meal: MealType, used: Set<string>, people: Person[], recipes: Recipe[]): Recipe` — filters by meal type and household exclusions, prefers recipes matching at least one person's diet style, prefers unused recipes, falls back if pool is exhausted. If nothing matches at all, throws an error with a clear message.
   - `buildPeriod(meta, existingMeals, people, recipes): Period` — first pass keeps locked meals from existingMeals; second pass picks fresh ones for unlocked slots. The `meta` argument provides label, key, days, dayList, cookDay, eatRange.
   - `rerollMeal(plan, periodKey, mealType, people, recipes): Plan` — picks a replacement for one meal. Seeds the `used` set with every other recipe currently in the plan to encourage week-wide variety. Returns a new plan object (don't mutate).

3. `src/domain/shopping.ts` — exports:
   - `aggregateShopping(plan, people): ShoppingItem[]` — for each meal in each period, sums per-person portion factors, multiplies by ingredient amount and by period days, accumulates by `${name}||${unit}` key across both periods. Returns array sorted alphabetically by name. Quantities rounded: integers for g/ml, one decimal for everything else.

4. `src/domain/intake.ts` — exports:
   - `dailyActualFor(person, period): DailyTargets` — sums all three meals' macros for one person in one period.
   - `weeklyAverageFor(person, plan): DailyTargets` — weighted average across periods by days.

After creating these, add a temporary "domain sanity check" block to App.tsx that:
- Constructs two test people (one 2100 kcal balanced, one 1800 kcal mediterranean with seafood excluded).
- Builds a full plan using buildPeriod for both A (4 days, Mon-Thu) and B (3 days, Fri-Sun).
- Aggregates the shopping list.
- Renders the plan structure and shopping list as plain text in <pre> tags so I can eyeball the numbers.

The test block is temporary. It will be removed in Phase 4.
```

**Files touched:** `src/domain/scaling.ts`, `src/domain/picker.ts`, `src/domain/shopping.ts`, `src/domain/intake.ts`, `src/App.tsx`.

**Acceptance:**
- [ ] Test page shows a plan with 6 meals (3 in each period)
- [ ] No meal in Period A repeats in Period A
- [ ] No recipe with seafood exclusion appears (the test partner excludes seafood)
- [ ] Shopping list has reasonable quantities (chicken breast in hundreds of grams, olive oil in tbsp)
- [ ] Manual check: for "Lemon chicken & rice" (180g chicken per person, base 620 kcal), two people at 2100 and 1800 kcal lunch (37.5% = 787 and 675 kcal budget) over 4 days should give roughly 180g × (1.27 + 1.09) × 4 ≈ 1700g of chicken. Verify in the rendered shopping list.

---

## Phase 3 — State management with reducer and localStorage

**Goal:** A single React context holding `AppState`, mutated only via reducer actions. State persists to localStorage automatically.

**Prompt to Cursor:**

```
Build the state layer in src/state/.

1. `src/state/reducer.ts` — define an `Action` union type and a reducer function. Actions:
   - `GENERATE_PLAN` — build both periods, preserving locked meals from current plan if it exists
   - `REROLL_MEAL` (payload: { periodKey, mealType }) — replace one unlocked meal
   - `TOGGLE_LOCK` (payload: { periodKey, mealType }) — flip the locked flag on a meal slot
   - `SET_ACTIVE_TAB` (payload: 'plan' | 'shop')
   - `SET_ACTIVE_PERSON` (payload: personId)
   - `ADD_PERSON` — appends a new person with defaults (name "Person N", 2000 kcal, balanced, no exclusions)
   - `REMOVE_PERSON` (payload: personId) — removes; if it was active, switch to first remaining
   - `UPDATE_PERSON` (payload: { id, patch: Partial<Person> }) — shallow merge
   - `HYDRATE` (payload: AppState) — replaces state with loaded data (used by localStorage load)

   The reducer is pure. It calls buildPeriod/rerollMeal from the domain layer but never touches localStorage or the DOM. Import the RECIPES array from data/recipes.ts inside the reducer file.

2. `src/state/useLocalStorage.ts` — a `useDebouncedStorage<T>(key, value)` hook that writes `value` to localStorage under `key` debounced 300ms. It only writes, never reads (loading is done once on mount in the provider).

3. `src/state/AppContext.tsx` — exports:
   - `AppContext` — React context holding `{ state, dispatch }`
   - `AppProvider` — wraps children. On mount, reads from localStorage under STORAGE_KEY and dispatches HYDRATE if found, otherwise uses the default initial state below. Subscribes to state changes via useDebouncedStorage. Catches JSON parse errors and falls back to defaults.
   - `useApp()` — hook returning the context. Throws if used outside provider.

   Default initial state:
   - people: [{ id: 'p1', name: 'You', cals: 2100, diet: 'balanced', excludes: [] }, { id: 'p2', name: 'Partner', cals: 1800, diet: 'mediterranean', excludes: ['seafood'] }]
   - plan: null
   - activeTab: 'plan'
   - activePersonId: 'p1'

4. Wrap <App /> in <AppProvider> in main.tsx.

5. Update App.tsx to consume the context: replace the static test block with one that calls dispatch({ type: 'GENERATE_PLAN' }) on a button click, and renders the resulting plan as plain text. Keep it ugly — this is still a sanity check, not the real UI.

Follow the rules in .cursor/rules/project.md.
```

**Files touched:** `src/state/reducer.ts`, `src/state/useLocalStorage.ts`, `src/state/AppContext.tsx`, `src/main.tsx`, `src/App.tsx`.

**Acceptance:**
- [ ] Clicking "Generate" produces a plan
- [ ] Reloading the page restores the plan
- [ ] In DevTools → Application → Local Storage, there's a `mealprep:v1` key with the full state
- [ ] Manually editing the localStorage value and reloading shows the edited state (proves load works)
- [ ] Deleting the localStorage key and reloading falls back to defaults (proves error handling)
- [ ] No `any` types anywhere in `src/state/`

---

## Phase 4 — Top bar, tabs, and Plan tab shell

**Goal:** The app shell — top bar with household summary and settings gear, person switcher pills, tab bar, and an empty Plan tab with the Generate button.

**Prompt to Cursor:**

```
Replace the placeholder App.tsx with the real app shell. Build it as composed components in src/components/.

Components to create:

1. `src/components/TopBar.tsx`
   - 64px-ish tall, full width inside the 420px column.
   - Left side: small eyebrow label "THIS WEEK" (uppercase, 11px, letter-spacing 0.5px, text-secondary), below it the household summary (e.g. "2 people") in 14px weight 500.
   - Right side: icon-only button with IconSettings from @tabler/icons-react. aria-label="Open household settings". On click, dispatches a local "open settings sheet" event — for now, console.log("open settings") since the sheet doesn't exist yet.
   - 0.5px bottom border using border-border-tertiary.

2. `src/components/PersonSwitcher.tsx`
   - Horizontal scrollable row of pills, one per person.
   - Active pill: bg-bg-info, text-text-info, border-border-info, rounded-full.
   - Inactive pill: transparent bg, 0.5px border-border-tertiary, rounded-full, text-primary.
   - Click dispatches SET_ACTIVE_PERSON.
   - Padding: px-3 py-1.5, text-sm.

3. `src/components/Tabs.tsx`
   - Two tab buttons, equal width.
   - Active tab: 2px border-bottom in text-info color, text-primary, font-weight-500.
   - Inactive tab: transparent border-bottom, text-secondary.
   - Click dispatches SET_ACTIVE_TAB.

4. `src/components/PlanTab/index.tsx`
   - Padding 14px sides and bottom, top 14px.
   - At the top, a Generate week button: full width, bg-text-info, white text, py-3.5, rounded-lg, IconSparkles icon on the left, "Generate week" label.
   - Below the button, render a placeholder div for now: when state.plan is null, show "Tap Generate week to plan your meals." in text-secondary inside a bg-bg-secondary rounded-lg padding-8 centered card. Otherwise show "[Plan goes here — Phase 5]".

5. `src/components/ShoppingTab.tsx`
   - Just a placeholder: "[Shopping list goes here — Phase 6]" in a bg-bg-secondary card.

6. `src/App.tsx`
   - Top-level layout: centered max-w-[420px] column, full height of viewport.
   - Renders TopBar, PersonSwitcher, Tabs, then either PlanTab or ShoppingTab based on state.activeTab.
   - No card around the whole app — just the column.

Use @tabler/icons-react for all icons. All buttons use type="button". All icons that aren't standalone have aria-hidden.

Follow the rules. No new libraries. No animations.
```

**Files touched:** `src/components/TopBar.tsx`, `src/components/PersonSwitcher.tsx`, `src/components/Tabs.tsx`, `src/components/PlanTab/index.tsx`, `src/components/ShoppingTab.tsx`, `src/App.tsx`.

**Acceptance:**
- [ ] At 360px viewport (Chrome DevTools mobile), nothing overflows horizontally
- [ ] Tapping a person pill changes which one is highlighted
- [ ] Tapping a tab switches between Plan and Shopping content
- [ ] Pressing Generate creates a plan; the placeholder text in PlanTab disappears (because plan is no longer null), even though we haven't rendered the meals yet
- [ ] Reload preserves the active tab and active person

---

## Phase 5 — Plan tab content: daily intake card, period blocks, meal rows

**Goal:** Plan tab shows the full layout — daily intake card for the active person, two period blocks, three meal rows each, with lock and re-roll buttons working.

**Prompt to Cursor:**

```
Build the Plan tab content. Create three new components and update PlanTab/index.tsx to use them.

1. `src/components/PlanTab/DailyIntakeCard.tsx`
   Renders the active person's daily target vs actual.
   
   When plan is null: just show targets — eyebrow "{name}'s daily target" + a row with kcal, P, C, F values in 18px weight-500.
   
   When plan exists: show a 2x2 grid:
   - Top-left: kcal label + "actual / target" + progress bar in text-info color
   - Top-right: protein, progress bar in text-success
   - Bottom-left: carbs, progress bar in text-warning
   - Bottom-right: fat, progress bar in text-danger
   
   Each bar is 4px tall, rounded, with width = min(100, (actual/target)*100)%. The bar track is bg-bg-secondary; this card itself is also bg-bg-secondary so use bg-bg-tertiary for the bar track.
   
   Use weeklyAverageFor from domain/intake.ts for "actual".
   
   Bar markup uses role="progressbar" with aria-valuenow, aria-valuemax, aria-valuemin.

2. `src/components/PlanTab/MealRow.tsx`
   Props: { periodKey: PeriodKey, mealType: MealType, slot: MealSlot }
   
   A horizontal flex row, 0.5px border, rounded-md, padding 3, gap 2.5:
   - 36×36 square avatar with rounded-md, bg-bg-secondary, centered icon: IconCoffee for breakfast, IconBowl for lunch, IconToolsKitchen2 for dinner
   - Flex-1 text block (min-w-0 to allow truncation):
     - Eyebrow "{mealType}" (uppercase 11px text-secondary)
     - Recipe name (text-sm font-medium, truncate)
     - Subtext "{kcal} kcal · {p}P {c}C {f}F · {personName}" (12px text-secondary)
     The kcal and macros are personMacros for the ACTIVE person, not the household.
   - Lock button: icon-only, IconLock if locked, IconLockOpen otherwise. When locked: bg-bg-info, text-text-info, border-border-info. Click dispatches TOGGLE_LOCK.
   - Reroll button: icon-only, IconRefresh. When the meal is locked, disable the button and reduce icon opacity to 30%. Click dispatches REROLL_MEAL.
   
   The whole row is clickable — clicking anywhere except the two buttons should... for now, console.log("open meal sheet", periodKey, mealType). The actual sheet comes in Phase 7.
   
   Use e.stopPropagation() on the two button handlers.

3. `src/components/PlanTab/PeriodBlock.tsx`
   Props: { period: Period }
   
   Header row (margin-bottom 2):
   - Left: period.label in font-medium 15px, below it "Cook {cookDay} · eat {eatRange}" in 12px text-secondary
   - Right: per-day kcal for active person in font-medium 12px, below it "{p}P {c}C {f}F" in 11px text-secondary
   
   Three MealRow components below, with 2 spacing between them.
   
   Margin-bottom 4.5 between period blocks.

4. Update `src/components/PlanTab/index.tsx`:
   - Above the Generate button: nothing.
   - Below the Generate button: DailyIntakeCard.
   - Below that: PeriodBlock for A, then PeriodBlock for B.
   - When plan is null, only the Generate button and the no-plan placeholder show.

Follow the rules. Use only the icons listed. Don't add animations. All numbers must be rounded.
```

**Files touched:** `src/components/PlanTab/DailyIntakeCard.tsx`, `src/components/PlanTab/MealRow.tsx`, `src/components/PlanTab/PeriodBlock.tsx`, `src/components/PlanTab/index.tsx`.

**Acceptance:**
- [ ] After tapping Generate, both periods render with three meals each
- [ ] Switching active person changes the kcal/macro numbers in meal rows AND in the daily intake card
- [ ] Daily intake card bars fill proportionally
- [ ] Tapping lock toggles the icon and color; the reroll button next to it greys out when locked
- [ ] Tapping reroll on an unlocked meal swaps it for a different recipe; locked meals never change on a single reroll
- [ ] Tapping Generate again preserves locked meals
- [ ] Long recipe names truncate with ellipsis, don't break layout
- [ ] At 360px viewport, nothing overflows

---

## Phase 6 — Shopping tab

**Goal:** Shopping tab shows an alphabetically sorted, household-totalled, period-aware ingredient list that recalculates on every change.

**Prompt to Cursor:**

```
Replace `src/components/ShoppingTab.tsx` with the real implementation.

When plan is null: bg-bg-secondary rounded-lg card with "Generate a week to see your shopping list." in text-secondary, centered, padding-8.

When plan exists:
- Top hint line (12px text-secondary, margin-bottom 2.5): "For {N} {person/people} · 7 days · auto-updates with your menu"
- Below: a flat <ul> with no padding/margin. Each <li> is a flex row, justify-between, font-size 14px, padding-y 2.75, 0.5px bottom border in border-tertiary:
  - Left: ingredient name
  - Right: "{qty} {unit}" in text-secondary, font-variant-numeric: tabular-nums for clean alignment

Call aggregateShopping(state.plan, state.people) on every render — don't memoize unless this becomes a measured performance problem.

Follow the rules.
```

**Files touched:** `src/components/ShoppingTab.tsx`.

**Acceptance:**
- [ ] Shopping list shows ingredients in alphabetical order
- [ ] Tapping reroll on a meal in the Plan tab and switching to Shopping shows different quantities
- [ ] Adding a person in localStorage (manually, since the settings sheet doesn't exist yet) and reloading shows higher quantities
- [ ] Quantities are integers for g/ml, one decimal for pcs/tbsp/tsp/etc.
- [ ] No floating point artifacts like "84.99999" in the displayed values

---

## Phase 7 — Bottom sheets (meal detail and household settings)

**Goal:** Tapping a meal row opens a Vaul bottom sheet with full per-person nutrition and raw ingredients. Tapping the gear opens a household settings sheet where you can edit, add, and remove people.

**Prompt to Cursor:**

```
Add two bottom sheets using Vaul.

1. `src/components/sheets/MealDetailSheet.tsx`
   
   Props: { open: boolean, onOpenChange: (open: boolean) => void, periodKey: PeriodKey | null, mealType: MealType | null }
   
   Uses Vaul's <Drawer.Root open onOpenChange> with snapPoints not required. The drawer slides up from the bottom.
   
   When periodKey/mealType are non-null and plan exists, look up the slot, then render in the drawer content:
   - Drag handle (Vaul provides; if not, a 36×4 rounded pill in bg-border-secondary, centered, margin-bottom 3.5)
   - Header row: eyebrow "{period.label} · {mealType}" + h3 recipe name on the left; IconX close button on the right that calls onOpenChange(false)
   - Section "Nutrition per person" (eyebrow style):
     - One row per person: padding 2.5/3, rounded-md, bg-bg-secondary normally, bg-bg-info if person.id === state.activePersonId
     - Left: person name (13px font-medium), below it "{factor*100}% portion" in 11px text-secondary
     - Right: "{kcal} kcal" (14px font-medium), below it "{p}P · {c}C · {f}F" in 11px text-secondary
   - Section "Raw ingredients · {N} {day/days}, {M} {person/people}" (eyebrow):
     - Plain table, full width: name on the left, "{qty} {unit}" on the right with tabular-nums. 0.5px bottom border on each row.
     - For this meal alone over period.days, multiplied by household.
   - Footer with two buttons side-by-side:
     - Left: Lock toggle — same lock styling as the meal row. Label "Locked" / "Lock meal".
     - Right: Reroll — disabled if locked, label "Re-roll", IconRefresh.
   
   The sheet content has max-height 85vh and is scrollable internally.

2. `src/components/sheets/HouseholdSheet.tsx`
   
   Props: { open, onOpenChange }
   
   Drawer content (max-h 90vh, scrollable):
   - Drag handle, header "Household" + IconX close button
   - For each person in state.people, render a card (bg-bg-secondary, rounded-md, padding 3, margin-bottom 2.5):
     - Top row: text input for name (flex-1) + IconTrash button on the right (only show if state.people.length > 1)
     - 2-column grid:
       - "kcal/day": number input, step 50, min 1000, max 4500
       - "Diet": <select> with DIETS options
     - Below: small label "Avoids", then a flex-wrap row of checkbox chips for each EXCLUSION. Chip styling: padding 1/2, bg-bg-primary, 0.5px border-border-tertiary, rounded-md, 12px text. When checked, no special highlight — the inner checkbox indicates state.
   - At the bottom of the list, a dashed "Add person" button: full width, py-2.5, border-dashed 0.5px border-border-secondary, transparent bg, IconPlus.
   - Every input change dispatches UPDATE_PERSON immediately (debounce is at the storage layer, not here).

3. Add state to App.tsx (or PlanTab) for which sheet is open and which meal is selected:
   - useState<{ open: boolean, periodKey: PeriodKey | null, mealType: MealType | null }> for the meal sheet
   - useState<boolean> for the household sheet
   - Wire TopBar's settings button to open the household sheet
   - Wire MealRow's row-click to open the meal sheet with the right periodKey/mealType

Use vaul's import: `import { Drawer } from 'vaul'`. Style Drawer.Content with bg-bg-primary, rounded-t-[20px], border-t border-border-tertiary, padding 4.

Follow the rules. Numbers stay rounded. No new libraries.
```

**Files touched:** `src/components/sheets/MealDetailSheet.tsx`, `src/components/sheets/HouseholdSheet.tsx`, `src/App.tsx`, `src/components/PlanTab/MealRow.tsx` (to trigger sheet), `src/components/TopBar.tsx` (to trigger sheet).

**Acceptance:**
- [ ] Tap a meal → sheet slides up with the right recipe
- [ ] Active person's row in the sheet is visually distinct from others
- [ ] Numbers in the sheet match what the Plan tab shows for that meal
- [ ] Lock/Reroll buttons in the sheet work and update both the sheet and the underlying plan
- [ ] Tap the gear icon → household sheet opens
- [ ] Edit a person's kcal → close sheet → meal row macros for that person update
- [ ] Toggle "dairy" exclusion for one person → currently-displayed meals may not change (per design, we don't auto-regenerate); but tapping Generate after the change picks no dairy recipes
- [ ] Add a 3rd person → they appear in the PersonSwitcher
- [ ] Remove the active person → switcher falls back to the first remaining person
- [ ] Escape key closes sheets (Vaul default)
- [ ] Backdrop tap closes sheets (Vaul default)

---

## Phase 8 — PWA setup

**Goal:** The app can be installed to a phone's home screen and works offline.

**Prompt to Cursor:**

```
Configure vite-plugin-pwa.

1. Add the plugin to vite.config.ts. Configuration:
   - registerType: 'autoUpdate'
   - manifest:
     - name: 'Meal Prep'
     - short_name: 'Meal Prep'
     - description: 'Plan a week of meals across two cook sessions'
     - theme_color: '#1a1a1a'
     - background_color: '#ffffff'
     - display: 'standalone'
     - orientation: 'portrait'
     - start_url: '/'
     - icons: standard sizes 192 and 512, src '/icon-192.png' and '/icon-512.png'
   - workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] }
   - includeAssets: ['favicon.ico']

2. Create placeholder icon files in public/: a minimal 192x192 and 512x512 PNG of a dark grey square with a centered light circle. Just placeholders — we'll replace with real art later.

3. Add `<meta name="theme-color" content="#1a1a1a">` to index.html.

4. Add a small registration prompt in App.tsx that's commented out — we don't need a custom install button for v1, but leave a note for future.

Test: after `npm run build && npm run preview`, the app should be installable from Chrome (look for the install icon in the address bar) and the Lighthouse PWA audit should pass.
```

**Files touched:** `vite.config.ts`, `index.html`, `public/icon-192.png`, `public/icon-512.png`.

**Acceptance:**
- [ ] `npm run build` succeeds
- [ ] After `npm run preview`, Chrome shows an "Install app" option
- [ ] Installed app opens without browser chrome and shows the meal prep UI
- [ ] Lighthouse PWA audit shows no critical errors
- [ ] Loading the app with the network throttled to offline (after one successful load) still shows the UI and previously generated plan

---

## Phase 9 — Deploy to Vercel

**Goal:** App is live at a Vercel URL, auto-deploys on push.

This phase is mostly clicking through Vercel's UI, not Cursor work. But ask Cursor for one thing:

**Prompt to Cursor:**

```
Add a vercel.json file at the repo root with rewrite rules so all routes serve index.html (for the SPA), and a simple cache header on the service worker file.

{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    }
  ]
}

Also add a README section under "Deploy" with the manual Vercel steps:
1. Push to GitHub
2. Import the repo at vercel.com/new
3. Framework preset: Vite (auto-detected)
4. Deploy
```

**Files touched:** `vercel.json`, `README.md`.

**Acceptance:**
- [ ] App is live at a Vercel URL
- [ ] Pushing to main triggers a redeploy
- [ ] Branch pushes get preview URLs
- [ ] The deployed app works as a PWA on a phone

---

## Phase 10 — Cleanup

**Goal:** Production-clean state. No console.logs, no TODOs left dangling, no unused imports.

**Prompt to Cursor:**

```
Do a cleanup pass on src/.

1. Remove all console.log statements except deliberate error logging.
2. Remove unused imports across all files.
3. Verify no `any` types remain. If any are present, replace with proper types or unknown + narrowing.
4. Verify all component files are under 150 lines. If any are larger, suggest a split but don't make the change yet — flag them and let me review.
5. Search for "TODO" comments and list them.
6. Run npx tsc --noEmit and fix any errors.
7. Verify the package.json scripts include `"typecheck": "tsc --noEmit"` and add it if missing.
```

**Acceptance:**
- [ ] `npm run typecheck` passes with no errors
- [ ] No `console.log` in shipped code
- [ ] No `any` types
- [ ] No TODOs (or all are documented and acceptable)
- [ ] Bundle size from `npm run build` output is under 200KB gzipped

---

## After v1

Things to add when v1 has been used for a few weeks:

- **Versioned localStorage**: when the AppState shape changes, add a `version` field and a migration function. Currently any shape change will break stored plans for existing users.
- **Recipe library expansion**: 30+ recipes. Consider sourcing from TheMealDB and computing nutrition from USDA FoodData Central as a one-time import.
- **AI-assisted generation**: a "Smart generate" button that calls Gemini (or similar) with the recipe library and constraints, returning IDs to pick. Falls back to the existing random picker if the API fails. Needs a Vercel Edge Function to keep the API key off the client.
- **Per-person meals**: today everyone eats the same meal scaled to their kcal. Some households want different meals on the same day. This is a real model change — `Period.meals` becomes `Period.meals[personId]`. Save for later.
- **Vitest**: add tests for the domain layer. The pure functions in `domain/` are easy to test and will catch regressions when the recipe library or algorithms evolve.

## Notes for working with Cursor

- **Don't over-prompt.** If a phase prompt feels too long, it probably is — but these phases are explicitly designed to be self-contained chunks. Resist the urge to combine phases.
- **Ask Cursor to explain before changing.** Especially for the domain layer and the reducer, asking "explain what this function does before changing it" reduces the chance Cursor silently breaks logic.
- **Use Composer for multi-file edits, Chat for questions.** Phases 1–8 are Composer territory. Cleanup-style passes work fine in Chat.
- **Verify acceptance criteria yourself.** Don't take "done" from Cursor at face value. Open the app, click the buttons, look at the numbers.
- **Commit between phases.** If phase 5 goes well and phase 6 explodes, you want to be able to reset.
