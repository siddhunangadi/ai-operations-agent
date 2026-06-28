// ============================================================
// core/auth.js — Session Management
// Handles token storage, user session, and auth checks.
// The backend uses Supabase auth; tokens are stored in localStorage.
// AUTH_REQUIRED=false in dev means no token is needed.
// ============================================================

import { API_BASE } from '../config.js';

const TOKEN_KEY = 'ai_ops_token';
const USER_KEY  = 'ai_ops_user';

/**
 * Saves the auth token to localStorage.
 * Called after a successful Supabase login.
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieves the stored auth token.
 * Returns null if not logged in.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Saves the user profile object to localStorage so we don't
 * re-fetch it on every page load.
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieves the cached user profile from localStorage.
 */
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

/**
 * Removes all auth data from localStorage.
 * Called on logout.
 */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Returns the Authorization header if a token exists.
 * The backend validates this token with Supabase.
 * In dev mode (AUTH_REQUIRED=false), the backend accepts requests
 * without a token, so the header is optional.
 */
export function authHeaders() {
  const token = getToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

/**
 * Fetches the current user profile from /api/v1/auth/me.
 * If the call fails (e.g., no token), returns a demo user.
 * This allows the app to run in dev mode without login.
 */
export async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...authHeaders() }
    });

    if (res.ok) {
      const user = await res.json();
      saveUser(user);
      return user;
    }
  } catch (err) {
    console.warn('[auth] Could not fetch user profile:', err.message);
  }

  // Return a demo user when backend auth is not required
  const demo = {
    id: 'dev-user',
    email: 'admin@demo.local',
    full_name: 'Demo Admin',
    organization_id: 'org_1',
  };
  saveUser(demo);
  return demo;
}

/**
 * Logs out by calling the backend logout endpoint,
 * then clears local storage and redirects to login.
 */
export async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { ...authHeaders() },
    });
  } catch { /* ignore network errors on logout */ }

  clearSession();
  window.location.href = '/login.html';
}
