# Contributing to WhatsApp Privacy Blur

First off, thank you for considering contributing to **WhatsApp Privacy Blur**! Open-source contributions help keep the extension reliable, fast, and privacy-respecting as WhatsApp Web evolves.

---

## Code of Conduct

We expect all contributors to adhere to polite, constructive, and respectful interactions across issues, discussions, and pull requests.

---

## How Can I Contribute?

### 1. Reporting Bugs & Selector Breakages
WhatsApp Web frequently changes its internal DOM structure and generated classes. If you notice a specific element is no longer blurring:
1. Check existing [GitHub Issues](../../issues) to see if it has already been reported.
2. If not, open a new issue with:
   - **WhatsApp Web version**: Found in WhatsApp Web Settings > Help.
   - **Affected element**: (e.g., group description, quoted message reply, voice note title).
   - **Expected vs. actual behavior**: Screenshot with sensitive data redacted.
   - **DOM snippet**: Right-click the element > Inspect > copy the outer HTML element tag (strip any personal text).

### 2. Suggesting Enhancements
Feature requests are welcome! Please make sure suggested features:
- Align with our **100% offline & zero-analytics** privacy architecture.
- Do not add remote network requests, ads, or third-party trackers.
- Keep the UI clean, lightweight, and focused on user privacy.

### 3. Submitting Pull Requests
1. **Fork** the repository and clone your fork locally:
   ```bash
   git clone https://github.com/4tik/whatsapp-privacy-blur.git
   cd whatsapp-privacy-blur
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create a branch**:
   ```bash
   git checkout -b fix/chat-list-selector
   ```
4. **Make your changes**:
   - Write clear, descriptive code comments and JSDoc annotations.
   - Use semantic, resilient selectors (`[data-testid]`, `[aria-label]`, semantic tags) rather than obfuscated CSS classes (e.g., avoid `._ak8l`).
   - Maintain the Vue 3 Composition API style in the popup.
5. **Build and test locally**:
   ```bash
   npm run build
   ```
   - Load `dist/` as an unpacked extension in `chrome://extensions/`.
   - Test on [https://web.whatsapp.com/](https://web.whatsapp.com/) across incoming messages, chat list items, drawer details, and hover unblur.
6. **Commit & Push**:
   ```bash
   git commit -m "fix(selectors): update selector for message bubble container"
   git push origin fix/chat-list-selector
   ```
7. **Open a Pull Request** with a concise description of your changes.

---

## Coding Guidelines

- **Vanilla JavaScript**: Do not introduce TypeScript or complex transpilers; keep the codebase lightweight and approachable.
- **Vue 3 Composition API**: Use `<script setup>` syntax for all popup components.
- **No Remote Dependencies**: All assets, icons, and libraries must be packaged locally. Never load external CDNs or remote scripts.
- **Resilient Selectors**: Hardcoded hashed classes (`.x1y2z3`) break every few weeks. Always use structural hierarchy, ARIA roles, or data attributes.
