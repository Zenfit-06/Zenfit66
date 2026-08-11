document.addEventListener('DOMContentLoaded', () => {
  // 1. Authentication check via localStorage
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('zenfit_user') || 'null');
  } catch (e) {
    currentUser = null;
  }

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  initNutritionDashboard(currentUser);
});

// DEFAULT NUTRITION TARGETS
const NUTRITION_TARGETS = {
  calories: 2200,
  protein: 140,
  carbs: 310,
  fats: 50,
  fiber: 30
};

// INITIAL MEALS STATE
let mealsState = [
  {
    id: 1,
    tag: 'BREAKFAST',
    name: 'Oatmeal Power Bowl',
    time: '7:30 AM',
    emoji: '🥣',
    image: 'images/oatmeal-bowl.png',
    desc: 'Steel-cut oats topped with fresh berries, chia seeds, almonds, and a drizzle of honey.',
    calories: 420,
    protein: 18,
    carbs: 62,
    fats: 12,
    fiber: 8,
    prepTime: '10 mins',
    logged: true,
    bookmarked: false,
    ingredients: [
      '1/2 cup Steel-cut Oats',
      '1 cup Almond Milk',
      '1/2 cup Fresh Berries',
      '1 tbsp Chia Seeds',
      '1 tbsp Sliced Almonds',
      '1 tsp Raw Honey'
    ],
    recipe: [
      'Bring almond milk to a light simmer in a small saucepan over medium heat.',
      'Stir in steel-cut oats, decrease heat to low, and cover.',
      'Cook for 8-10 minutes until thick and creamy, stirring occasionally.',
      'Transfer cooked oats into a bowl. Top with fresh berries, chia seeds, sliced almonds, and a drizzle of honey.'
    ],
    substitutions: 'Swap almond milk with oat milk or dairy milk. Substitute almonds with walnuts or pumpkin seeds.',
    allergens: ['Tree Nuts', 'Gluten-Free Option']
  },
  {
    id: 2,
    tag: 'MORNING SNACK',
    name: 'Apple & Almond Butter',
    time: '10:00 AM',
    emoji: '🍎',
    image: 'images/apple-almond-butter.png',
    desc: 'A crisp apple sliced and paired with a tablespoon of natural almond butter.',
    calories: 220,
    protein: 5,
    carbs: 30,
    fats: 10,
    fiber: 5,
    prepTime: '5 mins',
    logged: true,
    bookmarked: false,
    ingredients: [
      '1 Large Honeycrisp Apple',
      '2 tbsp All-Natural Almond Butter',
      'Pinch of Cinnamon'
    ],
    recipe: [
      'Core and cut the apple into even wedges.',
      'Scoop almond butter into a small dish and dust lightly with cinnamon.',
      'Serve apple slices alongside almond butter for dipping.'
    ],
    substitutions: 'Use peanut butter or sunflower seed butter for nut-free dietary option.',
    allergens: ['Tree Nuts']
  },
  {
    id: 3,
    tag: 'LUNCH',
    name: 'Grilled Chicken Quinoa Bowl',
    time: '1:00 PM',
    emoji: '🥗',
    image: 'images/chicken-quinoa-bowl.png',
    desc: 'Herb-marinated grilled chicken over fluffy quinoa, roasted veggies, avocado, and a lemon-tahini dressing.',
    calories: 580,
    protein: 42,
    carbs: 55,
    fats: 18,
    fiber: 9,
    prepTime: '20 mins',
    logged: true,
    bookmarked: true,
    ingredients: [
      '150g Chicken Breast Fillet',
      '3/4 cup Cooked Quinoa',
      '1/2 Avocado (sliced)',
      '1/2 cup Roasted Zucchini & Bell Peppers',
      '2 tbsp Lemon Tahini Dressing'
    ],
    recipe: [
      'Season chicken breast with olive oil, oregano, garlic powder, salt, and black pepper.',
      'Grill chicken over medium-high heat for 6-7 minutes per side until fully cooked.',
      'Fluff pre-cooked quinoa and layer into bowl with roasted vegetables.',
      'Top with sliced chicken, fresh avocado, and drizzle lemon-tahini dressing.'
    ],
    substitutions: 'Replace chicken breast with grilled tofu or chickpeas for vegetarian option.',
    allergens: ['Sesame (Tahini)', 'Gluten-Free']
  },
  {
    id: 4,
    tag: 'AFTERNOON SNACK',
    name: 'Green Protein Smoothie',
    time: '4:00 PM',
    emoji: '🥤',
    image: 'images/green-smoothie.png',
    desc: 'Spinach, banana, whey protein, Greek yogurt, and almond milk.',
    calories: 280,
    protein: 25,
    carbs: 32,
    fats: 6,
    fiber: 4,
    prepTime: '5 mins',
    logged: true,
    bookmarked: false,
    ingredients: [
      '1 scoop Vanilla Whey Protein Powder',
      '1 cup Fresh Baby Spinach',
      '1 Frozen Ripe Banana',
      '1/2 cup Low-Fat Greek Yogurt',
      '1 cup Unsweetened Almond Milk'
    ],
    recipe: [
      'Pour almond milk and Greek yogurt into blender base first.',
      'Add fresh baby spinach, protein powder, and frozen banana slices.',
      'Blend on high speed for 60 seconds until smooth and creamy.',
      'Pour into tall glass and serve chilled.'
    ],
    substitutions: 'Use plant-based pea/rice protein and coconut yogurt for dairy-free smoothie.',
    allergens: ['Dairy (Whey & Yogurt)', 'Tree Nuts']
  },
  {
    id: 5,
    tag: 'DINNER',
    name: 'Salmon & Sweet Potato',
    time: '7:30 PM',
    emoji: '🍛',
    image: 'images/salmon-dinner.png',
    desc: 'Omega-3 rich baked salmon fillet with roasted sweet potato wedges and steamed broccoli.',
    calories: 520,
    protein: 38,
    carbs: 48,
    fats: 16,
    fiber: 7,
    prepTime: '25 mins',
    logged: false,
    bookmarked: false,
    ingredients: [
      '160g Wild Salmon Fillet',
      '1 Medium Sweet Potato (wedged)',
      '1 cup Fresh Broccoli Florets',
      '1 tbsp Extra Virgin Olive Oil',
      'Fresh Lemon & Herbs'
    ],
    recipe: [
      'Preheat oven to 400°F (200°C). Toss sweet potato wedges with olive oil, paprika, and sea salt.',
      'Roast sweet potatoes for 15 minutes, then place salmon fillet on baking sheet.',
      'Season salmon with lemon juice, dill, garlic, and bake for additional 12 minutes.',
      'Steam broccoli florets until tender-crisp. Serve together warm.'
    ],
    substitutions: 'Swap salmon with baked cod, trout, or grilled tempeh block.',
    allergens: ['Fish', 'Gluten-Free']
  }
];

