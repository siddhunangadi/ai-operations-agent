// ============================================================
// components/card.js — KPI Card Builder
// Returns an HTML string for a KPI metric card.
// Usage: el.innerHTML = createKPICard({ label, value, icon, color, trend })
// ============================================================

/**
 * Creates a KPI (Key Performance Indicator) card.
 *
 * @param {Object} opts
 * @param {string} opts.label   - Card title (e.g., "Today's Spend")
 * @param {string} opts.value   - The big number/text to display
 * @param {string} opts.icon    - Font Awesome class (e.g., "fa-dollar-sign")
 * @param {string} opts.color   - Icon background color: 'indigo'|'violet'|'success'|'warning'|'danger'|'info'
 * @param {string} [opts.trend] - Optional trend line (e.g., "↑ 12% vs yesterday")
 * @param {string} [opts.trendType] - 'up'|'down'|'flat' for color
 * @returns {string} HTML string
 */
export function createKPICard({ label, value, icon, color = 'indigo', trend = '', trendType = 'flat' }) {
  return `
    <div class="kpi-card">
      <div class="kpi-card-top">
        <span class="kpi-label">${label}</span>
        <div class="kpi-icon ${color}">
          <i class="fa-solid ${icon}"></i>
        </div>
      </div>
      <div class="kpi-value">${value}</div>
      ${trend ? `<div class="kpi-trend ${trendType}">${trend}</div>` : ''}
    </div>
  `;
}

/**
 * Creates a simple info card with a title and content area.
 *
 * @param {string} title   - Card header text
 * @param {string} content - Inner HTML for the card body
 * @param {string} [extra] - Optional HTML for the card header right side
 * @returns {string} HTML string
 */
export function createCard(title, content, extra = '') {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">${title}</div>
        ${extra}
      </div>
      ${content}
    </div>
  `;
}

/**
 * Creates a chart card with a canvas element inside.
 *
 * @param {string} title    - Card title
 * @param {string} canvasId - The id to give the <canvas> element
 * @param {string} [extra]  - Optional HTML for right side of header
 * @returns {string} HTML string
 */
export function createChartCard(title, canvasId, extra = '') {
  return `
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-card-title">${title}</div>
        ${extra}
      </div>
      <div class="chart-wrapper">
        <canvas id="${canvasId}"></canvas>
      </div>
    </div>
  `;
}
