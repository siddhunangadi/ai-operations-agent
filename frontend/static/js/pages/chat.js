// ============================================================
// pages/chat.js — AI Chat Page
//
// What it does:
//   Sends user messages to the AI agent via SSE streaming.
//   Shows live step-by-step progress as the agent thinks.
//   Renders the final answer with confidence, tools used, etc.
//
// Which API it calls:
//   POST /api/v1/agent/chat/stream  (primary — Server-Sent Events)
//   POST /api/v1/agent/chat         (fallback — standard JSON)
//
// SSE Event types from backend:
//   { type: 'start', message: 'Starting investigation' }
//   { type: 'step',  node: 'planner', label: 'Planning investigation', confidence: 0.3 }
//   { type: 'done',  answer: '...', confidence: 0.9, tools_used: [...] }
// ============================================================

import { sendChatStream, sendChat } from '../api/agent.js';
import { createToolChip } from '../components/badge.js';
import { formatConfidence, formatDate } from '../core/utils.js';
import { notify } from '../core/notifications.js';

// Track all messages for the session
let messages = [];
// Track whether a request is in-flight
let isStreaming = false;

/**
 * init() is called by the router when the chat page loads.
 */
export function init() {
  messages = [];
  isStreaming = false;
  setupEventListeners();
  showWelcome();
}

/** Attaches event listeners to the input and send button */
function setupEventListeners() {
  const input   = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  if (!input || !sendBtn) return;

  // Send on button click
  sendBtn.addEventListener('click', handleSend);

  // Send on Enter key (Shift+Enter = new line)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea as user types
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Suggestion chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent;
      input.focus();
    });
  });
}

/** Handles the send action: validates, shows user message, starts streaming */
async function handleSend() {
  if (isStreaming) return;

  const input = document.getElementById('chat-input');
  const question = input?.value.trim();
  if (!question) return;

  // Clear input and reset height
  input.value = '';
  input.style.height = 'auto';
  setStreaming(true);

  // Hide the welcome screen once user sends first message
  hideWelcome();

  // Append user message to the chat
  appendUserMessage(question);

  // Create the assistant message container (will be filled by stream)
  const assistantMsgEl = appendAssistantPlaceholder();

  try {
    await streamResponse(question, assistantMsgEl);
  } catch (err) {
    console.error('[chat] Stream error:', err);
    finalizeAssistantMessage(assistantMsgEl, {
      answer: `Sorry, I encountered an error: ${err.message}`,
      confidence: 0,
      tools_used: [],
    }, true);
    notify.error('Chat failed', err.message);
  } finally {
    setStreaming(false);
  }
}

/**
 * Opens the SSE stream and processes events as they arrive.
 * Each 'step' event updates the thinking indicator.
 * The 'done' event renders the final answer.
 */
async function streamResponse(question, msgEl) {
  const response = await sendChatStream(question);
  const reader   = response.body.getReader();
  const decoder  = new TextDecoder();

  let buffer = '';

  // Update the placeholder to show typing indicator
  showTypingIndicator(msgEl);

  while (true) {
    // Read the next chunk from the SSE stream
    const { done, value } = await reader.read();
    if (done) break;

    // Decode bytes to text and add to buffer
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by double newlines
    const lines = buffer.split('\n\n');
    // Keep the last incomplete chunk in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      // Each SSE event line starts with 'data: '
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const event = JSON.parse(jsonStr);
        handleStreamEvent(event, msgEl);
      } catch (e) {
        console.warn('[chat] Failed to parse SSE event:', jsonStr);
      }
    }
  }
}

/**
 * Handles a single SSE event from the backend.
 * - 'start' → show initial thinking label
 * - 'step'  → add a completed step to the list
 * - 'done'  → render the final answer
 */
function handleStreamEvent(event, msgEl) {
  if (event.type === 'start') {
    updateThinkingLabel(msgEl, 'Starting investigation...');
  }

  if (event.type === 'step') {
    // Add the completed step to the steps list
    addCompletedStep(msgEl, event.label || event.node);
    if (event.confidence) {
      updateThinkingLabel(msgEl, `${event.label} · ${formatConfidence(event.confidence)} confident`);
    }
  }

  if (event.type === 'done') {
    // Render the final complete response
    finalizeAssistantMessage(msgEl, event, false);
  }
}

// ---- DOM Manipulation functions ----

