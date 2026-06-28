// pages/recommendations.js — Optimization Recommendations
import { getRecommendations } from '../api/dashboard.js';
import { createPriorityBadge } from '../components/badge.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatCurrency, titleCase, truncate } from '../core/utils.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const c = document.getElementById('rec-content');
  if (c) c.innerHTML = loadingState('Loading recommendations...');
  try {
    const data = await getRecommendations();
    renderRecommendations(data);
  } catch (err) {
    const c = document.getElementById('rec-content');
    if (c) c.innerHTML = errorState('Failed to load recommendations', err.message);
    notify.error('Recommendations failed', err.message);
  }
}

function renderRecommendations(data) {
  const c = document.getElementById('rec-content');
  if (!c) return;

  const recs = Array.isArray(data) ? data : (data.recommendations || []);

  if (!recs.length) {
    c.innerHTML = emptyState('💡', 'No recommendations yet', 'The AI agent will generate optimization recommendations as it analyzes your usage patterns.');
    return;
  }

  const totalSavings = recs.reduce((sum, r) => sum + (r.estimated_savings ?? 0), 0);

  c.innerHTML = `
    <div class="card" style="margin-bottom:var(--sp-6);background:var(--accent-light);border-color:rgba(99,102,241,0.3)">
      <div style="display:flex;align-items:center;gap:var(--sp-4)">
        <div class="kpi-icon indigo"><i class="fa-solid fa-lightbulb"></i></div>
        <div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Total Potential Savings</div>
          <div style="font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--accent)">${formatCurrency(totalSavings)}<span style="font-size:var(--text-sm);font-weight:normal;color:var(--text-muted)">/month</span></div>
        </div>
        <div style="margin-left:auto;color:var(--text-muted);font-size:var(--text-sm)">${recs.length} recommendations</div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--sp-4)">
      ${recs.map(r => `
        <div class="rec-card">
          <div class="rec-card-top">
            <div class="rec-icon"><i class="fa-solid fa-lightbulb"></i></div>
            <div style="flex:1;min-width:0">
              <div class="rec-title">${r.title || r.recommendation || '—'}</div>
              <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-1)">
                ${r.priority ? createPriorityBadge(r.priority) : ''}
                ${r.category ? `<span class="badge badge-accent">${r.category}</span>` : ''}
              </div>
            </div>
            ${r.estimated_savings ? `
              <div style="text-align:right;flex-shrink:0">
                <div class="rec-saving">${formatCurrency(r.estimated_savings)}/mo</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted)">potential saving</div>
              </div>` : ''}
          </div>
          <div class="rec-description">${r.description || r.reason || '—'}</div>
          ${r.action_steps?.length ? `
            <div style="background:var(--bg-surface-2);border-radius:var(--radius-md);padding:var(--sp-3)">
              <div style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);margin-bottom:var(--sp-2)">ACTION STEPS</div>
              ${r.action_steps.map((step, i) => `
                <div style="display:flex;gap:var(--sp-2);font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--sp-1)">
                  <span style="color:var(--accent);font-weight:var(--weight-semibold)">${i+1}.</span>
                  <span>${step}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}