// SWAP MEAL ALTERNATIVES
const SWAP_DATA = {
  BREAKFAST: [
    { name: 'Avocado & Poached Egg Toast', emoji: '🥑', calories: 410, protein: 19, carbs: 40, fats: 20 },
    { name: 'Berry Chia Pudding Bowl', emoji: '🍧', calories: 390, protein: 16, carbs: 54, fats: 14 },
    { name: 'Greek Yogurt Parfait & Granola', emoji: '🥛', calories: 430, protein: 24, carbs: 50, fats: 10 }
  ],
  'MORNING SNACK': [
    { name: 'Rice Cakes & Hummus', emoji: '🍘', calories: 210, protein: 6, carbs: 32, fats: 7 },
    { name: 'Cottage Cheese & Pineapple', emoji: '🍍', calories: 230, protein: 18, carbs: 24, fats: 4 },
    { name: 'Handful of Almonds & Dark Chocolate', emoji: '🥜', calories: 240, protein: 7, carbs: 18, fats: 16 }
  ],
  LUNCH: [
    { name: 'Turkey Avocado Club Wrap', emoji: '🥪', calories: 560, protein: 38, carbs: 48, fats: 22 },
    { name: 'Mediterranean Chickpea Salad', emoji: '🥙', calories: 540, protein: 22, carbs: 68, fats: 18 },
    { name: 'Seared Tuna Grain Bowl', emoji: '🍱', calories: 590, protein: 44, carbs: 52, fats: 16 }
  ],
  'AFTERNOON SNACK': [
    { name: 'Edamame Pods with Sea Salt', emoji: '🫛', calories: 250, protein: 20, carbs: 18, fats: 9 },
    { name: 'Berry Whey Protein Shake', emoji: '🍓', calories: 270, protein: 28, carbs: 25, fats: 4 },
    { name: 'Boiled Eggs & Cherry Tomatoes', emoji: '🥚', calories: 220, protein: 14, carbs: 10, fats: 13 }
  ],
  DINNER: [
    { name: 'Lean Beef Sirloin & Asparagus', emoji: '🥩', calories: 530, protein: 44, carbs: 28, fats: 22 },
    { name: 'Tofu Veggie Stir-Fry with Brown Rice', emoji: '🍲', calories: 490, protein: 26, carbs: 62, fats: 14 },
    { name: 'Baked Cod with Cauliflower Mash', emoji: '🐟', calories: 480, protein: 36, carbs: 38, fats: 12 }
  ]
};

// NUTRITION KNOWLEDGE DATA
const KNOWLEDGE_DATA = {
  vegetables: {
    emoji: '🥦',
    title: 'Vegetables & Super Nutrients',
    items: [
      {
        name: 'Broccoli & Cruciferous Veggies',
        desc: 'Contains high concentrations of Sulforaphane, Vitamin C (135% DV), and Vitamin K (116% DV). Neutralizes free radicals and enhances liver detoxification pathways.',
        badges: ['Vitamin C', 'Vitamin K', 'Fiber', 'Sulforaphane']
      },
      {
        name: 'Spinach & Dark Leafy Greens',
        desc: 'Packed with plant-based Iron, Folate, Lutein, and Magnesium. Enhances cellular oxygen transport and neuromuscular function.',
        badges: ['Iron', 'Vitamin A', 'Folate', 'Magnesium']
      },
      {
        name: 'Red & Yellow Bell Peppers',
        desc: 'Contains double the Vitamin C density of citrus fruits! Rich in Beta-Carotene for skin integrity and immune cell protection.',
        badges: ['Vitamin C', 'Beta-Carotene', 'Lutein', 'Antioxidants']
      }
    ]
  },
  proteins: {
    emoji: '🥩',
    title: 'Essential Proteins & Amino Acids',
    items: [
      {
        name: 'Wild Salmon & Cold-Water Fish',
        desc: 'Delivers complete bioavailable protein and long-chain EPA/DHA Omega-3 fatty acids. Dampens systemic inflammation and speeds muscle repair.',
        badges: ['Complete Protein', 'Omega-3 (EPA/DHA)', 'Vitamin D', 'Selenium']
      },
      {
        name: 'Pasture-Raised Eggs',
        desc: 'Nature’s most bioavailable protein source (DIAAS score 1.13). Rich in Choline for brain health and Leucine for muscle protein synthesis.',
        badges: ['Leucine', 'Choline', 'Vitamin B12', 'Protein']
      },
      {
        name: 'Greek Yogurt & Fermented Dairy',
        desc: 'Provides 2x protein of regular yogurt with live active probiotics (L. acidophilus) for gut microbiome diversity.',
        badges: ['Probiotics', 'Calcium', 'Slow-Release Casein']
      }
    ]
  },
  bodyNeeds: {
    emoji: '⚡',
    title: 'What the Body Needs Daily',
    items: [
      {
        name: 'Complex Carbs & Soluble Fiber',
        desc: 'Steel-cut oats, quinoa, and tubers provide slow glucose infusion into blood vessels, avoiding insulin spikes and feeding gut microbes.',
        badges: ['Low Glycemic', 'Beta-Glucan', 'Sustained Energy']
      },
      {
        name: 'Essential Electrolytes',
        desc: 'Potassium, Sodium, and Magnesium maintain electrical membrane potential across heart and muscle cells, preventing fatigue.',
        badges: ['Potassium', 'Sodium', 'Magnesium', 'Fluid Balance']
      },
      {
        name: 'Polyphenols & Micronutrient Variety',
        desc: 'Aim for 30+ unique plant foods per week. Diverse plant compounds enhance mitochondrial efficiency and metabolic resilience.',
        badges: ['Polyphenols', 'Micronutrients', 'Microbiome']
      }
    ]
  },
  fatsSuperfoods: {
    emoji: '🥑',
    title: 'Healthy Fats & Superfoods',
    items: [
      {
        name: 'Avocado & Extra Virgin Olive Oil',
        desc: 'Abundant in Monounsaturated Oleic Acid and Vitamin E. Facilitates fat-soluble vitamin absorption (A, D, E, K) and lowers LDL oxidation.',
        badges: ['Oleic Acid', 'Vitamin E', 'Monounsaturated Fats']
      },
      {
        name: 'Chia Seeds & Flaxseeds',
        desc: 'Rich in Alpha-Linolenic Acid (ALA Omega-3) and mucilage fiber. Promotes cardiovascular health and digestive regularity.',
        badges: ['ALA Omega-3', 'Mucilage Fiber', 'Lignans']
      },
      {
        name: 'Wild Blueberries & Dark Berries',
        desc: 'Concentrated Anthocyanins cross the blood-brain barrier to enhance neuroplasticity and reduce exercise-induced oxidative damage.',
        badges: ['Anthocyanins', 'Polyphenols', 'Low Glycemic']
      }
    ]
  }
};

