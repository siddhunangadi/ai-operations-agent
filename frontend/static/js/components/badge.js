// ============================================================
// components/badge.js — Status Badge Builder
// Returns HTML strings for semantic status badges.
// ============================================================

/**
 * Returns the CSS class for a given status string.
 * Maps backend status values to badge color classes.
 */
export function statusClass(status) {
  const map = {
    success:   'badge-success',
    completed: 'badge-success',
    done:      'badge-success',
    ok:        'badge-success',
    healthy:   'badge-success',
    good:      'badge-success',

    warning:   'badge-warning',
    partial:   'badge-warning',
    degraded:  'badge-warning',

    failed:    'badge-danger',
    error:     'badge-danger',
    critical:  'badge-danger',
    bad:       'badge-danger',

    skipped:   'badge-neutral',
    pending:   'badge-neutral',
    unknown:   'badge-neutral',

    action:    'badge-accent',
    learning:  'badge-violet',
    info:      'badge-info',
  };
  return map[(status || '').toLowerCase()] || 'badge-neutral';
}

/**
 * Creates a status badge HTML string.
 * @param {string} text   - Badge label text
 * @param {string} type   - Badge style: 'success'|'warning'|'danger'|'info'|'accent'|'neutral'|'violet'
 * @param {boolean} dot   - Whether to show a dot prefix
 * @returns {string}
 */
export function createBadge(text, type = 'neutral', dot = false) {
  const cls = `badge badge-${type}${dot ? ' badge-dot' : ''}`;
  return `<span class="${cls}">${text}</span>`;
}

/**
 * Creates a status badge from a raw status string.
 * Automatically picks the right color.
 */
export function createStatusBadge(status) {
  const cls = statusClass(status);
  const label = (status || 'unknown').charAt(0).toUpperCase() + (status || 'unknown').slice(1);
  return `<span class="badge ${cls} badge-dot">${label}</span>`;
}

/**
 * Creates a priority badge (high/medium/low).
 */
export function createPriorityBadge(priority) {
  const map = {
    high:   'badge-high',
    medium: 'badge-medium',
    low:    'badge-low',
  };
  const cls   = map[(priority || '').toLowerCase()] || 'badge-neutral';
  const label = (priority || 'low').charAt(0).toUpperCase() + (priority || 'low').slice(1);
  return `<span class="badge ${cls}">${label}</span>`;
}

/**
 * Creates a tool chip (small monospaced badge used in chat).
 */
export function createToolChip(toolName) {
  return `<span class="tool-chip"><i class="fa-solid fa-wrench"></i> ${toolName}</span>`;
}
