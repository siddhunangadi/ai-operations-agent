// ============================================================
// pages/cost.js — Cost Analytics Page
// Calls GET /api/v1/dashboard/cost
// ============================================================

import { getCost } from '../api/dashboard.js';
import { createLineChart, createBarChart } from '../components/chart.js';
import { createKPICard } from '../components/card.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatCurrency, formatNumber } from '../core/utils.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const container = document.getElementById('cost-content');
  if (container) container.innerHTML = loadingState('Loading cost data...');

  try {
    const data = await getCost();
    renderCost(data);
  } catch (err) {
    const container = document.getElementById('cost-content');
    if (container) container.innerHTML = errorState('Failed to load cost data', err.message);
    notify.error('Cost data failed', err.message);
  }
}

function renderCost(data) {
  const container = document.getElementById('cost-content');
  if (!container) return;

  const totalCost  = data.total_cost  ?? 0;
  const todayCost  = data.today_cost  ?? 0;
  const avgCost    = data.avg_cost_per_request ?? 0;
  const models     = data.models || [];
  const daily      = data.daily_costs || [];

  container.innerHTML = `
    <div class="grid-4" style="margin-bottom:var(--sp-8)">
      ${createKPICard({ label: 'Total Cost', value: formatCurrency(totalCost), icon: 'fa-dollar-sign', color: 'indigo' })}
      ${createKPICard({ label: "Today's Cost", value: formatCurrency(todayCost), icon: 'fa-clock', color: 'warning' })}
      ${createKPICard({ label: 'Avg Cost / Request', value: formatCurrency(avgCost), icon: 'fa-chart-simple', color: 'info' })}
      ${createKPICard({ label: 'Models Billed', value: formatNumber(models.length), icon: 'fa-microchip', color: 'violet' })}
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-card-header"><div class="chart-card-title">Daily Cost Trend</div></div>
        <div class="chart-wrapper"><canvas id="cost-daily-chart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header"><div class="chart-card-title">Cost by Model</div></div>
        <div class="chart-wrapper"><canvas id="cost-model-chart"></canvas></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Cost Breakdown by Model</div></div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Model</th><th>Total Cost</th><th>Requests</th><th>Cost / Request</th></tr>
          </thead>
          <tbody>
            ${models.length
              ? models.map(m => `<tr>
                  <td>${m.model || '—'}</td>
                  <td>${formatCurrency(m.total_cost ?? 0)}</td>
                  <td>${formatNumber(m.requests ?? 0)}</td>
                  <td>${formatCurrency(m.cost_per_request ?? 0)}</td>
                </tr>`).join('')
              : `<tr class="no-data"><td colspan="4">${emptyState('💰', 'No cost data')}</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (daily.length) {
    createLineChart('cost-daily-chart',
      daily.map(d => d.date || d.day),
      [{ label: 'Cost ($)', data: daily.map(d => d.cost ?? 0) }],
      'USD ($)'
    );
  }
  if (models.length) {
    createBarChart('cost-model-chart',
      models.map(m => m.model),
      [{ label: 'Cost ($)', data: models.map(m => m.total_cost ?? 0) }],
      true // horizontal bars
    );
  }
}
