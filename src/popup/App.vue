<template>
  <div class="popup-container">
    <!-- Header -->
    <header class="popup-header">
      <div class="header-brand">
        <div class="header-icon-wrap">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9a3 3 0 100 6 3 3 0 000-6z"/>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="header-title">WhatsApp Privacy</h1>
          <p class="header-subtitle">Visual Privacy Protection</p>
        </div>
      </div>

      <div class="header-status">
        <span
          class="status-badge"
          :class="statusBadgeClass"
          :title="statusBadgeTooltip"
        >
          <span class="status-dot"></span>
          {{ statusBadgeText }}
        </span>
      </div>
    </header>

    <!-- Feedback Toast Notification -->
    <transition name="fade">
      <div v-if="feedbackMessage" class="feedback-toast" role="status" aria-live="polite">
        <svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        <span>{{ feedbackMessage }}</span>
      </div>
    </transition>

    <main class="popup-content">
      <!-- 1. Master Privacy Switch Card -->
      <section class="card master-card">
        <div class="master-info">
          <div class="master-title-row">
            <span class="master-title">Master Privacy</span>
            <span class="master-indicator" :class="{ 'is-active': settings.masterEnabled }">
              {{ settings.masterEnabled ? 'ON' : 'OFF' }}
            </span>
          </div>
          <p class="master-desc">Enable or disable all blur filters immediately</p>
        </div>

        <label class="switch-control master-switch">
          <input
            type="checkbox"
            v-model="settings.masterEnabled"
            @change="handleSettingChange"
            aria-label="Toggle Master Privacy"
          />
          <span class="slider round"></span>
        </label>
      </section>

      <!-- 2. Temporary Reveal Action Card -->
      <section class="card reveal-card">
        <div class="reveal-inner">
          <button
            type="button"
            class="btn-reveal"
            :class="{ 'is-revealed': isTemporarilyRevealed }"
            @click="toggleTemporaryReveal"
            :disabled="!settings.masterEnabled"
            :aria-pressed="isTemporarilyRevealed"
          >
            <!-- Eye icon when hidden, Eye Off icon when revealed -->
            <svg v-if="!isTemporarilyRevealed" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
            </svg>
            <span>{{ isTemporarilyRevealed ? 'Reapply Blur' : 'Temporarily Reveal' }}</span>
          </button>
          <span class="reveal-hint">Alt+Shift+X</span>
        </div>
      </section>

      <!-- 3. Independent Category Controls -->
      <section class="card category-card" :class="{ 'card-disabled': !settings.masterEnabled }">
        <h2 class="section-title">Privacy Categories</h2>

        <div class="toggle-list">
          <!-- Messages -->
          <div class="toggle-row">
            <div class="toggle-label-wrap">
              <div class="row-icon-wrap">
                <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <div class="toggle-texts">
                <span class="toggle-name">Message Text</span>
                <span class="toggle-hint">Incoming, outgoing & quoted messages</span>
              </div>
            </div>
            <label class="switch-control">
              <input
                type="checkbox"
                v-model="settings.blurMessages"
                :disabled="!settings.masterEnabled"
                @change="handleSettingChange"
                aria-label="Blur Message Text"
              />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Contact Names -->
          <div class="toggle-row">
            <div class="toggle-label-wrap">
              <div class="row-icon-wrap">
                <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div class="toggle-texts">
                <span class="toggle-name">Contact Names</span>
                <span class="toggle-hint">Chat header, list titles & drawer</span>
              </div>
            </div>
            <label class="switch-control">
              <input
                type="checkbox"
                v-model="settings.blurNames"
                :disabled="!settings.masterEnabled"
                @change="handleSettingChange"
                aria-label="Blur Contact Names"
              />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Profile Avatars -->
          <div class="toggle-row">
            <div class="toggle-label-wrap">
              <div class="row-icon-wrap">
                <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <div class="toggle-texts">
                <span class="toggle-name">Profile Avatars</span>
                <span class="toggle-hint">Photos in chat list, headers & groups</span>
              </div>
            </div>
            <label class="switch-control">
              <input
                type="checkbox"
                v-model="settings.blurAvatars"
                :disabled="!settings.masterEnabled"
                @change="handleSettingChange"
                aria-label="Blur Profile Avatars"
              />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Chat Previews -->
          <div class="toggle-row">
            <div class="toggle-label-wrap">
              <div class="row-icon-wrap">
                <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h7"/>
                </svg>
              </div>
              <div class="toggle-texts">
                <span class="toggle-name">Chat List Previews</span>
                <span class="toggle-hint">Last message preview snippet</span>
              </div>
            </div>
            <label class="switch-control">
              <input
                type="checkbox"
                v-model="settings.blurPreviews"
                :disabled="!settings.masterEnabled"
                @change="handleSettingChange"
                aria-label="Blur Chat List Previews"
              />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Group & Participant Info -->
          <div class="toggle-row">
            <div class="toggle-label-wrap">
              <div class="row-icon-wrap">
                <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div class="toggle-texts">
                <span class="toggle-name">Group Information</span>
                <span class="toggle-hint">Participant names & descriptions</span>
              </div>
            </div>
            <label class="switch-control">
              <input
                type="checkbox"
                v-model="settings.blurGroups"
                :disabled="!settings.masterEnabled"
                @change="handleSettingChange"
                aria-label="Blur Group Information"
              />
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Hover to Peek Option -->
          <div class="toggle-row toggle-row-secondary">
            <div class="toggle-label-wrap">
              <div class="row-icon-wrap">
                <svg class="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                </svg>
              </div>
              <div class="toggle-texts">
                <span class="toggle-name">Hover to Peek</span>
                <span class="toggle-hint">Unblur element smoothly when hovering</span>
              </div>
            </div>
            <label class="switch-control">
              <input
                type="checkbox"
                v-model="settings.unblurOnHover"
                :disabled="!settings.masterEnabled"
                @change="handleSettingChange"
                aria-label="Unblur on Hover"
              />
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- 4. Adjustable Blur Strength Slider -->
      <section class="card slider-card" :class="{ 'card-disabled': !settings.masterEnabled }">
        <div class="slider-header">
          <div class="slider-title-wrap">
            <span class="slider-title">Blur Strength</span>
            <span class="slider-desc">Filter intensity</span>
          </div>
          <span class="slider-value-pill">{{ settings.blurStrength }} px</span>
        </div>

        <div class="slider-input-wrapper">
          <input
            type="range"
            min="2"
            max="20"
            step="1"
            v-model.number="settings.blurStrength"
            :disabled="!settings.masterEnabled"
            @input="handleSettingChange"
            aria-label="Blur strength slider"
            class="range-slider"
          />
          <div class="slider-marks">
            <span>2px (Subtle)</span>
            <span>8px (Normal)</span>
            <span>20px (Strong)</span>
          </div>
        </div>
      </section>

      <!-- 5. Quick Controls -->
      <section class="quick-actions-bar">
        <button
          type="button"
          class="btn-action"
          @click="enableAllCategories"
          :disabled="!settings.masterEnabled"
        >
          Enable All
        </button>
        <button
          type="button"
          class="btn-action"
          @click="disableAllCategories"
          :disabled="!settings.masterEnabled"
        >
          Disable All
        </button>
        <button
          type="button"
          class="btn-action btn-reset"
          @click="handleReset"
        >
          Reset Defaults
        </button>
      </section>
    </main>

    <!-- Footer -->
    <footer class="popup-footer">
      <div class="footer-meta">
        <span class="footer-version">v1.0.0</span>
        <span class="footer-dot">•</span>
        <span class="footer-tag">Client-side only</span>
      </div>
      <p class="footer-privacy">
        100% Local & Private. No data is collected, stored, or sent.
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  resetSettings,
  onSettingsChanged
} from '../utils/settings.js';

