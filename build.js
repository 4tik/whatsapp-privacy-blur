/**
 * @file build.js
 * @description Production build orchestrator for WhatsApp Privacy Blur (Manifest V3).
 *
 * Architecture rationale:
 * 1. Vue 3 Popup Build: Uses standard Vite compilation with relative base ('./')
 *    so assets resolve reliably within the chrome-extension:// URI scheme.
 * 2. Content Script Build: Bundled into an isolated, self-contained IIFE
 *    (Immediately Invoked Function Expression). Standard Chrome MV3 content scripts
 *    cannot consume static ES module imports; bundling into a single IIFE ensures
 *    seamless execution without module syntax errors or remote code injection.
 * 3. Asset Assembly: Direct synchronization of privacy.css, manifest.json, and icons
 *    into the production `dist/` directory ready for "Load unpacked" installation.
 */

import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuild() {
  console.log('\n=============================================');
  console.log('Building WhatsApp Privacy Blur Extension (MV3)');
  console.log('=============================================\n');

  const distDir = resolve(__dirname, 'dist');

  // Clean and recreate dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // --------------------------------------------------------------------------
  // Step 1: Compile the Vue 3 Extension Popup
  // --------------------------------------------------------------------------
  console.log('--> Step 1/4: Building Vue 3 Popup...');
  await build({
    plugins: [vue()],
    root: resolve(__dirname, 'src/popup'),
    base: './', // Ensures relative script/style asset paths in popup HTML
    publicDir: false,
    build: {
      outDir: resolve(__dirname, 'dist/popup'),
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'src/popup/index.html')
      }
    }
  });

  // --------------------------------------------------------------------------
  // Step 2: Bundle Content Script as Standalone IIFE
  // --------------------------------------------------------------------------
  console.log('--> Step 2/4: Bundling Content Script (standalone IIFE)...');
  await build({
    configFile: false,
    build: {
      outDir: resolve(__dirname, 'dist/content'),
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/content/content.js'),
        name: 'WhatsAppPrivacyBlurContent',
        formats: ['iife'],
        fileName: () => 'content.js'
      }
    }
  });

  // --------------------------------------------------------------------------
  // Step 3: Copy Dedicated Stylesheet & Manifest V3 Configuration
  // --------------------------------------------------------------------------
  console.log('--> Step 3/4: Copying privacy.css & manifest.json...');
  fs.mkdirSync(resolve(__dirname, 'dist/content'), { recursive: true });
  fs.copyFileSync(
    resolve(__dirname, 'src/content/privacy.css'),
    resolve(__dirname, 'dist/content/privacy.css')
  );

  fs.copyFileSync(
    resolve(__dirname, 'manifest.json'),
    resolve(__dirname, 'dist/manifest.json')
  );

  // --------------------------------------------------------------------------
  // Step 4: Copy Extension Icons
  // --------------------------------------------------------------------------
  console.log('--> Step 4/4: Copying icons...');
  fs.mkdirSync(resolve(__dirname, 'dist/icons'), { recursive: true });
  if (fs.existsSync(resolve(__dirname, 'public/icons'))) {
    const iconFiles = fs.readdirSync(resolve(__dirname, 'public/icons'));
    for (const file of iconFiles) {
      fs.copyFileSync(
        resolve(__dirname, 'public/icons', file),
        resolve(__dirname, 'dist/icons', file)
      );
    }
  }

  console.log('\n[SUCCESS] Extension build completed in /dist directory.');
  console.log('Ready to be loaded as an unpacked extension in Chrome.\n');
}

runBuild().catch((err) => {
  console.error('\n[BUILD FAILED]:', err);
  process.exit(1);
});
