// ============================================================
// api/auth.js — Auth API Calls
// Wraps GET/PATCH /auth/me and POST /auth/logout
// ============================================================

import { API_BASE } from '../config.js';
import { authHeaders } from '../core/auth.js';

/**
 * Fetches the current user's profile.
 * GET /api/v1/auth/me
 * Returns: { id, email, full_name, avatar_url, organization_id }
 */
export async function getProfile() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Failed to get profile (${res.status})`);
  return res.json();
}

/**
 * Updates the current user's display name.
 * PATCH /api/v1/auth/me
 * Body: { "full_name": "..." }
 */
export async function updateProfile(fullName) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ full_name: fullName }),
  });
  if (!res.ok) throw new Error(`Failed to update profile (${res.status})`);
  return res.json();
}

/**
 * Calls the backend logout endpoint.
 * POST /api/v1/auth/logout
 * Returns: { success: true, message: '...' }
 */
export async function logoutApi() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return res.json();
}
