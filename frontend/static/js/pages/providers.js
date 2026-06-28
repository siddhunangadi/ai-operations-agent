// pages/providers.js — Provider Analytics
import { getProviders } from '../api/dashboard.js';
import { createDoughnutChart, createBarChart } from '../components/chart.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatCurrency, formatNumber, colorFromString } from '../core/utils.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const c = document.getElementById('providers-content');
  if (c) c.innerHTML = loadingState('Loading provider data...');
  try {
    const data = await getProviders();
    renderProviders(data);
  } catch (err) {
    const c = document.getElementById('providers-content');
    if (c) c.innerHTML = errorState('Failed to load provider data', err.message);
    notify.error('Provider data failed', err.message);
  }
}

function renderProviders(data) {
  const c = document.getElementById('providers-content');
  if (!c) return;
  const providers = data.providers || [];

  const providerIcons = { openai: '🟢', anthropic: '🔵', google: '🔴', cohere: '🟣', mistral: '🟡' };

  c.innerHTML = `
    <div class="grid-auto" style="margin-bottom:var(--sp-8)" id="provider-cards"></div>
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-card-header"><div class="chart-card-title">Requests by Provider</div></div>
        <div class="chart-wrapper"><canvas id="prov-req-chart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header"><div class="chart-card-title">Cost by Provider</div></div>
        <div class="chart-wrapper"><canvas id="prov-cost-chart"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Provider Summary</div></div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Provider</th><th>Requests</th><th>Tokens</th><th>Cost</th><th>Avg Cost/Req</th></tr></thead>
          <tbody>
            ${providers.length
              ? providers.map(p => `<tr>
                  <td>${providerIcons[p.provider?.toLowerCase()] || '☁️'} ${p.provider || '—'}</td>
                  <td>${formatNumber(p.requests ?? 0)}</td>
                  <td>${formatNumber(p.total_tokens ?? 0)}</td>
                  <td>${formatCurrency(p.total_cost ?? 0)}</td>
                  <td>${formatCurrency(p.avg_cost ?? 0)}</td>
                </tr>`).join('')
              : `<tr class="no-data"><td colspan="5">${emptyState('☁️', 'No provider data')}</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

  const cardsEl = document.getElementById('provider-cards');
  if (cardsEl) {
    cardsEl.innerHTML = providers.map(p => `
      <div class="provider-card">
        <div class="provider-logo">${providerIcons[p.provider?.toLowerCase()] || '☁️'}</div>
        <div class="provider-info">
          <div class="provider-name">${p.provider || '—'}</div>
          <div class="provider-stat">${formatNumber(p.requests ?? 0)} requests</div>
          <div class="progress-bar-wrapper" style="margin-top:var(--sp-2)">
            <div class="progress-bar-fill" style="width:${Math.min((p.requests / (providers[0]?.requests || 1)) * 100, 100)}%"></div>
          </div>
        </div>
        <div class="provider-value">${formatCurrency(p.total_cost ?? 0)}</div>
      </div>
    `).join('') || emptyState('☁️', 'No providers found');
  }

  if (providers.length) {
    createDoughnutChart('prov-req-chart', providers.map(p => p.provider), providers.map(p => p.requests ?? 0));
    createBarChart('prov-cost-chart', providers.map(p => p.provider), [{ label: 'Cost ($)', data: providers.map(p => p.total_cost ?? 0) }]);
  }
}
