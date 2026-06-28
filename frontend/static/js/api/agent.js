// ============================================================
// api/agent.js — AI Agent API Calls
// Wraps the chat endpoints including SSE streaming.
// ============================================================

import { API_BASE } from '../config.js';
import { authHeaders } from '../core/auth.js';

/**
 * Sends a question to the agent (standard JSON response).
 * Use this as a fallback if streaming is not supported.
 *
 * POST /api/v1/agent/chat
 * Body: { "question": "..." }
 * Returns: { success, answer, confidence, goal, strategy, tools_used, action }
 */
export async function sendChat(question) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Chat failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Sends a question to the agent with SSE streaming.
 * Returns a ReadableStream that emits Server-Sent Events.
 *
 * POST /api/v1/agent/chat/stream
 * Body: { "question": "..." }
 *
 * The caller is responsible for reading the stream.
 * See pages/chat.js for how to consume the stream.
 *
 * SSE event types:
 *   { type: 'start', message: '...' }
 *   { type: 'step',  node: '...', label: '...', confidence: 0.5 }
 *   { type: 'done',  answer: '...', confidence: 1.0, tools_used: [...] }
 */
export async function sendChatStream(question) {
  const res = await fetch(`${API_BASE}/agent/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Stream failed (${res.status}): ${text}`);
  }

  // Return the raw Response so the caller can read the stream body
  return res;
}
