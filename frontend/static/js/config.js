// ============================================================
// config.js — Global Configuration
// Single place to change the backend URL.
// If you deploy to a server, only edit this file.
// ============================================================

// The base URL for all FastAPI API calls.
// In production with Nginx, this becomes '/api/v1' (same-origin proxy).
// In local dev (without Nginx), it points to the FastAPI server directly.
export const API_BASE = 'https://ai-operations-agent-fyxs.onrender.com/api/v1';

// App information shown in the UI
export const APP_NAME = 'AI Operations Agent';
export const APP_VERSION = '1.0.0';

// Navigation pages — each entry becomes a sidebar link.
// 'page' maps to pages/{page}.html which gets loaded into #content.
export const NAV_PAGES = [
  // ----- Overview -----
  { section: 'Overview' },
  { page: 'dashboard',       label: 'Dashboard',        icon: 'fa-gauge-high' },

  // ----- AI Agent -----
  { section: 'AI Agent' },
  { page: 'chat',            label: 'AI Chat',           icon: 'fa-comments' },

  // ----- Analytics -----
  { section: 'Analytics' },
  { page: 'usage',           label: 'Usage Analytics',   icon: 'fa-chart-bar' },
  { page: 'cost',            label: 'Cost Analytics',    icon: 'fa-dollar-sign' },
  { page: 'providers',       label: 'Provider Analytics',icon: 'fa-server' },

  // ----- Operations -----
  { section: 'Operations' },
  { page: 'budget',          label: 'Budget Monitoring', icon: 'fa-wallet' },
  { page: 'recommendations', label: 'Recommendations',   icon: 'fa-lightbulb' },
  { page: 'actions',         label: 'Actions',           icon: 'fa-bolt' },
  { page: 'timeline',        label: 'Timeline',          icon: 'fa-timeline' },

  // ----- Intelligence -----
  { section: 'Intelligence' },
  { page: 'world-model',     label: 'World Model',       icon: 'fa-brain' },
  { page: 'learning',        label: 'Learning',          icon: 'fa-graduation-cap' },

  // ----- System -----
  { section: 'System' },
  { page: 'settings',        label: 'Settings',          icon: 'fa-gear' },
];
