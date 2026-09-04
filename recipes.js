// The weekly meal plan, keyed by store. Each store has its own independently
// curated list of 7 recipes, because a single fixed set of exact product
// names can't resolve against every store's different weekly promotions —
// dbPromotionalIngredients only ever holds items currently on a genuine
// deal, never a full catalogue, and different PAK'nSAVE locations run
// different specials. Every ingredient's "match" string was checked against
// that specific store's live data (see supabase-client.js) at the time this
// was written; as real promotions rotate week to week, some may start
// showing "not on special" again and need revisiting.
//
// category: "V" (vegetarian), "NV" (non-vegetarian), "VG" (vegan)
// glutenFree: true if the recipe's packaged ingredients are gluten-free per
// the manufacturer's own product page/ingredient list at the time this was
// written (see PR notes) — an orthogonal tag, independent of category, since
// e.g. a vegan dish can also be GF. Formulations can change: if this matters
// for a real dietary restriction, verify current packaging before relying
// on this tag. The same goes for the vegetarian rennet source behind the
// "V" tag on any cheese ingredient.
// dayOffset: days after the CSV dump date (0 = dump day itself)
// ingredients[].qty: how many pack units of that special the recipe needs
window.MEAL_PLANS_BY_STORE = {

  "PAK'nSAVE Albany": [
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
      // No dry pasta of any shape/brand was on special at this store when
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
      // No dry pasta of any shape/brand was on special at this store when
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
  ],

  "PAK'nSAVE Westgate": [
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
        { generic: 'Capsicum, red', brand: '', match: 'Red Capsicum', qty: 1 },
        { generic: 'Teriyaki stir-fry sauce', brand: 'Lee Kum Kee', match: "Lee Kum Kee Ready Sauce For Teriyaki Beef", qty: 1 },
      ],
      pantry: ['Salt', 'Pepper', 'Soy sauce', 'Cooking oil', 'Garlic'],
      instructions: [
        'Cook the jasmine rice pouches according to the pack instructions (or microwave 90 seconds).',
        'Cut the broccoli into small florets and thinly slice the red capsicum.',
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
      // No fresh pumpkin or Asian greens were on special at this store when
      // this was written — cauliflower and wong bok cabbage stand in.
      ingredients: [
        { generic: 'Coconut curry vegetable sauce', brand: 'Lee Kum Kee', match: "Lee Kum Kee Ready Sauce For Coconut Curry Vegetables", qty: 1 },
        { generic: 'Chickpeas, canned', brand: 'Chantal Organics', match: 'Chantal Organics Organic Chickpeas', qty: 1 },
        { generic: 'Cauliflower', brand: '', match: 'Cauliflower', qty: 1 },
        { generic: 'Wong bok cabbage', brand: '', match: 'Chinese Cabbage (Wong Bok)', qty: 1 },
        { generic: 'Jasmine rice microwave pouch', brand: "Ben's Original", match: "Ben's Original Jasmine Rice Microwave Pouch", qty: 2 },
      ],
      pantry: ['Salt', 'Pepper', 'Cooking oil', 'Garlic', 'Onion'],
      instructions: [
        'Cut the cauliflower into small florets. Rinse and drain the chickpeas.',
        'Cook the jasmine rice pouches according to the pack instructions.',
        'Heat oil in a large pot, soften a diced onion and a crushed garlic clove for 2–3 minutes.',
        'Add the cauliflower, chickpeas and coconut curry vegetable sauce, plus a splash of water. Cover and simmer 10–12 minutes until the cauliflower is tender.',
        'Roughly chop the wong bok cabbage and stir through until just wilted, season to taste, and serve over the rice.',
      ],
    },
    {
      id: 'r3',
      dayOffset: 2,
      name: 'Tomato & Cabbage Spaghetti',
      category: 'V',
      servings: 4,
      emoji: '🍝',
      gradient: ['#56ab2f', '#a8e063'],
      // No dry pasta or Asian greens were on special at this store when this
      // was written — a canned spaghetti-in-tomato-sauce product and wong
      // bok cabbage stand in.
      ingredients: [
        { generic: 'Spaghetti in tomato sauce, canned', brand: 'Oak', match: 'Oak Spaghetti In Tomato Sauce', qty: 2 },
        { generic: 'Italian-style tomatoes, canned', brand: "Wattie's", match: "Wattie's Italian Style Tomatoes", qty: 1 },
        { generic: 'Wong bok cabbage', brand: '', match: 'Chinese Cabbage (Wong Bok)', qty: 1 },
        { generic: 'Cheese wedges', brand: 'Pams', match: 'Pams Cheddar Cheese Wedges', qty: 1 },
      ],
      pantry: ['Salt', 'Pepper', 'Olive oil', 'Garlic', 'Sugar (pinch)'],
      instructions: [
        'Warm the canned spaghetti in a saucepan over medium heat.',
        'Meanwhile, warm the Italian-style tomatoes in a separate small saucepan, breaking them up with a spoon, with a crushed garlic clove and a small pinch of sugar to round out the acidity.',
        'Roughly chop the wong bok cabbage.',
        'Stir the warmed tomatoes and cabbage through the spaghetti until the cabbage is just wilted.',
        'Plate up and finish with crumbled cheese wedges and cracked pepper.',
      ],
    },
    {
      id: 'r4',
      dayOffset: 3,
      name: 'Cantonese Chicken & Cabbage Stir-fry',
      category: 'NV',
      glutenFree: true,
      servings: 4,
      emoji: '🥡',
      gradient: ['#ee0979', '#ff6a00'],
      // No Asian greens matching the usual choy sum were on special at this
      // store when this was written — wong bok cabbage stands in.
      ingredients: [
        { generic: 'Cooked chicken breast pieces', brand: 'Chop Chop', match: 'Chop Chop Springwater Pieces Of Cooked Chicken Breast', qty: 2 },
        { generic: 'Cantonese chicken stir-fry sauce', brand: 'Lee Kum Kee', match: 'Lee Kum Kee Ready Sauce For Cantonese Chicken', qty: 1 },
        { generic: 'Wong bok cabbage', brand: '', match: 'Chinese Cabbage (Wong Bok)', qty: 1 },
        { generic: 'Savoury chicken rice pouch', brand: "Ben's Original", match: "Ben's Original Savoury Chicken Flavour Rice Microwave Pouch", qty: 2 },
      ],
      pantry: ['Salt', 'Pepper', 'Cooking oil', 'Garlic', 'Sesame oil'],
      instructions: [
        'Cook the rice pouches according to pack instructions.',
        'Roughly chop the wong bok cabbage and rinse well.',
        'Heat oil in a wok over high heat and stir-fry the cabbage for 2–3 minutes until just wilted.',
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
      name: 'Tuna & Capsicum Spaghetti Bake',
      category: 'NV',
      servings: 4,
      emoji: '🐟',
      gradient: ['#2193b0', '#6dd5ed'],
      // No dry pasta was on special at this store when this was written — a
      // canned spaghetti-in-tomato-sauce product stands in.
      ingredients: [
        { generic: 'Spaghetti in tomato sauce, canned', brand: 'Oak', match: 'Oak Spaghetti In Tomato Sauce', qty: 2 },
        { generic: 'Tuna in spring water', brand: 'Sealord', match: 'Sealord Chunky Style Tuna In Spring Water', qty: 2 },
        { generic: 'Cheese wedges', brand: 'Pams', match: 'Pams Cheddar Cheese Wedges', qty: 1 },
        { generic: 'Capsicum, red', brand: '', match: 'Red Capsicum', qty: 1 },
      ],
      pantry: ['Salt', 'Pepper', 'Olive oil', 'Garlic'],
      instructions: [
        'Preheat the oven to 200°C.',
        'Dice the red capsicum and flake the drained tuna.',
        'Mix the canned spaghetti, capsicum and tuna together in a baking dish, seasoning with salt, pepper and a crushed garlic clove.',
        'Scatter the crumbled cheese wedges evenly over the top.',
        'Bake for 15–18 minutes until bubbling and golden, then rest 5 minutes before serving.',
      ],
    },
    {
      id: 'r7',
      dayOffset: 6,
      name: 'Roast Cauliflower, Broccoli & Chickpea Salad',
      category: 'V',
      glutenFree: true,
      servings: 4,
      emoji: '🥗',
      gradient: ['#11998e', '#38ef7d'],
      // No fresh pumpkin was on special at this store when this was written
      // — broccoli stands in as the second roasting vegetable.
      ingredients: [
        { generic: 'Cauliflower', brand: '', match: 'Cauliflower', qty: 1 },
        { generic: 'Broccoli', brand: '', match: 'Broccoli', qty: 1 },
        { generic: 'Capsicum, red', brand: '', match: 'Red Capsicum', qty: 1 },
        { generic: 'Chickpeas, canned', brand: 'Chantal Organics', match: 'Chantal Organics Organic Chickpeas', qty: 1 },
        { generic: 'Cheese wedges', brand: 'Pams', match: 'Pams Cheddar Cheese Wedges', qty: 1 },
      ],
      pantry: ['Salt', 'Pepper', 'Olive oil', 'Balsamic vinegar', 'Garlic'],
      instructions: [
        'Preheat the oven to 210°C. Cut the cauliflower and broccoli into florets.',
        'Toss the cauliflower, broccoli and sliced red capsicum in olive oil, salt and pepper.',
        'Roast for 20–25 minutes, turning once, until caramelised and tender.',
        'Rinse and drain the chickpeas, then toss through the warm roasted vegetables.',
        'Finish with a drizzle of olive oil and balsamic vinegar and a scatter of crumbled cheese wedges.',
      ],
    },
  ],

  "PAK'nSAVE Lincoln Road": [
    {
      id: 'r1',
      dayOffset: 0,
      name: 'Teriyaki Chicken & Vege Rice Bowl',
      category: 'NV',
      servings: 4,
      emoji: '🍱',
      gradient: ['#ff9a56', '#ff6a88'],
      // No capsicum of any colour was on special at this store when this
      // was written — a frozen stir-fry vegetable mix stands in.
      ingredients: [
        { generic: 'Cooked chicken breast, teriyaki', brand: "Chop Chop", match: "Chop Chop Teriyaki Pieces Of Cooked Chicken Breast", qty: 2 },
        { generic: 'Jasmine rice microwave pouch', brand: "Ben's Original", match: "Ben's Original Jasmine Rice Microwave Pouch", qty: 2 },
        { generic: 'Broccoli', brand: '', match: 'Broccoli', qty: 1 },
        { generic: 'Stir-fry vegetable mix, frozen', brand: "Wattie's", match: "Wattie's Chinese Style Stir-Fry", qty: 1 },
        { generic: 'Teriyaki stir-fry sauce', brand: 'Lee Kum Kee', match: "Lee Kum Kee Ready Sauce For Teriyaki Beef", qty: 1 },
      ],
      pantry: ['Salt', 'Pepper', 'Soy sauce', 'Cooking oil', 'Garlic'],
      instructions: [
        'Cook the jasmine rice pouches according to the pack instructions (or microwave 90 seconds).',
        'Cut the broccoli into small florets.',
        'Heat a splash of cooking oil in a wok over high heat and stir-fry the broccoli and frozen vegetable mix for 3–4 minutes until just tender-crisp.',
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
      // No fresh pumpkin or Asian greens like choy sum were on special at
      // this store when this was written — broccoli and snow pea shoots
      // stand in.
      ingredients: [
        { generic: 'Coconut curry vegetable sauce', brand: 'Lee Kum Kee', match: "Lee Kum Kee Ready Sauce For Coconut Curry Vegetables", qty: 1 },
        { generic: 'Chickpeas, canned', brand: 'Chantal Organics', match: 'Chantal Organics Organic Chickpeas', qty: 1 },
        { generic: 'Broccoli', brand: '', match: 'Broccoli', qty: 1 },
        { generic: 'Snow pea shoots', brand: 'Pams', match: 'Pams Snow Pea Shoots', qty: 1 },
        { generic: 'Jasmine rice microwave pouch', brand: "Ben's Original", match: "Ben's Original Jasmine Rice Microwave Pouch", qty: 2 },
      ],
      pantry: ['Salt', 'Pepper', 'Cooking oil', 'Garlic', 'Onion'],
      instructions: [
        'Cut the broccoli into small florets. Rinse and drain the chickpeas.',
        'Cook the jasmine rice pouches according to the pack instructions.',
        'Heat oil in a large pot, soften a diced onion and a crushed garlic clove for 2–3 minutes.',
        'Add the broccoli, chickpeas and coconut curry vegetable sauce, plus a splash of water. Cover and simmer 8–10 minutes until the broccoli is tender.',
        'Stir through the snow pea shoots until just wilted, season to taste, and serve over the rice.',
      ],
    },
    {
      id: 'r3',
      dayOffset: 2,
      name: 'Tomato & Snow Pea Shoot Gnocchi',
      category: 'V',
      servings: 4,
      emoji: '🍝',
      gradient: ['#56ab2f', '#a8e063'],
      // No dry pasta shapes or spinach/choy sum-style greens were on
      // special at this store when this was written — gnocchi and snow pea
      // shoots stand in.
      ingredients: [
        { generic: 'Gnocchi', brand: 'Diamond', match: 'Diamond Gnocchi', qty: 1 },
        { generic: 'Tomato, onion & roast garlic pasta sauce', brand: 'Dolmio', match: 'Dolmio Tomato Onion & Roast Garlic Pasta Sauce Jar', qty: 1 },
        { generic: 'Snow pea shoots', brand: 'Pams', match: 'Pams Snow Pea Shoots', qty: 1 },
        { generic: 'Cheese wedges', brand: 'Pams', match: 'Pams Creamy Cheese Wedges', qty: 1 },
      ],
      pantry: ['Salt', 'Pepper', 'Olive oil', 'Garlic'],
      instructions: [
        'Bring a large pot of salted water to the boil and cook the gnocchi for 2–3 minutes until they float to the surface, then drain.',
        'Meanwhile, warm the pasta sauce in a saucepan with a crushed garlic clove.',
        'Stir the snow pea shoots through the warm sauce until just wilted.',
        'Toss the drained gnocchi through the sauce to coat.',
        'Plate up and finish with crumbled cheese wedges and cracked pepper.',
      ],
    },
    {
      id: 'r4',
      dayOffset: 3,
      name: 'Cantonese Chicken & Snow Pea Shoot Stir-fry',
      category: 'NV',
      glutenFree: true,
      servings: 4,
      emoji: '🥡',
      gradient: ['#ee0979', '#ff6a00'],
      // No choy sum was on special at this store when this was written —
      // snow pea shoots stand in.
      ingredients: [
        { generic: 'Cooked chicken breast pieces', brand: 'Chop Chop', match: 'Chop Chop Springwater Pieces Of Cooked Chicken Breast', qty: 2 },
        { generic: 'Cantonese chicken stir-fry sauce', brand: 'Lee Kum Kee', match: 'Lee Kum Kee Ready Sauce For Cantonese Chicken', qty: 1 },
        { generic: 'Snow pea shoots', brand: 'Pams', match: 'Pams Snow Pea Shoots', qty: 2 },
        { generic: 'Savoury chicken rice pouch', brand: "Ben's Original", match: "Ben's Original Savoury Chicken Flavour Rice Microwave Pouch", qty: 2 },
      ],
      pantry: ['Salt', 'Pepper', 'Cooking oil', 'Garlic', 'Sesame oil'],
      instructions: [
        'Cook the rice pouches according to pack instructions.',
        'Heat oil in a wok over high heat and stir-fry the snow pea shoots for 1 minute until just wilted.',
        'Add the cooked chicken pieces and the Cantonese stir-fry sauce, tossing to coat and heating through for 2–3 minutes.',
        'Finish with a few drops of sesame oil and serve over the warm rice.',
      ],
    },
    {
      id: 'r5',
      dayOffset: 4,
      name: 'Vegan Bean Chilli',
      category: 'VG',
      servings: 4,
      emoji: '🌶️',
      gradient: ['#c31432', '#240b36'],
      // No capsicum of any colour was on special at this store when this
      // was written, so this is a simpler bean-and-rice chilli without it.
      ingredients: [
        { generic: 'Mild chilli beans, canned', brand: "Wattie's", match: "Wattie's Mild Chilli Beans", qty: 2 },
        { generic: 'Black beans, canned', brand: 'Chantal Organics', match: 'Chantal Organics Organic Black Beans', qty: 1 },
        { generic: 'Jasmine rice microwave pouch', brand: "Ben's Original", match: "Ben's Original Jasmine Rice Microwave Pouch", qty: 2 },
      ],
      pantry: ['Salt', 'Pepper', 'Cumin', 'Chilli powder', 'Cooking oil', 'Onion'],
      instructions: [
        'Cook the jasmine rice pouches according to the pack instructions.',
        'Dice the onion. Rinse and drain the black beans.',
        'Heat oil in a pot and soften the onion for 3–4 minutes with a pinch of cumin and chilli powder.',
        'Stir in the chilli beans and black beans (undrained), then simmer uncovered for 12–15 minutes, stirring occasionally, until thickened.',
        'Season to taste and serve spooned over the rice.',
      ],
    },
    {
      id: 'r6',
      dayOffset: 5,
      name: 'Tuna & Gnocchi Bake',
      category: 'NV',
      servings: 4,
      emoji: '🐟',
      gradient: ['#2193b0', '#6dd5ed'],
      // No dry pasta shapes or capsicum were on special at this store when
      // this was written — gnocchi replaces the pasta and the capsicum is
      // dropped rather than forced in.
      ingredients: [
        { generic: 'Gnocchi', brand: 'Diamond', match: 'Diamond Gnocchi', qty: 1 },
        { generic: 'Tomato, onion & roast garlic pasta sauce', brand: 'Dolmio', match: 'Dolmio Tomato Onion & Roast Garlic Pasta Sauce Jar', qty: 1 },
        { generic: 'Tuna in spring water', brand: 'Sealord', match: 'Sealord Chunky Style Tuna In Spring Water', qty: 2 },
        { generic: 'Cheese wedges', brand: 'Pams', match: 'Pams Creamy Cheese Wedges', qty: 1 },
      ],
      pantry: ['Salt', 'Pepper', 'Olive oil', 'Garlic'],
      instructions: [
        'Preheat the oven to 200°C. Bring a large pot of salted water to the boil and cook the gnocchi for 2–3 minutes until they float, then drain.',
        'Flake the drained tuna.',
        'Mix the gnocchi, pasta sauce and tuna together in a baking dish, seasoning with salt, pepper and a crushed garlic clove.',
        'Scatter the crumbled cheese wedges evenly over the top.',
        'Bake for 12–15 minutes until bubbling and golden, then rest 5 minutes before serving.',
      ],
    },
    {
      id: 'r7',
      dayOffset: 6,
      name: 'Roast Broccoli & Chickpea Salad',
      category: 'V',
      glutenFree: true,
      servings: 4,
      emoji: '🥗',
      gradient: ['#11998e', '#38ef7d'],
      // No fresh cauliflower, pumpkin or capsicum were on special at this
      // store when this was written — broccoli carries the whole roast, with
      // fresh sprouts tossed through at the end for crunch.
      ingredients: [
        { generic: 'Broccoli', brand: '', match: 'Broccoli', qty: 2 },
        { generic: 'Chickpeas, canned', brand: 'Chantal Organics', match: 'Chantal Organics Organic Chickpeas', qty: 1 },
        { generic: 'Alfalfa sprouts', brand: 'Pams', match: 'Pams Alfalfa Sprouts', qty: 1 },
        { generic: 'Cheese wedges', brand: 'Pams', match: 'Pams Creamy Cheese Wedges', qty: 1 },
      ],
      pantry: ['Salt', 'Pepper', 'Olive oil', 'Balsamic vinegar', 'Garlic'],
      instructions: [
        'Preheat the oven to 210°C. Cut the broccoli into large florets.',
        'Toss the broccoli in olive oil, salt and pepper.',
        'Roast for 18–22 minutes, turning once, until caramelised and tender.',
        'Rinse and drain the chickpeas, then toss through the warm roasted broccoli.',
        'Finish with a drizzle of olive oil and balsamic vinegar, a scatter of crumbled cheese wedges, and the alfalfa sprouts tossed through just before serving.',
      ],
    },
  ],

};
