/* =========================================================
   TOOMY'S — SHARED MENU DATA (16 ITEMS — SINGLE SOURCE OF TRUTH)
   Used by: menu.html, product.html, checkout.html & script.js
   ========================================================= */
window.MENU_ITEMS = {
  /* ===================== BURGERS (5) ===================== */
  "truck-burger": {
    id: "truck-burger",
    category: "burgers",
    categoryLabel: "Burgers",
    cardTheme: "red",
    badge: "Street Classic",
    title: "Truck Burger",
    subtitle: "SMASHED BEEF & DINER SAUCE",
    description:
      "Juicy smashed beef patty seared on a hot griddle with melted American cheddar, crisp lettuce, ripe tomatoes, pickles, and Toomy's signature truck sauce.",
    basePrice: 145,
    image: "assets/products/truck.png",
    includedChips: [
      "Smashed Beef Patty",
      "American Cheddar",
      "Crisp Lettuce & Pickles",
      "Truck Sauce",
      "Brioche Bun"
    ],
    optionGroups: [
      {
        name: "Patty Size",
        options: [
          { label: "Single", delta: 0 },
          { label: "Double", delta: 45 },
          { label: "Triple", delta: 85 }
        ]
      },
      {
        name: "Extra Sauce",
        options: [
          { label: "None", delta: 0 },
          { label: "Toomy Sauce", delta: 15 },
          { label: "Cheese Sauce", delta: 20 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "basmati-chicken", "hotdog-crispy-roll"]
  },

  "juicy-jack-burger": {
    id: "juicy-jack-burger",
    category: "burgers",
    categoryLabel: "Burgers",
    cardTheme: "yellow",
    badge: "For True Hungry",
    title: "Juicy Jack Burger",
    subtitle: "MONTEREY JACK & JALAPENO",
    description:
      "Thick seared smash patties smothered in melted Monterey Jack cheese, grilled jalapenos, caramelized onions, and smoky chipotle diner sauce.",
    basePrice: 195,
    image: "assets/products/juicy-jack.png",
    includedChips: [
      "Double Smash Patty",
      "Monterey Jack",
      "Grilled Jalapenos",
      "Chipotle Sauce",
      "Brioche Bun"
    ],
    optionGroups: [
      {
        name: "Patty Size",
        options: [
          { label: "Double", delta: 0 },
          { label: "Triple", delta: 45 }
        ]
      },
      {
        name: "Heat Level",
        options: [
          { label: "Medium Kick", delta: 0 },
          { label: "Extra Fiery", delta: 10 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "popcorn-chicken-pizza", "hotdog-crispy-roll"]
  },

  "pepperonzi-burger": {
    id: "pepperonzi-burger",
    category: "burgers",
    categoryLabel: "Burgers",
    cardTheme: "cream",
    badge: "Pizza Meets Smash",
    title: "Pepperonzi Burger",
    subtitle: "CRISPY PEPPERONI & MOZZARELLA",
    description:
      "Smashed beef patty crowned with seared beef pepperoni slices, stretchy melted mozzarella, rich marinara glaze, and Italian herb butter on toasted brioche.",
    basePrice: 175,
    image: "assets/products/pepperonzi.png",
    includedChips: [
      "Smashed Beef",
      "Seared Pepperoni",
      "Melted Mozzarella",
      "Marinara Glaze",
      "Brioche Bun"
    ],
    optionGroups: [
      {
        name: "Patty Size",
        options: [
          { label: "Single", delta: 0 },
          { label: "Double", delta: 45 }
        ]
      },
      {
        name: "Extra Cheese",
        options: [
          { label: "Standard Mozzarella", delta: 0 },
          { label: "Double Mozzarella Pull", delta: 20 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "basmati-steak", "hotdog-crispy-roll"]
  },

  "toomy-burger": {
    id: "toomy-burger",
    category: "burgers",
    categoryLabel: "Burgers",
    cardTheme: "red",
    badge: "The Original",
    title: "Toomy Burger",
    subtitle: "SIGNATURE DOUBLE SMASH",
    description:
      "Double smashed beef patties seared on a flat-top grill, stacked with crispy onion rings, melted mozzarella sticks, beef bacon, and Toomy's smoky house sauce.",
    basePrice: 185,
    image: "assets/products/toomy-burger.webp",
    includedChips: [
      "Double Smash Patty",
      "Mozzarella Sticks",
      "Crispy Onion Rings",
      "Toomy Sauce",
      "Brioche Bun"
    ],
    optionGroups: [
      {
        name: "Patty Size",
        options: [
          { label: "Single", delta: 0 },
          { label: "Double", delta: 45 },
          { label: "Triple", delta: 85 }
        ]
      },
      {
        name: "Bread",
        options: [
          { label: "Brioche Bun", delta: 0 },
          { label: "Lettuce Wrap", delta: 0 }
        ]
      },
      {
        name: "Extra Sauce",
        options: [
          { label: "None", delta: 0 },
          { label: "Toomy Sauce", delta: 15 },
          { label: "Cheese Sauce", delta: 20 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "popcorn-chicken-pizza", "hotdog-crispy-roll"]
  },

  "cheesy-burger-boom": {
    id: "cheesy-burger-boom",
    category: "burgers",
    categoryLabel: "Burgers",
    cardTheme: "yellow",
    badge: "Cheese Overload",
    title: "Cheesy Burger Boom",
    subtitle: "MOLTEN CHEDDAR DRENCHED",
    description:
      "Double smashed beef patties loaded with crispy onion strings and drenched table-side in a rich, velvety molten cheddar cheese cascade.",
    basePrice: 205,
    image: "assets/products/burger-boom.png",
    includedChips: [
      "Double Smash Patty",
      "Molten Cheddar Cascade",
      "Crispy Onion Strings",
      "Toasted Brioche"
    ],
    optionGroups: [
      {
        name: "Patty Size",
        options: [
          { label: "Double", delta: 0 },
          { label: "Triple", delta: 45 }
        ]
      },
      {
        name: "Extra Dip",
        options: [
          { label: "None", delta: 0 },
          { label: "Extra Cheddar Cup", delta: 20 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "sea-ranch-pizza", "basmati-chicken"]
  },

  /* ===================== CHICKEN (4) ===================== */
  "truck-chicken": {
    id: "truck-chicken",
    category: "chicken",
    categoryLabel: "Chicken",
    cardTheme: "cream",
    badge: "Crowd Favorite",
    title: "Truck Chicken",
    subtitle: "EXTRA CRISPY FILLET",
    description:
      "Hand-breaded crunchy chicken breast glazed with honey mustard, creamy coleslaw, melted cheddar, and pickles inside a toasted brioche bun.",
    basePrice: 160,
    image: "assets/products/truck-chicken.webp",
    includedChips: [
      "Crispy Chicken Breast",
      "Honey Mustard",
      "Coleslaw",
      "Melted Cheddar",
      "Brioche Bun"
    ],
    optionGroups: [
      {
        name: "Combo Upgrade",
        options: [
          { label: "Sandwich Only", delta: 0 },
          { label: "Make It a Meal (+Fries)", delta: 35 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "popcorn-chicken-pizza", "hotdog-crispy-roll"]
  },

  "buffalo-chicken": {
    id: "buffalo-chicken",
    category: "chicken",
    categoryLabel: "Chicken",
    cardTheme: "red",
    badge: "Hot & Tangy",
    title: "Buffalo Chicken",
    subtitle: "FIERY BUFFALO GLAZE",
    description:
      "Golden crispy fried chicken breast tossed in bold, tangy Buffalo hot sauce, balanced with cool buttermilk ranch, crisp lettuce, and dill pickles.",
    basePrice: 165,
    image: "assets/products/buffalo.png",
    includedChips: [
      "Crispy Chicken Fillet",
      "Buffalo Hot Glaze",
      "Buttermilk Ranch",
      "Dill Pickles"
    ],
    optionGroups: [
      {
        name: "Heat Level",
        options: [
          { label: "Classic Buffalo", delta: 0 },
          { label: "Extra Spicy", delta: 10 }
        ]
      },
      {
        name: "Combo Upgrade",
        options: [
          { label: "Sandwich Only", delta: 0 },
          { label: "Make It a Meal (+Fries)", delta: 35 }
        ]
      }
    ],
    recommendedIds: ["basmati-chicken", "sea-ranch-pizza", "hotdog-crispy-roll"]
  },

  "ranch-chicken": {
    id: "ranch-chicken",
    category: "chicken",
    categoryLabel: "Chicken",
    cardTheme: "yellow",
    badge: "Creamy Crunch",
    title: "Ranch Chicken",
    subtitle: "HERB BUTTERMILK RANCH",
    description:
      "Crunchy all-white-meat fried chicken breast layered with smoked turkey, melted Swiss-cheddar blend, iceberg lettuce, and house herb ranch.",
    basePrice: 165,
    image: "assets/products/ranch.png",
    includedChips: [
      "Crispy Chicken Fillet",
      "House Herb Ranch",
      "Smoked Turkey",
      "Brioche Bun"
    ],
    optionGroups: [
      {
        name: "Combo Upgrade",
        options: [
          { label: "Sandwich Only", delta: 0 },
          { label: "Make It a Meal (+Fries)", delta: 35 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "steak-pizza", "basmati-chicken"]
  },

  "cheesy-chicken-boom": {
    id: "cheesy-chicken-boom",
    category: "chicken",
    categoryLabel: "Chicken",
    cardTheme: "cream",
    badge: "Melted Perfection",
    title: "Cheesy Chicken Boom",
    subtitle: "CHEDDAR DRENCHED FILLET",
    description:
      "Extra-crunchy fried chicken fillet stacked with mozzarella sticks, turkey bacon, and a generous pour of warm, creamy cheddar cheese sauce.",
    basePrice: 185,
    image: "assets/products/chicken-boom.png",
    includedChips: [
      "Crispy Chicken Fillet",
      "Molten Cheddar Sauce",
      "Mozzarella Stick",
      "Brioche Bun"
    ],
    optionGroups: [
      {
        name: "Combo Upgrade",
        options: [
          { label: "Sandwich Only", delta: 0 },
          { label: "Make It a Meal (+Fries)", delta: 35 }
        ]
      }
    ],
    recommendedIds: ["toomy-burger", "popcorn-chicken-pizza", "hotdog-crispy-roll"]
  },

  /* ===================== TENDERS (1) ===================== */
  "tenders-meal": {
    id: "tenders-meal",
    category: "tenders",
    categoryLabel: "Tenders",
    cardTheme: "red",
    badge: "Try It Now",
    title: "Tenders Meal",
    subtitle: "HAND-BATTERED CRISPY STRIPS",
    description:
      "Crispy hand-battered chicken tenders, golden fries, toasted brioche buns, creamy coleslaw, and your choice of two signature dipping sauces.",
    basePrice: 175,
    image: "assets/products/tenders-meal.webp",
    includedChips: [
      "Crispy Chicken Strips",
      "3 Buns",
      "Coleslaw",
      "2 Sauces",
      "Rice or Fries"
    ],
    optionGroups: [
      {
        name: "Size",
        options: [
          { label: "Regular · 2 Pcs", delta: 0 },
          { label: "Triple · 3 Pcs", delta: 40 },
          { label: "Big · 5 Pcs", delta: 90 }
        ]
      },
      {
        name: "Side",
        options: [
          { label: "Fries", delta: 0 },
          { label: "Rice", delta: 0 }
        ]
      }
    ],
    recommendedIds: ["toomy-burger", "basmati-chicken", "hotdog-crispy-roll"]
  },

  /* ===================== PIZZA (3) ===================== */
  "popcorn-chicken-pizza": {
    id: "popcorn-chicken-pizza",
    category: "pizza",
    categoryLabel: "Pizza",
    cardTheme: "red",
    badge: "House Star",
    title: "Popcorn Chicken Pizza",
    subtitle: "BUFFALO & RANCH DRIZZLE",
    description:
      "Toomy's signature tomato sauce, stretchy mozzarella, golden fried popcorn chicken bites, and a rich Buffalo-ranch drizzle on hand-stretched dough.",
    basePrice: 210,
    image: "assets/products/pizza-popcorn-buffalo.webp",
    includedChips: [
      "Popcorn Chicken",
      "Mozzarella Blend",
      "Buffalo Drizzle",
      "Ranch Swirl"
    ],
    optionGroups: [
      {
        name: "Pizza Size",
        options: [
          { label: "Medium · 10\"", delta: 0 },
          { label: "Large · 12\"", delta: 45 }
        ]
      },
      {
        name: "Crust",
        options: [
          { label: "Classic Pan", delta: 0 },
          { label: "Stuffed Cheese Crust", delta: 35 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "toomy-burger", "hotdog-crispy-roll"]
  },

  "sea-ranch-pizza": {
    id: "sea-ranch-pizza",
    category: "pizza",
    categoryLabel: "Pizza",
    cardTheme: "yellow",
    badge: "Coastal Favorite",
    title: "Sea Ranch Pizza",
    subtitle: "SHRIMP, CALAMARI & RANCH",
    description:
      "Creamy herb ranch base topped with seasoned shrimp, tender calamari rings, sweet bell peppers, black olives, and bubbling mozzarella cheese.",
    basePrice: 235,
    image: "assets/products/pizza-searanch.png",
    includedChips: [
      "Seasoned Shrimp",
      "Calamari Rings",
      "Creamy Ranch Base",
      "Melted Mozzarella"
    ],
    optionGroups: [
      {
        name: "Pizza Size",
        options: [
          { label: "Medium · 10\"", delta: 0 },
          { label: "Large · 12\"", delta: 50 }
        ]
      },
      {
        name: "Crust",
        options: [
          { label: "Classic Pan", delta: 0 },
          { label: "Stuffed Cheese Crust", delta: 35 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "truck-chicken", "hotdog-crispy-roll"]
  },

  "steak-pizza": {
    id: "steak-pizza",
    category: "pizza",
    categoryLabel: "Pizza",
    cardTheme: "cream",
    badge: "Savory & Bold",
    title: "Steak Pizza",
    subtitle: "CHARGRILLED BEEF & MUSHROOMS",
    description:
      "Tender strips of chargrilled steak, roasted mushrooms, caramelized onions, green peppers, and smoked mozzarella finished with savory steakhouse glaze.",
    basePrice: 225,
    image: "assets/products/pizza-steak.png",
    includedChips: [
      "Chargrilled Steak",
      "Roasted Mushrooms",
      "Caramelized Onions",
      "Smoked Mozzarella"
    ],
    optionGroups: [
      {
        name: "Pizza Size",
        options: [
          { label: "Medium · 10\"", delta: 0 },
          { label: "Large · 12\"", delta: 50 }
        ]
      },
      {
        name: "Crust",
        options: [
          { label: "Classic Pan", delta: 0 },
          { label: "Stuffed Cheese Crust", delta: 35 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "ranch-chicken", "hotdog-crispy-roll"]
  },

  /* ===================== BASMATI (2) ===================== */
  "basmati-chicken": {
    id: "basmati-chicken",
    category: "basmati",
    categoryLabel: "Basmati",
    cardTheme: "yellow",
    badge: "The House Signature",
    title: "Basmati Chicken",
    subtitle: "SPICED GOLDEN RICE BOWL",
    description:
      "Fragrant yellow basmati rice topped with sliced crispy chicken tenders, creamy garlic sauce, house Toomy drizzle, and toasted nuts.",
    basePrice: 155,
    image: "assets/products/basmati-chicken.webp",
    includedChips: [
      "Golden Basmati Rice",
      "Crispy Chicken Strips",
      "Garlic & Toomy Drizzle"
    ],
    optionGroups: [
      {
        name: "Sauce Drizzle",
        options: [
          { label: "Garlic & Toomy Sauce", delta: 0 },
          { label: "Sweet Chili Glaze", delta: 0 },
          { label: "Cheddar Cheese", delta: 15 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "toomy-burger", "hotdog-crispy-roll"]
  },

  "basmati-steak": {
    id: "basmati-steak",
    category: "basmati",
    categoryLabel: "Basmati",
    cardTheme: "cream",
    badge: "Hearty Bowl",
    title: "Basmati Steak",
    subtitle: "CHARGRILLED STEAK & RICE",
    description:
      "Aromatic seasoned basmati rice loaded with tender chargrilled steak strips, sauteed peppers, and smoky peppercorn-garlic sauce.",
    basePrice: 175,
    image: "assets/products/basmati-steak.png",
    includedChips: [
      "Seasoned Basmati Rice",
      "Chargrilled Steak",
      "Sauteed Peppers",
      "Smoky Peppercorn Sauce"
    ],
    optionGroups: [
      {
        name: "Sauce Drizzle",
        options: [
          { label: "Peppercorn Garlic", delta: 0 },
          { label: "Mushroom Cream", delta: 15 }
        ]
      }
    ],
    recommendedIds: ["tenders-meal", "pepperonzi-burger", "hotdog-crispy-roll"]
  },

  /* ===================== CRISPY (1) ===================== */
  "hotdog-crispy-roll": {
    id: "hotdog-crispy-roll",
    category: "crispy",
    categoryLabel: "Crispy",
    cardTheme: "cream",
    badge: "Roll Up",
    title: "Hotdog Crispy Roll",
    subtitle: "STACKED & MELTED",
    description:
      "Crispy toasted tortilla wrap packed with grilled hot dog bites, melted mozzarella, rich cheddar sauce, and fresh crunchy veggies.",
    basePrice: 145,
    image: "assets/products/crispy-roll.webp",
    includedChips: [
      "Grilled Hot Dog",
      "Melted Mozzarella",
      "Cheddar Sauce",
      "Toasted Tortilla Wrap"
    ],
    optionGroups: [
      {
        name: "Roll Size",
        options: [
          { label: "Single Roll", delta: 0 },
          { label: "Double Roll", delta: 55 }
        ]
      }
    ],
    recommendedIds: ["toomy-burger", "tenders-meal", "basmati-chicken"]
  }
};

window.MENU_ITEMS_LIST = Object.values(window.MENU_ITEMS);