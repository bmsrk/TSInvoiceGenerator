#!/usr/bin/env node
/*
 Copy wkhtmltopdf binary from wkhtmltopdf-installer into the package's wk/ folder
 This makes it easier to bundle the binary into Electron builds via extraResources.
*/
const fs = require('fs');
const path = require('path');

function main() {
  try {
    // resolve the wkhtmltopdf-installer module
    const installer = require('wkhtmltopdf-installer');
    let installerPath = null;

    if (!installer) {
      console.error('wkhtmltopdf-installer not found. Please npm install in packages/electron.');
      process.exit(1);
    }

    if (typeof installer === 'string') {
      installerPath = installer;
    } else if (installer.path) {
      installerPath = installer.path;
    } else if (installer.exePath) {
      // older variations
      installerPath = installer.exePath;
    }

    if (!installerPath) {
      console.error('Could not resolve wkhtmltopdf binary path from wkhtmltopdf-installer');
      process.exit(1);
    }

    const base = path.resolve(__dirname, '..');
    const destDir = path.join(base, 'wk');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const fileName = path.basename(installerPath);
    const destPath = path.join(destDir, fileName);

    fs.copyFileSync(installerPath, destPath);
    fs.chmodSync(destPath, 0o755);

    console.log('Copied wkhtmltopdf binary to', destPath);
    process.exit(0);
  } catch (err) {
    console.error('Failed to copy wkhtmltopdf binary:', err);
    process.exit(1);
  }
}

main();
