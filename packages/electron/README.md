# Invoice Generator — Electron Desktop App

The Electron app bundles the web UI and an embedded API server so you can run the app as a completely offline desktop application.

## Building and Packaging

The project already includes build scripts in `packages/electron/package.json` to package the app using `electron-builder`:

```bash
# from the repo root
cd packages/electron
npm install
npm run build        # compile TypeScript to JS
npm run package      # package for current platform
# or platform-specific
npm run package:win
npm run package:mac
npm run package:linux
```

The packaged app includes the embedded API server and the web frontend files (copied from `packages/web/dist`). When run, the app starts a lightweight Hono API server on bootstrap and serves the UI inside the BrowserWindow.

## PDF Export & wkhtmltopdf

- The included API server exposes `/api/invoices/:id/pdf` which renders invoices to PDF. The app will call this endpoint to offer the "Export PDF" functionality.
- For the highest-quality printed output, install `wkhtmltopdf` on the host system. If `wkhtmltopdf` is not found, the server falls back to using Puppeteer (Chromium) to render PDFs.
- If you prefer to bundle `wkhtmltopdf` directly inside the packaged app, include a compatible binary in the build resources of electron-builder or use `wkhtmltopdf-installer` so the binary is present at runtime.

### Bundled wkhtmltopdf

This repository adds a small helper that uses `wkhtmltopdf-installer` to copy a platform-appropriate wkhtmltopdf binary into `packages/electron/wk/` before packaging. The binary is then included in the packaged app using `extraResources` so the delivered app can call wkhtmltopdf locally (no system install required).

When running packaging in CI, the `prepare-wk` script runs automatically in the build steps to prepare the binary for inclusion.

## Notes

- Dev mode: run `npm run dev` in `packages/electron` to launch the app while developing. The app assumes the web UI is served at `http://localhost:5173`.
- Production mode: the app loads the `web` assets from the packaged `resources` directory and starts the embedded API server on port 3001. The frontend detects this and will call `http://localhost:3001` for API requests when needed.

## CI packaging

This repo includes a GitHub Actions workflow `.github/workflows/packaging.yml` that demonstrates:
- Building the CLI executable using Bun on Linux/macOS/Windows and uploading the artifacts.
- Packaging the Electron app for each platform (Ubuntu/macOS/Windows) and uploading packaged artifacts. Note: code signing and macOS notarization steps are omitted — add credentials and secrets as needed to sign the final installers.
