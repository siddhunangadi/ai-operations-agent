// ============================================================
// core/notifications.js — Toast Notification System
// Creates a global toast container and provides show/hide functions.
// Usage: import { notify } from './notifications.js';
//        notify.success('Saved!', 'Your profile was updated.');
// ============================================================

// Create the toast container once and attach it to the body.
// All toasts render inside this container.
let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Shows a toast notification.
 * @param {string} type    - 'success' | 'error' | 'warning' | 'info'
 * @param {string} title   - Bold title text
 * @param {string} message - Smaller detail text (optional)
 * @param {number} duration- Auto-dismiss time in ms (default 4000)
 */
function show(type, title, message = '', duration = 4000) {
  const icons = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'ℹ',
  };

  // Build the toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close">✕</button>
  `;

  // Close button removes the toast immediately
  toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

  // Add to the container (newest at top)
  getContainer().prepend(toast);

  // Auto-dismiss after duration
  const timer = setTimeout(() => dismiss(toast), duration);

  // Pause auto-dismiss on hover (so users can read it)
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => {
    setTimeout(() => dismiss(toast), 1500);
  });
}

/**
 * Removes a toast with a slide-out animation.
 */
function dismiss(toastEl) {
  if (!toastEl || !toastEl.parentNode) return;
  toastEl.classList.add('removing');
  // Remove from DOM after animation completes
  toastEl.addEventListener('animationend', () => toastEl.remove());
}

// Public API — four convenience methods
export const notify = {
  success: (title, msg, duration) => show('success', title, msg, duration),
  error:   (title, msg, duration) => show('error',   title, msg, duration),
  warning: (title, msg, duration) => show('warning', title, msg, duration),
  info:    (title, msg, duration) => show('info',    title, msg, duration),
};
