(function () {
  'use strict';

  // These are re-buildable (not const) because "Check for new store data" can
  // hot-swap in a freshly regenerated data.js without a full page reload.
  let rows = [];
  let dumpDate = new Date();
  let stores = [];
  let storeScrapedAt = {}; // store name -> YYYYMMDD string, for the per-store "last scraped" subtitle
  let productIndex = new Map(); // product name -> array of rows across stores

  function rebuildIndexes(dataset) {
    rows = (dataset && dataset.rows) || [];
    dumpDate = parseDumpDate(dataset && dataset.dumpDate);
    storeScrapedAt = (dataset && dataset.storeScrapedAt) || {};
    stores = [...new Set(rows.map(r => r.store))].sort();
    productIndex = new Map();
    for (const r of rows) {
      if (!productIndex.has(r.product)) productIndex.set(r.product, []);
      productIndex.get(r.product).push(r);
    }
  }
  const state = {
    activeCategories: new Set(['V', 'NV', 'VG']),
    gfOnly: false, // narrows the above further to gluten-free meals only; independent of category
    storeFilter: null, // set once the user answers the store prompt; app is scoped to that store only
    selectedMeals: new Set(),
    checkedCartItems: new Set(), // ingredient keys the shopper still needs to buy
    openUsesKey: null,
  };

  function parseDumpDate(str) {
    if (str && /^\d{8}$/.test(str)) {
      const y = +str.slice(0, 4), m = +str.slice(4, 6), d = +str.slice(6, 8);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }

  function fmtDate(date) {
    return date.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function money(n) {
    return '$' + (Math.round(n * 100) / 100).toFixed(2);
  }

  // Each store has its own independently-curated recipe list (see
  // recipes.js), since a fixed set of exact product names can't resolve
  // against every store's different weekly promotions. Falls back to the
  // first curated store's list for a store the scraper has added that
  // hasn't been reviewed yet, rather than showing nothing.
  function currentMealPlans() {
    const byStore = window.MEAL_PLANS_BY_STORE || {};
    if (state.storeFilter && byStore[state.storeFilter]) return byStore[state.storeFilter];
    const fallbackKey = Object.keys(byStore)[0];
    return fallbackKey ? byStore[fallbackKey] : [];
  }

  // ---------- Ingredient resolution ----------
  // Special ingredients are strictly limited to the store the user chose in the
  // store prompt — no cross-store fallback. If the item isn't on special at that
  // store this week, it comes back unresolved.
  function resolveIngredient(matchName, storeFilter) {
    if (!storeFilter) return null;
    const candidates = productIndex.get(matchName) || [];
    const pool = candidates.filter(c => c.salePrice != null && c.store === storeFilter);
    if (!pool.length) return null;
    const best = pool.slice().sort((a, b) => a.salePrice - b.salePrice)[0];
    return { row: best };
  }

  function computeRecipeLines(recipe, storeFilter) {
    return recipe.ingredients.map(ing => {
      const resolved = resolveIngredient(ing.match, storeFilter);
      if (!resolved) {
        return { ...ing, resolved: false };
      }
      const row = resolved.row;
      const priceEach = row.salePrice;
      const savingEach = row.saving || 0;
      const onSpecial = row.onSpecial;
      const savingPct = onSpecial && priceEach + savingEach > 0
        ? Math.round((savingEach / (priceEach + savingEach)) * 100)
        : 0;
      return {
        ...ing,
        resolved: true,
        row,
        size: row.size,
        priceEach,
        onSpecial,
        savingEach,
        savingPct,
        lineTotal: priceEach * ing.qty,
        lineSaving: savingEach * ing.qty,
      };
    });
  }

  function cardTotals(lines) {
    let total = 0, saving = 0;
    for (const l of lines) {
      if (l.resolved) { total += l.lineTotal; saving += l.lineSaving; }
    }
    return { total, saving };
  }

  // Ingredient names shown to the shopper are the real Supabase product name
  // (ing.match) with the brand prefix stripped, never the curator-written
  // ing.generic — so wording always matches what's on the shelf/receipt.
  function displayIngredientName(ing) {
    const match = ing.match || '';
    const brand = ing.brand || '';
    if (brand && match.toLowerCase().startsWith(brand.toLowerCase())) {
      const stripped = match.slice(brand.length).replace(/^[\s,-]+/, '');
      if (stripped) return stripped;
    }
    return match;
  }

  // ---------- Rendering: meal cards ----------
  const cardGrid = document.getElementById('cardGrid');
  const sourceLine = document.getElementById('sourceLine');

  function init() {
    document.querySelectorAll('#categoryFilters input').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.value === 'GF') {
          state.gfOnly = cb.checked;
        } else if (cb.checked) {
          state.activeCategories.add(cb.value);
        } else {
          state.activeCategories.delete(cb.value);
        }
        renderCards();
      });
    });

    updateSourceLine();

    document.getElementById('cartToggle').addEventListener('click', () => setCartOpen(true));
    document.getElementById('cartClose').addEventListener('click', () => setCartOpen(false));
    document.getElementById('cartOverlay').addEventListener('click', () => setCartOpen(false));
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') closeModal();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    document.getElementById('pdfBtn').addEventListener('click', generateInstructionsPdf);
    document.getElementById('generateBtn').addEventListener('click', handleGeneratePlan);
    document.getElementById('backToStoresBtn').addEventListener('click', () => location.reload());

    document.body.classList.add('store-pending');
    renderStorePrompt();

    renderCards();
    renderCart();
  }

  function updateSourceLine() {
    if (!stores.length) {
      sourceLine.textContent = 'No specials data yet — waiting for the Supabase scraper to populate it.';
      return;
    }
    if (!state.storeFilter) {
      sourceLine.textContent = 'Choose a store to see this week’s specials.';
      return;
    }
    const scrapedRaw = storeScrapedAt[state.storeFilter];
    const scrapedDate = scrapedRaw ? parseDumpDate(scrapedRaw) : dumpDate;
    const dumpLabel = scrapedDate.toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
    sourceLine.textContent = `Specials from ${state.storeFilter} — last scraped ${dumpLabel}`;
  }

  // ---------- Store prompt ----------
  function renderStorePrompt() {
    const container = document.getElementById('storePromptButtons');
    container.innerHTML = '';
    if (!stores.length) {
      const msg = document.createElement('p');
      msg.textContent = 'No specials data yet — the Supabase scraper hasn’t populated any stores. Try reloading the page shortly.';
      container.appendChild(msg);
    } else {
      for (const s of stores) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = s;
        btn.addEventListener('click', () => chooseStore(s));
        container.appendChild(btn);
      }
    }
    document.getElementById('storePromptOverlay').classList.add('is-open');
  }

  function chooseStore(store) {
    state.storeFilter = store;
    document.getElementById('storePromptOverlay').classList.remove('is-open');
    document.getElementById('generateBtn').disabled = false;
    document.body.classList.remove('store-pending');
    updateSourceLine();
    renderCards();
    renderCart();
  }

  function renderCards() {
    cardGrid.innerHTML = '';
    for (const recipe of currentMealPlans()) {
      if (!state.activeCategories.has(recipe.category)) continue;
      if (state.gfOnly && !recipe.glutenFree) continue;
      cardGrid.appendChild(buildCard(recipe));
    }
  }

  function buildCard(recipe) {
    const lines = computeRecipeLines(recipe, state.storeFilter);
    const { total, saving } = cardTotals(lines);
    const date = new Date(dumpDate);
    date.setDate(date.getDate() + recipe.dayOffset);
    const selected = state.selectedMeals.has(recipe.id);

    const card = document.createElement('article');
    card.className = 'meal-card' + (selected ? ' meal-card--selected' : '');

    const hero = document.createElement('div');
    hero.className = 'meal-card__hero';
    hero.style.background = `linear-gradient(135deg, ${recipe.gradient[0]}, ${recipe.gradient[1]})`;
    hero.textContent = recipe.emoji;
    card.appendChild(hero);

    const ribbon = document.createElement('div');
    ribbon.className = 'meal-card__ribbon';
    ribbon.innerHTML = `
      <input type="checkbox" class="meal-card__select" ${selected ? 'checked' : ''} aria-label="Add ${recipe.name} to shopping cart" />
      <div class="meal-card__titles">
        <div class="meal-card__name">${recipe.name}</div>
        <div class="meal-card__meta">
          <span class="badge badge--${recipe.category}">${recipe.category}</span>
          ${recipe.glutenFree ? '<span class="badge badge--GF">GF</span>' : ''}
          <span class="meal-card__date">${fmtDate(date)}</span>
          <span class="meal-card__servings">· Serves ${recipe.servings}</span>
        </div>
      </div>`;
    const selectCheckbox = ribbon.querySelector('.meal-card__select');
    selectCheckbox.addEventListener('change', (e) => {
      toggleMeal(recipe.id, e.target.checked);
    });
    card.appendChild(ribbon);

    const body = document.createElement('div');
    body.className = 'meal-card__body';
    for (const line of lines) {
      body.appendChild(buildIngredientRow(line));
    }
    const pantryNote = document.createElement('div');
    pantryNote.className = 'pantry-note';
    pantryNote.innerHTML = `<b>Pantry staples:</b> ${recipe.pantry.join(', ')}`;
    body.appendChild(pantryNote);
    card.appendChild(body);

    const footer = document.createElement('div');
    footer.className = 'meal-card__footer';
    footer.innerHTML = `
      <div class="meal-card__totals">
        Total: <b>${money(total)}</b><br />
        <span class="meal-card__saving-line">${saving > 0 ? 'You save ' + money(saving) : ' '}</span>
      </div>
      <button type="button" class="meal-card__link">Recipe & image ›</button>`;
    footer.querySelector('.meal-card__link').addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(recipe, lines, date);
    });
    card.appendChild(footer);

    // Clicking anywhere else in the card toggles its selection, in sync
    // with the checkbox — except the checkbox itself (already handled by
    // its own 'change' listener above) and the "Recipe & image" button
    // (which stops propagation to keep its own distinct action).
    card.addEventListener('click', (e) => {
      if (e.target.closest('.meal-card__select')) return;
      selectCheckbox.checked = !selectCheckbox.checked;
      toggleMeal(recipe.id, selectCheckbox.checked);
    });

    return card;
  }

  function buildIngredientRow(line) {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    if (!line.resolved) {
      row.innerHTML = `
        <div class="ingredient-row__name">
          ${displayIngredientName(line)}
          ${line.brand ? `<span class="ingredient-row__brand">${line.brand}</span>` : ''}
        </div>
        <div class="ingredient-row__price ingredient-row__unresolved">not on special</div>`;
      return row;
    }
    const priceClass = line.onSpecial ? 'ingredient-row__price is-special' : 'ingredient-row__price';
    // Native tooltip on hover, referencing the live Supabase row this price
    // came from (dbPromotionalIngredients.PromotionalIngredientID).
    row.title = 'PromotionalIngredientID: ' + line.row.id;
    row.innerHTML = `
      <div class="ingredient-row__name">
        ${displayIngredientName(line)} ${line.qty > 1 ? '×' + line.qty : ''}
        ${line.brand ? `<span class="ingredient-row__brand">${line.brand}</span>` : ''}
        <span class="ingredient-row__size">${line.size}</span>
      </div>
      <div class="${priceClass}">
        ${money(line.priceEach)}
        ${line.onSpecial && line.savingPct > 0 ? `<span class="ingredient-row__saving">(${line.savingPct}% off)</span>` : ''}
      </div>`;
    return row;
  }

  // ---------- Selection / cart logic ----------
  function toggleMeal(id, isSelected) {
    if (isSelected) state.selectedMeals.add(id);
    else state.selectedMeals.delete(id);
    renderCards();
    renderCart();
  }

  function ingredientKey(match) { return 'ing::' + match; }

  function buildCartAggregate() {
    // key -> { generic, brand, match, qty, uses: [{recipeName,date}], line info }
    const map = new Map();
    const pantrySet = new Set();
    for (const recipe of currentMealPlans()) {
      if (!state.selectedMeals.has(recipe.id)) continue;
      const date = new Date(dumpDate);
      date.setDate(date.getDate() + recipe.dayOffset);
      for (const ing of recipe.ingredients) {
        const key = ingredientKey(ing.match);
        if (!map.has(key)) {
          map.set(key, { key, generic: ing.generic, brand: ing.brand, match: ing.match, qty: 0, uses: [] });
        }
        const entry = map.get(key);
        entry.qty += ing.qty;
        entry.uses.push({ name: recipe.name, date: fmtDate(date) });
      }
      for (const p of recipe.pantry) pantrySet.add(p);
    }
    // resolve pricing per aggregated item
    for (const entry of map.values()) {
      const resolved = resolveIngredient(entry.match, state.storeFilter);
      if (resolved) {
        entry.resolved = true;
        entry.priceEach = resolved.row.salePrice;
        entry.onSpecial = resolved.row.onSpecial;
        entry.size = resolved.row.size;
        entry.store = resolved.row.store;
        entry.lineTotal = entry.priceEach * entry.qty;
      } else {
        entry.resolved = false;
        entry.lineTotal = 0;
      }
      // default new items to "checked" (need to buy) unless the user un-checked them before
      if (!state.checkedCartItems.has(entry.key) && !cartKeysEverSeen.has(entry.key)) {
        state.checkedCartItems.add(entry.key);
      }
      cartKeysEverSeen.add(entry.key);
    }
    return { items: [...map.values()].sort((a, b) => displayIngredientName(a).localeCompare(displayIngredientName(b))), pantry: [...pantrySet].sort() };
  }
  const cartKeysEverSeen = new Set();

  function renderCart() {
    const { items, pantry } = buildCartAggregate();
    const cartList = document.getElementById('cartList');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartPantry = document.getElementById('cartPantry');
    const cartCount = document.getElementById('cartCount');
    const grandTotalEl = document.getElementById('grandTotal');
    const pdfBtn = document.getElementById('pdfBtn');

    cartCount.textContent = state.selectedMeals.size;
    pdfBtn.disabled = state.selectedMeals.size === 0;

    if (!items.length) {
      cartEmpty.style.display = 'block';
      cartList.innerHTML = '';
      cartPantry.innerHTML = '';
      grandTotalEl.textContent = money(0);
      return;
    }
    cartEmpty.style.display = 'none';
    cartList.innerHTML = '';

    let grandTotal = 0;
    for (const item of items) {
      const checked = state.checkedCartItems.has(item.key);
      if (checked && item.resolved) grandTotal += item.lineTotal;

      const row = document.createElement('div');
      row.className = 'cart-item' + (checked ? '' : ' is-unchecked');
      const usesOpen = state.openUsesKey === item.key;
      row.innerHTML = `
        <input type="checkbox" ${checked ? 'checked' : ''} aria-label="Need to buy ${displayIngredientName(item)}" />
        <div class="cart-item__main">
          <div class="cart-item__name-row">
            <div>
              <div class="cart-item__name">${displayIngredientName(item)}${item.uses.length > 1 ? `<button type="button" class="cart-item__count-btn">×${item.uses.length}</button>` : ''}</div>
              ${item.brand ? `<div class="cart-item__brand">${item.brand}</div>` : ''}
            </div>
            <div class="cart-item__price">${item.resolved ? money(item.lineTotal) : '—'}</div>
          </div>
          <div class="cart-item__qty-line">
            ${item.resolved ? `Qty ${item.qty} × ${money(item.priceEach)} (${item.size})` : 'Not currently on special'}
          </div>
          <div class="cart-item__uses ${usesOpen ? 'is-open' : ''}">
            ${item.uses.map(u => `<div>🍽️ ${u.name} — ${u.date}</div>`).join('')}
          </div>
        </div>`;
      row.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        if (e.target.checked) state.checkedCartItems.add(item.key);
        else state.checkedCartItems.delete(item.key);
        renderCart();
      });
      const countBtn = row.querySelector('.cart-item__count-btn');
      if (countBtn) {
        countBtn.addEventListener('click', () => {
          state.openUsesKey = state.openUsesKey === item.key ? null : item.key;
          renderCart();
        });
      }
      cartList.appendChild(row);
    }

    cartPantry.innerHTML = pantry.length
      ? `<b>Pantry items you may already have:</b> ${pantry.join(', ')}`
      : '';

    grandTotalEl.textContent = money(grandTotal);
  }

  function setCartOpen(open) {
    document.getElementById('cartPanel').classList.toggle('is-open', open);
    document.getElementById('cartOverlay').classList.toggle('is-open', open);
  }

  // ---------- Modal (recipe + image popup) ----------
  function openModal(recipe, lines, date) {
    const content = document.getElementById('modalContent');
    content.innerHTML = `
      <div class="modal-hero" style="background: linear-gradient(135deg, ${recipe.gradient[0]}, ${recipe.gradient[1]})">${recipe.emoji}</div>
      <div class="modal-body">
        <h2>${recipe.name}</h2>
        <div class="meal-card__meta">
          <span class="badge badge--${recipe.category}">${recipe.category}</span>
          <span class="meal-card__date">${fmtDate(date)}</span>
          <span class="meal-card__servings">· Serves ${recipe.servings}</span>
        </div>
        <div class="modal-section-title">Ingredients</div>
        <ul>
          ${lines.map(l => `<li>${displayIngredientName(l)}${l.brand ? ' (' + l.brand + ')' : ''} — ${l.resolved ? l.qty + ' × ' + l.size : 'not on special'}</li>`).join('')}
        </ul>
        <div class="modal-section-title">Pantry staples</div>
        <div>${recipe.pantry.join(', ')}</div>
        <div class="modal-section-title">Cooking instructions</div>
        <ol>
          ${recipe.instructions.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>`;
    document.getElementById('modalOverlay').classList.add('is-open');
  }
  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('is-open');
  }

  // ---------- PDF / print generation ----------
  function generateInstructionsPdf() {
    const selected = currentMealPlans().filter(r => state.selectedMeals.has(r.id));
    if (!selected.length) return;

    const sections = selected.map(recipe => {
      const lines = computeRecipeLines(recipe, state.storeFilter);
      const date = new Date(dumpDate);
      date.setDate(date.getDate() + recipe.dayOffset);
      return `
        <section class="meal">
          <div class="meal-hero" style="background:linear-gradient(135deg, ${recipe.gradient[0]}, ${recipe.gradient[1]})">${recipe.emoji}</div>
          <h2>${recipe.name}</h2>
          <div class="meta">
            <span class="badge badge--${recipe.category}">${recipe.category}</span>
            &nbsp;${fmtDate(date)} &nbsp;·&nbsp; Serves ${recipe.servings}
          </div>
          <h3>Ingredients</h3>
          <ul>
            ${lines.map(l => `<li>${displayIngredientName(l)}${l.brand ? ' <em>(' + l.brand + ')</em>' : ''} — ${l.resolved ? l.qty + ' × ' + l.size : 'not on special this week'}</li>`).join('')}
          </ul>
          <h3>Pantry staples</h3>
          <p class="pantry">${recipe.pantry.join(', ')}</p>
          <h3>Method</h3>
          <ol>
            ${recipe.instructions.map(s => `<li>${s}</li>`).join('')}
          </ol>
        </section>`;
    }).join('<div class="page-break"></div>');

    const doc = `<!doctype html>
<html><head><meta charset="UTF-8" /><title>Cooking Instructions — Weekly Meal Plan</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #222; margin: 0; padding: 0 40px 40px; }
  .cover { text-align: center; padding: 60px 0 30px; }
  .cover h1 { font-size: 2.2rem; margin-bottom: 6px; }
  .cover p { color: #666; }
  .meal { padding-top: 30px; }
  .meal-hero { width: 100%; height: 120px; border-radius: 12px; display:flex; align-items:center; justify-content:center; font-size: 3rem; color:#fff; margin-bottom: 14px; }
  h2 { font-size: 1.5rem; margin: 0 0 4px; }
  .meta { font-size: 0.9rem; color: #555; margin-bottom: 10px; }
  .badge { display:inline-block; font-size:0.7rem; font-weight:700; color:#fff; padding:2px 9px; border-radius:999px; }
  .badge--V { background:#43a047; } .badge--NV { background:#e0672a; } .badge--VG { background:#00897b; }
  h3 { font-size: 1.05rem; border-bottom: 2px solid #ddd; padding-bottom: 4px; margin-top: 20px; }
  li { margin-bottom: 5px; }
  .pantry { color: #555; font-style: italic; }
  .page-break { page-break-after: always; }
  .print-btn { margin: 24px auto 0; display:block; padding: 10px 20px; font-size: 1rem; cursor:pointer; }
  @media print { .print-btn { display: none; } }
</style></head>
<body>
  <div class="cover">
    <h1>🍽️ Weekly Cooking Instructions</h1>
    <p>Your selected meal plan — generated ${new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  ${sections}
</body></html>`;

    openHtmlInNewTab(doc);
  }

  function openHtmlInNewTab(html) {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Please allow pop-ups to view the generated document.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  function downloadHtmlFile(html, filename) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // ---------- Generate Meal Plan (whole-week doc, per store + per generation day) ----------
  function slugifyStore(store) {
    return store.replace(/pak'?n\s*save/gi, '').replace(/[^a-z0-9]+/gi, '') || 'Store';
  }

  function todayYYYYMMDD() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }

  function planStorageKey(store, dateStr) {
    return `mealplan_generated::${slugifyStore(store)}::${dateStr}`;
  }

  function buildWeeklyPlanDocument(store, filename) {
    const included = currentMealPlans().filter(r => state.activeCategories.has(r.category));
    let grandTotal = 0, grandSaving = 0;
    const sections = included.map(recipe => {
      const lines = computeRecipeLines(recipe, store);
      const { total, saving } = cardTotals(lines);
      grandTotal += total; grandSaving += saving;
      const date = new Date(dumpDate);
      date.setDate(date.getDate() + recipe.dayOffset);
      return `
        <section class="meal">
          <div class="meal-hero" style="background:linear-gradient(135deg, ${recipe.gradient[0]}, ${recipe.gradient[1]})">${recipe.emoji}</div>
          <h2>${recipe.name}</h2>
          <div class="meta">
            <span class="badge badge--${recipe.category}">${recipe.category}</span>
            &nbsp;${fmtDate(date)} &nbsp;·&nbsp; Serves ${recipe.servings}
          </div>
          <h3>Ingredients</h3>
          <ul>
            ${lines.map(l => `<li>${displayIngredientName(l)}${l.brand ? ' <em>(' + l.brand + ')</em>' : ''} — ${l.resolved ? l.qty + ' × ' + l.size + ' — ' + money(l.lineTotal) : 'not on special this week'}</li>`).join('')}
          </ul>
          <h3>Pantry staples</h3>
          <p class="pantry">${recipe.pantry.join(', ')}</p>
          <h3>Method</h3>
          <ol>${recipe.instructions.map(s => `<li>${s}</li>`).join('')}</ol>
          <p class="meal-total">Meal total: <b>${money(total)}</b>${saving > 0 ? ` &nbsp;·&nbsp; You save ${money(saving)}` : ''}</p>
        </section>`;
    }).join('<div class="page-break"></div>');

    const genDateLabel = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });

    return `<!doctype html>
<html><head><meta charset="UTF-8" /><title>${filename}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #222; margin: 0; padding: 0 40px 40px; }
  .cover { text-align: center; padding: 60px 0 30px; }
  .cover h1 { font-size: 2.2rem; margin-bottom: 6px; }
  .cover p { color: #666; }
  .summary { font-size: 1.05rem; color: #222 !important; margin-top: 6px; }
  .meal { padding-top: 30px; }
  .meal-hero { width: 100%; height: 120px; border-radius: 12px; display:flex; align-items:center; justify-content:center; font-size: 3rem; color:#fff; margin-bottom: 14px; }
  h2 { font-size: 1.5rem; margin: 0 0 4px; }
  .meta { font-size: 0.9rem; color: #555; margin-bottom: 10px; }
  .badge { display:inline-block; font-size:0.7rem; font-weight:700; color:#fff; padding:2px 9px; border-radius:999px; }
  .badge--V { background:#43a047; } .badge--NV { background:#e0672a; } .badge--VG { background:#00897b; }
  h3 { font-size: 1.05rem; border-bottom: 2px solid #ddd; padding-bottom: 4px; margin-top: 20px; }
  li { margin-bottom: 5px; }
  .pantry { color: #555; font-style: italic; }
  .meal-total { margin-top: 14px; font-size: 0.95rem; }
  .page-break { page-break-after: always; }
  .print-btn { margin: 24px auto 0; display:block; padding: 10px 20px; font-size: 1rem; cursor:pointer; }
  @media print { .print-btn { display: none; } }
</style></head>
<body>
  <div class="cover">
    <h1>🥗 Weekly Meal Plan</h1>
    <p>${store} &nbsp;·&nbsp; Generated ${genDateLabel}</p>
    <p class="summary">Plan total: <b>${money(grandTotal)}</b>${grandSaving > 0 ? ` &nbsp;·&nbsp; Total savings: ${money(grandSaving)}` : ''}</p>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  ${sections}
</body></html>`;
  }

  function handleGeneratePlan() {
    if (!state.storeFilter) return;
    const store = state.storeFilter;
    const dateStr = todayYYYYMMDD();
    const filename = `MealPlan_${slugifyStore(store)}_${dateStr}.html`;
    const key = planStorageKey(store, dateStr);
    const statusEl = document.getElementById('planStatus');

    let existing = null;
    try { existing = localStorage.getItem(key); } catch (e) { /* storage unavailable */ }

    if (existing) {
      openHtmlInNewTab(existing);
      statusEl.textContent = `Already generated today — opened ${filename}`;
      return;
    }

    const html = buildWeeklyPlanDocument(store, filename);
    try { localStorage.setItem(key, html); } catch (e) { /* storage unavailable, still allow download */ }
    downloadHtmlFile(html, filename);
    openHtmlInNewTab(html);
    statusEl.textContent = `Generated ${filename}`;
  }

  async function bootstrap() {
    sourceLine.textContent = 'Loading specials from Supabase…';
    let dataset;
    try {
      dataset = await window.loadDealsData();
    } catch (err) {
      console.error('Failed to load specials from Supabase:', err);
      sourceLine.textContent = 'Could not load specials from Supabase — check your connection and reload.';
      dataset = { rows: [], dumpDate: '' };
    }
    rebuildIndexes(dataset);
    init();
  }

  bootstrap();
})();