// WEEKLY METRIC DATA
const WEEKLY_METRIC_DATA = {
  calories: {
    unit: 'kcal',
    avgVal: '2,050 kcal',
    subText: 'daily average',
    data: [
      { day: 'Mon', consumed: 1850, target: 2200 },
      { day: 'Tue', consumed: 2100, target: 2200 },
      { day: 'Wed', consumed: 1950, target: 2200 },
      { day: 'Thu', consumed: 2180, target: 2200 },
      { day: 'Fri', consumed: 2020, target: 2200 },
      { day: 'Sat', consumed: 2250, target: 2200 },
      { day: 'Sun', consumed: 1820, target: 2200, active: true }
    ]
  },
  protein: {
    unit: 'g',
    avgVal: '132g / day',
    subText: 'target: 140g',
    data: [
      { day: 'Mon', consumed: 135, target: 140 },
      { day: 'Tue', consumed: 142, target: 140 },
      { day: 'Wed', consumed: 128, target: 140 },
      { day: 'Thu', consumed: 145, target: 140 },
      { day: 'Fri', consumed: 130, target: 140 },
      { day: 'Sat', consumed: 148, target: 140 },
      { day: 'Sun', consumed: 98, target: 140, active: true }
    ]
  },
  carbs: {
    unit: 'g',
    avgVal: '285g / day',
    subText: 'target: 310g',
    data: [
      { day: 'Mon', consumed: 290, target: 310 },
      { day: 'Tue', consumed: 305, target: 310 },
      { day: 'Wed', consumed: 275, target: 310 },
      { day: 'Thu', consumed: 312, target: 310 },
      { day: 'Fri', consumed: 280, target: 310 },
      { day: 'Sat', consumed: 320, target: 310 },
      { day: 'Sun', consumed: 248, target: 310, active: true }
    ]
  },
  fats: {
    unit: 'g',
    avgVal: '44g / day',
    subText: 'target: 50g',
    data: [
      { day: 'Mon', consumed: 46, target: 50 },
      { day: 'Tue', consumed: 48, target: 50 },
      { day: 'Wed', consumed: 42, target: 50 },
      { day: 'Thu', consumed: 52, target: 50 },
      { day: 'Fri', consumed: 45, target: 50 },
      { day: 'Sat', consumed: 51, target: 50 },
      { day: 'Sun', consumed: 28, target: 50, active: true }
    ]
  }
};

let currentDeleteMealId = null;

function initNutritionDashboard(user) {
  setupUserInfo(user);
  setupSidebarToggle();
  setupLogout();
  setupMacrosToggle();

  renderMealsList();
  updateDailyTotals();

  setupAddMeal();
  setupEditMeal();
  setupSwapMeal();
  setupDeleteMeal();
  setupWeeklyAnalytics();
  setupKnowledgeCards();
  setupSidebarKnowledge();
  setupGroceryList();
  setupExtraButtons();
}

/**
 * Setup user information in header and sidebar
 */
function setupUserInfo(user) {
  let rawName = user.fullName || user.name || user.email || 'User';
  if (rawName.includes('@')) {
    const parts = rawName.split('@');
    if (parts[0]) rawName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  const fullName = rawName;

  const avatarInitials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const sidebarAvatarEl = document.getElementById('sidebarAvatar');
  if (sidebarAvatarEl) sidebarAvatarEl.textContent = avatarInitials;

  const sidebarNameEl = document.getElementById('sidebarUserName');
  if (sidebarNameEl) sidebarNameEl.textContent = fullName;

  const sidebarBadgeEl = document.getElementById('sidebarUserBadge');
  if (sidebarBadgeEl) {
    sidebarBadgeEl.textContent = '👑 Pro Member 👋';
    sidebarBadgeEl.style.color = '#FF7043';
    sidebarBadgeEl.style.fontWeight = '600';
  }

  const headerAvatarTextEl = document.getElementById('headerAvatarText');
  if (headerAvatarTextEl) headerAvatarTextEl.textContent = avatarInitials;

  const headerAvatar = document.getElementById('headerAvatar');
  if (headerAvatar) {
    headerAvatar.style.cursor = 'pointer';
    headerAvatar.onclick = () => {
      window.location.href = 'personal_details.html';
    };
  }
}

/**
 * Mobile Sidebar Drawer Toggle
 */
function setupSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('sidebar-open');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('sidebar-open');
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);
}

