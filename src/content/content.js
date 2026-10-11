/**
 * @file content.js
 * @description WhatsApp Web Content Script.
 *
 * Responsibilities:
 * 1. Synchronizes privacy settings from chrome.storage.local into the active DOM.
 * 2. Toggles control classes on `document.body` (`wpb-active`, `wpb-blur-messages`, etc.).
 * 3. Injects custom blur intensity via CSS custom property (`--wpb-blur-radius`).
 * 4. Batches DOM mutation processing with `MutationObserver` and `requestAnimationFrame`
 *    so newly scrolled or incoming messages are tagged with zero frame drops.
 * 5. Handles keyboard shortcuts (Alt+X for master toggle, Alt+Shift+X for temporary reveal).
 * 6. Coordinates runtime messages between the extension popup and WhatsApp Web.
 */

import { SELECTORS, ATTRS } from './selectors.js';
import { getSettings, saveSettings, onSettingsChanged } from '../utils/settings.js';

(function initWhatsAppPrivacyBlur() {
  // Prevent duplicate execution if content script is injected multiple times
  if (window.__WPB_INITIALIZED__) {
    return;
  }
  window.__WPB_INITIALIZED__ = true;

  // Active in-memory state
  let currentSettings = null;
  let isTemporarilyRevealed = false; // In-memory only; does NOT overwrite saved preferences
  let observer = null;
  let scheduledAnimationFrame = null;
  const pendingNodes = new Set();

  /**
   * Applies the current settings and temporary reveal state to the DOM.
   * Modifies CSS custom properties on :root and toggle classes on <body>.
   */
  function applyStateToDOM() {
    if (!currentSettings || !document.body) {
      return;
    }

    const {
      masterEnabled,
      blurMessages,
      blurNames,
      blurAvatars,
      blurPreviews,
      blurGroups,
      blurStrength,
      unblurOnHover
    } = currentSettings;

    // Dynamically update blur radius CSS custom property
    document.documentElement.style.setProperty('--wpb-blur-radius', `${blurStrength}px`);

    const cl = document.body.classList;

    // Master privacy mode toggle
    cl.toggle('wpb-active', Boolean(masterEnabled));

    // Temporary reveal mode (suspends blur visually without clearing user preferences)
    cl.toggle('wpb-revealed', Boolean(isTemporarilyRevealed));

    // Independent category toggles
    cl.toggle('wpb-blur-messages', Boolean(blurMessages));
    cl.toggle('wpb-blur-names', Boolean(blurNames));
    cl.toggle('wpb-blur-avatars', Boolean(blurAvatars));
    cl.toggle('wpb-blur-previews', Boolean(blurPreviews));
    cl.toggle('wpb-blur-groups', Boolean(blurGroups));
    cl.toggle('wpb-hover-reveal', Boolean(unblurOnHover));
  }

  /**
   * Tags matching DOM elements under a given root node with a specific privacy data attribute.
   *
   * @param {Element} root - Parent element to search within.
   * @param {string|string[]} queryOrQueries - CSS selector(s) to match.
   * @param {string} attrName - Target data attribute (e.g. data-wpb-message).
   */
  function tagMatchingElements(root, queryOrQueries, attrName) {
    if (!root || !root.querySelectorAll) return;

    const queries = Array.isArray(queryOrQueries) ? queryOrQueries : [queryOrQueries];

    for (const query of queries) {
      try {
        if (root.matches && root.matches(query) && !root.hasAttribute(attrName)) {
          root.setAttribute(attrName, 'true');
        }

        const matches = root.querySelectorAll(query);
        for (let i = 0; i < matches.length; i++) {
          const el = matches[i];
          if (!el.hasAttribute(attrName)) {
            el.setAttribute(attrName, 'true');
          }
        }
      } catch (err) {
        // Silently skip malformed or deprecated selectors
      }
    }
  }

  /**
   * Scans a DOM node (either the full document body or a dynamically appended subtree)
   * and tags all sensitive elements with their corresponding data attributes.
   *
   * @param {Node} node - Target node to inspect.
   */
  function tagSensitiveContent(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

    // 1. Message Bubble Text & Quoted Content
    tagMatchingElements(node, SELECTORS.messages.text, ATTRS.MESSAGE);
    tagMatchingElements(node, SELECTORS.messages.quoted, ATTRS.MESSAGE);

    // 2. Contact & Group Participant Names
    tagMatchingElements(node, SELECTORS.names.chatListItemTitle, ATTRS.NAME);
    tagMatchingElements(node, SELECTORS.names.activeHeaderTitle, ATTRS.NAME);
    tagMatchingElements(node, SELECTORS.names.groupAuthor, ATTRS.NAME);
    tagMatchingElements(node, SELECTORS.names.drawerTitle, ATTRS.NAME);

    // 3. Profile Avatars & Placeholders
    tagMatchingElements(node, SELECTORS.avatars.chatList, ATTRS.AVATAR);
    tagMatchingElements(node, SELECTORS.avatars.header, ATTRS.AVATAR);
    tagMatchingElements(node, SELECTORS.avatars.messages, ATTRS.AVATAR);
    tagMatchingElements(node, SELECTORS.avatars.drawer, ATTRS.AVATAR);
    tagMatchingElements(node, SELECTORS.avatars.placeholders, ATTRS.AVATAR);

    // 4. Chat List Previews
    tagMatchingElements(node, SELECTORS.previews.lastMessage, ATTRS.PREVIEW);

    // 5. Group Details & Participants List
    tagMatchingElements(node, SELECTORS.groupInfo.description, ATTRS.GROUP);
    tagMatchingElements(node, SELECTORS.groupInfo.participants, ATTRS.GROUP);
  }

  /**
   * Flushes queued mutation nodes during requestAnimationFrame.
   * Batches DOM traversals to maintain 60fps scrolling performance.
   */
  function flushPendingNodes() {
    scheduledAnimationFrame = null;

    if (pendingNodes.size === 0) return;

    pendingNodes.forEach((node) => {
      if (node.isConnected) {
        tagSensitiveContent(node);
      }
    });

    pendingNodes.clear();
  }

  /**
   * Enqueues an added DOM node for batch processing in the next animation frame.
   *
   * @param {Node} node - Appended node to queue.
   */
  function scheduleNodeProcessing(node) {
    pendingNodes.add(node);

    if (!scheduledAnimationFrame) {
      scheduledAnimationFrame = requestAnimationFrame(flushPendingNodes);
    }
  }

  /**
   * Initializes a MutationObserver on WhatsApp Web's root to capture
   * dynamically rendered virtual list rows, new messages, and open drawers.
   */
  function setupMutationObserver() {
    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
      // Skip processing when master privacy is switched off
      if (!currentSettings || !currentSettings.masterEnabled) {
        return;
      }

      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];

        if (mutation.type === 'childList') {
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const addedNode = mutation.addedNodes[j];
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              scheduleNodeProcessing(addedNode);
            }
          }
        }
      }
    });

    const target = document.body || document.documentElement;
    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Registers global keyboard shortcuts directly on window:
   * - Alt+X: Toggles master privacy mode on/off
   * - Alt+Shift+X: Toggles temporary reveal mode
   */
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();

        if (e.shiftKey) {
          // Alt+Shift+X: Temporary reveal toggle
          isTemporarilyRevealed = !isTemporarilyRevealed;
          applyStateToDOM();
        } else {
          // Alt+X: Master privacy toggle
          if (currentSettings) {
            const updated = {
              ...currentSettings,
              masterEnabled: !currentSettings.masterEnabled
            };
            currentSettings = updated;
            applyStateToDOM();
            saveSettings(updated).catch((err) => console.error('[WPB] Save error:', err));
          }
        }
      }
    }, { capture: true });
  }

  /**
   * Listens for runtime communication messages sent from the extension popup.
   */
  function setupMessageListener() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
      return;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (!request || !request.action) return false;

      switch (request.action) {
        case 'GET_STATUS':
          // Returns live tab status to the popup
          sendResponse({
            settings: currentSettings,
            isTemporarilyRevealed
          });
          return true;

        case 'TOGGLE_REVEAL':
          // Toggles temporary reveal and responds
          isTemporarilyRevealed = !isTemporarilyRevealed;
          applyStateToDOM();
          sendResponse({
            isTemporarilyRevealed,
            success: true
          });
          return true;

        case 'SET_REVEAL':
          // Sets explicit reveal boolean state
          isTemporarilyRevealed = Boolean(request.value);
          applyStateToDOM();
          sendResponse({
            isTemporarilyRevealed,
            success: true
          });
          return true;

        default:
          return false;
      }
    });
  }

  /**
   * Content script entry point & bootstrap sequence.
   */
  async function start() {
    try {
      currentSettings = await getSettings();

      // Ensure <body> is present before applying DOM modifications
      if (document.body) {
        applyStateToDOM();
        tagSensitiveContent(document.body);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          applyStateToDOM();
          tagSensitiveContent(document.body);
        }, { once: true });
      }

      setupMutationObserver();
      setupKeyboardShortcuts();
      setupMessageListener();

      // Real-time synchronization when settings change via the popup
      onSettingsChanged((newSettings) => {
        currentSettings = newSettings;
        applyStateToDOM();
        if (document.body && currentSettings.masterEnabled) {
          tagSensitiveContent(document.body);
        }
      });
    } catch (err) {
      console.error('[WPB] Initialization failed:', err);
    }
  }

  // Trigger bootstrap immediately or when DOM becomes ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
