# Weekly Meal Planner

A screen-adaptive web app that builds a weekly meal plan from the discounted/special
ingredients dumped into `/datadump` (PAK'nSAVE Mt Albert & Westgate specials).

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
  `StoreID` for the canonical store name.

`supabase-client.js` fetches both tables (paginated, 1000 rows/request) using
the project's **publishable** (`sb_publishable_...`) key and reshapes them
into the same `{ generatedFrom, dumpDate, rows }` structure `data.js` used to
provide, so the rest of the app didn't need to change. This runs on page
load, and again whenever you click **"Check for new store data"** — which,
unlike the old data.js version, works from a plain `file://` page too, since
it's a cross-origin fetch to Supabase rather than a same-origin file read.

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

## What it does

- **Store prompt on load**: the app asks which store you're shopping at before
  showing anything. Every price and special shown afterwards is limited strictly to
  that store — no cross-store fallback. You can still switch stores any time from
  the header dropdown.
- **7-day meal plan**, one card per day, each tagged **V** (vegetarian), **NV**
  (non-vegetarian) or **VG** (vegan). Filter the grid with the checkboxes in the header.
- Each card's ribbon (directly under the meal image) holds the "add to cart"
  checkbox, category badge, date, meal name and serving count.
- Every ingredient is looked up live against the CSV data: size, price, and — when
  the item is genuinely discounted — the price is shown in green with a `(% off)`
  badge. Brand names sit under the ingredient name; items with no brand (fresh
  produce) just show the ingredient. If an ingredient isn't on special at the
  chosen store this week, the card says so instead of guessing.
- **Common pantry staples** (salt, pepper, oil, etc.) are listed separately on each
  card and are not added to the shopping cart or its total, since you're assumed to
  already have them.
- **Reset button** clears all card selections (and the cart) and turns every meal
  type filter back on.
- **Generate Meal Plan button** builds a stylish whole-week plan document (all
  currently-filtered meals, priced for the chosen store) and downloads it as
  `MealPlan_<Store>_<yyyymmdd>.html` (generation date, not meal date) — open that
  file in a browser and use "Print → Save as PDF" for a PDF copy. Only one plan is
  produced per store per calendar day: clicking the button again the same day just
  reopens that same plan instead of generating a new one (tracked in the browser's
  local storage, since a static page has no real filesystem to check against).
- **Check for new store data** re-fetches `dbPromotionalIngredients`/`tStores`
  from Supabase without a full page reload, so if the scraper has added a new
  store since the app loaded, this picks it up live. If a store you don't
  already have shows up, it swaps in the fresh data, reopens the store
  prompt, and — as soon as you pick a store there — immediately generates
  that store's weekly plan. Works whether the page is opened via `file://`
  or served over `http(s)://`, since it's a cross-origin request to Supabase.
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
| `recipes.js` | The 7 meal definitions — ingredients reference exact product names as scraped |
| `tools/build-data.js` | *(legacy)* CSV → `data.js` converter, no longer used by the app |
| `data.js` | *(legacy)* Generated — no longer loaded by `index.html` |
| `datadump/*.csv` | *(legacy)* Source specials data, superseded by the Supabase tables |
