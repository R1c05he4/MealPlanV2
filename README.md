# Weekly Meal Planner

A screen-adaptive web app that builds a weekly meal plan from discounted/special
PAK'nSAVE ingredients, scraped live into Supabase (see "Updating the specials" below).

## Running it

No build step, no server, no dependencies. Just open **`index.html`** in a browser
(Chrome or Edge recommended for the print-to-PDF step).

If you'd rather serve it (e.g. to test on your phone on the same network), any static
file server works, for example:

```
npx serve .
```

## Updating the specials

Specials now come live from Supabase — there's nothing to run locally to
refresh them. An external scraper writes rows into two tables in the
`bfelamslupuonlfntjol` project:

- `dbPromotionalIngredients` — one row per scraped special (`StoreName`,
  `Product`, `Size/Weight`, `Unit Price`, `Sale Price`, `Saving`, `scraped_at`,
  `StoreID`).
- `tStores` — `StoreID`, `StoreName`, `Island`, `City`. The app joins on
  `StoreID` for the canonical store name when this table has rows; if it's
  empty or a row's `StoreID` doesn't match (both true as of this writing —
  `dbPromotionalIngredients.StoreID` is currently `null` on every row), it
  falls back to that row's own `StoreName` column, which is already the
  full canonical name.

`supabase-client.js` fetches both tables (paginated, 1000 rows/request) using
the project's **publishable** (`sb_publishable_...`) key and reshapes them
into the same `{ generatedFrom, dumpDate, storeScrapedAt, rows }` structure
`data.js` used to provide, so the rest of the app didn't need to change. This
runs once, on page load; there's no live-refresh button — use **"Back To
Stores"** (which reloads the page) to re-fetch and re-pick a store.

The publishable key is safe to ship in client code — it only works because
Row Level Security on both tables grants public, read-only `SELECT`. Never
swap in the project's **secret** (`sb_secret_...`) key here; that one
bypasses RLS entirely and must never reach the browser.

If both tables are empty (nothing scraped yet), the app shows a "no specials
data yet" state instead of guessing.

### Legacy CSV pipeline (no longer used by the app)

`/datadump`, `tools/build-data.js` and `data.js` are kept for reference but
are no longer wired into `index.html`. If you ever need to fall back to them
(e.g. Supabase is unreachable), regenerate `data.js` with:

```
node tools/build-data.js
```

and swap the `<script src="supabase-client.js">` tag in `index.html` back to
`<script src="data.js">`.

### Re-auditing recipes.js after a Supabase refresh

There's no script for this — `recipes.js`'s ingredient `match` strings are
exact-string product names, so when the external scraper's weekly run
replaces the specials, some of last week's matches stop resolving (the app
shows those rows as "not on special") and any store the scraper newly added
has no curated list at all yet (it silently falls back to the first store's
list — see `currentMealPlans()` in `app.js`). To re-curate:

1. Query the live tables directly with the same publishable key
   `supabase-client.js` uses, e.g.
   `curl "https://bfelamslupuonlfntjol.supabase.co/rest/v1/dbPromotionalIngredients?select=*" -H "apikey: <key>" -H "Authorization: Bearer <key>"`
   (paginate with `&offset=`/`&limit=` past 1000 rows). Compare the distinct
   `StoreName` values against the keys already in
   `window.MEAL_PLANS_BY_STORE` to spot new/removed stores.
2. For each store, filter to rows with a parseable `Sale Price` (mirrors
   `resolveIngredient()` in `app.js`) to see what's actually promotable that
   week — proteins, starches, sauces, and separately the fresh produce
   (`Size/Weight` of `ea`/`kg`), since that's normally where stores differ
   most from each other.
3. Rebuild each store's recipes from what's live — up to 7 each for V, NV
   and VG — keeping every `ingredients[].match` an exact `Product` string
   for that store, and re-verify with the same query (0 unresolved
   ingredients) before committing — a recipe with an unresolvable
   ingredient is exactly the "not on special" bug this process exists to
   catch.

The last full re-audit (this session) found 6 live stores instead of the
previous 3, and ~2/3 of the existing ingredients no longer resolving — the
scale of drift can be substantial, not just a few swapped products. A
later session expanded every store from 7 mixed recipes to up to 21 (up to
7 each of V/NV/VG) using the same live-catalog validation approach.

## What it does

- **Store prompt on load**: the app asks which store you're shopping at before
  showing anything, listing every store the scraper currently has data for.
  Every price and special shown afterwards is limited strictly to that store
  — no cross-store fallback, and no way to switch stores without going back
  through this prompt.
