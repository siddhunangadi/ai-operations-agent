// pages/budget.js — Budget Monitoring
import { getBudget, getForecast } from '../api/dashboard.js';
import { createLineChart, createGaugeChart } from '../components/chart.js';
import { createKPICard } from '../components/card.js';
import { loadingState, errorState } from '../components/states.js';
import { formatCurrency, formatConfidence } from '../core/utils.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const c = document.getElementById('budget-content');
  if (c) c.innerHTML = loadingState('Loading budget data...');
  try {
    const [budget, forecast] = await Promise.all([getBudget(), getForecast()]);
    renderBudget(budget, forecast);
  } catch (err) {
    const c = document.getElementById('budget-content');
    if (c) c.innerHTML = errorState('Failed to load budget data', err.message);
    notify.error('Budget data failed', err.message);
  }
}

function renderBudget(budget, forecast) {
  const c = document.getElementById('budget-content');
  if (!c) return;

  const monthly  = budget.monthly_budget ?? 0;
  const spent    = budget.total_spent    ?? 0;
  const remaining= budget.remaining      ?? (monthly - spent);
  const pct      = monthly > 0 ? (spent / monthly) * 100 : 0;
  const color    = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'success';
  const daily    = forecast.daily_forecast || [];

  c.innerHTML = `
    <div class="grid-4" style="margin-bottom:var(--sp-8)">
      ${createKPICard({ label: 'Monthly Budget', value: formatCurrency(monthly), icon: 'fa-wallet', color: 'indigo' })}
      ${createKPICard({ label: 'Total Spent', value: formatCurrency(spent), icon: 'fa-dollar-sign', color: color })}
      ${createKPICard({ label: 'Remaining', value: formatCurrency(remaining), icon: 'fa-piggy-bank', color: 'success' })}
      ${createKPICard({ label: 'Budget Used', value: `${pct.toFixed(1)}%`, icon: 'fa-chart-pie', color: color })}
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-card-header"><div class="chart-card-title">Cost Forecast</div></div>
        <div class="chart-wrapper"><canvas id="forecast-chart"></canvas></div>
      </div>
      <div class="chart-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div class="chart-card-header" style="width:100%"><div class="chart-card-title">Budget Gauge</div></div>
        <div style="position:relative;width:200px;height:110px;margin:0 auto">
          <canvas id="gauge-chart"></canvas>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);text-align:center">
            <div style="font-size:var(--text-xl);font-weight:var(--weight-bold);color:var(--text-primary)">${pct.toFixed(0)}%</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">of budget</div>
          </div>
        </div>
        <div class="progress-bar-wrapper" style="margin-top:var(--sp-4);width:100%">
          <div class="progress-bar-fill ${color}" style="width:${Math.min(pct,100)}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;width:100%;font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--sp-2)">
          <span>${formatCurrency(spent)} spent</span>
          <span>${formatCurrency(monthly)} limit</span>
        </div>
      </div>
    </div>

    ${budget.alerts?.length ? `
    <div class="card" style="border-color:var(--warning);border-left:3px solid var(--warning)">
      <div class="card-header"><div class="card-title" style="color:var(--warning)">⚠ Budget Alerts</div></div>
      ${budget.alerts.map(a => `<div style="padding:var(--sp-3) 0;border-bottom:1px solid var(--border-subtle);color:var(--text-secondary);font-size:var(--text-sm)">${a.message || a}</div>`).join('')}
    </div>` : ''}
  `;

  createGaugeChart('gauge-chart', spent, monthly || 1, color);
  if (daily.length) {
    createLineChart('forecast-chart',
      daily.map(d => d.date || d.day),
      [
        { label: 'Actual', data: daily.map(d => d.actual ?? null) },
        { label: 'Forecast', data: daily.map(d => d.forecast ?? d.projected ?? 0) },
      ]
    );
  }
}
