// pages/settings.js — User Settings
import { getProfile } from '../api/auth.js';
import { updateProfile } from '../api/auth.js';
import { loadingState, errorState } from '../components/states.js';
import { API_BASE } from '../config.js';
import { notify } from '../core/notifications.js';

export async function init() {
  const c = document.getElementById('settings-content');
  if (c) c.innerHTML = loadingState('Loading settings...');
  try {
    const user = await getProfile();
    renderSettings(user);
  } catch (err) {
    const c = document.getElementById('settings-content');
    if (c) c.innerHTML = errorState('Failed to load settings', err.message);
    notify.error('Settings failed', err.message);
  }
}

function renderSettings(user) {
  const c = document.getElementById('settings-content');
  if (!c) return;

  c.innerHTML = `
    <!-- Profile Section -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-title">Profile</div>
        <div class="settings-section-desc">Manage your account display name</div>
      </div>
      <div class="settings-section-body">
        <div class="form-group">
          <label class="form-label" for="profile-name">Display Name</label>
          <input class="input" id="profile-name" type="text" value="${user.full_name || ''}" placeholder="Enter your name" maxlength="120" />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="input" type="email" value="${user.email || ''}" disabled />
          <div class="form-hint">Email cannot be changed here.</div>
        </div>
        <button class="btn btn-primary" id="save-profile-btn">
          <i class="fa-solid fa-floppy-disk"></i>
          Save Profile
        </button>
      </div>
    </div>

    <!-- System Info Section -->
    <div class="settings-section">
      <div class="settings-section-header">
        <div class="settings-section-title">System Information</div>
        <div class="settings-section-desc">Read-only connection details</div>
      </div>
      <div class="settings-section-body">
        <div class="settings-row">
          <div class="settings-row-label">Organization ID</div>
          <div class="settings-row-value">${user.organization_id || '—'}</div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">User ID</div>
          <div class="settings-row-value">${user.id || '—'}</div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">API Base URL</div>
          <div class="settings-row-value">${API_BASE}</div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Backend Docs</div>
          <div class="settings-row-value">
            <a href="http://localhost:8000/docs" target="_blank" style="color:var(--accent)">
              Open Swagger UI <i class="fa-solid fa-external-link"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="settings-section" style="border-color:var(--danger-border)">
      <div class="settings-section-header" style="background:var(--danger-light)">
        <div class="settings-section-title" style="color:var(--danger)">Session</div>
        <div class="settings-section-desc">Sign out of your account</div>
      </div>
      <div class="settings-section-body">
        <button class="btn btn-danger" id="logout-settings-btn">
          <i class="fa-solid fa-right-from-bracket"></i>
          Sign Out
        </button>
      </div>
    </div>
  `;

  // Save profile
  document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
    const btn      = document.getElementById('save-profile-btn');
    const nameEl   = document.getElementById('profile-name');
    const newName  = nameEl?.value.trim();

    if (!newName) { notify.warning('Name required', 'Please enter a display name.'); return; }

    btn.classList.add('loading');
    btn.disabled = true;

    try {
      await updateProfile(newName);
      notify.success('Profile saved', 'Your name has been updated.');
    } catch (err) {
      notify.error('Save failed', err.message);
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  });

  // Logout from settings page
  document.getElementById('logout-settings-btn')?.addEventListener('click', async () => {
    const { logout } = await import('../core/auth.js');
    await logout();
  });
}
