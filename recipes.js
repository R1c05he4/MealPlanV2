// The weekly meal plan. Each recipe's ingredients reference the EXACT
// "Product" string as scraped live into Supabase's dbPromotionalIngredients
// table (see supabase-client.js) so the app can look up live size/price/
// special info at render time. Since that table only ever holds items
// currently on a genuine promotional deal (never a full catalogue), an
// ingredient here can go from resolvable to "not on special" — or vice
// versa — as real promotions rotate week to week.
//
// category: "V" (vegetarian), "NV" (non-vegetarian), "VG" (vegan)
// glutenFree: true if the recipe's packaged ingredients are gluten-free per
// the manufacturer's own product page/ingredient list at the time this was
// written (see PR notes) — an orthogonal tag, independent of category, since
// e.g. a vegan dish can also be GF. Formulations can change: if this matters
// for a real dietary restriction, verify current packaging before relying
// on this tag.
// dayOffset: days after the CSV dump date (0 = dump day itself)
// ingredients[].qty: how many pack units of that special the recipe needs
window.MEAL_PLANS = [
  {
    id: 'r1',
    dayOffset: 0,
    name: 'Teriyaki Chicken & Vege Rice Bowl',
    category: 'NV',
    servings: 4,
    emoji: '🍱',
    gradient: ['#ff9a56', '#ff6a88'],
    ingredients: [
      { generic: 'Cooked chicken breast, teriyaki', brand: "Chop Chop", match: "Chop Chop Teriyaki Pieces Of Cooked Chicken Breast", qty: 2 },
      { generic: 'Jasmine rice microwave pouch', brand: "Ben's Original", match: "Ben's Original Jasmine Rice Microwave Pouch", qty: 2 },
      { generic: 'Broccoli', brand: '', match: 'Broccoli', qty: 1 },
      { generic: 'Capsicum, green', brand: '', match: 'Green Capsicum', qty: 1 },
      { generic: 'Teriyaki stir-fry sauce', brand: 'Lee Kum Kee', match: "Lee Kum Kee Ready Sauce For Teriyaki Beef", qty: 1 },
    ],
    pantry: ['Salt', 'Pepper', 'Soy sauce', 'Cooking oil', 'Garlic'],
    instructions: [
      'Cook the jasmine rice pouches according to the pack instructions (or microwave 90 seconds).',
      'Cut the broccoli into small florets and thinly slice the green capsicum.',
      'Heat a splash of cooking oil in a wok over high heat and stir-fry the broccoli and capsicum for 2–3 minutes until just tender-crisp.',
      'Add the cooked teriyaki chicken pieces and the teriyaki sauce, tossing until everything is glossy and heated through, about 2 minutes.',
      'Season with a pinch of salt and pepper, spoon over the warm rice, and serve immediately with a scatter of sesame seeds if you have them.',
    ],
  },
  {
    id: 'r2',
    dayOffset: 1,
    name: 'Coconut Curry Vegetable & Chickpea Bowl',
    category: 'VG',
    glutenFree: true,
    servings: 4,
    emoji: '🍛',
    gradient: ['#f7971e', '#ffd200'],
    ingredients: [
      { generic: 'Coconut curry vegetable sauce', brand: 'Lee Kum Kee', match: "Lee Kum Kee Ready Sauce For Coconut Curry Vegetables", qty: 1 },
      { generic: 'Chickpeas, canned', brand: 'Chantal Organics', match: 'Chantal Organics Organic Chickpeas', qty: 1 },
      { generic: 'Pumpkin', brand: '', match: 'Crown Pumpkin', qty: 1 },
      { generic: 'Choy sum', brand: '', match: 'Choy Sum', qty: 1 },
      { generic: 'Jasmine rice microwave pouch', brand: "Ben's Original", match: "Ben's Original Jasmine Rice Microwave Pouch", qty: 2 },
    ],
    pantry: ['Salt', 'Pepper', 'Cooking oil', 'Garlic', 'Onion'],
    instructions: [
      'Peel the pumpkin and cut into 2cm cubes. Rinse and drain the chickpeas.',
      'Cook the jasmine rice pouches according to the pack instructions.',
      'Heat oil in a large pot, soften a diced onion and a crushed garlic clove for 2–3 minutes.',
      'Add the pumpkin, chickpeas and coconut curry vegetable sauce, plus a splash of water. Cover and simmer 12–15 minutes until the pumpkin is tender.',
      'Roughly chop the choy sum and stir through until just wilted, season to taste, and serve over the rice.',
    ],
  },
  {
    id: 'r3',
    dayOffset: 2,
    name: 'Tomato & Choy Sum Pasta',
    category: 'V',
    servings: 4,
    emoji: '🍝',
    gradient: ['#56ab2f', '#a8e063'],
    // No dry pasta of any shape/brand was on special at any store when
    // this was written, so this is built around a boxed pasta-and-sauce
    // product instead of separately-bought dry pasta + jar sauce.
    ingredients: [
      { generic: 'Tomato pasta & sauce', brand: 'Continental', match: 'Continental Tomato Pasta & Sauce', qty: 2 },
      { generic: 'Italian-style tomatoes, canned', brand: "Wattie's", match: "Wattie's Italian Style Tomatoes", qty: 1 },
      { generic: 'Choy sum', brand: '', match: 'Choy Sum', qty: 1 },
      { generic: 'Cheddar cheese, sliced', brand: 'Emborg', match: 'Emborg Red Cheddar Natural Slices Cheese', qty: 1 },
    ],
    pantry: ['Salt', 'Pepper', 'Olive oil', 'Garlic', 'Sugar (pinch)'],
    instructions: [
      'Cook the pasta & sauce packets according to the box instructions.',
      'Meanwhile, warm the Italian-style tomatoes in a small saucepan, breaking them up with a spoon, with a crushed garlic clove and a small pinch of sugar to round out the acidity.',
      'Roughly chop the choy sum.',
      'Stir the warmed tomatoes and choy sum through the cooked pasta until the greens are just wilted.',
      'Plate up and finish with a scatter of torn cheddar and cracked pepper.',
    ],
  },
  {
    id: 'r4',
    dayOffset: 3,
    name: 'Cantonese Chicken & Choy Sum Stir-fry',
    category: 'NV',
    glutenFree: true,
    servings: 4,
    emoji: '🥡',
    gradient: ['#ee0979', '#ff6a00'],
    ingredients: [
      { generic: 'Cooked chicken breast pieces', brand: 'Chop Chop', match: 'Chop Chop Springwater Pieces Of Cooked Chicken Breast', qty: 2 },
      { generic: 'Cantonese chicken stir-fry sauce', brand: 'Lee Kum Kee', match: 'Lee Kum Kee Ready Sauce For Cantonese Chicken', qty: 1 },
      { generic: 'Choy sum', brand: '', match: 'Choy Sum', qty: 2 },
      { generic: 'Savoury chicken rice pouch', brand: "Ben's Original", match: "Ben's Original Savoury Chicken Flavour Rice Microwave Pouch", qty: 2 },
    ],
    pantry: ['Salt', 'Pepper', 'Cooking oil', 'Garlic', 'Sesame oil'],
    instructions: [
      'Cook the rice pouches according to pack instructions.',
      'Trim the choy sum stems and rinse well, cutting into thirds.',
      'Heat oil in a wok over high heat and stir-fry the choy sum for 1–2 minutes until just wilted.',
      'Add the cooked chicken pieces and the Cantonese stir-fry sauce, tossing to coat and heating through for 2–3 minutes.',
      'Finish with a few drops of sesame oil and serve over the warm rice.',
    ],
  },
  {
    id: 'r5',
    dayOffset: 4,
    name: 'Vegan Bean & Capsicum Chilli',
    category: 'VG',
    servings: 4,
    emoji: '🌶️',
    gradient: ['#c31432', '#240b36'],
    ingredients: [
      { generic: 'Mild chilli beans, canned', brand: "Wattie's", match: "Wattie's Mild Chilli Beans", qty: 2 },
      { generic: 'Black beans, canned', brand: 'Chantal Organics', match: 'Chantal Organics Organic Black Beans', qty: 1 },
      { generic: 'Capsicum, red', brand: '', match: 'Red Capsicum', qty: 1 },
      { generic: 'Jasmine rice microwave pouch', brand: "Ben's Original", match: "Ben's Original Jasmine Rice Microwave Pouch", qty: 2 },
    ],
    pantry: ['Salt', 'Pepper', 'Cumin', 'Chilli powder', 'Cooking oil', 'Onion'],
    instructions: [
      'Cook the jasmine rice pouches according to the pack instructions.',
      'Dice the red onion and red capsicum. Rinse and drain the black beans.',
      'Heat oil in a pot and soften the onion and capsicum for 3–4 minutes with a pinch of cumin and chilli powder.',
      'Stir in the chilli beans and black beans (undrained), then simmer uncovered for 12–15 minutes, stirring occasionally, until thickened.',
      'Season to taste and serve spooned over the rice.',
    ],
  },
  {
    id: 'r6',
    dayOffset: 5,
    name: 'Tuna & Capsicum Pasta Bake',
    category: 'NV',
    servings: 4,
    emoji: '🐟',
    gradient: ['#2193b0', '#6dd5ed'],
    // No dry pasta of any shape/brand was on special at any store when
    // this was written, so this is built around a boxed pasta-and-sauce
    // product instead of separately-bought dry pasta + jar sauce.
    ingredients: [
      { generic: 'Tomato pasta & sauce', brand: 'Continental', match: 'Continental Tomato Pasta & Sauce', qty: 2 },
      { generic: 'Tuna in spring water', brand: 'Sealord', match: 'Sealord Chunky Style Tuna In Spring Water', qty: 2 },
      { generic: 'Cheddar cheese, sliced', brand: 'Emborg', match: 'Emborg Red Cheddar Natural Slices Cheese', qty: 1 },
      { generic: 'Capsicum, green', brand: '', match: 'Green Capsicum', qty: 1 },
    ],
    pantry: ['Salt', 'Pepper', 'Olive oil', 'Garlic'],
    instructions: [
      'Preheat the oven to 200°C and cook the pasta & sauce packets according to the box instructions.',
      'Dice the green capsicum and flake the drained tuna.',
      'Mix the cooked pasta, capsicum and tuna together in a baking dish, seasoning with salt, pepper and a crushed garlic clove.',
      'Scatter the torn cheddar evenly over the top.',
      'Bake for 15–18 minutes until bubbling and golden, then rest 5 minutes before serving.',
    ],
  },
  {
    id: 'r7',
    dayOffset: 6,
    name: 'Roast Cauliflower, Pumpkin & Chickpea Salad',
    category: 'V',
    glutenFree: true,
    servings: 4,
    emoji: '🥗',
    gradient: ['#11998e', '#38ef7d'],
    ingredients: [
      { generic: 'Cauliflower', brand: '', match: 'Cauliflower', qty: 1 },
      { generic: 'Pumpkin', brand: '', match: 'Crown Pumpkin', qty: 1 },
      { generic: 'Capsicum, red', brand: '', match: 'Red Capsicum', qty: 1 },
      { generic: 'Chickpeas, canned', brand: 'Chantal Organics', match: 'Chantal Organics Organic Chickpeas', qty: 1 },
      { generic: 'Cheddar cheese, sliced', brand: 'Emborg', match: 'Emborg Red Cheddar Natural Slices Cheese', qty: 1 },
    ],
    pantry: ['Salt', 'Pepper', 'Olive oil', 'Balsamic vinegar', 'Garlic'],
    instructions: [
      'Preheat the oven to 210°C. Cut the cauliflower into florets and the pumpkin into 2cm wedges.',
      'Toss the cauliflower, pumpkin and sliced red capsicum in olive oil, salt and pepper.',
      'Roast for 25–30 minutes, turning once, until caramelised and tender.',
      'Rinse and drain the chickpeas, then toss through the warm roasted vegetables.',
      'Finish with a drizzle of olive oil and balsamic vinegar and a scatter of torn cheddar.',
    ],
  },
];
