// ============================================================
// core/router.js — Client-Side SPA Router
// Uses URL hash (#dashboard, #chat, etc.) to determine which
// page fragment to load into the #content element.
//
// How it works:
// 1. User clicks a nav link  → URL changes to index.html#chat
// 2. hashchange event fires  → router reads the hash
// 3. Router fetches pages/chat.html
// 4. HTML is injected into #content
// 5. The page's JS module is dynamically imported and initialized
// ============================================================

import { NAV_PAGES } from '../config.js';

// The element where page content is injected
const CONTENT_ID = 'content';

// Maps page names to their JS module paths
// Each module must export an `init()` function
const PAGE_MODULES = {
  dashboard:       () => import('../pages/dashboard.js'),
  chat:            () => import('../pages/chat.js'),
  usage:           () => import('../pages/usage.js'),
  cost:            () => import('../pages/cost.js'),
  providers:       () => import('../pages/providers.js'),
  budget:          () => import('../pages/budget.js'),
  recommendations: () => import('../pages/recommendations.js'),
  actions:         () => import('../pages/actions.js'),
  timeline:        () => import('../pages/timeline.js'),
  'world-model':   () => import('../pages/world-model.js'),
  learning:        () => import('../pages/learning.js'),
  settings:        () => import('../pages/settings.js'),
};

// Track the current page to avoid reloading the same page
let currentPage = null;

/**
 * Gets the page name from the current URL hash.
 * Example: '#chat' → 'chat', '' → 'dashboard'
 */
function getCurrentPage() {
  const hash = window.location.hash.replace('#', '').trim();
  return hash || 'dashboard'; // default to dashboard
}

/**
 * Loads a page: fetches its HTML fragment, injects it,
 * then dynamically imports and calls its init() function.
 *
 * @param {string} pageName - e.g., 'dashboard', 'chat'
 */
async function loadPage(pageName) {
  // Skip if already on this page
  if (pageName === currentPage) return;
  currentPage = pageName;

  const contentEl = document.getElementById(CONTENT_ID);
  if (!contentEl) return;

  // Show loading state while fetching the page HTML
  contentEl.innerHTML = `
    <div class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p class="loading-text">Loading...</p>
    </div>
  `;

  try {
    // Fetch the HTML fragment for this page
    const res = await fetch(`/pages/${pageName}.html`);
    if (!res.ok) throw new Error(`Page not found: ${pageName}`);
    const html = await res.text();

    // Inject the HTML into the content area
    contentEl.innerHTML = html;
    contentEl.classList.add('animate-in');

    // Re-trigger animation on each navigation
    void contentEl.offsetWidth; // force reflow
    contentEl.classList.remove('animate-in');
    void contentEl.offsetWidth;
    contentEl.classList.add('animate-in');

    // Load and initialize the page's JavaScript module
    const moduleLoader = PAGE_MODULES[pageName];
    if (moduleLoader) {
      const module = await moduleLoader();
      if (typeof module.init === 'function') {
        await module.init();
      }
    }

    // Update the active link in the sidebar
    updateActiveLink(pageName);

    // Update the navbar page title
    updateNavbarTitle(pageName);

  } catch (err) {
    console.error('[router] Failed to load page:', pageName, err);
    contentEl.innerHTML = `
      <div class="error-state" style="margin:2rem">
        <div class="error-state-icon">⚠</div>
        <div class="error-state-title">Failed to load page</div>
        <div class="error-state-text">${err.message}</div>
      </div>
    `;
  }
}

/**
 * Updates which nav link has the 'active' class.
 * Called every time a new page loads.
 */
function updateActiveLink(pageName) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageName) {
      link.classList.add('active');
    }
  });
}

/**
 * Updates the page title shown in the top navbar.
 */
function updateNavbarTitle(pageName) {
  const titleEl = document.getElementById('navbar-page-title');
  if (!titleEl) return;

  // Find the label for this page from the config
  const navItem = NAV_PAGES.find(n => n.page === pageName);
  titleEl.textContent = navItem?.label || pageName;
}

/**
 * Initializes the router.
 * Listens for hash changes and loads the initial page.
 * Called once when index.html loads.
 */
export function initRouter() {
  // Listen for back/forward navigation and direct hash changes
  window.addEventListener('hashchange', () => {
    loadPage(getCurrentPage());
  });

  // Load the page matching the current URL on first load
  loadPage(getCurrentPage());
}
