// ============================================================
// core/utils.js — Shared Utility Functions
// Pure functions with no side effects.
// Import these wherever you need formatting.
// ============================================================

/**
 * Formats a number as a US dollar currency string.
 * Example: formatCurrency(1234.56) → "$1,234.56"
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

/**
 * Formats large numbers with K/M suffixes.
 * Example: formatNumber(1500000) → "1.5M"
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return '—';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000)     return (value / 1_000).toFixed(1) + 'K';
  return String(Math.round(value));
}

/**
 * Formats token counts (same as formatNumber but labeled).
 * Example: formatTokens(45000) → "45.0K tokens"
 */
export function formatTokens(value) {
  if (value === null || value === undefined) return '—';
  return formatNumber(value) + ' tokens';
}

/**
 * Formats an ISO date string into a human-readable date + time.
 * Example: formatDate("2024-01-15T10:30:00Z") → "Jan 15, 2024 10:30 AM"
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Formats a date as a relative time string.
 * Example: formatRelative("2024-01-15T10:00:00Z") → "2 hours ago"
 */
export function formatRelative(isoString) {
  if (!isoString) return '—';
  const now  = Date.now();
  const then = new Date(isoString).getTime();
  const diff = (now - then) / 1000; // seconds

  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(isoString);
}

/**
 * Formats a confidence score (0.0–1.0) as a percentage.
 * Example: formatConfidence(0.85) → "85%"
 */
export function formatConfidence(value) {
  if (value === null || value === undefined) return '—';
  return Math.round(value * 100) + '%';
}

/**
 * Safely parses JSON — returns null on error instead of throwing.
 */
export function safeJSON(str) {
  try { return JSON.parse(str); }
  catch { return null; }
}

/**
 * Capitalizes the first letter of a string.
 * Example: capitalize("hello") → "Hello"
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts a snake_case or kebab-case string to Title Case.
 * Example: titleCase("action_name") → "Action Name"
 */
export function titleCase(str) {
  if (!str) return '';
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Formats a description or lesson that might be a string or a JSON object.
 */
export function formatDescription(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const text = val.finding || val.description || val.observation || val.message || val.content;
    if (text) {
      let result = text;
      if (val.recommendation) {
        result += ` Recommendation: ${val.recommendation}`;
      }
      return result;
    }
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

/**
 * Truncates text to a max character length, adding "..." if needed.
 * Safely handles objects and non-string values.
 */
export function truncate(str, maxLen = 80) {
  if (!str) return '';
  const stringVal = typeof str === 'object' ? formatDescription(str) : String(str);
  if (stringVal.length <= maxLen) return stringVal;
  return stringVal.slice(0, maxLen) + '…';
}

/**
 * Returns a deterministic color class based on a string.
 * Used to consistently color provider icons or badges.
 */
export function colorFromString(str) {
  const colors = ['indigo', 'violet', 'success', 'warning', 'info'];
  const index  = (str || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[index % colors.length];
}

/**
 * Formats bytes as KB / MB / GB.
 */
export function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