- **Three parallel 7-day meal plans per store** — up to 7 recipes each for
  **V** (vegetarian), **NV** (non-vegetarian) and **VG** (vegan), up to 21
  cards total, plus a **GF** (gluten-free) badge on top of that where it
  applies, since gluten-free is independent of the other three (a dish can
  be both Vegan and GF, say). A given calendar day can show up to three
  cards side by side — one per category — since each category's `dayOffset`
  cycles 0–6 independently. Filter the grid with the checkboxes in the
  header to narrow down to one or two categories at a time; the GF checkbox
  further narrows whatever's already showing down to gluten-free meals
  only, rather than being another either/or category. Where a store's live
  specials can't realistically support 7 distinct, coherent dishes in a
  category, that category simply has fewer than 7 rather than padding with
  unrealistic combinations. GF tags (and the vegetarian rennet source
  behind the **V** tag, for cheese ingredients) reflect the packaged
  ingredients' manufacturer-published ingredient lists at the time each
  recipe was written — formulations can change, so verify current
  packaging if this matters for an actual dietary restriction.
- Each card's ribbon (directly under the meal image) holds the "add to cart"
  checkbox, category/GF badges, date, meal name and serving count. Clicking
  anywhere on the card toggles its selection, same as clicking the checkbox
  directly — except the "Recipe & image ›" button, which keeps its own
  distinct action instead.
- Every ingredient is looked up live against Supabase: size, price, and — when
  the item is genuinely discounted — the price is shown in green with a `(% off)`
  badge. Brand names sit under the ingredient name; items with no brand (fresh
  produce) just show the ingredient. If an ingredient isn't on special at the
  chosen store this week, the card says so instead of guessing. On a mouse
  (not touch), hovering an ingredient row highlights it.
- `dbPromotionalIngredients` only ever holds items *currently* on a genuine
  promotional deal, never a full catalogue — so every recipe ingredient is
  chosen to be something realistically promotable at that specific store,
  not just a plausible product name. This is also why **each store has its
  own independently-curated recipe list** — up to 7 recipes each for V, NV
  and VG, up to 21 total — (`recipes.js`, `window.MEAL_PLANS_BY_STORE`)
  rather than one fixed list applied everywhere: what substitutes for e.g.
  dry pasta or a leafy green genuinely differs store to store, so the same
  nominal dish can use different real ingredients — and even a different
  name — depending which store you picked. As of this writing the scraper
  covers 6 stores (Albany, Westgate, Lincoln Road, Sylvia Park, Royal Oak,
  Silverdale), each with its own fully independent list; fresh produce is
  where they diverge most — Lincoln Road in particular still has no fresh
  vegetables on special, only avocado, so its recipes lean on that plus
  frozen prawns, raw chicken cutlets and a wide range of canned legumes for
  the vegan slots instead. A store the scraper adds later, before anyone
  curates a list for it, falls back to Albany's list rather than showing
  nothing (see `currentMealPlans()` in `app.js`) — that's a stopgap, not a
  substitute for an accurate list for that store.
- **Common pantry staples** (salt, pepper, oil, etc.) are listed separately on each
  card and are not added to the shopping cart or its total, since you're assumed to
  already have them.
- **Back To Stores button** reloads the page, taking you back to the initial
  store prompt (clearing selections and re-fetching Supabase in the process)
  so you can shop a different store.
- **Generate Meal Plan button** builds a stylish whole-week plan document (all
  currently-filtered meals, priced for the chosen store) and downloads it as
  `MealPlan_<Store>_<yyyymmdd>.html` (generation date, not meal date) — open that
  file in a browser and use "Print → Save as PDF" for a PDF copy. Only one plan is
  produced per store per calendar day: clicking the button again the same day just
  reopens that same plan instead of generating a new one (tracked in the browser's
  local storage, since a static page has no real filesystem to check against).
- Selecting a card's checkbox adds its ingredients to the **shopping cart**
  (floating cart button, bottom-right). Ingredients shared by two or more selected
  meals are merged into a single row with a `×N` badge — click it to see which
  meals/dates use that ingredient; click again to hide.
- Each cart row has its own checkbox so you can tick off things you already have at
  home; the grand total only counts checked rows.
- **"Generate Cooking Instructions (PDF)"** opens a nicely formatted, illustrated
  (CSS hero + emoji per meal) instructions document for every selected meal, with a
  print button — choose "Save as PDF" in the browser's print dialog for a real PDF
  file.
- Clicking "Recipe & image ›" on any card opens a popup with that meal's image,
  full ingredient list, pantry staples and numbered cooking steps.

## Project files

| File | Purpose |
|---|---|
| `index.html` / `styles.css` / `app.js` | The app itself |
| `supabase-client.js` | Fetches specials live from Supabase (`dbPromotionalIngredients` + `tStores`) |
| `recipes.js` | Up to 21 meal definitions per store (up to 7 each of V/NV/VG) — each store's list is independently curated so every ingredient resolves against that store's own specials |
| `tools/build-data.js` | *(legacy)* CSV → `data.js` converter, no longer used by the app |
| `data.js` | *(legacy)* Generated — no longer loaded by `index.html` |
| `datadump/*.csv` | *(legacy)* Source specials data, superseded by the Supabase tables |
