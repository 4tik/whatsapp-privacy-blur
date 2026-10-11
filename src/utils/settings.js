/**
 * @file settings.js
 * @description Centralized state & storage manager for WhatsApp Privacy Blur.
 *
 * Persists user privacy preferences via Chrome's local storage API (`chrome.storage.local`).
 * Provides data validation, sanitization, default fallbacks, and real-time subscription
 * listeners for seamless state synchronization across the Vue popup and content script.
 */

/**
 * Storage key used within chrome.storage.local
 * @type {string}
 */
export const STORAGE_KEY = 'whatsapp_privacy_blur_settings';

/**
 * Default settings schema applied to new installations or upon configuration reset.
 * @type {Readonly<{
 *   masterEnabled: boolean,
 *   blurMessages: boolean,
 *   blurNames: boolean,
 *   blurAvatars: boolean,
 *   blurPreviews: boolean,
 *   blurGroups: boolean,
 *   blurStrength: number,
 *   unblurOnHover: boolean
 * }>}
 */
export const DEFAULT_SETTINGS = Object.freeze({
  masterEnabled: true,  // Master toggle that controls all blur filters
  blurMessages: true,   // Obscures message bubble text & quoted previews
  blurNames: true,      // Obscures contact/group titles in header, list & drawer
  blurAvatars: true,    // Obscures contact profile photos & group icons
  blurPreviews: true,   // Obscures the last message preview line in the chat list
  blurGroups: true,     // Obscures group descriptions and participant listings
  blurStrength: 8,      // Blur radius in pixels (clamped between 2px and 20px)
  unblurOnHover: true   // Temporarily unblurs an element when mouse cursor hovers over it
});

/**
 * Validates, cleans, and bounds an incoming settings object.
 * Protects against missing properties, invalid data types, or out-of-range slider numbers.
 *
 * @param {unknown} input - Raw settings candidate from storage or user input.
 * @returns {typeof DEFAULT_SETTINGS} Sanitized settings with guaranteed types and ranges.
 */
export function sanitizeSettings(input) {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const sanitized = { ...DEFAULT_SETTINGS };

  // Validate boolean toggle fields
  const booleanKeys = [
    'masterEnabled',
    'blurMessages',
    'blurNames',
    'blurAvatars',
    'blurPreviews',
    'blurGroups',
    'unblurOnHover'
  ];

  for (const key of booleanKeys) {
    if (typeof input[key] === 'boolean') {
      sanitized[key] = input[key];
    }
  }

  // Validate and clamp numeric blur radius (2px min to 20px max)
  if (typeof input.blurStrength === 'number' && !isNaN(input.blurStrength)) {
    sanitized.blurStrength = Math.min(20, Math.max(2, Math.round(input.blurStrength)));
  } else if (typeof input.blurStrength === 'string') {
    const parsed = parseInt(input.blurStrength, 10);
    if (!isNaN(parsed)) {
      sanitized.blurStrength = Math.min(20, Math.max(2, parsed));
    }
  }

  return sanitized;
}

/**
 * Checks whether the Chrome Storage API is available in the current execution runtime.
 * Returns false when running in standard browser dev environments outside an extension context.
 *
 * @returns {boolean} True if chrome.storage.local is accessible.
 */
export function isStorageAvailable() {
  return (
    typeof chrome !== 'undefined' &&
    Boolean(chrome.storage) &&
    Boolean(chrome.storage.local) &&
    typeof chrome.storage.local.get === 'function'
  );
}

/**
 * Asynchronously loads settings from chrome.storage.local.
 * Automatically initializes storage with default values if run for the first time.
 *
 * @returns {Promise<typeof DEFAULT_SETTINGS>} Stored or default settings.
 */
export async function getSettings() {
  if (!isStorageAvailable()) {
    return { ...DEFAULT_SETTINGS };
  }

  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.error('[WPB] Storage load error:', chrome.runtime.lastError.message);
          resolve({ ...DEFAULT_SETTINGS });
          return;
        }

        if (result && result[STORAGE_KEY]) {
          resolve(sanitizeSettings(result[STORAGE_KEY]));
        } else {
          // First-time user bootstrap: persist and return default settings
          const initial = { ...DEFAULT_SETTINGS };
          chrome.storage.local.set({ [STORAGE_KEY]: initial }, () => {
            resolve(initial);
          });
        }
      });
    } catch (err) {
      console.error('[WPB] Unexpected storage access exception:', err);
      resolve({ ...DEFAULT_SETTINGS });
    }
  });
}

/**
 * Saves validated settings to chrome.storage.local.
 *
 * @param {Partial<typeof DEFAULT_SETTINGS>} newSettings - Candidate settings to persist.
 * @returns {Promise<typeof DEFAULT_SETTINGS>} The cleaned settings that were committed.
 */
export async function saveSettings(newSettings) {
  const sanitized = sanitizeSettings(newSettings);

  if (!isStorageAvailable()) {
    return sanitized;
  }

  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: sanitized }, () => {
        if (chrome.runtime.lastError) {
          console.error('[WPB] Storage save error:', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(sanitized);
      });
    } catch (err) {
      console.error('[WPB] Storage set error:', err);
      reject(err);
    }
  });
}

/**
 * Resets all privacy preferences back to initial default values.
 *
 * @returns {Promise<typeof DEFAULT_SETTINGS>}
 */
export async function resetSettings() {
  return saveSettings(DEFAULT_SETTINGS);
}

/**
 * Attaches a storage change observer to synchronize settings across
 * the popup, background (if used), and injected content scripts.
 *
 * @param {function(typeof DEFAULT_SETTINGS): void} callback - Handler called with updated settings.
 * @returns {function(): void} Unsubscribe cleanup function.
 */
export function onSettingsChanged(callback) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) {
    return () => {};
  }

  const listener = (changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      const updated = sanitizeSettings(changes[STORAGE_KEY].newValue);
      callback(updated);
    }
  };

  chrome.storage.onChanged.addListener(listener);
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}