/**
 * Logout Handler
 */
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('zenfit_user');
        window.location.href = 'login.html';
      }
    });
  }
}

/**
 * Macros Toggle (Today / Week)
 */
function setupMacrosToggle() {
  const toggles = document.querySelectorAll('.macros-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      toggles.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const period = btn.getAttribute('data-period');
      
      if (period === 'week') {
        updateMacroRing('proteinCard', 85, '119g', '/ 140g');
        updateMacroRing('carbsCard', 92, '285g', '/ 310g');
        updateMacroRing('fatsCard', 68, '34g', '/ 50g');
        updateMacroRing('fiberCard', 75, '22.5g', '/ 30g');
      } else {
        updateDailyTotals();
      }
    });
  });
}

function updateMacroRing(cardId, percent, valText, goalText) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const ringProgress = card.querySelector('.ring-progress');
  const ringLabel = card.querySelector('.ring-label');
  const amountEl = card.querySelector('.macro-ring-amount');

  if (ringLabel) ringLabel.textContent = `${percent}%`;
  if (amountEl) {
    amountEl.innerHTML = `${valText} <span class="macro-ring-goal">${goalText}</span>`;
  }
  if (ringProgress) {
    const strokeDasharray = 264;
    const offset = strokeDasharray - (strokeDasharray * percent) / 100;
    ringProgress.style.strokeDashoffset = Math.max(0, offset);
  }
}

/**
 * Render Meals List
 */
function renderMealsList() {
  const container = document.getElementById('mealsList');
  if (!container) return;

  container.innerHTML = '';

  mealsState.forEach((meal, index) => {
    const article = document.createElement('article');
    article.className = 'pose-card meal-card';
    article.dataset.id = meal.id;

    const imageContent = meal.image
      ? `<img src="${meal.image}" alt="${meal.name}" class="meal-food-image">`
      : `<div class="meal-emoji-display">${meal.emoji}</div>`;

    article.innerHTML = `
      <div class="pose-image-box meal-image-box">
        ${imageContent}
        <div class="meal-time-badge"><i class="fa-regular fa-clock"></i> ${meal.time}</div>
      </div>
      <div class="pose-content">
        <div class="meal-content-header">
          <div>
            <span class="pose-tag">${meal.tag}</span>
            <h3 class="pose-name">${meal.name}</h3>
          </div>
          <div class="more-menu-wrapper">
            <button class="btn-more-menu" data-id="${meal.id}" aria-label="Meal Options">
              <i class="fa-solid fa-ellipsis"></i>
            </button>
            <div class="more-menu-dropdown" id="dropdown-${meal.id}">
              <button class="menu-opt opt-details" data-id="${meal.id}"><i class="fa-solid fa-circle-info"></i> View Details</button>
              <button class="menu-opt opt-edit" data-id="${meal.id}"><i class="fa-solid fa-pen-to-square"></i> Edit Meal</button>
              <button class="menu-opt opt-swap" data-id="${meal.id}"><i class="fa-solid fa-arrows-rotate"></i> Swap Meal</button>
              <button class="menu-opt opt-duplicate" data-id="${meal.id}"><i class="fa-solid fa-copy"></i> Duplicate Meal</button>
              <button class="menu-opt opt-grocery" data-id="${meal.id}"><i class="fa-solid fa-cart-plus"></i> Add to Grocery List</button>
              <button class="menu-opt opt-remove danger" data-id="${meal.id}"><i class="fa-solid fa-trash-can"></i> Remove Meal</button>
            </div>
          </div>
        </div>
        <p class="pose-desc">${meal.desc}</p>
        <div class="meal-macros-row">
          <span class="meal-macro"><i class="fa-solid fa-fire"></i> ${meal.calories} kcal</span>
          <span class="meal-macro protein"><i class="fa-solid fa-dumbbell"></i> ${meal.protein}g protein</span>
          <span class="meal-macro carbs"><i class="fa-solid fa-wheat-awn"></i> ${meal.carbs}g carbs</span>
          <span class="meal-macro fats"><i class="fa-solid fa-droplet"></i> ${meal.fats}g fats</span>
        </div>
        <div class="pose-actions">
          <button class="btn-start-practice btn-log-meal ${meal.logged ? 'logged' : ''}" data-id="${meal.id}">
            <i class="fa-solid ${meal.logged ? 'fa-check' : 'fa-check'}"></i> ${meal.logged ? 'Logged' : 'Log Meal'}
          </button>
          <button class="btn-bookmark ${meal.bookmarked ? 'active' : ''}" data-id="${meal.id}" aria-label="Bookmark meal">
            <i class="${meal.bookmarked ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
          </button>
          <button class="btn-more-actions" data-id="${meal.id}">
            <i class="fa-solid fa-ellipsis"></i> More
          </button>
        </div>
      </div>
    `;

    container.appendChild(article);
  });

  attachMealEventListeners();
  renderTodaysPlan();
}

/**
 * Event Listeners for Meal Cards
 */
