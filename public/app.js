// NHAM EY KE (ញ៉ាំអីគេ) - Prototype Application Controller
// Full in-app editing: Change, Add, and Deduce (Remove) Icons, Photos, Text & Categories

(function() {
  // App Data State
  let appData = window.NHAM_DATA;
  let currentLang = localStorage.getItem('nham_lang') || 'kh';
  let isEditMode = localStorage.getItem('nham_edit_mode') === 'true';
  let currentView = 'home';
  let activeCategoryId = null;
  let activeRecipeId = null;
  let activeFilterTag = 'all';
  let inboxMessages = [];
  let checkedIngredients = JSON.parse(localStorage.getItem('nham_checked_ingredients') || '{}');

  // Working state for active recipe photo editor
  let editingRecipePhotos = [];

  // DOM Elements
  const appContainer = document.getElementById('app-container');
  const toastEl = document.getElementById('app-toast');
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const editToggleBtn = document.getElementById('edit-toggle-btn');
  const editModeBanner = document.getElementById('edit-mode-banner');
  const editModal = document.getElementById('edit-modal');
  const editModalTitle = document.getElementById('edit-modal-title');
  const editModalBody = document.getElementById('edit-modal-body');
  const editModalFooter = document.getElementById('edit-modal-footer');
  const searchTriggerBtn = document.getElementById('search-trigger-btn');
  const inboxHeaderBtn = document.getElementById('inbox-header-btn');
  const headerBrand = document.getElementById('header-brand');
  const navHomeBtn = document.getElementById('nav-home-btn');
  const navSearchBtn = document.getElementById('nav-search-btn');
  const navInboxBtn = document.getElementById('nav-inbox-btn');
  const inboxBadgeEl = document.getElementById('inbox-badge');
  const navInboxBadgeEl = document.getElementById('nav-inbox-badge');

  // Localization helper
  function t(obj) {
    if (!obj) return '';
    return obj[currentLang] || obj.kh || obj.en || '';
  }

  // Toast Notification
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    setTimeout(() => {
      toastEl.classList.remove('visible');
    }, 2400);
  }

  // Universal Icon Renderer Helper
  function renderIcon(iconKey) {
    if (window.renderIcon) {
      return window.renderIcon(iconKey);
    }
    if (!iconKey || iconKey === 'none') return '';
    return window.DRAWING_ICONS && window.DRAWING_ICONS[iconKey] ? window.DRAWING_ICONS[iconKey] : iconKey;
  }

  // YouTube Video Embed URL Helper
  function getYouTubeEmbedUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;
    let videoId = null;
    const match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (match && match[1]) {
      videoId = match[1];
    }
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    return null;
  }

  // Load Data from Server API or Static JSON
  async function loadAppData() {
    // 1. Check local storage cache for edits
    const localSaved = localStorage.getItem('nham_app_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (parsed && parsed.recipes) appData = parsed;
      } catch (e) {}
    }

    // 2. Fetch from dynamic API or static data.json
    try {
      let res = await fetch('/api/data');
      if (!res.ok) {
        res = await fetch('/data.json');
      }
      if (res.ok) {
        const remoteData = await res.json();
        if (remoteData && remoteData.recipes) {
          appData = remoteData;
        }
      }
    } catch (e) {
      console.warn('Using local dataset');
    }
    render();
  }

  // Save Data to Server API & LocalStorage
  async function persistAppData() {
    try {
      localStorage.setItem('nham_app_data', JSON.stringify(appData));
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });
      showToast(currentLang === 'kh' ? 'បានរក្សាទុកការកែប្រែដោយជោគជ័យ!' : 'Changes saved successfully!');
    } catch (e) {
      showToast(currentLang === 'kh' ? 'បានរក្សាទុកក្នុងឧបករណ៍របស់អ្នក!' : 'Saved in your device storage!');
    }
  }

  // Load Inbox
  async function loadInbox() {
    try {
      let res = await fetch('/api/inbox');
      if (!res.ok) {
        res = await fetch('/inbox.json');
      }
      if (res.ok) {
        inboxMessages = await res.json();
      } else {
        inboxMessages = [...(appData.inboxInitial || [])];
      }
    } catch (e) {
      inboxMessages = [...(appData.inboxInitial || [])];
    }
    updateInboxBadges();
  }

  function updateInboxBadges() {
    const unreadCount = inboxMessages.filter(m => m.unread).length;
    if (inboxBadgeEl) {
      inboxBadgeEl.textContent = unreadCount;
      inboxBadgeEl.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    if (navInboxBadgeEl) {
      navInboxBadgeEl.textContent = unreadCount;
      navInboxBadgeEl.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
  }

  // Update Header & Edit Controls
  function updateHeader() {
    const flagSpan = langToggleBtn.querySelector('.lang-flag');
    const labelSpan = langToggleBtn.querySelector('.lang-label');
    if (currentLang === 'kh') {
      flagSpan.textContent = '🇰🇭';
      labelSpan.textContent = 'ខ្មែរ';
    } else {
      flagSpan.textContent = '🇬🇧';
      labelSpan.textContent = 'EN';
    }

    document.getElementById('brand-title').textContent = t(appData.app.name);
    document.getElementById('brand-sub').textContent = currentLang === 'kh' ? 'សម្រាប់និស្សិត' : 'Student Cooking';

    // Handle App Logo Image Visibility (Allows deducing / removing logo)
    const brandLogoImg = document.querySelector('.brand-logo-img');
    if (brandLogoImg) {
      if (appData.app.logo && appData.app.logo !== 'none') {
        brandLogoImg.src = appData.app.logo;
        brandLogoImg.style.display = 'block';
      } else {
        brandLogoImg.style.display = 'none';
      }
    }

    // Update Bottom Nav
    document.getElementById('nav-home-label').textContent = t(appData.uiText.homeNav);
    document.getElementById('nav-search-label').textContent = t(appData.uiText.searchNav);
    document.getElementById('nav-inbox-label').textContent = t(appData.uiText.inboxNav);

    // Update Edit Mode Button
    editToggleBtn.classList.toggle('active', isEditMode);
    document.getElementById('edit-toggle-label').textContent = isEditMode 
      ? (currentLang === 'kh' ? 'កែរួច' : 'Done')
      : (currentLang === 'kh' ? 'កែប្រែ' : 'Edit');

    editModeBanner.style.display = isEditMode ? 'flex' : 'none';
  }

  // Navigation
  function navigateTo(view, params = {}) {
    currentView = view;
    if (params.categoryId) activeCategoryId = params.categoryId;
    if (params.recipeId) activeRecipeId = params.recipeId;
    if (params.filterTag) activeFilterTag = params.filterTag;

    navHomeBtn.classList.toggle('active', view === 'home' || view === 'category' || view === 'recipe');
    navSearchBtn.classList.toggle('active', view === 'search');
    navInboxBtn.classList.toggle('active', view === 'inbox');

    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- RENDERING VIEWS ---

  // 1. Home View
  function renderHome() {
    const categoriesHtml = appData.categories.map(cat => {
      const cardClass = cat.color === 'red' ? 'card-red' : cat.color === 'yellow' ? 'card-yellow' : 'card-green';
      const sampleRecipes = appData.recipes.filter(r => r.categoryId === cat.id);

      const editCatBtn = isEditMode ? `
        <div style="display:flex; gap:6px; margin: 4px 0;" onclick="event.stopPropagation();">
          <button class="edit-btn-inline" onclick="window.nhamApp.editCategory('${cat.id}')">
            ✏️ ${currentLang === 'kh' ? 'កែអត្ថបទ & រូបតំណាង' : 'Edit Info & Icon'}
          </button>
        </div>
      ` : '';

      const renderedIconSvg = renderIcon(cat.iconSvg);
      const iconBoxHtml = (cat.iconSvg && cat.iconSvg !== 'none') ? `
        <div class="card-icon-doodle">
          ${renderedIconSvg}
        </div>
      ` : (isEditMode ? `<div class="card-icon-doodle" style="border:1px dashed #999; border-radius:50%; font-size:0.7rem; color:#999; display:flex; align-items:center; justify-content:center;">No Icon</div>` : '');

      return `
        <div class="option-card ${cardClass}" onclick="window.nhamApp.openCategory('${cat.id}')">
          <div class="card-top">
            <span class="card-badge">${t(cat.badge)}</span>
            ${iconBoxHtml}
          </div>
          ${editCatBtn}
          <h3 class="card-title">${t(cat.title)}</h3>
          <div class="card-tagline">${t(cat.tagline)}</div>
          <p class="card-desc">${t(cat.description)}</p>
          <div class="card-action-bar">
            <span class="card-sample-count">
              ${DRAWING_ICONS.chefHat}
              ${sampleRecipes.length} ${currentLang === 'kh' ? 'មុខម្ហូបគំរូ' : 'sample dishes'}
            </span>
            <button class="card-btn">
              ${t(appData.uiText.viewRecipesBtn)} →
            </button>
          </div>
        </div>
      `;
    }).join('');

    const editHeaderBtn = isEditMode ? `
      <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:6px;">
        <button class="edit-btn-inline" onclick="window.nhamApp.editAppInfo()">
          ✏️ ${currentLang === 'kh' ? 'កែចំណងជើង & រូបភាព App' : 'Edit App Info & Pictures'}
        </button>
      </div>
    ` : '';

    // Hero Picture Box (Rendered if not deduced/removed)
    const heroPicHtml = (appData.app.heroArtwork && appData.app.heroArtwork !== 'none') ? `
      <div class="hero-avatar-box">
        <img src="${appData.app.heroArtwork}" alt="Student Cooking" onerror="this.src='/samples/nham_ey_ke_logo.png'" />
      </div>
    ` : (isEditMode ? `
      <div class="hero-avatar-box" style="display:flex; align-items:center; justify-content:center; border:2px dashed var(--color-border); cursor:pointer;" onclick="window.nhamApp.editAppInfo()">
        <span style="font-size:0.7rem; font-weight:800; text-align:center;">+ Add Hero Pic</span>
      </div>
    ` : '');

    const addNewRecipeGlobal = isEditMode ? `
      <div class="add-recipe-card-btn" onclick="window.nhamApp.openNewRecipeModal()">
        ➕ ${currentLang === 'kh' ? 'បន្ថែមមុខម្ហូបថ្មី (Add New Recipe)' : '+ Add New Recipe'}
      </div>
    ` : '';

    return `
      <!-- Hero Banner -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <span class="hero-tag">🎓 ${currentLang === 'kh' ? 'សម្រាប់និស្សិតសាកលវិទ្យាល័យ' : 'For University Students'}</span>
            <h1 class="hero-title">${t(appData.app.subtitle)}</h1>
            <p class="hero-tagline">${t(appData.app.tagline)}</p>
            ${editHeaderBtn}
          </div>
          ${heroPicHtml}
        </div>
      </section>

      <!-- Search Trigger -->
      <div class="search-trigger-bar" onclick="window.nhamApp.openSearchModal()">
        ${DRAWING_ICONS.search}
        <span class="search-trigger-text">${t(appData.uiText.searchPlaceholder)}</span>
      </div>

      <!-- Section Title for 3 Big Options -->
      <div class="section-header">
        <h2 class="section-title">
          ${t(appData.uiText.threeOptionsTitle)}
        </h2>
      </div>

      <!-- 3 Main Interactive Option Cards -->
      <div class="options-grid">
        ${categoriesHtml}
        ${addNewRecipeGlobal}
      </div>

      <!-- Student Tip Banner -->
      <div class="student-tip-banner">
        <div class="tip-banner-icon">💡</div>
        <div>
          <div class="tip-banner-title">
            ${currentLang === 'kh' ? 'ដឹងទេ? ធ្វើម្ហូបខ្លួនឯងចំណេញច្រើន!' : 'Did You Know? Cooking Saves 60%!'}
          </div>
          <div class="tip-banner-text">
            ${currentLang === 'kh' 
              ? 'ការធ្វើម្ហូបក្នុងបន្ទប់ជួលចំណាយត្រឹមតែ ~$1.20 ក្នុងមួយពេល ខណៈពេលទិញញ៉ាំក្រៅអស់លើស $2.50!'
              : 'Cooking in your dorm room averages just ~$1.20 per meal compared to $2.50+ on takeout!'}
          </div>
        </div>
      </div>
    `;
  }

  // 2. Category Hub View
  function renderCategory() {
    const category = appData.categories.find(c => c.id === activeCategoryId);
    if (!category) return renderHome();

    let recipes = appData.recipes.filter(r => r.categoryId === activeCategoryId);

    if (activeFilterTag === 'quick') {
      recipes = recipes.filter(r => (r.cookTime.en || '').includes('10') || (r.cookTime.en || '').includes('8') || (r.cookTime.en || '').includes('12'));
    } else if (activeFilterTag === 'cheap') {
      recipes = recipes.filter(r => (r.cost.en || '').includes('$1') || (r.cost.en || '').includes('$0'));
    } else if (activeFilterTag === 'cooker') {
      recipes = recipes.filter(r => (r.equipment.en || '').toLowerCase().includes('cooker') || (r.equipment.en || '').toLowerCase().includes('pot'));
    }

    const headerThemeClass = category.color === 'red' ? 'cat-red' : category.color === 'yellow' ? 'cat-yellow' : 'cat-green';
    const catIconSvg = renderIcon(category.iconSvg);

    const recipesListHtml = recipes.map(recipe => {
      const editButtons = isEditMode ? `
        <div style="display:flex; gap:6px; margin-top:8px;" onclick="event.stopPropagation()">
          <button class="edit-btn-inline" onclick="window.nhamApp.editRecipe('${recipe.id}')">
            ✏️ ${currentLang === 'kh' ? 'កែមុខម្ហូប & រូបភាព' : 'Edit Recipe & Photos'}
          </button>
          <button class="edit-btn-inline" style="color:var(--color-red);" onclick="window.nhamApp.deleteRecipe('${recipe.id}')">
            🗑️ ${currentLang === 'kh' ? 'លុប' : 'Delete'}
          </button>
        </div>
      ` : '';

      return `
        <div class="recipe-item-card" onclick="window.nhamApp.openRecipe('${recipe.id}')">
          <div class="recipe-card-media">
            <img src="${recipe.image}" alt="${t(recipe.title)}" onerror="this.src='/samples/recipe_quick_bites.jpg'" />
            <span class="recipe-tag-badge">${t(recipe.difficulty)}</span>
            <span class="recipe-price-badge">${t(recipe.cost)}</span>
          </div>
          <div class="recipe-card-body">
            <h3 class="recipe-card-title">${t(recipe.title)}</h3>
            <p class="recipe-card-desc">${t(recipe.shortDesc)}</p>
            ${editButtons}
            <div class="recipe-meta-row">
              <span class="meta-item">
                ${DRAWING_ICONS.clock} ${t(recipe.cookTime)}
              </span>
              <span class="meta-item">
                ${DRAWING_ICONS.skillet} ${t(recipe.equipment)}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const addRecipeInCatBtn = isEditMode ? `
      <div class="add-recipe-card-btn" onclick="window.nhamApp.openNewRecipeModal('${category.id}')">
        ➕ ${currentLang === 'kh' ? `បន្ថែមមុខម្ហូបក្នុង ${t(category.title)}` : `+ Add Recipe to ${t(category.title)}`}
      </div>
    ` : '';

    return `
      <div class="page-top-nav">
        <button class="back-btn" onclick="window.nhamApp.goHome()">
          ${DRAWING_ICONS.arrowLeft} ${t(appData.uiText.backToHome)}
        </button>
        <span class="card-badge" style="background:var(--color-${category.color}); color: ${category.color === 'yellow' ? '#1B1E23' : '#FFF'}">
          ${t(category.badge)}
        </span>
      </div>

      <div class="category-header-box ${headerThemeClass}">
        <div class="cat-header-top">
          ${catIconSvg ? `<div class="card-icon-doodle">${catIconSvg}</div>` : ''}
          <div>
            <h2 class="cat-header-title">${t(category.title)}</h2>
            <div style="font-size:0.78rem; font-weight:700; color:var(--color-muted);">
              ${t(category.tagline)}
            </div>
          </div>
        </div>
        <p class="cat-header-desc">${t(category.description)}</p>
      </div>

      <div class="filter-chips-bar">
        <button class="filter-chip ${activeFilterTag === 'all' ? 'active' : ''}" onclick="window.nhamApp.setFilter('all')">
          ${t(appData.uiText.filterAll)}
        </button>
        <button class="filter-chip ${activeFilterTag === 'quick' ? 'active' : ''}" onclick="window.nhamApp.setFilter('quick')">
          ⚡ ${t(appData.uiText.filterQuick)}
        </button>
        <button class="filter-chip ${activeFilterTag === 'cheap' ? 'active' : ''}" onclick="window.nhamApp.setFilter('cheap')">
          💰 ${t(appData.uiText.filterCheap)}
        </button>
        <button class="filter-chip ${activeFilterTag === 'cooker' ? 'active' : ''}" onclick="window.nhamApp.setFilter('cooker')">
          🍚 ${t(appData.uiText.filterRiceCooker)}
        </button>
      </div>

      <div class="recipes-list">
        ${recipesListHtml}
        ${addRecipeInCatBtn}
      </div>
    `;
  }

  // 3. Detail Subpage View
  function renderRecipe() {
    const recipe = appData.recipes.find(r => r.id === activeRecipeId);
    if (!recipe) return renderHome();

    // Ensure gallery has at least the main image
    const gallery = (recipe.gallery && recipe.gallery.length > 0) ? recipe.gallery : [recipe.image];

    const galleryHtml = gallery.map(imgSrc => `
      <img class="gallery-thumb" src="${imgSrc}" onclick="window.nhamApp.swapMainPhoto('${imgSrc}')" alt="Sample photo" onerror="this.src='/samples/recipe_quick_bites.jpg'" />
    `).join('');

    const ingredientsHtml = (recipe.ingredients || []).map((item, idx) => {
      const key = `${recipe.id}_ing_${idx}`;
      const isChecked = !!checkedIngredients[key];
      return `
        <div class="checklist-item ${isChecked ? 'checked' : ''}" onclick="window.nhamApp.toggleIngredient('${key}', this)">
          <div class="custom-checkbox">
            ${DRAWING_ICONS.check}
          </div>
          <span class="ingredient-text">${t(item)}</span>
        </div>
      `;
    }).join('');

    const stepsHtml = (recipe.steps || []).map(step => `
      <div class="step-item-card">
        <div class="step-number">${step.num}</div>
        <div class="step-content">${t(step)}</div>
      </div>
    `).join('');

    // YouTube Video section
    const ytEmbedUrl = getYouTubeEmbedUrl(recipe.youtubeUrl);
    const videoSectionHtml = ytEmbedUrl ? `
      <div class="video-section">
        <div class="section-header" style="padding: 10px 0;">
          <h3 class="section-title">
            🎥 ${currentLang === 'kh' ? 'វីដេអូបង្រៀនធ្វើម្ហូប (YouTube)' : 'Cooking Video Tutorial'}
          </h3>
        </div>
        <div class="video-responsive-wrap">
          <iframe src="${ytEmbedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    ` : '';

    const editRecipeBanner = isEditMode ? `
      <div style="margin-bottom:12px; display:flex; flex-wrap:wrap; gap:8px;">
        <button class="edit-btn-inline" style="background:var(--color-yellow); font-size:0.75rem; padding:6px 12px;" onclick="window.nhamApp.editRecipe('${recipe.id}')">
          ✏️ ${currentLang === 'kh' ? 'កែមុខម្ហូប & គ្រឿងផ្សំ' : 'Edit Recipe & Ingredients'}
        </button>
        <button class="edit-btn-inline" style="background:var(--color-cream-dark); font-size:0.75rem; padding:6px 12px;" onclick="window.nhamApp.openPhotoManagerForRecipe('${recipe.id}')">
          🖼️ ${currentLang === 'kh' ? 'គ្រប់គ្រងរូបភាព (+ថែម/លុប)' : 'Manage Photos (+Add/Remove)'}
        </button>
        <button class="edit-btn-inline" style="color:var(--color-red); font-size:0.75rem; padding:6px 12px;" onclick="window.nhamApp.deleteRecipe('${recipe.id}')">
          🗑️ ${currentLang === 'kh' ? 'លុបមុខម្ហូប' : 'Delete'}
        </button>
      </div>
    ` : '';

    return `
      <div class="recipe-detail-page">
        <div class="detail-hero-media">
          <button class="detail-floating-back" onclick="window.nhamApp.backToCategory('${recipe.categoryId}')">
            ${DRAWING_ICONS.arrowLeft}
          </button>
          <img id="detail-main-img" src="${recipe.image}" alt="${t(recipe.title)}" onerror="this.src='/samples/recipe_quick_bites.jpg'" />
        </div>

        <div class="detail-body-container">
          ${editRecipeBanner}
          <div class="detail-title-wrap">
            <span class="card-badge" style="background:var(--color-yellow); color:#1B1E23; margin-bottom:8px;">
              ${t(recipe.difficulty)}
            </span>
            <h1 class="detail-title">${t(recipe.title)}</h1>
            <p class="detail-desc">${t(recipe.shortDesc)}</p>
          </div>

          <div class="detail-stat-grid">
            <div class="stat-pill">
              <div class="stat-label">${currentLang === 'kh' ? 'តម្លៃប្រមាណ' : 'Est. Budget'}</div>
              <div class="stat-val" style="color:var(--color-red);">${t(recipe.cost)}</div>
            </div>
            <div class="stat-pill">
              <div class="stat-label">${currentLang === 'kh' ? 'រយៈពេល' : 'Cook Time'}</div>
              <div class="stat-val">${t(recipe.cookTime)}</div>
            </div>
            <div class="stat-pill">
              <div class="stat-label">${currentLang === 'kh' ? 'បរិមាណ' : 'Portion'}</div>
              <div class="stat-val">${t(recipe.servings)}</div>
            </div>
          </div>

          <div class="detail-hack-card">
            <div class="hack-header">
              ${DRAWING_ICONS.mortar}
              ${t(appData.uiText.studentHackTitle)}
            </div>
            <div class="hack-text">${t(recipe.studentTip)}</div>
          </div>

          <div class="gallery-section">
            <div class="gallery-title" style="display:flex; justify-content:space-between; align-items:center;">
              <span>📸 ${currentLang === 'kh' ? 'រូបភាពគំរូ និងសកម្មភាព' : 'Sample Photos & Gallery'}</span>
              ${isEditMode ? `
                <button class="edit-btn-inline" onclick="window.nhamApp.openPhotoManagerForRecipe('${recipe.id}')">
                  🖼️ ${currentLang === 'kh' ? 'កែសម្រួលរូបភាព' : 'Edit Photos'}
                </button>
              ` : ''}
            </div>
            <div class="gallery-strip">
              ${galleryHtml}
            </div>
          </div>

          <div class="checklist-section">
            <div class="section-header" style="padding: 10px 0;">
              <h3 class="section-title">
                🛒 ${t(appData.uiText.ingredientsTitle)}
              </h3>
            </div>
            <div style="font-size:0.74rem; color:var(--color-muted); margin-bottom:10px;">
              ${currentLang === 'kh' ? 'ចុចលើគ្រឿងផ្សំដើម្បីគូសចំណាំពេលដើរផ្សារ' : 'Tap items to tick them off while shopping at the market'}
            </div>
            ${ingredientsHtml}
          </div>

          <div class="steps-section">
            <div class="section-header" style="padding: 10px 0;">
              <h3 class="section-title">
                🍳 ${t(appData.uiText.stepsTitle)}
              </h3>
            </div>
            ${stepsHtml}
          </div>

          <!-- YouTube Video Tutorial -->
          ${videoSectionHtml}

          <div style="display:flex; gap:10px; margin: 24px 0 10px;">
            <button class="back-btn" style="flex:1; justify-content:center; padding:12px;" onclick="window.nhamApp.shareRecipe('${t(recipe.title)}')">
              ${DRAWING_ICONS.share} ${currentLang === 'kh' ? 'ចែករំលែកទៅមិត្តភក្តិ' : 'Share with Friends'}
            </button>
            <button class="back-btn" style="background:var(--color-yellow); justify-content:center; padding:12px;" onclick="window.nhamApp.bookmarkRecipe('${t(recipe.title)}')">
              ${DRAWING_ICONS.bookmark} ${currentLang === 'kh' ? 'រក្សាទុក' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Inbox View
  function renderInbox() {
    const messagesHtml = inboxMessages.map(msg => {
      return `
        <div class="inbox-item-card ${msg.unread ? 'unread' : ''}" onclick="window.nhamApp.toggleInboxDetail('${msg.id}')">
          <div class="inbox-top">
            <div class="inbox-sender-wrap">
              <div class="inbox-avatar" style="background:${msg.avatarColor || '#E63946'}">
                ${(msg.sender || 'U').charAt(0)}
              </div>
              <div class="inbox-sender-name">${msg.sender}</div>
            </div>
            <div class="inbox-date">${msg.date}</div>
          </div>
          <div class="inbox-subject">${t(msg.subject)}</div>
          <div class="inbox-preview" id="preview-${msg.id}">${t(msg.preview)}</div>
          <div class="inbox-body" id="body-${msg.id}" style="display:none; margin-top:8px; font-size:0.78rem; line-height:1.45; color:#23272F; border-top:1px dashed #D6CFBA; padding-top:8px;">
            ${t(msg.body)}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="inbox-page-header">
        <h2 class="inbox-header-title">
          ✉️ ${currentLang === 'kh' ? 'ប្រអប់សារនិស្សិត' : 'Student Cooking Inbox'}
        </h2>
        <p class="inbox-header-desc">
          ${currentLang === 'kh' 
            ? 'គន្លឹះធ្វើម្ហូបពីសិស្សច្បង និងកន្លែងសួរសំណួរ/ស្នើសុំមុខម្ហូបថ្មីៗ' 
            : 'Tips from seniors and direct line to ask questions or request dishes'}
        </p>
      </div>

      <div class="inbox-list">
        ${messagesHtml}
      </div>

      <div class="inbox-compose-box">
        <h3 class="compose-title">
          ✍️ ${t(appData.uiText.sendQuestionTitle)}
        </h3>
        <input type="text" id="compose-name" class="compose-input" placeholder="${t(appData.uiText.yourNamePlaceholder)}" />
        <textarea id="compose-msg" class="compose-input" placeholder="${t(appData.uiText.yourMessagePlaceholder)}"></textarea>
        <button class="compose-btn" onclick="window.nhamApp.submitInboxQuestion()">
          ${t(appData.uiText.sendBtn)} 🚀
        </button>
      </div>
    `;
  }

  // Master Render
  function render() {
    updateHeader();
    let content = '';
    switch(currentView) {
      case 'category':
        content = renderCategory();
        break;
      case 'recipe':
        content = renderRecipe();
        break;
      case 'inbox':
        content = renderInbox();
        break;
      case 'home':
      default:
        content = renderHome();
        break;
    }
    appContainer.innerHTML = content;
  }

  // --- SEARCH ENGINE ---
  function openSearchModal() {
    searchModal.classList.add('active');
    searchInput.placeholder = t(appData.uiText.searchPlaceholder);
    searchInput.value = '';
    searchInput.focus();
    renderSearchResults('');
  }

  function closeSearchModal() {
    searchModal.classList.remove('active');
  }

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    let filtered = appData.recipes;

    if (q) {
      filtered = filtered.filter(recipe => {
        const titleKh = (recipe.title.kh || '').toLowerCase();
        const titleEn = (recipe.title.en || '').toLowerCase();
        const descKh = (recipe.shortDesc.kh || '').toLowerCase();
        const descEn = (recipe.shortDesc.en || '').toLowerCase();
        const tagMatch = (recipe.tags || []).some(tag => tag.toLowerCase().includes(q));
        const ingMatch = (recipe.ingredients || []).some(i => (i.kh || '').toLowerCase().includes(q) || (i.en || '').toLowerCase().includes(q));

        return titleKh.includes(q) || titleEn.includes(q) || descKh.includes(q) || descEn.includes(q) || tagMatch || ingMatch;
      });
    }

    if (filtered.length === 0) {
      searchResults.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color:var(--color-muted);">
          <div style="font-size:2rem; margin-bottom:8px;">🍲</div>
          <div style="font-weight:700;">${t(appData.uiText.noResults)}</div>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = filtered.map(r => `
      <div class="recipe-item-card" onclick="window.nhamApp.openFromSearch('${r.id}')">
        <div style="display:flex; gap:12px; padding:10px;">
          <img src="${r.image}" style="width:75px; height:75px; border-radius:10px; object-fit:cover; border:1.5px solid var(--color-border);" onerror="this.src='/samples/recipe_quick_bites.jpg'" />
          <div style="flex:1;">
            <div style="font-size:0.65rem; font-weight:800; color:var(--color-red);">${t(r.cost)} • ${t(r.cookTime)}</div>
            <div style="font-size:0.95rem; font-weight:800; line-height:1.2; margin:2px 0 4px;">${t(r.title)}</div>
            <div style="font-size:0.72rem; color:var(--color-muted); line-height:1.3;">${t(r.shortDesc)}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- MODAL DIALOG ENGINE ---
  function openEditModal(title, bodyHtml, footerHtml) {
    editModalTitle.textContent = title;
    editModalBody.innerHTML = bodyHtml;
    editModalFooter.innerHTML = footerHtml;
    editModal.classList.add('active');
  }

  function closeEditModal() {
    editModal.classList.remove('active');
  }

  // --- ICON PICKER COMPONENT GENERATOR ---
  function generateIconPickerHtml(currentIconKey, targetInputId) {
    const drawingKeys = ['skillet', 'pot', 'heart-pot', 'bowl', 'fish', 'egg', 'veggies', 'rice', 'fire', 'mortar', 'chefHat', 'clock'];
    const emojiList = ['🍳', '🍲', '🍜', '🥗', '🍚', '🌶️', '🐟', '🥩', '👩‍🍳', '🥢', '🥟', '🧄'];

    const drawingItemsHtml = drawingKeys.map(k => `
      <div class="icon-picker-item ${currentIconKey === k ? 'selected' : ''}" onclick="window.nhamApp.selectIconPickerItem('${k}', '${targetInputId}', this)" title="${k}">
        ${renderIcon(k)}
      </div>
    `).join('');

    const emojiItemsHtml = emojiList.map(em => `
      <div class="icon-picker-item ${currentIconKey === em ? 'selected' : ''}" onclick="window.nhamApp.selectIconPickerItem('${em}', '${targetInputId}', this)" title="${em}">
        ${em}
      </div>
    `).join('');

    return `
      <div class="icon-picker-container">
        <div style="font-size:0.72rem; font-weight:800; color:var(--color-muted);">
          ${currentLang === 'kh' ? 'ជ្រើសរើសរូបតំណាងគំនូរ (Drawing Icons)' : 'Choose Hand-Drawn Icon:'}
        </div>
        <div class="icon-picker-grid">
          ${drawingItemsHtml}
        </div>

        <div style="font-size:0.72rem; font-weight:800; color:var(--color-muted); margin-top:6px;">
          ${currentLang === 'kh' ? 'ឬជ្រើសរើស Emoji ម្ហូបអាហារ' : 'Or Choose Food Emoji:'}
        </div>
        <div class="icon-picker-grid">
          ${emojiItemsHtml}
        </div>

        <div style="margin-top:6px;">
          <label class="edit-label">${currentLang === 'kh' ? 'រូបតំណាងបច្ចុប្បន្ន / ឬវាយ Emoji ផ្ទាល់ខ្លួន' : 'Selected Icon Key or Custom Emoji / SVG:'}</label>
          <input type="text" id="${targetInputId}" class="edit-input" value="${currentIconKey || ''}" placeholder="skillet, pot, 🍳, or SVG..." oninput="window.nhamApp.updateIconPreview(this.value, '${targetInputId}-preview')" />
        </div>

        <div class="icon-picker-actions">
          <button type="button" class="btn-icon-action btn-icon-deduce" onclick="window.nhamApp.deduceIcon('${targetInputId}')">
            ❌ ${currentLang === 'kh' ? 'ដករូបតំណាងចេញ (Deduce / Remove Icon)' : 'Deduce / Remove Icon'}
          </button>
          <div id="${targetInputId}-preview" style="width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border:1px solid #ccc; border-radius:8px;">
            ${renderIcon(currentIconKey)}
          </div>
        </div>
      </div>
    `;
  }

  // --- PHOTO GALLERY MANAGER COMPONENT GENERATOR ---
  function generatePhotoManagerHtml(photos, mainPhoto) {
    editingRecipePhotos = [...photos];
    if (!editingRecipePhotos.includes(mainPhoto) && mainPhoto) {
      editingRecipePhotos.unshift(mainPhoto);
    }

    const itemsHtml = editingRecipePhotos.map((imgSrc, idx) => {
      const isCover = imgSrc === mainPhoto;
      return `
        <div class="photo-manager-item" id="photo-box-${idx}">
          <img src="${imgSrc}" onerror="this.src='/samples/recipe_quick_bites.jpg'" />
          ${isCover ? `<span class="photo-badge-cover">★ Cover</span>` : `
            <button type="button" class="photo-set-cover-btn" onclick="window.nhamApp.setAsCoverPhoto('${imgSrc}')">
              Set Cover
            </button>
          `}
          <button type="button" class="photo-delete-btn" onclick="window.nhamApp.deduceRecipePhoto(${idx})" title="Deduce / Remove this picture">
            ✕
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="photo-manager-box">
        <div style="font-size:0.75rem; font-weight:800; color:var(--color-ink); display:flex; justify-content:space-between; align-items:center;">
          <span>📸 ${currentLang === 'kh' ? 'រូបភាពមុខម្ហូប (ចុច ✕ ដើម្បីដករូបចេញ)' : 'Recipe Pictures (Click ✕ to Deduce/Remove)'}</span>
          <span style="font-size:0.7rem; color:var(--color-muted);">${editingRecipePhotos.length} photos</span>
        </div>

        <div class="photo-manager-grid" id="photo-manager-grid">
          ${itemsHtml}
          <!-- Add Photo Card Trigger -->
          <label class="photo-add-trigger">
            <span style="font-size:1.2rem;">➕</span>
            <span>Upload Photo</span>
            <input type="file" accept="image/*" style="display:none;" onchange="window.nhamApp.uploadPhotoToRecipe(this)" />
          </label>
        </div>

        <!-- Add Photo via URL -->
        <div style="display:flex; gap:6px; margin-top:4px;">
          <input type="text" id="add-photo-url-input" class="edit-input" style="flex:1; padding:6px 10px;" placeholder="Or paste image URL (https://... or /samples/...)" />
          <button type="button" class="btn-icon-action" onclick="window.nhamApp.addPhotoViaUrl()">
            ➕ Add URL
          </button>
        </div>
      </div>
    `;
  }

  // --- EDIT APP INFO (BRANDING, LOGO & HERO PICTURE) ---
  function editAppInfo() {
    const currentLogo = appData.app.logo || '';
    const currentHero = appData.app.heroArtwork || '';

    const bodyHtml = `
      <div class="edit-field-group">
        <label class="edit-label">App Title (Khmer)</label>
        <input type="text" id="edit-app-name-kh" class="edit-input" value="${appData.app.name.kh || ''}" />
      </div>
      <div class="edit-field-group">
        <label class="edit-label">App Title (English)</label>
        <input type="text" id="edit-app-name-en" class="edit-input" value="${appData.app.name.en || ''}" />
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Subtitle (Khmer)</label>
        <input type="text" id="edit-app-sub-kh" class="edit-input" value="${appData.app.subtitle.kh || ''}" />
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Subtitle (English)</label>
        <input type="text" id="edit-app-sub-en" class="edit-input" value="${appData.app.subtitle.en || ''}" />
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Tagline (Khmer)</label>
        <textarea id="edit-app-tagline-kh" class="edit-textarea">${appData.app.tagline.kh || ''}</textarea>
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Tagline (English)</label>
        <textarea id="edit-app-tagline-en" class="edit-textarea">${appData.app.tagline.en || ''}</textarea>
      </div>

      <!-- App Logo Picture Manager (Change, Add, or Deduce) -->
      <div class="photo-manager-box">
        <label class="edit-label">🏷️ App Logo Picture</label>
        <div style="display:flex; align-items:center; gap:12px;">
          <div id="logo-preview-box" style="width:50px; height:50px; border-radius:50%; border:2px solid var(--color-border); overflow:hidden; background:var(--color-yellow); display:flex; align-items:center; justify-content:center;">
            ${(currentLogo && currentLogo !== 'none') ? `<img src="${currentLogo}" style="width:100%; height:100%; object-fit:cover;" />` : `<span style="font-size:0.65rem;">No Logo</span>`}
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
            <input type="text" id="edit-app-logo" class="edit-input" value="${currentLogo}" placeholder="/samples/nham_ey_ke_logo.png" />
            <div style="display:flex; gap:6px;">
              <label class="btn-icon-action" style="cursor:pointer;">
                📁 Upload Logo
                <input type="file" accept="image/*" style="display:none;" onchange="window.nhamApp.uploadAppBrandingPhoto('edit-app-logo', 'logo-preview-box', this)" />
              </label>
              <button type="button" class="btn-icon-action btn-icon-deduce" onclick="window.nhamApp.deduceAppPhoto('edit-app-logo', 'logo-preview-box')">
                ❌ Deduce Logo
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Artwork Picture Manager (Change, Add, or Deduce) -->
      <div class="photo-manager-box">
        <label class="edit-label">🎨 Student Hero Artwork Picture</label>
        <div style="display:flex; align-items:center; gap:12px;">
          <div id="hero-preview-box" style="width:65px; height:65px; border-radius:14px; border:2px solid var(--color-border); overflow:hidden; background:var(--color-white); display:flex; align-items:center; justify-content:center;">
            ${(currentHero && currentHero !== 'none') ? `<img src="${currentHero}" style="width:100%; height:100%; object-fit:cover;" />` : `<span style="font-size:0.65rem; text-align:center;">No Hero Pic</span>`}
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
            <input type="text" id="edit-app-hero" class="edit-input" value="${currentHero}" placeholder="/samples/artwork_character.png" />
            <div style="display:flex; gap:6px;">
              <label class="btn-icon-action" style="cursor:pointer;">
                📁 Upload Hero Picture
                <input type="file" accept="image/*" style="display:none;" onchange="window.nhamApp.uploadAppBrandingPhoto('edit-app-hero', 'hero-preview-box', this)" />
              </label>
              <button type="button" class="btn-icon-action btn-icon-deduce" onclick="window.nhamApp.deduceAppPhoto('edit-app-hero', 'hero-preview-box')">
                ❌ Deduce Picture
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn-save" onclick="window.nhamApp.saveAppInfo()">💾 Save App Info & Pictures</button>
    `;

    openEditModal('✏️ Edit App Header, Logo & Pictures', bodyHtml, footerHtml);
  }

  function saveAppInfo() {
    appData.app.name.kh = document.getElementById('edit-app-name-kh').value.trim();
    appData.app.name.en = document.getElementById('edit-app-name-en').value.trim();
    appData.app.subtitle.kh = document.getElementById('edit-app-sub-kh').value.trim();
    appData.app.subtitle.en = document.getElementById('edit-app-sub-en').value.trim();
    appData.app.tagline.kh = document.getElementById('edit-app-tagline-kh').value.trim();
    appData.app.tagline.en = document.getElementById('edit-app-tagline-en').value.trim();
    appData.app.logo = document.getElementById('edit-app-logo').value.trim();
    appData.app.heroArtwork = document.getElementById('edit-app-hero').value.trim();

    persistAppData();
    closeEditModal();
    render();
  }

  // --- EDIT CATEGORY & ICONS ---
  function editCategory(catId) {
    const cat = appData.categories.find(c => c.id === catId);
    if (!cat) return;

    const iconPickerHtml = generateIconPickerHtml(cat.iconSvg, 'edit-cat-icon');

    const bodyHtml = `
      <div class="edit-field-group">
        <label class="edit-label">Category Title (Khmer)</label>
        <input type="text" id="edit-cat-title-kh" class="edit-input" value="${cat.title.kh || ''}" />
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Category Title (English)</label>
        <input type="text" id="edit-cat-title-en" class="edit-input" value="${cat.title.en || ''}" />
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Tagline (Khmer)</label>
        <input type="text" id="edit-cat-tagline-kh" class="edit-input" value="${cat.tagline.kh || ''}" />
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Tagline (English)</label>
        <input type="text" id="edit-cat-tagline-en" class="edit-input" value="${cat.tagline.en || ''}" />
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Description (Khmer)</label>
        <textarea id="edit-cat-desc-kh" class="edit-textarea">${cat.description.kh || ''}</textarea>
      </div>
      <div class="edit-field-group">
        <label class="edit-label">Description (English)</label>
        <textarea id="edit-cat-desc-en" class="edit-textarea">${cat.description.en || ''}</textarea>
      </div>

      <!-- Icon Customization Picker -->
      <div class="edit-field-group">
        <label class="edit-label">🎨 Category Icon (Change, Add or Deduce)</label>
        ${iconPickerHtml}
      </div>
    `;

    const footerHtml = `
      <button class="btn-save" onclick="window.nhamApp.saveCategory('${cat.id}')">💾 Save Category & Icon</button>
    `;

    openEditModal(`✏️ Edit Category & Icon: ${t(cat.title)}`, bodyHtml, footerHtml);
  }

  function saveCategory(catId) {
    const cat = appData.categories.find(c => c.id === catId);
    if (!cat) return;

    cat.title.kh = document.getElementById('edit-cat-title-kh').value.trim();
    cat.title.en = document.getElementById('edit-cat-title-en').value.trim();
    cat.tagline.kh = document.getElementById('edit-cat-tagline-kh').value.trim();
    cat.tagline.en = document.getElementById('edit-cat-tagline-en').value.trim();
    cat.description.kh = document.getElementById('edit-cat-desc-kh').value.trim();
    cat.description.en = document.getElementById('edit-cat-desc-en').value.trim();
    cat.iconSvg = document.getElementById('edit-cat-icon').value.trim() || 'none';

    persistAppData();
    closeEditModal();
    render();
  }

  // --- EDIT RECIPE & PHOTO GALLERY ---
  function editRecipe(recipeId) {
    const recipe = appData.recipes.find(r => r.id === recipeId) || {
      id: 'custom-' + Date.now(),
      categoryId: activeCategoryId || 'quick-budget',
      title: { kh: '', en: '' },
      shortDesc: { kh: '', en: '' },
      cost: { kh: '~$1.50', en: '~$1.50' },
      cookTime: { kh: '15 នាទី', en: '15 mins' },
      servings: { kh: '1-2 នាក់', en: '1-2 servings' },
      difficulty: { kh: 'ងាយស្រួល', en: 'Easy' },
      equipment: { kh: 'ខ្ទះឆា', en: 'Skillet' },
      studentTip: { kh: '', en: '' },
      image: '/samples/canned_sardines_eggs.jpg',
      gallery: ['/samples/canned_sardines_eggs.jpg'],
      tags: ['Budget', 'Quick'],
      ingredients: [],
      steps: []
    };

    const isNew = !appData.recipes.some(r => r.id === recipe.id);

    // Categories Options
    const catOptionsHtml = appData.categories.map(c => `
      <option value="${c.id}" ${c.id === recipe.categoryId ? 'selected' : ''}>${t(c.badge)} - ${t(c.title)}</option>
    `).join('');

    const ingLinesKh = (recipe.ingredients || []).map(i => i.kh || '').join('\n');
    const ingLinesEn = (recipe.ingredients || []).map(i => i.en || '').join('\n');
    const stepLinesKh = (recipe.steps || []).map(s => s.kh || '').join('\n');
    const stepLinesEn = (recipe.steps || []).map(s => s.en || '').join('\n');

    // Photo Gallery Manager
    const photoManagerHtml = generatePhotoManagerHtml(recipe.gallery || [recipe.image], recipe.image);

    const bodyHtml = `
      <input type="hidden" id="edit-recipe-id" value="${recipe.id}" />
      <input type="hidden" id="edit-recipe-is-new" value="${isNew ? '1' : '0'}" />
      <input type="hidden" id="edit-recipe-cover-image" value="${recipe.image || ''}" />

      <div class="edit-field-group">
        <label class="edit-label">Category (ជម្រើស)</label>
        <select id="edit-recipe-cat" class="edit-select">
          ${catOptionsHtml}
        </select>
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Recipe Title (Khmer)</label>
        <input type="text" id="edit-recipe-title-kh" class="edit-input" value="${recipe.title.kh || ''}" placeholder="ឈ្មោះមុខម្ហូបជាភាសាខ្មែរ..." />
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Recipe Title (English)</label>
        <input type="text" id="edit-recipe-title-en" class="edit-input" value="${recipe.title.en || ''}" placeholder="Dish title in English..." />
      </div>

      <!-- Photo Manager Component: Change, Add, Deduce Pictures -->
      <div class="edit-field-group">
        <label class="edit-label">📸 Photo Gallery & Cover Picture</label>
        ${photoManagerHtml}
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Short Description (Khmer)</label>
        <textarea id="edit-recipe-desc-kh" class="edit-textarea" placeholder="ការពិពណ៌នាខ្លី...">${recipe.shortDesc.kh || ''}</textarea>
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Short Description (English)</label>
        <textarea id="edit-recipe-desc-en" class="edit-textarea" placeholder="Short description...">${recipe.shortDesc.en || ''}</textarea>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
        <div class="edit-field-group">
          <label class="edit-label">Cost / Budget (តម្លៃ)</label>
          <input type="text" id="edit-recipe-cost" class="edit-input" value="${recipe.cost.kh || recipe.cost.en || '~$1.50'}" />
        </div>
        <div class="edit-field-group">
          <label class="edit-label">Cook Time (នាទី)</label>
          <input type="text" id="edit-recipe-time" class="edit-input" value="${recipe.cookTime.kh || recipe.cookTime.en || '15 mins'}" />
        </div>
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Cooking Equipment / Icon Name</label>
        <input type="text" id="edit-recipe-equipment" class="edit-input" value="${recipe.equipment.en || recipe.equipment.kh || 'Skillet'}" placeholder="Skillet, Pot, Rice Cooker, Mortar..." />
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Student Hack / Dorm Tip (Khmer)</label>
        <textarea id="edit-recipe-tip-kh" class="edit-textarea" placeholder="គន្លឹះនិស្សិត...">${recipe.studentTip.kh || ''}</textarea>
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Student Hack / Dorm Tip (English)</label>
        <textarea id="edit-recipe-tip-en" class="edit-textarea" placeholder="Student dorm tip...">${recipe.studentTip.en || ''}</textarea>
      </div>

      <div class="edit-field-group">
        <label class="edit-label">🎥 YouTube Video Tutorial Link (Optional)</label>
        <input type="text" id="edit-recipe-video" class="edit-input" value="${recipe.youtubeUrl || ''}" placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." />
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Ingredients Checklist (1 per line - Khmer)</label>
        <textarea id="edit-recipe-ing-kh" class="edit-textarea" style="min-height:80px;" placeholder="១ បន្ទាត់ = ១ គ្រឿងផ្សំ...">${ingLinesKh}</textarea>
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Ingredients Checklist (1 per line - English)</label>
        <textarea id="edit-recipe-ing-en" class="edit-textarea" style="min-height:80px;" placeholder="1 line = 1 ingredient...">${ingLinesEn}</textarea>
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Cooking Steps (1 per line - Khmer)</label>
        <textarea id="edit-recipe-steps-kh" class="edit-textarea" style="min-height:80px;" placeholder="ជំហានទី ១...\nជំហានទី ២...">${stepLinesKh}</textarea>
      </div>

      <div class="edit-field-group">
        <label class="edit-label">Cooking Steps (1 per line - English)</label>
        <textarea id="edit-recipe-steps-en" class="edit-textarea" style="min-height:80px;" placeholder="Step 1...\nStep 2...">${stepLinesEn}</textarea>
      </div>
    `;

    const footerHtml = `
      <button class="btn-save" onclick="window.nhamApp.saveRecipe()">💾 Save Recipe & Photos</button>
      ${!isNew ? `<button class="btn-delete" onclick="window.nhamApp.deleteRecipe('${recipe.id}')">🗑️ Delete</button>` : ''}
    `;

    openEditModal(isNew ? '➕ Add New Recipe / បន្ថែមមុខម្ហូប' : `✏️ Edit: ${t(recipe.title)}`, bodyHtml, footerHtml);
  }

  function saveRecipe() {
    const id = document.getElementById('edit-recipe-id').value;
    const isNew = document.getElementById('edit-recipe-is-new').value === '1';

    let recipe = appData.recipes.find(r => r.id === id);
    if (!recipe) {
      recipe = { id, tags: ['Student', 'Khmer'] };
      appData.recipes.push(recipe);
    }

    recipe.categoryId = document.getElementById('edit-recipe-cat').value;
    recipe.title = {
      kh: document.getElementById('edit-recipe-title-kh').value.trim() || 'មុខម្ហូបគ្មានចំណងជើង',
      en: document.getElementById('edit-recipe-title-en').value.trim() || 'Untitled Dish'
    };
    recipe.shortDesc = {
      kh: document.getElementById('edit-recipe-desc-kh').value.trim(),
      en: document.getElementById('edit-recipe-desc-en').value.trim()
    };
    const costVal = document.getElementById('edit-recipe-cost').value.trim();
    recipe.cost = { kh: costVal, en: costVal };

    const timeVal = document.getElementById('edit-recipe-time').value.trim();
    recipe.cookTime = { kh: timeVal, en: timeVal };

    recipe.servings = recipe.servings || { kh: '1-2 នាក់', en: '1-2 servings' };
    recipe.difficulty = recipe.difficulty || { kh: 'ងាយស្រួល', en: 'Easy' };

    const equipVal = document.getElementById('edit-recipe-equipment').value.trim();
    recipe.equipment = { kh: equipVal, en: equipVal };

    recipe.studentTip = {
      kh: document.getElementById('edit-recipe-tip-kh').value.trim(),
      en: document.getElementById('edit-recipe-tip-en').value.trim()
    };

    const videoVal = document.getElementById('edit-recipe-video');
    if (videoVal) {
      recipe.youtubeUrl = videoVal.value.trim();
    }

    // Save photos from working list
    recipe.gallery = editingRecipePhotos.length > 0 ? [...editingRecipePhotos] : ['/samples/recipe_quick_bites.jpg'];
    const coverVal = document.getElementById('edit-recipe-cover-image').value.trim();
    recipe.image = (coverVal && recipe.gallery.includes(coverVal)) ? coverVal : recipe.gallery[0];

    // Parse ingredients lines
    const linesKh = document.getElementById('edit-recipe-ing-kh').value.split('\n').map(s => s.trim()).filter(Boolean);
    const linesEn = document.getElementById('edit-recipe-ing-en').value.split('\n').map(s => s.trim()).filter(Boolean);
    const maxIng = Math.max(linesKh.length, linesEn.length);
    recipe.ingredients = [];
    for (let i = 0; i < maxIng; i++) {
      recipe.ingredients.push({
        kh: linesKh[i] || linesEn[i] || '',
        en: linesEn[i] || linesKh[i] || ''
      });
    }

    // Parse steps lines
    const stepsKh = document.getElementById('edit-recipe-steps-kh').value.split('\n').map(s => s.trim()).filter(Boolean);
    const stepsEn = document.getElementById('edit-recipe-steps-en').value.split('\n').map(s => s.trim()).filter(Boolean);
    const maxSteps = Math.max(stepsKh.length, stepsEn.length);
    recipe.steps = [];
    for (let i = 0; i < maxSteps; i++) {
      recipe.steps.push({
        num: i + 1,
        kh: stepsKh[i] || stepsEn[i] || '',
        en: stepsEn[i] || stepsKh[i] || ''
      });
    }

    persistAppData();
    closeEditModal();
    if (currentView === 'recipe' && activeRecipeId === recipe.id) {
      render();
    } else {
      navigateTo('category', { categoryId: recipe.categoryId });
    }
  }

  function deleteRecipe(recipeId) {
    if (!confirm(currentLang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបមុខម្ហូបនេះមែនទេ?' : 'Are you sure you want to delete this recipe?')) {
      return;
    }
    const idx = appData.recipes.findIndex(r => r.id === recipeId);
    if (idx !== -1) {
      const removed = appData.recipes.splice(idx, 1)[0];
      persistAppData();
      closeEditModal();
      if (currentView === 'recipe') {
        navigateTo('category', { categoryId: removed.categoryId });
      } else {
        render();
      }
    }
  }

  // --- PHOTO MANAGEMENT HANDLERS ---
  function openPhotoManagerForRecipe(recipeId) {
    const recipe = appData.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    editingRecipePhotos = (recipe.gallery && recipe.gallery.length > 0) ? [...recipe.gallery] : [recipe.image];
    if (!editingRecipePhotos.includes(recipe.image)) {
      editingRecipePhotos.unshift(recipe.image);
    }

    const refreshManagerModal = () => {
      const photoManagerHtml = generatePhotoManagerHtml(editingRecipePhotos, recipe.image);
      const bodyHtml = `
        <div style="font-size:0.82rem; margin-bottom:10px;">
          ${currentLang === 'kh' ? `គ្រប់គ្រងរូបភាពសម្រាប់ «${t(recipe.title)}»` : `Manage Photos for "${t(recipe.title)}"`}
        </div>
        ${photoManagerHtml}
      `;
      const footerHtml = `
        <button class="btn-save" onclick="window.nhamApp.savePhotoManager('${recipe.id}')">💾 Save Photos</button>
      `;
      openEditModal(`📸 Manage Photos: ${t(recipe.title)}`, bodyHtml, footerHtml);
    };

    refreshManagerModal();
  }

  function savePhotoManager(recipeId) {
    const recipe = appData.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    recipe.gallery = editingRecipePhotos.length > 0 ? [...editingRecipePhotos] : ['/samples/recipe_quick_bites.jpg'];
    if (!recipe.gallery.includes(recipe.image)) {
      recipe.image = recipe.gallery[0];
    }

    persistAppData();
    closeEditModal();
    render();
  }

  function deduceRecipePhoto(photoIndex) {
    if (editingRecipePhotos.length <= 1) {
      if (!confirm(currentLang === 'kh' ? 'នេះជារូបភាពតែមួយគត់! តើអ្នកពិតជាចង់ដករូបនេះចេញមែនទេ?' : 'This is the last photo! Are you sure you want to remove it?')) {
        return;
      }
    }
    editingRecipePhotos.splice(photoIndex, 1);
    // Re-render photo manager
    const coverInput = document.getElementById('edit-recipe-cover-image');
    const currentCover = coverInput ? coverInput.value : '';
    const newCover = editingRecipePhotos.includes(currentCover) ? currentCover : (editingRecipePhotos[0] || '');
    if (coverInput) coverInput.value = newCover;

    const grid = document.getElementById('photo-manager-grid');
    if (grid) {
      grid.parentElement.outerHTML = generatePhotoManagerHtml(editingRecipePhotos, newCover);
    }
    showToast(currentLang === 'kh' ? 'បានដករូបភាពចេញ (Photo deduced)' : 'Photo removed!');
  }

  function setAsCoverPhoto(photoSrc) {
    const coverInput = document.getElementById('edit-recipe-cover-image');
    if (coverInput) coverInput.value = photoSrc;

    // Refresh UI
    const grid = document.getElementById('photo-manager-grid');
    if (grid) {
      grid.parentElement.outerHTML = generatePhotoManagerHtml(editingRecipePhotos, photoSrc);
    }
    showToast(currentLang === 'kh' ? 'បានកំណត់ជារូបភាពចម្បង (Cover photo set)' : 'Set as cover photo!');
  }

  function addPhotoViaUrl() {
    const urlInput = document.getElementById('add-photo-url-input');
    if (!urlInput) return;
    const url = urlInput.value.trim();
    if (!url) return;

    editingRecipePhotos.push(url);
    urlInput.value = '';

    const coverInput = document.getElementById('edit-recipe-cover-image');
    const currentCover = coverInput ? coverInput.value : editingRecipePhotos[0];

    const grid = document.getElementById('photo-manager-grid');
    if (grid) {
      grid.parentElement.outerHTML = generatePhotoManagerHtml(editingRecipePhotos, currentCover);
    }
    showToast(currentLang === 'kh' ? 'បានបន្ថែមរូបភាព!' : 'Photo added!');
  }

  function uploadPhotoToRecipe(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
      const base64 = e.target.result;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64 })
        });
        const data = await res.json();
        if (data.success && data.url) {
          editingRecipePhotos.push(data.url);
          const coverInput = document.getElementById('edit-recipe-cover-image');
          const currentCover = coverInput ? coverInput.value : editingRecipePhotos[0];

          const grid = document.getElementById('photo-manager-grid');
          if (grid) {
            grid.parentElement.outerHTML = generatePhotoManagerHtml(editingRecipePhotos, currentCover);
          }
          showToast(currentLang === 'kh' ? 'បានផ្ទុករូបភាពឡើងជោគជ័យ!' : 'Photo uploaded!');
        } else {
          showToast('Upload failed');
        }
      } catch (err) {
        showToast('Upload error');
      }
    };
    reader.readAsDataURL(file);
  }

  // --- BRANDING PHOTO HANDLERS (LOGO & HERO ARTWORK) ---
  function uploadAppBrandingPhoto(targetInputId, previewBoxId, input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
      const base64 = e.target.result;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64 })
        });
        const data = await res.json();
        if (data.success && data.url) {
          const inputEl = document.getElementById(targetInputId);
          if (inputEl) inputEl.value = data.url;

          const previewEl = document.getElementById(previewBoxId);
          if (previewEl) {
            previewEl.innerHTML = `<img src="${data.url}" style="width:100%; height:100%; object-fit:cover;" />`;
          }
          showToast(currentLang === 'kh' ? 'បានផ្ទុករូបភាពជោគជ័យ!' : 'Photo uploaded!');
        }
      } catch (err) {
        showToast('Upload error');
      }
    };
    reader.readAsDataURL(file);
  }

  function deduceAppPhoto(targetInputId, previewBoxId) {
    const inputEl = document.getElementById(targetInputId);
    if (inputEl) inputEl.value = 'none';

    const previewEl = document.getElementById(previewBoxId);
    if (previewEl) {
      previewEl.innerHTML = `<span style="font-size:0.65rem; color:#999;">Deduce/None</span>`;
    }
    showToast(currentLang === 'kh' ? 'បានដករូបភាពចេញ (Deduce/Hidden)' : 'Picture deduced/removed!');
  }

  // --- ICON PICKER INTERACTION HANDLERS ---
  function selectIconPickerItem(iconKey, targetInputId, el) {
    const input = document.getElementById(targetInputId);
    if (input) input.value = iconKey;

    const parent = el.closest('.icon-picker-container');
    if (parent) {
      parent.querySelectorAll('.icon-picker-item').forEach(item => item.classList.remove('selected'));
      el.classList.add('selected');
    }

    const preview = document.getElementById(`${targetInputId}-preview`);
    if (preview) {
      preview.innerHTML = renderIcon(iconKey);
    }
  }

  function deduceIcon(targetInputId) {
    const input = document.getElementById(targetInputId);
    if (input) input.value = 'none';

    const preview = document.getElementById(`${targetInputId}-preview`);
    if (preview) {
      preview.innerHTML = `<span style="font-size:0.65rem; color:#999;">None</span>`;
    }

    const parent = input.closest('.icon-picker-container');
    if (parent) {
      parent.querySelectorAll('.icon-picker-item').forEach(item => item.classList.remove('selected'));
    }
    showToast(currentLang === 'kh' ? 'បានដករូបតំណាងចេញ (Icon Deduced)' : 'Icon deduced/removed!');
  }

  function updateIconPreview(val, previewId) {
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.innerHTML = renderIcon(val);
    }
  }

  // Event Listeners
  langToggleBtn.addEventListener('click', () => {
    currentLang = currentLang === 'kh' ? 'en' : 'kh';
    localStorage.setItem('nham_lang', currentLang);
    render();
    if (searchModal.classList.contains('active')) {
      renderSearchResults(searchInput.value);
    }
  });

  editToggleBtn.addEventListener('click', () => {
    isEditMode = !isEditMode;
    localStorage.setItem('nham_edit_mode', isEditMode);
    render();
    showToast(isEditMode 
      ? (currentLang === 'kh' ? 'បានបើករបៀបកែសម្រួល (Edit Mode On)!' : 'Edit Mode Activated!')
      : (currentLang === 'kh' ? 'បានបិទរបៀបកែសម្រួល' : 'Edit Mode Deactivated'));
  });

  searchTriggerBtn.addEventListener('click', openSearchModal);
  inboxHeaderBtn.addEventListener('click', () => navigateTo('inbox'));
  headerBrand.addEventListener('click', () => navigateTo('home'));

  navHomeBtn.addEventListener('click', () => navigateTo('home'));
  navSearchBtn.addEventListener('click', openSearchModal);
  navInboxBtn.addEventListener('click', () => navigateTo('inbox'));

  document.getElementById('close-search-btn').addEventListener('click', closeSearchModal);
  searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value));

  // Expose to window
  window.nhamApp = {
    openCategory(categoryId) {
      activeFilterTag = 'all';
      navigateTo('category', { categoryId });
    },
    openRecipe(recipeId) {
      navigateTo('recipe', { recipeId });
    },
    openFromSearch(recipeId) {
      closeSearchModal();
      navigateTo('recipe', { recipeId });
    },
    goHome() {
      navigateTo('home');
    },
    backToCategory(categoryId) {
      navigateTo('category', { categoryId });
    },
    setFilter(tag) {
      activeFilterTag = tag;
      render();
    },
    swapMainPhoto(src) {
      const mainImg = document.getElementById('detail-main-img');
      if (mainImg) mainImg.src = src;
    },
    toggleIngredient(key, el) {
      const isChecked = !checkedIngredients[key];
      checkedIngredients[key] = isChecked;
      localStorage.setItem('nham_checked_ingredients', JSON.stringify(checkedIngredients));
      el.classList.toggle('checked', isChecked);
    },
    toggleInboxDetail(msgId) {
      const bodyEl = document.getElementById(`body-${msgId}`);
      if (bodyEl) {
        const isHidden = bodyEl.style.display === 'none';
        bodyEl.style.display = isHidden ? 'block' : 'none';
      }
      const msg = inboxMessages.find(m => m.id === msgId);
      if (msg && msg.unread) {
        msg.unread = false;
        updateInboxBadges();
        const card = bodyEl.closest('.inbox-item-card');
        if (card) card.classList.remove('unread');
      }
    },
    async submitInboxQuestion() {
      const nameInput = document.getElementById('compose-name');
      const msgInput = document.getElementById('compose-msg');
      const name = nameInput.value.trim() || (currentLang === 'kh' ? 'និស្សិត' : 'Student');
      const text = msgInput.value.trim();

      if (!text) {
        showToast(currentLang === 'kh' ? 'សូមបញ្ចូលសំណួររបស់អ្នក!' : 'Please enter your question!');
        return;
      }

      const newMsg = {
        id: 'msg-' + Date.now(),
        sender: name + ' (RU)',
        avatarColor: '#FB8500',
        subject: {
          kh: text.slice(0, 30) + '...',
          en: text.slice(0, 30) + '...'
        },
        preview: { kh: text, en: text },
        body: { kh: text, en: text },
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        unread: false
      };

      try {
        await fetch('/api/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMsg)
        });
      } catch (e) {
        console.warn('Local submit');
      }

      inboxMessages.unshift(newMsg);
      nameInput.value = '';
      msgInput.value = '';
      showToast(t(appData.uiText.sendSuccess));
      render();
    },
    shareRecipe(title) {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: 'Checkout this easy Khmer student recipe on Nham Ey Ke!',
          url: window.location.href
        }).catch(() => {});
      } else {
        showToast(currentLang === 'kh' ? 'បានចម្លងតំណភ្ជាប់ចែករំលែក!' : 'Recipe link copied!');
      }
    },
    bookmarkRecipe(title) {
      showToast(currentLang === 'kh' ? `បានរក្សាទុក «${title}»!` : `Saved "${title}" to favorites!`);
    },
    toggleEditMode() {
      isEditMode = !isEditMode;
      localStorage.setItem('nham_edit_mode', isEditMode);
      render();
    },
    editAppInfo,
    saveAppInfo,
    editCategory,
    saveCategory,
    editRecipe,
    openNewRecipeModal(catId) {
      if (catId) activeCategoryId = catId;
      editRecipe(null);
    },
    saveRecipe,
    deleteRecipe,
    closeEditModal,
    openSearchModal,
    // Icon & Photo Management APIs
    selectIconPickerItem,
    deduceIcon,
    updateIconPreview,
    openPhotoManagerForRecipe,
    savePhotoManager,
    deduceRecipePhoto,
    setAsCoverPhoto,
    addPhotoViaUrl,
    uploadPhotoToRecipe,
    uploadAppBrandingPhoto,
    deduceAppPhoto
  };

  // Init
  loadAppData();
  loadInbox();
})();
