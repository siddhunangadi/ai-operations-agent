// ============================================================
// pages/usage.js — Usage Analytics Page
// Calls GET /api/v1/dashboard/usage and renders charts + stats.
// ============================================================

import { getUsage } from '../api/dashboard.js';
import { createLineChart, createDoughnutChart } from '../components/chart.js';
import { createKPICard } from '../components/card.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatNumber, formatTokens } from '../core/utils.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const container = document.getElementById('usage-content');
  if (container) container.innerHTML = loadingState('Loading usage data...');

  try {
    const data = await getUsage();
    renderUsage(data);
  } catch (err) {
    const container = document.getElementById('usage-content');
    if (container) container.innerHTML = errorState('Failed to load usage data', err.message);
    notify.error('Usage data failed', err.message);
  }
}

function renderUsage(data) {
  const container = document.getElementById('usage-content');
  if (!container) return;

  const totalRequests = data.total_requests ?? 0;
  const totalTokens   = data.total_tokens   ?? 0;
  const todayRequests = data.today_requests  ?? 0;
  const models        = data.models          || [];
  const daily         = data.daily_usage     || [];

  container.innerHTML = `
    <!-- KPI Cards -->
    <div class="grid-4" style="margin-bottom:var(--sp-8)">
      ${createKPICard({ label: 'Total Requests', value: formatNumber(totalRequests), icon: 'fa-arrow-right-arrow-left', color: 'indigo' })}
      ${createKPICard({ label: 'Total Tokens', value: formatNumber(totalTokens), icon: 'fa-coins', color: 'warning' })}
      ${createKPICard({ label: "Today's Requests", value: formatNumber(todayRequests), icon: 'fa-chart-line', color: 'info' })}
      ${createKPICard({ label: 'Models Used', value: formatNumber(models.length), icon: 'fa-microchip', color: 'violet' })}
    </div>

    <!-- Charts row -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-card-title">Daily Request Volume</div>
        </div>
        <div class="chart-wrapper"><canvas id="usage-daily-chart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-card-title">Token Distribution by Model</div>
        </div>
        <div class="chart-wrapper"><canvas id="usage-model-chart"></canvas></div>
      </div>
    </div>

    <!-- Models table -->
    <div class="card">
      <div class="card-header"><div class="card-title">Usage by Model</div></div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Requests</th>
              <th>Total Tokens</th>
              <th>Avg Tokens</th>
            </tr>
          </thead>
          <tbody id="model-table-body">
            ${models.length
              ? models.map(m => `
                <tr>
                  <td>${m.model || '—'}</td>
                  <td>${formatNumber(m.requests ?? 0)}</td>
                  <td>${formatNumber(m.total_tokens ?? 0)}</td>
                  <td>${formatNumber(m.avg_tokens ?? 0)}</td>
                </tr>`).join('')
              : `<tr class="no-data"><td colspan="4">${emptyState('📊', 'No model data', 'No usage data available yet.')}</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Render daily chart
  if (daily.length) {
    createLineChart(
      'usage-daily-chart',
      daily.map(d => d.date || d.day),
      [{ label: 'Requests', data: daily.map(d => d.requests ?? d.count ?? 0) }],
      'Requests'
    );
  }

  // Render model doughnut chart
  if (models.length) {
    createDoughnutChart(
      'usage-model-chart',
      models.map(m => m.model),
      models.map(m => m.total_tokens ?? 0)
    );
  }
}