function attachMealEventListeners() {
  // Log Meal
  document.querySelectorAll('.btn-log-meal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      const meal = mealsState.find(m => m.id === id);
      if (!meal) return;

      meal.logged = !meal.logged;
      renderMealsList();
      updateDailyTotals();

      if (meal.logged) {
        showLogSuccessModal(meal);
      }
    });
  });

  // Bookmark Meal
  document.querySelectorAll('.btn-bookmark').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const meal = mealsState.find(m => m.id === id);
      if (!meal) return;

      meal.bookmarked = !meal.bookmarked;
      renderMealsList();
    });
  });

  // Details
  document.querySelectorAll('.btn-view-details-meal, .opt-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      const id = parseInt(btn.dataset.id);
      openMealDetailsModal(id);
    });
  });

  // More Menu Dropdown Toggle
  document.querySelectorAll('.btn-more-menu').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const dropdown = document.getElementById(`dropdown-${id}`);
      const isOpen = dropdown.classList.contains('show');
      closeAllDropdowns();
      if (!isOpen) dropdown.classList.add('show');
    });
  });

  // Edit Meal
  document.querySelectorAll('.opt-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      const id = parseInt(btn.dataset.id);
      openEditMealModal(id);
    });
  });

  // Swap Meal
  document.querySelectorAll('.opt-swap').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      const id = parseInt(btn.dataset.id);
      openSwapMealModal(id);
    });
  });

  // Remove Meal
  document.querySelectorAll('.opt-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      const id = parseInt(btn.dataset.id);
      openDeleteMealModal(id);
    });
  });

  // Duplicate Meal
  document.querySelectorAll('.opt-duplicate').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      const id = parseInt(btn.dataset.id);
      const meal = mealsState.find(m => m.id === id);
      if (!meal) return;
      const dup = { ...meal, id: Date.now(), logged: false, bookmarked: false };
      mealsState.push(dup);
      renderMealsList();
      updateDailyTotals();
    });
  });

  // Add to Grocery List from dropdown
  document.querySelectorAll('.opt-grocery').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      const toast = document.getElementById('groceryToast');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
    });
  });

  // More Actions button (bottom of meal card)
  document.querySelectorAll('.btn-more-actions').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const dropdown = document.getElementById(`dropdown-${id}`);
      const isOpen = dropdown && dropdown.classList.contains('show');
      closeAllDropdowns();
      if (!isOpen && dropdown) dropdown.classList.add('show');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.more-menu-dropdown').forEach(d => d.classList.remove('show'));
}

/**
 * Update Daily Totals & Calories Remaining
 */
function updateDailyTotals() {
  const loggedMeals = mealsState.filter(m => m.logged);

  const totalCals = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFats = loggedMeals.reduce((acc, m) => acc + m.fats, 0);
  const totalFiber = loggedMeals.reduce((acc, m) => acc + (m.fiber || 5), 0);

  const calRemaining = Math.max(0, NUTRITION_TARGETS.calories - totalCals);
  const calPct = Math.min(100, Math.round((totalCals / NUTRITION_TARGETS.calories) * 100));

  // Top Stat Cards
  const calsValEl = document.getElementById('caloriesValue');
  const calsRemValEl = document.getElementById('caloriesRemainingValue');
  const mealsValEl = document.getElementById('mealsValue');

  if (calsValEl) calsValEl.textContent = totalCals.toLocaleString();
  if (calsRemValEl) calsRemValEl.textContent = calRemaining.toLocaleString();
  if (mealsValEl) mealsValEl.textContent = `${loggedMeals.length} / ${mealsState.length}`;

  // Calories Remaining Section
  const calRemNum = document.getElementById('calRemNum');
  const calConsumedVal = document.getElementById('calConsumedVal');
  const calPctText = document.getElementById('calPctText');
  const calProgressFill = document.getElementById('calProgressFill');

  if (calRemNum) calRemNum.textContent = calRemaining.toLocaleString();
  if (calConsumedVal) calConsumedVal.textContent = totalCals.toLocaleString();
  if (calPctText) calPctText.textContent = `${calPct}% achieved`;
  if (calProgressFill) calProgressFill.style.width = `${calPct}%`;

  // Mini Macro Bars in Calories Remaining Section
  const pPct = Math.min(100, Math.round((totalProtein / NUTRITION_TARGETS.protein) * 100));
  const cPct = Math.min(100, Math.round((totalCarbs / NUTRITION_TARGETS.carbs) * 100));
  const fPct = Math.min(100, Math.round((totalFats / NUTRITION_TARGETS.fats) * 100));
  const fibPct = Math.min(100, Math.round((totalFiber / NUTRITION_TARGETS.fiber) * 100));

  const pBarVal = document.getElementById('proteinBarVal');
  const cBarVal = document.getElementById('carbsBarVal');
  const fBarVal = document.getElementById('fatsBarVal');

  if (pBarVal) pBarVal.textContent = `${totalProtein}g / ${NUTRITION_TARGETS.protein}g`;
  if (cBarVal) cBarVal.textContent = `${totalCarbs}g / ${NUTRITION_TARGETS.carbs}g`;
  if (fBarVal) fBarVal.textContent = `${totalFats}g / ${NUTRITION_TARGETS.fats}g`;

  const pBarFill = document.getElementById('proteinBarFill');
  const cBarFill = document.getElementById('carbsBarFill');
  const fBarFill = document.getElementById('fatsBarFill');

  if (pBarFill) pBarFill.style.width = `${pPct}%`;
  if (cBarFill) cBarFill.style.width = `${cPct}%`;
  if (fBarFill) fBarFill.style.width = `${fPct}%`;

  // Macro Ring Cards
  updateMacroRing('proteinCard', pPct, `${totalProtein}g`, `/ ${NUTRITION_TARGETS.protein}g`);
  updateMacroRing('carbsCard', cPct, `${totalCarbs}g`, `/ ${NUTRITION_TARGETS.carbs}g`);
  updateMacroRing('fatsCard', fPct, `${totalFats}g`, `/ ${NUTRITION_TARGETS.fats}g`);
  updateMacroRing('fiberCard', fibPct, `${totalFiber}g`, `/ ${NUTRITION_TARGETS.fiber}g`);
}

