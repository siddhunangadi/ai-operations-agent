// pages/world-model.js — Agent World Model
import { getWorldModel, getHealth, getGoals } from '../api/dashboard.js';
import { createStatusBadge } from '../components/badge.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatConfidence } from '../core/utils.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const c = document.getElementById('world-model-content');
  if (c) c.innerHTML = loadingState('Loading world model...');
  try {
    const [wm, health, goals] = await Promise.all([getWorldModel(), getHealth(), getGoals()]);
    renderWorldModel(wm, health, goals);
  } catch (err) {
    const c = document.getElementById('world-model-content');
    if (c) c.innerHTML = errorState('Failed to load world model', err.message);
    notify.error('World model failed', err.message);
  }
}

function renderWorldModel(wm, health, goals) {
  const c = document.getElementById('world-model-content');
  if (!c) return;

  const score = health.score ?? 0;
  const color = score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger';
  const healthBreakdown = health.breakdown || {};

  c.innerHTML = `
    <div class="grid-2" style="margin-bottom:var(--sp-8)">
      <!-- Health Score Card -->
      <div class="card">
        <div class="card-header"><div class="card-title">System Health</div></div>
        <div style="display:flex;align-items:center;gap:var(--sp-6)">
          <div style="text-align:center">
            <div style="font-size:var(--text-4xl);font-weight:var(--weight-bold);color:var(--${color === 'success' ? 'success' : color === 'warning' ? 'warning' : 'danger'})">${score}%</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">health score</div>
          </div>
          <div style="flex:1">
            ${Object.entries(healthBreakdown).map(([key, val]) => `
              <div style="margin-bottom:var(--sp-3)">
                <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);margin-bottom:var(--sp-1)">
                  <span style="color:var(--text-secondary)">${key.replace(/_/g,' ')}</span>
                  <span style="color:var(--text-primary);font-weight:var(--weight-medium)">${typeof val === 'number' ? val + '%' : val}</span>
                </div>
                ${typeof val === 'number' ? `<div class="progress-bar-wrapper"><div class="progress-bar-fill ${val >= 70 ? 'success' : val >= 40 ? 'warning' : 'danger'}" style="width:${val}%"></div></div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Goals Card -->
      <div class="card">
        <div class="card-header"><div class="card-title">Agent Goals</div></div>
        ${(goals || []).length
          ? goals.map(g => `
            <div class="goal-item">
              <div class="goal-icon"><i class="fa-solid fa-bullseye"></i></div>
              <div>
                <div style="font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-primary)">${g.goal || g.name || g}</div>
                ${g.priority ? `<span class="badge badge-neutral" style="margin-top:var(--sp-1)">${g.priority}</span>` : ''}
              </div>
            </div>`).join('')
          : emptyState('🎯', 'No goals defined', 'The agent has no active goals.')}
      </div>
    </div>

    <!-- Raw World Model JSON -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">World Model State</div>
        <span class="badge badge-neutral">JSON</span>
      </div>
      <pre class="world-model-json">${JSON.stringify(wm, null, 2)}</pre>
    </div>
  `;
}
