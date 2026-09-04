// Live specials data from Supabase, replacing the old CSV -> data.js pipeline.
//
// This uses the PUBLISHABLE (anon) key, which is safe to ship in client-side
// code as long as Row Level Security on these tables only grants public,
// read-only SELECT access. Never put a secret/service-role key here — it
// would give anyone who views source full read/write access to the database.
window.SUPABASE_CONFIG = {
  url: 'https://bfelamslupuonlfntjol.supabase.co',
  anonKey: 'sb_publishable_xgKuJqPo504jtAmYe4nUYA_rZUEks-3',
};

(function () {
  'use strict';

  const REST_URL = window.SUPABASE_CONFIG.url + '/rest/v1';
  const HEADERS = {
    apikey: window.SUPABASE_CONFIG.anonKey,
    Authorization: 'Bearer ' + window.SUPABASE_CONFIG.anonKey,
  };
  const PAGE_SIZE = 1000; // PostgREST's default max rows per request

  // ---- Same free-text price parsing tools/build-data.js used on the CSVs.
  // "Sale Price" / "Saving" are stored as the same kind of strings in
  // Supabase (e.g. "$0.89", "4 for $5.00 ($1.25 ea)"), scraped verbatim
  // from the retailer site. ----
  function parseSalePrice(str) {
    if (!str) return { each: null, label: str || '' };
    const eaMatch = str.match(/\(\$([\d.]+)\s*ea\)/i);
    if (eaMatch) return { each: parseFloat(eaMatch[1]), label: str.trim() };
    const simple = str.match(/\$([\d.]+)/);
    return { each: simple ? parseFloat(simple[1]) : null, label: str.trim() };
  }

  function parseSaving(str) {
    if (!str) return 0;
    const m = str.match(/\$([\d.]+)/);
    return m ? parseFloat(m[1]) : 0;
  }

  // Pages through a table with ?limit/&offset since a single request caps
  // out at PAGE_SIZE rows.
  async function fetchAllRows(table, orderColumn) {
    let all = [];
    let offset = 0;
    for (;;) {
      const url = `${REST_URL}/${table}?select=*&order=${orderColumn}.asc&offset=${offset}&limit=${PAGE_SIZE}`;
      const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
      if (!res.ok) throw new Error(`Supabase ${table} fetch failed: HTTP ${res.status}`);
      const page = await res.json();
      all = all.concat(page);
      if (page.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }
    return all;
  }

  // Fetches dbPromotionalIngredients + tStores and reshapes them into the
  // same { generatedFrom, dumpDate, rows } shape window.DEALS_DATA used to
  // have from data.js, so the rest of app.js didn't need to change.
  window.loadDealsData = async function loadDealsData() {
    const [ingredientRows, storeRows] = await Promise.all([
      fetchAllRows('dbPromotionalIngredients', 'PromotionalIngredientID'),
      fetchAllRows('tStores', 'StoreID'),
    ]);

    // tStores is the canonical store name; dbPromotionalIngredients.StoreName
    // is a convenience label the scraper also writes — prefer the joined
    // name and fall back to it only if the row has no matching StoreID.
    const storeNameById = new Map(storeRows.map(s => [s.StoreID, s.StoreName]));

    let latestScrapedAt = null;
    const latestScrapedAtByStore = new Map();
    const rows = ingredientRows.map(r => {
      const salePriceRaw = r['Sale Price'];
      const savingRaw = r['Saving'];
      const sale = parseSalePrice(salePriceRaw);
      const saving = parseSaving(savingRaw);
      const storeName = storeNameById.get(r.StoreID) || r.StoreName;
      if (r.scraped_at) {
        if (!latestScrapedAt || r.scraped_at > latestScrapedAt) latestScrapedAt = r.scraped_at;
        const prevForStore = latestScrapedAtByStore.get(storeName);
        if (!prevForStore || r.scraped_at > prevForStore) latestScrapedAtByStore.set(storeName, r.scraped_at);
      }
      return {
        id: r.PromotionalIngredientID,
        store: storeName,
        product: r.Product,
        size: r['Size/Weight'] || '',
        unitPrice: r['Unit Price'] || '',
        salePrice: sale.each,
        salePriceLabel: sale.label,
        saving,
        savingLabel: (savingRaw || '').trim(),
        onSpecial: saving > 0 || /for \$/.test(salePriceRaw || ''),
      };
    });

    // app.js expects 8-digit YYYYMMDD strings (see parseDumpDate).
    const dumpDate = latestScrapedAt ? latestScrapedAt.slice(0, 10).replace(/-/g, '') : '';
    const storeScrapedAt = {};
    for (const [store, iso] of latestScrapedAtByStore) {
      storeScrapedAt[store] = iso.slice(0, 10).replace(/-/g, '');
    }

    return {
      generatedFrom: [{ source: 'Supabase: dbPromotionalIngredients', count: rows.length }],
      dumpDate,
      storeScrapedAt,
      rows,
    };
  };
})();