// Reactive Settings State
const settings = ref({ ...DEFAULT_SETTINGS });
const isTemporarilyRevealed = ref(false);
const feedbackMessage = ref('');
let feedbackTimeout = null;

// Status Badge Computed Properties
const statusBadgeText = computed(() => {
  if (isTemporarilyRevealed.value) return 'Revealed';
  if (settings.value.masterEnabled) return 'Protected';
  return 'Disabled';
});

const statusBadgeClass = computed(() => {
  if (isTemporarilyRevealed.value) return 'status-revealed';
  if (settings.value.masterEnabled) return 'status-active';
  return 'status-disabled';
});

const statusBadgeTooltip = computed(() => {
  if (isTemporarilyRevealed.value) return 'Temporary reveal is currently active';
  if (settings.value.masterEnabled) return 'Privacy blur is actively shielding WhatsApp Web';
  return 'Privacy blur is currently disabled';
});

/**
 * Show temporary toast feedback message
 */
function showToast(msg) {
  if (feedbackTimeout) clearTimeout(feedbackTimeout);
  feedbackMessage.value = msg;
  feedbackTimeout = setTimeout(() => {
    feedbackMessage.value = '';
    feedbackTimeout = null;
  }, 2200);
}

/**
 * Persist modified settings to chrome.storage.local
 */
