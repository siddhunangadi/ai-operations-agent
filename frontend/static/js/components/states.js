// ============================================================
// components/states.js — Loading, Empty, and Error State Builders
// Every API call should show one of these states.
// ============================================================

/**
 * Returns HTML for a centered loading spinner.
 * @param {string} message - Optional text below the spinner
 */
export function loadingState(message = 'Loading data...') {
  return `
    <div class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p class="loading-text">${message}</p>
    </div>
  `;
}

/**
 * Returns HTML for an empty state (no data found).
 * @param {string} icon    - Emoji or text icon
 * @param {string} title   - Bold heading
 * @param {string} message - Explanatory text
 */
export function emptyState(icon = '📭', title = 'No data found', message = '') {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <div class="empty-state-title">${title}</div>
      ${message ? `<div class="empty-state-text">${message}</div>` : ''}
    </div>
  `;
}

/**
 * Returns HTML for an error state (API call failed).
 * @param {string} message  - Error description
 * @param {string} [detail] - Technical detail (optional)
 */
export function errorState(message = 'Something went wrong', detail = '') {
  return `
    <div class="error-state">
      <div class="error-state-icon">⚠</div>
      <div class="error-state-title">${message}</div>
      ${detail ? `<div class="error-state-text">${detail}</div>` : ''}
    </div>
  `;
}

/**
 * Returns HTML for skeleton loading placeholders.
 * Use this while content is loading to prevent layout shift.
 * @param {number} rows - How many skeleton rows to show
 */
export function skeletonRows(rows = 5) {
  const row = `
    <div style="padding: 0.75rem 1rem; border-bottom: 1px solid #1e1e2a; display:flex; gap:1rem; align-items:center;">
      <div class="skeleton" style="width:32px;height:32px;border-radius:50%;flex-shrink:0;"></div>
      <div style="flex:1;">
        <div class="skeleton skeleton-text" style="width:40%;"></div>
        <div class="skeleton skeleton-text" style="width:65%;margin-top:0.4rem;"></div>
      </div>
      <div class="skeleton" style="width:60px;height:20px;border-radius:999px;"></div>
    </div>
  `;
  return `<div>${row.repeat(rows)}</div>`;
}
