// pages/actions.js — Actions History
import { getActions } from '../api/dashboard.js';
import { createStatusBadge } from '../components/badge.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatRelative, titleCase, truncate } from '../core/utils.js';
import { notify } from '../core/notifications.js';

let allActions = [];

export async function init() {
  const c = document.getElementById('actions-content');
  if (c) c.innerHTML = loadingState('Loading action history...');
  try {
    allActions = await getActions(100);
    renderActions(allActions);
  } catch (err) {
    const c = document.getElementById('actions-content');
    if (c) c.innerHTML = errorState('Failed to load actions', err.message);
    notify.error('Actions failed', err.message);
  }
}

function renderActions(actions) {
  const c = document.getElementById('actions-content');
  if (!c) return;

  c.innerHTML = `
    <div class="table-filters">
      <input class="filter-input" id="action-search" type="text" placeholder="Search actions..." />
      <select class="filter-select" id="action-status-filter">
        <option value="">All Statuses</option>
        <option value="success">Success</option>
        <option value="failed">Failed</option>
        <option value="skipped">Skipped</option>
      </select>
    </div>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Status</th>
            <th>Description</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody id="actions-tbody">
          ${renderRows(actions)}
        </tbody>
      </table>
    </div>
  `;

  // Wire up search
  document.getElementById('action-search')?.addEventListener('input', applyFilters);
  document.getElementById('action-status-filter')?.addEventListener('change', applyFilters);
}

function renderRows(actions) {
  if (!actions.length) {
    return `<tr class="no-data"><td colspan="4">${emptyState('⚡', 'No actions yet', 'Agent actions will appear here once the agent starts executing.')}</td></tr>`;
  }
  return actions.map(a => `
    <tr>
      <td>${titleCase(a.action_name || a.id || '—')}</td>
      <td>${createStatusBadge(a.status)}</td>
      <td style="color:var(--text-muted);max-width:400px">${truncate(a.description || a.result?.message || '—', 80)}</td>
      <td style="color:var(--text-muted);white-space:nowrap">${formatRelative(a.created_at)}</td>
    </tr>
  `).join('');
}

function applyFilters() {
  const search = document.getElementById('action-search')?.value.toLowerCase() || '';
  const status = document.getElementById('action-status-filter')?.value.toLowerCase() || '';

  const filtered = allActions.filter(a => {
    const matchSearch = !search ||
      (a.action_name || '').toLowerCase().includes(search) ||
      (a.description || '').toLowerCase().includes(search);
    const matchStatus = !status || (a.status || '').toLowerCase() === status;
    return matchSearch && matchStatus;
  });

  const tbody = document.getElementById('actions-tbody');
  if (tbody) tbody.innerHTML = renderRows(filtered);
}
