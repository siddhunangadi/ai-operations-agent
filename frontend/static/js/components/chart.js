// ============================================================
// components/chart.js — Chart.js Wrapper
// Thin wrappers around Chart.js that apply the app's color scheme.
// Each function creates one chart in a given canvas element.
// ============================================================

// Chart.js color palette matching our CSS variables
const COLORS = {
  indigo:  'rgba(99, 102, 241',
  violet:  'rgba(139, 92, 246',
  success: 'rgba(16, 185, 129',
  warning: 'rgba(245, 158, 11',
  danger:  'rgba(239, 68, 68',
  info:    'rgba(59, 130, 246',
};

// Default colors for multi-series charts
const PALETTE = [
  COLORS.indigo,
  COLORS.violet,
  COLORS.success,
  COLORS.warning,
  COLORS.info,
  COLORS.danger,
];

/**
 * Shared Chart.js default options for dark mode.
 * All charts inherit these so they look consistent.
 */
function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeInOutQuart' },
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1a1a24',
        borderColor: '#2a2a3a',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Inter', size: 12, weight: '600' },
        bodyFont:  { family: 'Inter', size: 12 },
      },
    },
    scales: {
      x: {
        grid:  { color: '#1e1e2a' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        border: { color: '#2a2a3a' },
      },
      y: {
        grid:  { color: '#1e1e2a' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        border: { color: '#2a2a3a' },
        beginAtZero: true,
      },
    },
  };
}

/**
 * Destroys an existing chart on a canvas before creating a new one.
 * Prevents Chart.js errors when re-rendering the same canvas.
 */
function destroyExisting(canvasId) {
  const existing = Chart.getChart(canvasId);
  if (existing) existing.destroy();
}

/**
 * Creates a line chart.
 * @param {string}   canvasId - The id of the <canvas> element
 * @param {string[]} labels   - X-axis labels (e.g., dates)
 * @param {Array}    datasets - Array of { label, data[] } objects
 * @param {string}   yLabel   - Y-axis label (optional)
 */
export function createLineChart(canvasId, labels, datasets, yLabel = '') {
  destroyExisting(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;

  const chartDatasets = datasets.map((ds, i) => {
    const color = PALETTE[i % PALETTE.length];
    return {
      label: ds.label,
      data:  ds.data,
      borderColor:     `${color}, 1)`,
      backgroundColor: `${color}, 0.08)`,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: `${color}, 1)`,
      fill: datasets.length === 1, // fill only for single-line charts
      tension: 0.4,
    };
  });

  const opts = baseOptions();
  if (yLabel) opts.scales.y.title = { display: true, text: yLabel, color: '#64748b' };

  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: chartDatasets },
    options: opts,
  });
}

/**
 * Creates a bar chart.
 * @param {string}   canvasId
 * @param {string[]} labels
 * @param {Array}    datasets - Array of { label, data[] }
 * @param {boolean}  horizontal - Whether bars go left-right
 */
export function createBarChart(canvasId, labels, datasets, horizontal = false) {
  destroyExisting(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;

  const chartDatasets = datasets.map((ds, i) => {
    const color = PALETTE[i % PALETTE.length];
    return {
      label: ds.label,
      data:  ds.data,
      backgroundColor: `${color}, 0.7)`,
      hoverBackgroundColor: `${color}, 1)`,
      borderRadius: 4,
      borderSkipped: false,
    };
  });

  const opts = baseOptions();
  if (horizontal) {
    opts.indexAxis = 'y';
  }

  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: chartDatasets },
    options: opts,
  });
}

/**
 * Creates a doughnut / pie chart.
 * @param {string}   canvasId
 * @param {string[]} labels
 * @param {number[]} data
 */
export function createDoughnutChart(canvasId, labels, data) {
  destroyExisting(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;

  const backgroundColors = PALETTE.slice(0, data.length).map(c => `${c}, 0.8)`);
  const borderColors     = PALETTE.slice(0, data.length).map(c => `${c}, 1)`);

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderColor:     borderColors,
        borderWidth: 1,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 11 },
            padding: 16,
            boxWidth: 12,
          },
        },
        tooltip: {
          backgroundColor: '#1a1a24',
          borderColor: '#2a2a3a',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 12,
          cornerRadius: 8,
        },
      },
    },
  });
}

/**
 * Creates a gauge-style chart using a doughnut with a fixed total.
 * Shows one value as a portion of the max.
 * @param {string} canvasId
 * @param {number} value  - Current value (e.g., 750)
 * @param {number} max    - Total (e.g., 1000)
 * @param {string} color  - 'success' | 'warning' | 'danger'
 */
export function createGaugeChart(canvasId, value, max, color = 'success') {
  destroyExisting(canvasId);
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;

  const pct  = Math.min(value / max, 1);
  const c    = COLORS[color] || COLORS.success;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data:            [pct, 1 - pct],
        backgroundColor: [`${c}, 0.85)`, '#1a1a24'],
        borderWidth:     0,
        hoverOffset:     0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      rotation: -90,
      circumference: 180,
      animation: { duration: 800 },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
  });
}
