// ============================================================
// pages/dashboard.js — Dashboard Page
//
// What it does:
//   Fetches the aggregated dashboard data from /api/v1/dashboard
//   and renders KPI cards, recent actions, and recommendations.
//
// Which API it calls:
//   GET /api/v1/dashboard
//   Returns: { health, usage, cost, providers, forecast,
//              recommendations, recent_actions, learning_summary,
//              goals, timeline }
// ============================================================

import { getDashboard } from '../api/dashboard.js';
import { createKPICard } from '../components/card.js';
import { createStatusBadge } from '../components/badge.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatCurrency, formatNumber, formatRelative, formatConfidence, truncate, titleCase } from '../core/utils.js';
import { notify } from '../core/notifications.js';

/**
 * init() is called by the router after the dashboard HTML is injected.
 * It's the entry point for this page.
 */
export async function init() {
  // Show skeleton while loading
  setLoading(true);

  try {
    const data = await getDashboard();
    renderDashboard(data);
    notify.success('Dashboard loaded', 'Data is up to date.');
  } catch (err) {
    console.error('[dashboard] Load failed:', err);
    showError(err.message);
    notify.error('Failed to load dashboard', err.message);
  }
}

/** Shows loading skeleton in each section */
function setLoading(loading) {
  const kpiGrid = document.getElementById('kpi-grid');
  const actTable = document.getElementById('recent-actions-body');
  const recList  = document.getElementById('rec-list');

  if (loading) {
    if (kpiGrid) kpiGrid.innerHTML = Array(8).fill(`
      <div class="kpi-card">
        <div class="skeleton skeleton-text" style="width:60%"></div>
        <div class="skeleton" style="height:2rem;margin:0.75rem 0;width:80%"></div>
      </div>
    `).join('');
    if (actTable) actTable.innerHTML = `<tr><td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted)">Loading actions...</td></tr>`;
    if (recList)  recList.innerHTML  = `<div style="padding:2rem;color:var(--text-muted)">Loading recommendations...</div>`;
  }
}

/** Renders all dashboard sections with real data */
function renderDashboard(data) {
  renderKPIs(data);
  renderRecentActions(data.recent_actions || []);
  renderRecommendations(data.recommendations || []);
  renderHealthScore(data.health || {});
}

/** Renders the 8 KPI metric cards */
function renderKPIs(data) {
  const kpiGrid = document.getElementById('kpi-grid');
  if (!kpiGrid) return;

  const cost    = data.cost    || {};
  const usage   = data.usage   || {};
  const health  = data.health  || {};
  const budget  = data.forecast || {};
  const provs   = data.providers || {};

  // Find top provider and top model from providers data
  const providerList = provs.providers || [];
  const topProvider  = providerList[0]?.provider || '—';
  const modelList    = usage.models || [];
  const topModel     = modelList[0]?.model || '—';

  const budgetStatus = health.score >= 70 ? 'Healthy' :
                       health.score >= 40 ? 'Warning' : 'Critical';
  const budgetColor  = health.score >= 70 ? 'success' :
                       health.score >= 40 ? 'warning' : 'danger';

  kpiGrid.innerHTML = [
    createKPICard({
      label: "Today's Spend",
      value: formatCurrency(cost.today_cost ?? 0),
      icon:  'fa-dollar-sign',
      color: 'indigo',
    }),
    createKPICard({
      label: 'Monthly Spend',
      value: formatCurrency(cost.total_cost ?? 0),
      icon:  'fa-credit-card',
      color: 'violet',
    }),
    createKPICard({
      label: "Today's Requests",
      value: formatNumber(usage.today_requests ?? 0),
      icon:  'fa-arrow-right-arrow-left',
      color: 'info',
    }),
    createKPICard({
      label: "Today's Tokens",
      value: formatNumber(usage.today_tokens ?? 0),
      icon:  'fa-coins',
      color: 'warning',
    }),
    createKPICard({
      label: 'Health Score',
      value: formatConfidence((health.score ?? 0) / 100),
      icon:  'fa-heart-pulse',
      color: health.score >= 70 ? 'success' : health.score >= 40 ? 'warning' : 'danger',
    }),
    createKPICard({
      label: 'Budget Status',
      value: budgetStatus,
      icon:  'fa-wallet',
      color: budgetColor,
    }),
    createKPICard({
      label: 'Top Provider',
      value: topProvider || '—',
      icon:  'fa-server',
      color: 'indigo',
    }),
    createKPICard({
      label: 'Top Model',
      value: truncate(topModel, 20) || '—',
      icon:  'fa-microchip',
      color: 'violet',
    }),
  ].join('');
}

/** Renders the recent actions table */
function renderRecentActions(actions) {
  const tbody = document.getElementById('recent-actions-body');
  if (!tbody) return;

  if (!actions.length) {
    tbody.innerHTML = `<tr class="no-data"><td colspan="4">${emptyState('⚡', 'No actions yet', 'Actions taken by the agent will appear here.')}</td></tr>`;
    return;
  }

  tbody.innerHTML = actions.map(a => `
    <tr>
      <td>${titleCase(a.action_name || a.id || '—')}</td>
      <td>${createStatusBadge(a.status)}</td>
      <td style="color:var(--text-muted)">${truncate(a.description || '—', 60)}</td>
      <td style="color:var(--text-muted);white-space:nowrap">${formatRelative(a.created_at)}</td>
    </tr>
  `).join('');
}

/** Renders the recommendations list */
function renderRecommendations(recs) {
  const container = document.getElementById('rec-list');
  if (!container) return;

  if (!recs.length) {
    container.innerHTML = emptyState('💡', 'No recommendations', 'The agent has not generated any recommendations yet.');
    return;
  }

  container.innerHTML = recs.slice(0, 5).map(r => `
    <div style="padding:var(--sp-4);border-bottom:1px solid var(--border-subtle);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--sp-3)">
        <div style="font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-primary)">${r.title || r.recommendation || '—'}</div>
        ${r.estimated_savings ? `<span style="color:var(--success);font-size:var(--text-sm);font-weight:var(--weight-semibold);white-space:nowrap">${formatCurrency(r.estimated_savings)}/mo</span>` : ''}
      </div>
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--sp-1)">${truncate(r.description || r.reason || '', 100)}</div>
    </div>
  `).join('');
}

/** Updates the health score indicator */
function renderHealthScore(health) {
  const el = document.getElementById('health-score-value');
  const bar = document.getElementById('health-score-bar');
  if (el) el.textContent = `${health.score ?? 0}%`;
  if (bar) {
    bar.style.width = `${health.score ?? 0}%`;
    const color = health.score >= 70 ? 'success' : health.score >= 40 ? 'warning' : 'danger';
    bar.className = `progress-bar-fill ${color}`;
  }
}

/** Shows an error message in the main content area */
function showError(message) {
  const kpiGrid = document.getElementById('kpi-grid');
  if (kpiGrid) {
    kpiGrid.innerHTML = errorState('Failed to load dashboard data', message);
  }
}
