// pages/timeline.js — Event Timeline
import { getTimeline } from '../api/dashboard.js';
import { createStatusBadge } from '../components/badge.js';
import { loadingState, errorState, emptyState } from '../components/states.js';
import { formatRelative, titleCase, truncate } from '../core/utils.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const c = document.getElementById('timeline-content');
  if (c) c.innerHTML = loadingState('Loading timeline...');
  try {
    const events = await getTimeline(50);
    renderTimeline(events);
  } catch (err) {
    const c = document.getElementById('timeline-content');
    if (c) c.innerHTML = errorState('Failed to load timeline', err.message);
    notify.error('Timeline failed', err.message);
  }
}

function renderTimeline(events) {
  const c = document.getElementById('timeline-content');
  if (!c) return;

  if (!events.length) {
    c.innerHTML = emptyState('📅', 'No events yet', 'Agent actions and learning events will appear here.');
    return;
  }

  const typeConfig = {
    action:   { icon: '⚡', dotClass: 'action',   label: 'Action' },
    learning: { icon: '🧠', dotClass: 'learning', label: 'Learning' },
  };

  c.innerHTML = `
    <div class="timeline">
      ${events.map(e => {
        const cfg = typeConfig[e.type] || { icon: '•', dotClass: 'action', label: e.type };
        return `
          <div class="timeline-item">
            <div class="timeline-dot ${cfg.dotClass}">${cfg.icon}</div>
            <div class="timeline-body">
              <div class="timeline-title">${titleCase(e.title || '—')}</div>
              <div class="timeline-description">${truncate(e.description || '', 120)}</div>
              <div class="timeline-meta">
                <span class="badge badge-neutral">${cfg.label}</span>
                ${createStatusBadge(e.status)}
                <span>${formatRelative(e.timestamp)}</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