async function handleSettingChange() {
  try {
    const saved = await saveSettings(settings.value);
    settings.value = { ...saved };
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

/**
 * Toggle Temporary Reveal in active WhatsApp Web tab
 */
function toggleTemporaryReveal() {
  if (!settings.value.masterEnabled) return;

  const targetState = !isTemporarilyRevealed.value;
  isTemporarilyRevealed.value = targetState;

  // Send message to active tab if on WhatsApp Web
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'SET_REVEAL',
          value: targetState
        }, (res) => {
          if (chrome.runtime.lastError) {
            // Tab might not be WhatsApp or not loaded yet
          }
        });
      }
    });
  }

  showToast(targetState ? 'Content revealed temporarily' : 'Privacy blur restored');
}

/**
 * Quick Action: Enable All Categories
 */
async function enableAllCategories() {
  settings.value.blurMessages = true;
  settings.value.blurNames = true;
  settings.value.blurAvatars = true;
  settings.value.blurPreviews = true;
  settings.value.blurGroups = true;
  await handleSettingChange();
  showToast('All privacy categories enabled');
}

/**
 * Quick Action: Disable All Categories
 */
async function disableAllCategories() {
  settings.value.blurMessages = false;
  settings.value.blurNames = false;
  settings.value.blurAvatars = false;
  settings.value.blurPreviews = false;
  settings.value.blurGroups = false;
  await handleSettingChange();
  showToast('All privacy categories disabled');
}

/**
 * Quick Action: Reset Settings to Defaults
 */
async function handleReset() {
  try {
    const reset = await resetSettings();
    settings.value = { ...reset };
    isTemporarilyRevealed.value = false;
    showToast('Settings reset to defaults');
  } catch (err) {
    console.error('Failed to reset settings:', err);
  }
}

/**
 * Synchronize state on popup open
 */
onMounted(async () => {
  // Load saved settings
  const loaded = await getSettings();
  settings.value = { ...loaded };

  // Query active tab to check temporary reveal status
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'GET_STATUS' }, (res) => {
          if (!chrome.runtime.lastError && res) {
            if (typeof res.isTemporarilyRevealed === 'boolean') {
              isTemporarilyRevealed.value = res.isTemporarilyRevealed;
            }
          }
        });
      }
    });
  }

  // Subscribe to storage changes
  onSettingsChanged((newSettings) => {
    settings.value = { ...newSettings };
  });
});
</script>

<style scoped>
.popup-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 520px;
  background-color: #F8FAFC;
}

/* Header */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #EEF2FF;
  border-radius: 8px;
  color: #4F46E5;
}

.header-icon {
  width: 20px;
  height: 20px;
}

.header-title {
  font-size: 14px;
  font-weight: 700;
  color: #1E293B;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 11px;
  color: #64748B;
  line-height: 1.2;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid transparent;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-active {
  background-color: #F0FDF4;
  color: #15803D;
  border-color: #BBF7D0;
}
.status-active .status-dot {
  background-color: #22C55E;
}

.status-revealed {
  background-color: #FFFBEB;
  color: #B45309;
  border-color: #FDE68A;
}
.status-revealed .status-dot {
  background-color: #F59E0B;
}

.status-disabled {
  background-color: #F1F5F9;
  color: #64748B;
  border-color: #E2E8F0;
}
.status-disabled .status-dot {
  background-color: #94A3B8;
}

/* Feedback Toast */
.feedback-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 16px 0 16px;
  padding: 8px 12px;
  background-color: #1E293B;
  color: #FFFFFF;
  border-radius: 6px;
  font-size: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.toast-icon {
  width: 16px;
  height: 16px;
  color: #22C55E;
  flex-shrink: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Content */
.popup-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
}

/* Cards */
.card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 12px;
  transition: opacity 0.15s ease, border-color 0.15s ease;
}

