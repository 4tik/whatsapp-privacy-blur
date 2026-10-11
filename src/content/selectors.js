/**
 * @file selectors.js
 * @description Resilient DOM Selectors & Data Attribute Mappings for WhatsApp Web.
 *
 * WhatsApp Web DOM Engineering Strategy:
 * ---------------------------------------
 * Meta frequently generates randomized, obfuscated CSS class names (such as `._ak8l`, `._ao3e`,
 * or `.x1iyjqo2`) that mutate with each WhatsApp Web release.
 *
 * To ensure high durability across WhatsApp Web updates:
 * 1. Semantic Landmarks: We prioritize ARIA roles (`role="row"`, `role="listitem"`),
 *    stable IDs (`#pane-side`, `#main`), and persistent ARIA labels (`aria-label="Chat list"`).
 * 2. Data Attributes: We target official testing and semantic attributes
 *    (`data-testid="msg-container"`, `data-testid="selectable-text"`, `span[title]`).
 * 3. Fallback Hierarchy: Arrays of fallback queries are supplied for each UI category,
 *    evaluated in order of reliability.
 */

/**
 * Categorized selector definitions for WhatsApp Web elements.
 * Contributors: When adding support for newly changed WhatsApp UI components,
 * add semantic queries to the respective array below.
 */
export const SELECTORS = {
  // Chat list column on the left
  chatListPane: '#pane-side, [aria-label="Chat list"], div[data-testid="chat-list"]',

  // Active message conversation panel in the center/main column
  mainPanel: '#main, [data-testid="conversation-panel-messages"]',

  // Right-hand drawer panels (Contact Info, Group Details, Media/Links)
  rightDrawer: 'div[data-testid="drawer-right"], div[data-testid="contact-info"], div[data-testid="group-info-drawer"]',

  // Message Bubbles and Content
  messages: {
    // Top-level containers for message rows
    container: 'div[data-testid="msg-container"], div.message-in, div.message-out, div[role="row"]',

    // Selectable text contents inside incoming and outgoing messages
    text: [
      'span.selectable-text',
      'span[data-testid="selectable-text"]',
      'div[data-testid="selectable-text"]',
      'span.copyable-text',
      'div[data-testid="msg-container"] span[dir="ltr"]',
      'div[data-testid="msg-container"] span[dir="rtl"]'
    ],

    // Quoted message cards & reply preview bubbles
    quoted: [
      'div[data-testid="quoted-message"]',
      'div[data-testid="chat-quoted-message"]',
      'div[aria-label*="Quoted"]'
    ]
  },

  // Contact & Group Names
  names: {
    // Contact / Group titles in the left chat list pane
    chatListItemTitle: [
      '#pane-side span[title]',
      '[aria-label="Chat list"] span[title]',
      'div[data-testid="cell-frame-title"] span',
      'div[data-testid="chat-list"] span[title]'
    ],

    // Contact or Group title in the active conversation header
    activeHeaderTitle: [
      '#main header [data-testid="conversation-info-header-chat-title"]',
      '#main header span[title]',
      '#main header [role="button"] span[dir="auto"]'
    ],

    // Sender participant names displayed above messages in group chats
    groupAuthor: [
      'div[data-testid="msg-container"] span[data-testid="author-name"]',
      'div[data-testid="msg-container"] span[dir="auto"].x1f66tw2',
      'span[data-testid="quoted-author"]'
    ],

    // Contact/participant names in the right-hand details drawer
    drawerTitle: [
      'div[data-testid="drawer-right"] span[title]',
      'div[data-testid="group-info-drawer"] span[title]',
      'div[data-testid="contact-info"] span[title]'
    ]
  },

  // Profile Avatars & Icons
  avatars: {
    // Profile avatars in the left chat list
    chatList: [
      '#pane-side img',
      '[aria-label="Chat list"] img',
      'div[data-testid="cell-frame-container"] img',
      'div[data-testid="avatar-wrapper"] img'
    ],

    // Avatar in the active conversation header
    header: [
      '#main header img',
      'div[data-testid="conversation-header"] img'
    ],

    // Sender avatars beside incoming group chat messages
    messages: [
      'div[data-testid="msg-container"] img[src*="blob"]',
      'div[data-testid="msg-container"] img[src*="whatsapp"]'
    ],

    // Avatars in contact info / group participants drawer
    drawer: [
      'div[data-testid="drawer-right"] img',
      'div[data-testid="group-info-drawer"] img'
    ],

    // Default placeholder SVG avatars (when user has no profile photo)
    placeholders: [
      'span[data-icon="default-user"]',
      'span[data-icon="avatar"]',
      'div[data-testid="avatar-wrapper"] svg'
    ]
  },

  // Chat List Preview Snippets (last message text in left list)
  previews: {
    lastMessage: [
      '#pane-side div[role="row"] span[dir="ltr"]:not([title])',
      '#pane-side div[role="row"] span[dir="rtl"]:not([title])',
      '#pane-side [data-testid="last-msg-status"]',
      'div[data-testid="cell-frame-secondary-title"]',
      '#pane-side span[data-testid="status-dblcheck"] + span',
      '#pane-side span[data-testid="status-check"] + span'
    ]
  },

  // Group Details & Participant Roster
  groupInfo: {
    // Group subject and description block in drawer
    description: [
      '[data-testid="group-info-drawer"] [data-testid="group-info-description"]',
      'div[data-testid="drawer-right"] div[data-testid="chat-title"]'
    ],
    // Group participant rows in drawer
    participants: [
      '[data-testid="group-info-drawer"] [role="listitem"] span[title]',
      'div[data-testid="drawer-right"] [role="listitem"] span[title]'
    ]
  }
};

/**
 * HTML data attributes applied by content.js to tag identified DOM elements.
 * Facilitates high-performance CSS filter targeting via privacy.css.
 * @enum {string}
 */
export const ATTRS = {
  MESSAGE: 'data-wpb-message',
  NAME: 'data-wpb-name',
  AVATAR: 'data-wpb-avatar',
  PREVIEW: 'data-wpb-preview',
  GROUP: 'data-wpb-group'
};
