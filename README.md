<div align="center">

# 🛡️ WhatsApp Privacy Blur

**A lightweight, zero-tracking, open-source Chrome extension that safeguards your privacy on WhatsApp Web by selectively blurring messages, names, avatars, and previews.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg?style=flat-square)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D.svg?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg?style=flat-square)](SECURITY.md)

[Features](#-key-features) • [Installation](#-quick-installation-guide) • [Architecture](#-architecture) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [Contributing](#-contributing) • [Security & Privacy](#-privacy--security-policy)

</div>

---

## 📖 Overview

When using WhatsApp Web in public spaces, shared offices, cafes, or during screen-sharing sessions (Zoom, Google Meet, Teams), sensitive conversations, confidential contact names, and profile pictures are frequently exposed to accidental glances or video recordings.

**WhatsApp Privacy Blur** provides an elegant, reliable visual privacy barrier. It uses hardware-accelerated CSS blur filters and a debounced DOM mutation pipeline to blur sensitive elements instantly—preserving normal interface controls like timestamps and delivery checkmarks.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **⚡ Master Privacy Switch** | Toggle all privacy blurs on or off instantly across WhatsApp Web without reloading the tab. |
| **💬 Message Text Blur** | Obscures incoming, outgoing, and quoted reply message text while keeping timestamps and checkmarks visible. |
| **👤 Contact & Group Names** | Blurs names in the chat list, active conversation header, group author tags, and details drawers. |
| **🖼️ Profile Avatars** | Blurs user profile pictures in chat items, header bar, group message bubbles, and info panels. |
| **📑 Chat List Previews** | Obscures last message preview snippets in the left conversations sidebar. |
| **👥 Group Information** | Blurs group subjects, descriptions, and participant rosters. |
| **🔍 Hover to Peek** | Smoothly clears blur when your cursor hovers over any blurred item for quick, discreet reading. |
| **🎚️ Adjustable Blur Intensity** | Fine-tune blur intensity from `2px` (subtle) to `20px` (maximum) with an interactive slider. |
| **👁️ Temporary Reveal Mode** | Instantly unblur all content via popup button or keyboard shortcut without modifying saved settings. |
| **⌨️ Global Keyboard Shortcuts** | Fast shortcut toggles for both master privacy and temporary reveal. |
| **🔄 Zero Stale State** | Settings sync in real-time across tabs using `chrome.storage.local`. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| <kbd>Alt</kbd> + <kbd>X</kbd> | Toggle Master Privacy On/Off | Active WhatsApp Web Tab |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd> | Toggle Temporary Reveal Mode | Active WhatsApp Web Tab |

> *Tip: You can customize shortcuts at any time via `chrome://extensions/shortcuts` in Google Chrome.*

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Vue 3 Popup UI                       │
│  (App.vue: Master Toggle, Sliders, Category Switches)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ Reads & Writes
┌────────────────────────────────────────────────────────┐
│               chrome.storage.local                     │
│  (Persistent preferences, schema validation, defaults) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ Real-time Sync (onChanged)
┌────────────────────────────────────────────────────────┐
│           WhatsApp Web Content Script                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Dynamic CSS Custom Property (--wpb-blur-radius)│  │
│  │ 2. Control Classes on <body> (.wpb-active, etc.) │  │
│  │ 3. Batched MutationObserver + requestAnimationFrame │
│  │ 4. Semantic Element Tagging (data-wpb-*)         │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ Hardware Accelerated
┌────────────────────────────────────────────────────────┐
│             WhatsApp Web DOM Presentation              │
│       (privacy.css: filter: blur(...) !important)      │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
whatsapp-privacy-blur/
├── .gitignore             # Git ignore file (excludes node_modules, dist, logs)
├── LICENSE                # MIT License
├── README.md              # Project documentation
├── CONTRIBUTING.md        # Contribution & selector maintenance guide
├── SECURITY.md            # Privacy commitments & security policy
├── package.json           # Project manifest & build scripts
├── vite.config.js         # Vite popup bundling configuration
├── build.js               # Multi-target build orchestrator (Popup + IIFE Content Script)
├── generate-icons.js      # Zero-dependency PNG icon generator
├── manifest.json          # Chrome Extension Manifest V3 configuration
├── public/
│   └── icons/             # Generated extension icons (16px, 32px, 48px, 128px)
└── src/
    ├── popup/             # Extension Popup (Vue 3)
    │   ├── App.vue        # Popup application component
    │   ├── main.js        # Vue application entry
    │   ├── style.css      # Design tokens, resets, and typography
    │   └── index.html     # Popup HTML template
    ├── content/           # Content Script (Injected into web.whatsapp.com)
    │   ├── content.js     # DOM tagging, observer batching & shortcuts
    │   ├── privacy.css    # Hardware-accelerated CSS filter stylesheet
    │   └── selectors.js   # Resilient semantic WhatsApp DOM selectors
    └── utils/
        └── settings.js    # Storage synchronization & validation schema
```

---

## 🚀 Quick Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher; tested on v20 and v24)
- npm (v9.0.0 or higher)
- Google Chrome, Brave, Microsoft Edge, or any Chromium-based browser

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/whatsapp-privacy-blur.git
cd whatsapp-privacy-blur
npm install
```

### 2. Build the Extension
```bash
npm run build
```
The build orchestrator will compile the Vue 3 popup, bundle the content script into a self-contained IIFE, and output the complete extension in the `/dist` directory.

### 3. Load into Google Chrome
1. Open Google Chrome and enter `chrome://extensions/` in the address bar.
2. In the top-right corner, switch **Developer mode** to **ON**.
3. In the top-left corner, click **Load unpacked**.
4. Select the `dist` folder generated inside `whatsapp-privacy-blur`.
5. Open [WhatsApp Web](https://web.whatsapp.com/) and enjoy distraction-free privacy!

---

## 🧪 Testing Checklist

- [x] **Master Privacy Toggle**: Switch Master Privacy OFF in the popup; all elements restore sharpness immediately. Switch ON; blur applies instantly.
- [x] **Independent Categories**: Toggle Messages, Contact Names, Avatars, or Previews individually.
- [x] **Message Protection**: Verify that incoming and outgoing chat messages are blurred while delivery checkmarks and timestamps remain legible.
- [x] **Blur Intensity Slider**: Adjust slider between 2px and 20px; verify real-time intensity changes without page reload.
- [x] **Temporary Reveal**: Press `Alt+Shift+X` or click the Temporary Reveal button to unblur content on the fly.
- [x] **Hover to Peek**: Hover over any blurred bubble or contact to inspect it smoothly.
- [x] **Settings Persistence**: Change settings, restart Chrome, and verify preferences persist from `chrome.storage.local`.
- [x] **Settings Reset**: Click **Reset Defaults**; verify toast confirmation and that settings revert to defaults.

---

## 🔒 Privacy & Security Policy

- **No Remote Telemetry**: 100% offline. Zero analytics, trackers, ads, or tracking pixels.
- **Zero Data Harvesting**: The extension never reads, logs, stores, or transmits your messages or contacts.
- **Minimal Permissions**: The extension only requests `storage` and host access restricted solely to `https://web.whatsapp.com/*`.
- **Visual Privacy Notice**: CSS blur operates in the presentation layer to guard against screen recorders, screen sharing, and shoulder-surfing. It is not cryptographic encryption. See [SECURITY.md](SECURITY.md) for details.

---

## 🤝 Contributing

Contributions, bug reports, and selector updates are warmly welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide before submitting pull requests.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

---

## ⚠️ Disclaimer

*WhatsApp is a registered trademark of Meta Platforms, Inc. This project is an independent open-source browser extension and is not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp, Meta Platforms, Inc., or any of their affiliates.*