/**
 * Log Meal Success Modal
 */
function showLogSuccessModal(meal) {
  const modal = document.getElementById('mealLogModal');
  const title = document.getElementById('modalMealTitle');
  const cals = document.getElementById('modalCalories');
  const prot = document.getElementById('modalProtein');
  const carbs = document.getElementById('modalCarbs');
  const fats = document.getElementById('modalFats');

  if (title) title.textContent = `${meal.tag} — ${meal.name}`;
  if (cals) cals.textContent = `${meal.calories} kcal`;
  if (prot) prot.textContent = `${meal.protein}g`;
  if (carbs) carbs.textContent = `${meal.carbs}g`;
  if (fats) fats.textContent = `${meal.fats}g`;

  if (modal) modal.classList.add('show');

  const closeBtn = document.getElementById('modalCloseBtn');
  const doneBtn = document.getElementById('modalDoneBtn');

  function close() {
    if (modal) modal.classList.remove('show');
  }

  if (closeBtn) closeBtn.onclick = close;
  if (doneBtn) doneBtn.onclick = close;
}

/**
 * Meal Details Modal
 */
function openMealDetailsModal(id) {
  const meal = mealsState.find(m => m.id === id);
  if (!meal) return;

  const modal = document.getElementById('mealDetailsModal');
  if (!modal) return;

  document.getElementById('detailsMealEmoji').textContent = meal.emoji;
  document.getElementById('detailsMealTag').textContent = meal.tag;
  document.getElementById('detailsMealTitle').textContent = meal.name;
  document.getElementById('detailsMealTime').innerHTML = `<i class="fa-regular fa-clock"></i> ${meal.time}`;
  document.getElementById('detailsMealDesc').textContent = meal.desc;

  document.getElementById('detailsCal').textContent = `${meal.calories}`;
  document.getElementById('detailsProtein').textContent = `${meal.protein}g`;
  document.getElementById('detailsCarbs').textContent = `${meal.carbs}g`;
  document.getElementById('detailsFats').textContent = `${meal.fats}g`;
  document.getElementById('detailsFiber').textContent = `${meal.fiber || 6}g`;
  document.getElementById('detailsPrepTime').textContent = meal.prepTime || '15 min';

  // Ingredients
  const ingList = document.getElementById('detailsIngredientsList');
  if (ingList) {
    ingList.innerHTML = '';
    (meal.ingredients || []).forEach((ing, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<input type="checkbox" id="ing-${i}"> <label for="ing-${i}">${ing}</label>`;
      ingList.appendChild(li);
    });
  }

  // Recipe steps
  const recipeOl = document.getElementById('detailsRecipeSteps');
  if (recipeOl) {
    recipeOl.innerHTML = '';
    (meal.recipe || ['Prepare ingredients fresh and mix into bowl.']).forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      recipeOl.appendChild(li);
    });
  }

  // Substitutions & Allergens
  document.getElementById('detailsSubstitutions').textContent = meal.substitutions || 'No specific substitutions required.';
  const algContainer = document.getElementById('detailsAllergens');
  if (algContainer) {
    algContainer.innerHTML = '';
    (meal.allergens || ['Gluten-Free']).forEach(alg => {
      const span = document.createElement('span');
      span.className = 'allergen-tag';
      span.textContent = alg;
      algContainer.appendChild(span);
    });
  }

  // Log Button in Details Modal
  const logBtn = document.getElementById('detailsLogMealBtn');
  if (logBtn) {
    logBtn.innerHTML = meal.logged ? '<i class="fa-solid fa-check-double"></i> Already Logged' : '<i class="fa-solid fa-check"></i> Log This Meal';
    logBtn.onclick = () => {
      meal.logged = true;
      renderMealsList();
      updateDailyTotals();
      modal.classList.remove('show');
      showLogSuccessModal(meal);
    };
  }

  modal.classList.add('show');

  const closeBtn = document.getElementById('detailsModalCloseBtn');
  const closeBottomBtn = document.getElementById('detailsCloseBottomBtn');
  function close() { modal.classList.remove('show'); }
  if (closeBtn) closeBtn.onclick = close;
  if (closeBottomBtn) closeBottomBtn.onclick = close;
}

/**
 * Add Meal Modal Handler
 */
function setupAddMeal() {
  const openBtn = document.getElementById('openAddMealBtn');
  const modal = document.getElementById('addMealModal');
  const closeBtn = document.getElementById('addMealCloseBtn');
  const form = document.getElementById('addMealForm');

  if (openBtn) openBtn.onclick = () => { if (modal) modal.classList.add('show'); };
  if (closeBtn) closeBtn.onclick = () => { if (modal) modal.classList.remove('show'); };

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();

      const tag = document.getElementById('addMealTag').value;
      const name = document.getElementById('addMealName').value.trim();
      const time = document.getElementById('addMealTime').value.trim();
      const emoji = document.getElementById('addMealEmoji').value;
      const cals = parseInt(document.getElementById('addMealCalories').value) || 300;
      const protein = parseInt(document.getElementById('addMealProtein').value) || 15;
      const carbs = parseInt(document.getElementById('addMealCarbs').value) || 40;
      const fats = parseInt(document.getElementById('addMealFats').value) || 10;
      const desc = document.getElementById('addMealDesc').value.trim();
      const ingStr = document.getElementById('addMealIngredients').value.trim();

      const ingredients = ingStr ? ingStr.split(',').map(s => s.trim()) : ['Fresh Ingredients'];

      const newMeal = {
        id: Date.now(),
        tag,
        name,
        time,
        emoji,
        desc,
        calories: cals,
        protein,
        carbs,
        fats,
        fiber: 6,
        prepTime: '15 mins',
        logged: true,
        bookmarked: false,
        ingredients,
        recipe: ['Combine all fresh ingredients according to taste, cook as desired, and serve warm.'],
        substitutions: 'Custom meal substitutions available based on ingredients.',
        allergens: ['Custom Meal']
      };

      mealsState.push(newMeal);
      renderMealsList();
      updateDailyTotals();

      form.reset();
      if (modal) modal.classList.remove('show');
    };
  }
}

/**
 * Edit Meal Modal Handler
 */
function openEditMealModal(id) {
  const meal = mealsState.find(m => m.id === id);
  if (!meal) return;

  const modal = document.getElementById('editMealModal');
  if (!modal) return;

  document.getElementById('editMealId').value = meal.id;
  document.getElementById('editMealTag').value = meal.tag;
  document.getElementById('editMealName').value = meal.name;
  document.getElementById('editMealTime').value = meal.time;
  document.getElementById('editMealCalories').value = meal.calories;
  document.getElementById('editMealProtein').value = meal.protein;
  document.getElementById('editMealCarbs').value = meal.carbs;
  document.getElementById('editMealFats').value = meal.fats;
  document.getElementById('editMealDesc').value = meal.desc;

  modal.classList.add('show');

  const closeBtn = document.getElementById('editMealCloseBtn');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('show');
}

function setupEditMeal() {
  const form = document.getElementById('editMealForm');
  const modal = document.getElementById('editMealModal');

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const id = parseInt(document.getElementById('editMealId').value);
      const meal = mealsState.find(m => m.id === id);
      if (!meal) return;

      meal.tag = document.getElementById('editMealTag').value;
      meal.name = document.getElementById('editMealName').value.trim();
      meal.time = document.getElementById('editMealTime').value.trim();
      meal.calories = parseInt(document.getElementById('editMealCalories').value) || meal.calories;
      meal.protein = parseInt(document.getElementById('editMealProtein').value) || meal.protein;
      meal.carbs = parseInt(document.getElementById('editMealCarbs').value) || meal.carbs;
      meal.fats = parseInt(document.getElementById('editMealFats').value) || meal.fats;
      meal.desc = document.getElementById('editMealDesc').value.trim();

      renderMealsList();
      updateDailyTotals();
      if (modal) modal.classList.remove('show');
    };
  }
}

/**
 * Swap Meal Handler
 */
function openSwapMealModal(id) {
  const meal = mealsState.find(m => m.id === id);
  if (!meal) return;

  const modal = document.getElementById('swapMealModal');
  const list = document.getElementById('swapOptionsList');
  if (!modal || !list) return;

  list.innerHTML = '';

  const options = SWAP_DATA[meal.tag] || SWAP_DATA['BREAKFAST'];

  options.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'swap-item';
    item.innerHTML = `
      <div class="swap-item-info">
        <span class="swap-emoji">${opt.emoji}</span>
        <div>
          <div class="swap-title">${opt.name}</div>
          <div class="swap-macros">${opt.calories} kcal • ${opt.protein}g protein • ${opt.carbs}g carbs • ${opt.fats}g fats</div>
        </div>
      </div>
      <button class="btn-choose-swap" data-name="${opt.name}">Swap to This</button>
    `;

    item.querySelector('.btn-choose-swap').onclick = () => {
      meal.name = opt.name;
      meal.emoji = opt.emoji;
      meal.calories = opt.calories;
      meal.protein = opt.protein;
      meal.carbs = opt.carbs;
      meal.fats = opt.fats;
      meal.desc = `Swapped alternative dish packed with balanced macros and fresh ingredients.`;

      renderMealsList();
      updateDailyTotals();
      modal.classList.remove('show');
    };

    list.appendChild(item);
  });

  modal.classList.add('show');

  const closeBtn = document.getElementById('swapMealCloseBtn');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('show');
}

function setupSwapMeal() {}

/**
 * Delete Meal Handler
 */
function openDeleteMealModal(id) {
  currentDeleteMealId = id;
  const meal = mealsState.find(m => m.id === id);
  const modal = document.getElementById('deleteMealModal');
  const nameText = document.getElementById('deleteMealNameText');

  if (nameText && meal) nameText.textContent = meal.name;
  if (modal) modal.classList.add('show');
}

function setupDeleteMeal() {
  const modal = document.getElementById('deleteMealModal');
  const confirmBtn = document.getElementById('confirmDeleteMealBtn');
  const cancelBtn = document.getElementById('cancelDeleteMealBtn');
  const closeBtn = document.getElementById('deleteMealCloseBtn');

  function close() { if (modal) modal.classList.remove('show'); }

  if (closeBtn) closeBtn.onclick = close;
  if (cancelBtn) cancelBtn.onclick = close;

  if (confirmBtn) {
    confirmBtn.onclick = () => {
      if (currentDeleteMealId) {
        mealsState = mealsState.filter(m => m.id !== currentDeleteMealId);
        renderMealsList();
        updateDailyTotals();
      }
      close();
    };
  }
}

/**
 * Weekly Progress & Analytics Tabs
 */
function setupWeeklyAnalytics() {
  const tabs = document.querySelectorAll('.weekly-metric-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const metric = tab.getAttribute('data-metric');
      renderWeeklyBars(metric);
    });
  });

  renderWeeklyBars('calories');
}

function renderWeeklyBars(metric) {
  const metricInfo = WEEKLY_METRIC_DATA[metric] || WEEKLY_METRIC_DATA.calories;
  const container = document.getElementById('weeklyBars');
  if (!container) return;

  container.innerHTML = '';

  const maxVal = Math.max(...metricInfo.data.map(d => d.target)) * 1.1;

  metricInfo.data.forEach(item => {
    const heightPct = Math.min(100, Math.round((item.consumed / maxVal) * 100));
    const group = document.createElement('div');
    group.className = `bar-group ${item.active ? 'active' : ''}`;
    group.title = `${item.day}: ${item.consumed} ${metricInfo.unit} (Target: ${item.target} ${metricInfo.unit})`;

    group.innerHTML = `
      <div class="bar-wrapper">
        <div class="bar target-bar"></div>
        <div class="bar consumed-bar" style="height: ${heightPct}%;"></div>
      </div>
      <span class="bar-label">${item.day}</span>
    `;

    container.appendChild(group);
  });
}

/**
 * Nutrition Knowledge Cards
 */
function setupKnowledgeCards() {
  const cards = document.querySelectorAll('#knowledgeGrid .tip-card.clickable');
  const modal = document.getElementById('knowledgeModal');
  const closeBtn = document.getElementById('knowledgeCloseBtn');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const catKey = card.getAttribute('data-category');
      const data = KNOWLEDGE_DATA[catKey];
      if (!data) return;

      document.getElementById('knowledgeEmoji').textContent = data.emoji;
      document.getElementById('knowledgeTitle').textContent = data.title;

      const body = document.getElementById('knowledgeBody');
      if (body) {
        body.innerHTML = '';
        data.items.forEach(item => {
          const div = document.createElement('div');
          div.className = 'knowledge-item';
          div.innerHTML = `
            <h4>${item.name}</h4>
            <p>${item.desc}</p>
            <div class="nutrient-badges">
              ${item.badges.map(b => `<span class="nutrient-badge">${b}</span>`).join('')}
            </div>
          `;
          body.appendChild(div);
        });
      }

      if (modal) modal.classList.add('show');
    });
  });

  if (closeBtn) closeBtn.onclick = () => { if (modal) modal.classList.remove('show'); };
}

/**
 * Grocery List Toast
 */
function setupGroceryList() {
  const btn = document.getElementById('addGroceryBtn');
  const toast = document.getElementById('groceryToast');

  if (btn && toast) {
    btn.addEventListener('click', () => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    });
  }
}

/**
 * Render Today's Plan Sidebar
 */
function renderTodaysPlan() {
  const list = document.getElementById('todaysPlanList');
  const progressText = document.getElementById('planProgressText');
  const progressFill = document.getElementById('planProgressFill');
  if (!list) return;

  list.innerHTML = '';
  const loggedCount = mealsState.filter(m => m.logged).length;
  const totalCount = mealsState.length;
  const pct = totalCount > 0 ? Math.round((loggedCount / totalCount) * 100) : 0;

  if (progressText) progressText.textContent = `${loggedCount} / ${totalCount} meals completed`;
  if (progressFill) progressFill.style.width = `${pct}%`;

  mealsState.forEach(meal => {
    const li = document.createElement('li');
    li.className = `plan-meal-item ${meal.logged ? 'completed' : ''}`;
    li.innerHTML = `
      <div class="plan-meal-check ${meal.logged ? 'checked' : ''}">
        ${meal.logged ? '<i class="fa-solid fa-check"></i>' : ''}
      </div>
      <span class="plan-meal-name">${meal.tag.charAt(0) + meal.tag.slice(1).toLowerCase()}</span>
      <span class="plan-meal-time">${meal.time}</span>
    `;
    list.appendChild(li);
  });
}

/**
 * Sidebar Knowledge Items Click Handlers
 */
function setupSidebarKnowledge() {
  const sidebarItems = document.querySelectorAll('.knowledge-sidebar-item.clickable');
  const modal = document.getElementById('knowledgeModal');
  const closeBtn = document.getElementById('knowledgeCloseBtn');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const catKey = item.getAttribute('data-category');
      const data = KNOWLEDGE_DATA[catKey];
      if (!data) return;

      document.getElementById('knowledgeEmoji').textContent = data.emoji;
      document.getElementById('knowledgeTitle').textContent = data.title;

      const body = document.getElementById('knowledgeBody');
      if (body) {
        body.innerHTML = '';
        data.items.forEach(itm => {
          const div = document.createElement('div');
          div.className = 'knowledge-item';
          div.innerHTML = `
            <h4>${itm.name}</h4>
            <p>${itm.desc}</p>
            <div class="nutrient-badges">
              ${itm.badges.map(b => `<span class="nutrient-badge">${b}</span>`).join('')}
            </div>
          `;
          body.appendChild(div);
        });
      }

      if (modal) modal.classList.add('show');
    });
  });

  // View All link scrolls to the knowledge section
  const viewAllLink = document.getElementById('viewAllKnowledge');
  if (viewAllLink) {
    viewAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      const knowledgeSection = document.querySelector('.tips-section');
      if (knowledgeSection) {
        knowledgeSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/**
 * Extra Buttons (Add Meal 2, Quick Add, Customize Plan)
 */
function setupExtraButtons() {
  // Second Add Meal button
  const openBtn2 = document.getElementById('openAddMealBtn2');
  const addModal = document.getElementById('addMealModal');
  if (openBtn2 && addModal) {
    openBtn2.addEventListener('click', () => addModal.classList.add('show'));
  }

  // Quick Add (opens the same add modal with pre-filled defaults)
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (quickAddBtn && addModal) {
    quickAddBtn.addEventListener('click', () => addModal.classList.add('show'));
  }

  // Customize Plan (placeholder action)
  const customizeBtn = document.getElementById('customizePlanBtn');
  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      const toast = document.getElementById('groceryToast');
      if (toast) {
        toast.innerHTML = '<i class="fa-solid fa-sliders"></i> Plan customization coming soon!';
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          toast.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Ingredients added to your grocery list!';
        }, 3000);
      }
    });
  }
}
