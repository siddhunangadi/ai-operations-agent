// pages/learning.js — Agent Learning
import { getLearning } from '../api/dashboard.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatRelative, titleCase, truncate, formatDescription } from '../core/utils.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const c = document.getElementById('learning-content');
  if (c) c.innerHTML = loadingState('Loading learning entries...');
  try {
    const data = await getLearning(50);
    renderLearning(data);
  } catch (err) {
    const c = document.getElementById('learning-content');
    if (c) c.innerHTML = errorState('Failed to load learning data', err.message);
    notify.error('Learning data failed', err.message);
  }
}

function renderLearning(lessons) {
  const c = document.getElementById('learning-content');
  if (!c) return;

  const items = Array.isArray(lessons) ? lessons : [];

  if (!items.length) {
    c.innerHTML = emptyState('🧠', 'No learning entries yet', 'The agent will log lessons learned after each investigation.');
    return;
  }

  const typeColors = {
    cost_optimization: 'success',
    usage_pattern:     'info',
    performance:       'warning',
    error:             'danger',
    general:           'neutral',
  };

  c.innerHTML = `
    <div style="margin-bottom:var(--sp-4);color:var(--text-muted);font-size:var(--text-sm)">${items.length} entries recorded</div>
    <div style="display:flex;flex-direction:column;gap:var(--sp-3)">
      ${items.map(l => {
        const ltype  = l.lesson_type || 'general';
        const color  = typeColors[ltype] || 'neutral';
        return `
          <div class="card card-sm">
            <div style="display:flex;align-items:flex-start;gap:var(--sp-3)">
              <div class="kpi-icon ${color}" style="width:36px;height:36px;flex-shrink:0">🧠</div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-2)">
                  <span class="badge badge-${color}">${titleCase(ltype)}</span>
                  <span style="font-size:var(--text-xs);color:var(--text-muted)">${formatRelative(l.created_at)}</span>
                </div>
                <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:1.6">${formatDescription(l.lesson || l.content || '—')}</div>
                ${l.context ? `<div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--sp-2);padding:var(--sp-2);background:var(--bg-surface-2);border-radius:var(--radius-sm)">${truncate(l.context, 100)}</div>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
