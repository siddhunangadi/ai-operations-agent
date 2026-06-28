// ============================================================
// api/dashboard.js — Dashboard API Calls
// Wraps all GET /api/v1/dashboard/* endpoints.
// Each function is named to match what it returns.
// ============================================================

import { API_BASE } from '../config.js';
import { authHeaders } from '../core/auth.js';

/**
 * Helper: performs a GET request to the given path.
 * Returns the parsed JSON body on success.
 * Throws an error with a useful message on failure.
 */
async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

// GET /api/v1/dashboard — full aggregated dashboard data
export const getDashboard        = () => get('/dashboard');

// GET /api/v1/dashboard/usage — token and request usage summary
export const getUsage            = () => get('/dashboard/usage');

// GET /api/v1/dashboard/cost — cost breakdown by day/model
export const getCost             = () => get('/dashboard/cost');

// GET /api/v1/dashboard/providers — per-provider stats
export const getProviders        = () => get('/dashboard/providers');

// GET /api/v1/dashboard/forecast — cost forecast for next period
export const getForecast         = () => get('/dashboard/forecast');

// GET /api/v1/dashboard/budget — budget limits and current spend
export const getBudget           = () => get('/dashboard/budget');

// GET /api/v1/dashboard/recommendations — optimization recommendations
export const getRecommendations  = () => get('/dashboard/recommendations');

// GET /api/v1/dashboard/health — system health score and breakdown
export const getHealth           = () => get('/dashboard/health');

// GET /api/v1/dashboard/world-model — agent's world model state
export const getWorldModel       = () => get('/dashboard/world-model');

// GET /api/v1/dashboard/learning?limit=N — recent learning entries
export const getLearning         = (limit = 20) => get(`/dashboard/learning?limit=${limit}`);

// GET /api/v1/dashboard/actions?limit=N — recent action history
export const getActions          = (limit = 50) => get(`/dashboard/actions?limit=${limit}`);

// GET /api/v1/dashboard/goals — agent goals from world model
export const getGoals            = () => get('/dashboard/goals');

// GET /api/v1/dashboard/timeline?limit=N — mixed timeline of actions+learning
export const getTimeline         = (limit = 30) => get(`/dashboard/timeline?limit=${limit}`);
