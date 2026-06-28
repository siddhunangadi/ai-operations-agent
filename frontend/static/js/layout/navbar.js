// ============================================================
// layout/navbar.js — Top Navbar
// Renders the navbar, loads user profile, and handles logout.
// Also monitors backend connectivity and shows status badge.
// ============================================================

import { API_BASE } from '../config.js';
import { fetchCurrentUser, logout } from '../core/auth.js';
import { updateSidebarUser } from './sidebar.js';
import { notify } from '../core/notifications.js';

/**
 * Renders the navbar into the element with id="navbar".
 * Called once when index.html loads.
 */
export function renderNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  navbar.innerHTML = `
    <div class="navbar-left">
      <!-- Mobile hamburger (hidden on desktop via CSS) -->
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <span class="navbar-page-title" id="navbar-page-title">Dashboard</span>
    </div>

    <div class="navbar-right">
      <!-- Backend health badge -->
      <div class="backend-status" id="backend-status">
        <div class="backend-status-dot"></div>
        <span id="backend-status-text">Checking...</span>
      </div>

      <!-- Logout button -->
      <button class="icon-btn" id="logout-btn" title="Sign out">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    </div>
  `;

  // Wire up logout button
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try {
      await logout();
    } catch {
      // logout() already clears session, just redirect
      window.location.href = '/login.html';
    }
  });

  // Wire up hamburger for mobile sidebar toggle
  document.getElementById('hamburger')?.addEventListener('click', toggleMobileSidebar);

  // Load user profile and check backend health in parallel
  initNavbar();
}

/**
 * Runs after the navbar is rendered.
 * Loads user info and starts backend health checks.
 */
async function initNavbar() {
  // 1. Load user profile
  const user = await fetchCurrentUser();
  updateSidebarUser(user);

  // 2. Check backend health
  checkBackendHealth();

  // 3. Re-check health every 60 seconds
  setInterval(checkBackendHealth, 60_000);
}

/**
 * Calls GET /health to check if the backend is reachable.
 * Updates the status badge in the navbar accordingly.
 */
async function checkBackendHealth() {
  const badge  = document.getElementById('backend-status');
  const label  = document.getElementById('backend-status-text');
  if (!badge || !label) return;

  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(5000), // timeout after 5s
    });

    if (res.ok) {
      badge.classList.remove('offline');
      label.textContent = 'Backend Online';
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch {
    badge.classList.add('offline');
    label.textContent = 'Backend Offline';
  }
}

/**
 * Toggles the mobile sidebar by adding/removing the 'open' class.
 * This matches the CSS rule: .sidebar.open { transform: translateX(0) }
 */
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const isOpen = sidebar.classList.toggle('open');

  // Show/hide overlay behind sidebar on mobile
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.remove();
    });
    document.body.appendChild(overlay);
  }

  if (!isOpen) overlay.remove();
}