.card-disabled {
  opacity: 0.55;
  pointer-events: none;
}

/* Master Card */
.master-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-color: #CBD5E1;
  background-color: #FFFFFF;
}

.master-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.master-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.master-title {
  font-size: 13px;
  font-weight: 700;
  color: #1E293B;
}

.master-indicator {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: #F1F5F9;
  color: #64748B;
}
.master-indicator.is-active {
  background-color: #EEF2FF;
  color: #4F46E5;
}

.master-desc {
  font-size: 11px;
  color: #64748B;
}

/* Reveal Card */
.reveal-card {
  padding: 8px 12px;
}

.reveal-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-reveal {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  background-color: #F8FAFC;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reveal:hover:not(:disabled) {
  background-color: #F1F5F9;
  border-color: #CBD5E1;
  color: #1E293B;
}

.btn-reveal.is-revealed {
  background-color: #FEF3C7;
  border-color: #FCD34D;
  color: #92400E;
}

.btn-reveal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 15px;
  height: 15px;
}

.reveal-hint {
  font-size: 11px;
  font-family: monospace;
  color: #64748B;
  background-color: #F1F5F9;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid #E2E8F0;
}

/* Category Card */
.section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748B;
  margin-bottom: 8px;
}

.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.toggle-row-secondary {
  border-top: 1px dashed #E2E8F0;
  margin-top: 4px;
  padding-top: 8px;
}

.toggle-label-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #F1F5F9;
  border-radius: 5px;
  color: #64748B;
  flex-shrink: 0;
}

.row-icon {
  width: 14px;
  height: 14px;
}

.toggle-texts {
  display: flex;
  flex-direction: column;
}

.toggle-name {
  font-size: 12px;
  font-weight: 600;
  color: #1E293B;
}

.toggle-hint {
  font-size: 10px;
  color: #64748B;
}

/* Switches */
.switch-control {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}

.master-switch {
  width: 44px;
  height: 24px;
}

.switch-control input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #CBD5E1;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slider::before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.master-switch .slider::before {
  height: 18px;
  width: 18px;
}

input:checked + .slider {
  background-color: #4F46E5;
}

input:checked + .slider:hover {
  background-color: #4338CA;
}

input:checked + .slider::before {
  transform: translateX(16px);
}

.master-switch input:checked + .slider::before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 20px;
}

.slider.round::before {
  border-radius: 50%;
}

/* Blur Strength Slider Card */
.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.slider-title {
  font-size: 12px;
  font-weight: 600;
  color: #1E293B;
}

.slider-desc {
  font-size: 10px;
  color: #64748B;
  display: block;
}

.slider-value-pill {
  font-size: 11px;
  font-weight: 700;
  color: #4F46E5;
  background-color: #EEF2FF;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #E0E7FF;
}

.range-slider {
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: #E2E8F0;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4F46E5;
  cursor: pointer;
  border: 2px solid #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  background: #4338CA;
  transform: scale(1.15);
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  color: #64748B;
}

/* Quick Actions Bar */
.quick-actions-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.btn-action {
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action:hover:not(:disabled) {
  background-color: #F8FAFC;
  border-color: #CBD5E1;
  color: #1E293B;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reset {
  color: #64748B;
}

.btn-reset:hover:not(:disabled) {
  color: #DC2626;
  border-color: #FCA5A5;
  background-color: #FEF2F2;
}

/* Footer */
.popup-footer {
  margin-top: auto;
  padding: 10px 16px;
  background-color: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  text-align: center;
}

.footer-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: #64748B;
  font-weight: 500;
}

.footer-version {
  font-family: monospace;
}

.footer-privacy {
  margin-top: 3px;
  font-size: 10px;
  color: #94A3B8;
  line-height: 1.3;
}
</style>
