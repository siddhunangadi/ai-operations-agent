// ============================================================
// layout/sidebar.js — Sidebar Rendering & Navigation
// Builds the sidebar HTML from the NAV_PAGES config array
// and attaches click listeners that trigger the router.
// ============================================================

import { NAV_PAGES } from '../config.js';

/**
 * Renders the sidebar navigation into the element with id="sidebar".
 * Called once when index.html first loads.
 *
 * Reads NAV_PAGES from config.js to build the links.
 * Each nav link sets window.location.hash which the router listens to.
 */
export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Build logo section
  const logoHtml = `
    <a class="sidebar-logo" href="#dashboard">
      <div class="sidebar-logo-icon">
        <i class="fa-solid fa-robot"></i>
      </div>
      <div class="sidebar-logo-text">
        <div class="sidebar-logo-name">AI Operations</div>
        <div class="sidebar-logo-tag">Copilot v1.0</div>
      </div>
    </a>
  `;

  // Build navigation links from config
  let navHtml = '<nav class="sidebar-nav">';

  NAV_PAGES.forEach(item => {
    if (item.section) {
      // Section header (not a link)
      navHtml += `<div class="sidebar-section-label">${item.section}</div>`;
    } else {
      // Clickable nav link
      navHtml += `
        <a class="nav-link"
           href="#${item.page}"
           data-page="${item.page}"
           title="${item.label}">
          <span class="nav-icon"><i class="fa-solid ${item.icon}"></i></span>
          <span class="nav-label">${item.label}</span>
        </a>
      `;
    }
  });

  navHtml += '</nav>';

  // Build footer placeholder (user info filled in by navbar.js)
  const footerHtml = `
    <div class="sidebar-footer">
      <div class="sidebar-user" id="sidebar-user">
        <div class="user-avatar" id="sidebar-avatar">?</div>
        <div class="user-info">
          <div class="user-name" id="sidebar-user-name">Loading...</div>
          <div class="user-email" id="sidebar-user-email"></div>
        </div>
        <div class="status-dot"></div>
      </div>
    </div>
  `;

  // Assemble and inject
  sidebar.innerHTML = logoHtml + navHtml + footerHtml;
}

/**
 * Updates the user display in the sidebar footer.
 * Called after the user profile is fetched by navbar.js.
 *
 * @param {{ full_name: string, email: string }} user
 */
export function updateSidebarUser(user) {
  const nameEl   = document.getElementById('sidebar-user-name');
  const emailEl  = document.getElementById('sidebar-user-email');
  const avatarEl = document.getElementById('sidebar-avatar');

  if (nameEl)   nameEl.textContent  = user.full_name || user.email || 'User';
  if (emailEl)  emailEl.textContent = user.email || '';

  if (avatarEl) {
    // Show first letter of name as avatar
    const initials = (user.full_name || user.email || 'U').charAt(0).toUpperCase();
    avatarEl.textContent = initials;
  }
}