/** Appends a user message bubble to the chat */
function appendUserMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'chat-message user';
  div.innerHTML = `
    <div class="message-avatar user-avatar-icon">
      <i class="fa-solid fa-user"></i>
    </div>
    <div class="message-content">
      <div class="message-bubble">${escapeHtml(text)}</div>
      <div class="message-time">${formatDate(new Date().toISOString())}</div>
    </div>
  `;
  container.appendChild(div);
  scrollToBottom();
}

/** Creates an empty assistant message container for the stream to fill */
function appendAssistantPlaceholder() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const div = document.createElement('div');
  div.className = 'chat-message assistant';
  div.innerHTML = `
    <div class="message-avatar bot-avatar">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="agent-steps" id="agent-steps-list"></div>
        <div class="thinking-label" id="thinking-label"></div>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(div);
  scrollToBottom();
  return div;
}

/** Shows a typing indicator inside the assistant message */
function showTypingIndicator(msgEl) {
  const label = msgEl?.querySelector('#thinking-label');
  if (label) label.textContent = 'Thinking...';
}

/** Updates the label shown while the agent is working */
function updateThinkingLabel(msgEl, text) {
  const label = msgEl?.querySelector('#thinking-label');
  if (label) label.textContent = text;
}

/** Adds a completed step line to the agent steps list */
function addCompletedStep(msgEl, label) {
  const list = msgEl?.querySelector('#agent-steps-list');
  if (!list) return;

  const step = document.createElement('div');
  step.className = 'agent-step done';
  step.innerHTML = `
    <div class="step-icon"><i class="fa-solid fa-check"></i></div>
    <span>${label}</span>
  `;
  list.appendChild(step);
  scrollToBottom();
}

/**
 * Replaces the placeholder bubble with the final answer.
 * @param {HTMLElement} msgEl  - The assistant message container
 * @param {Object}      data   - The 'done' event data from the stream
 * @param {boolean}     isError- Whether this is an error state
 */
function finalizeAssistantMessage(msgEl, data, isError) {
  if (!msgEl) return;
  const bubble = msgEl.querySelector('.message-bubble');
  if (!bubble) return;

  const toolsHtml = (data.tools_used?.length)
    ? `<div class="tools-used">
        <div class="tools-label">Tools used</div>
        ${data.tools_used.map(createToolChip).join('')}
       </div>`
    : '';

  const confidenceHtml = (data.confidence && !isError)
    ? `<span class="confidence-badge">
        <i class="fa-solid fa-circle-check"></i>
        ${formatConfidence(data.confidence)} confident
       </span>`
    : '';

  // Get the completed steps HTML before replacing
  const stepsEl    = bubble.querySelector('#agent-steps-list');
  const stepsHtml  = stepsEl ? stepsEl.outerHTML : '';

  bubble.innerHTML = `
    ${stepsHtml}
    <div style="margin-top:${stepsEl?.children.length ? 'var(--sp-3)' : '0'};padding-top:${stepsEl?.children.length ? 'var(--sp-3)' : '0'};${stepsEl?.children.length ? 'border-top:1px solid var(--border-subtle)' : ''}">
      ${isError
        ? `<span style="color:var(--danger)">${escapeHtml(data.answer)}</span>`
        : formatAnswer(data.answer || 'No response received.')
      }
    </div>
    ${toolsHtml}
    ${confidenceHtml}
  `;

  scrollToBottom();
}

/** Simple markdown-like formatting for the answer text */
function formatAnswer(text) {
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
}

/** Escapes HTML special characters to prevent XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Scrolls the chat to the bottom after each update */
function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

/** Enables or disables the send button during streaming */
function setStreaming(active) {
  isStreaming = active;
  const sendBtn = document.getElementById('chat-send');
  const input   = document.getElementById('chat-input');
  if (sendBtn) sendBtn.disabled = active;
  if (input)   input.disabled  = active;
}

/** Shows the welcome screen (when no messages yet) */
function showWelcome() {
  const welcome = document.getElementById('chat-welcome');
  const msgs    = document.getElementById('chat-messages');
  if (welcome) welcome.style.display = 'flex';
  if (msgs)    msgs.style.display    = 'none';
}

/** Hides the welcome screen and shows the message list */
function hideWelcome() {
  const welcome = document.getElementById('chat-welcome');
  const msgs    = document.getElementById('chat-messages');
  if (welcome) welcome.style.display = 'none';
  if (msgs)    msgs.style.display    = 'flex';
}
