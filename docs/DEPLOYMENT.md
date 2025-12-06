# Deployment Guide

## Overview

TSInvoiceGenerator can be deployed in two ways:
1. **CLI Executable** - Standalone binary for terminal use
2. **Electron App** - Desktop application with installers

## CLI Deployment

### Building the CLI

```bash
cd cli
bun build src/index.ts --compile --outfile invoice
```

This produces a single executable file:
- Linux/macOS: `invoice`
- Windows: `invoice.exe`

### Platform-Specific Builds

Bun compile produces binaries for the current platform. For cross-platform builds, use CI/CD (see below).

### Distribution

The compiled executable can be distributed:
- Direct download
- Package managers (Homebrew, Chocolatey, etc.)
- GitHub Releases

### Installation

Users simply download and run:
```bash
chmod +x invoice  # Linux/macOS only
./invoice
```

### Database Location

CLI database is stored in the same directory as the executable:
- `prisma/dev.db` (created on first run)

## Electron Deployment

### Prerequisites

Before building:
```bash
npm install
npm run build:shared
npm run build:api
npm run build:web
```

### Building for Current Platform

```bash
npm run package:electron
```

Output: `packages/electron/release/`

### Building for Specific Platforms

#### Windows
```bash
npm run package:win
```

Produces:
- `Invoice Generator Setup.exe` (NSIS installer)
- `Invoice Generator.exe` (portable)

#### macOS
```bash
npm run package:mac
```

Produces:
- `Invoice Generator.dmg` (disk image)
- `Invoice Generator.zip` (portable)

#### Linux
```bash
npm run package:linux
```

Produces:
- `Invoice Generator.AppImage`
- `invoice-generator.deb` (Debian/Ubuntu)

### Electron Builder Configuration

Configuration in `packages/electron/package.json`:

```json
{
  "build": {
    "appId": "com.invoice.generator",
    "productName": "Invoice Generator",
    "files": [
      "dist/**/*",
      "node_modules/**/*"
    ],
    "extraResources": [
      { "from": "../web/dist", "to": "web" },
      { "from": "../api/prisma", "to": "prisma" },
      { "from": "./wk", "to": "wkhtmltopdf" }
    ]
  }
}
```

### Code Signing

#### macOS
```bash
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
npm run package:mac
```

#### Windows
```bash
# Requires code signing certificate
export WIN_CSC_LINK="path/to/cert.pfx"
export WIN_CSC_KEY_PASSWORD="password"
npm run package:win
```

### Database Location

Electron stores the database in the user data directory:
- **Windows**: `%APPDATA%/Invoice Generator/invoice.db`
- **macOS**: `~/Library/Application Support/Invoice Generator/invoice.db`
- **Linux**: `~/.config/Invoice Generator/invoice.db`

## GitHub Actions CI/CD

### Automated Releases

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release-cli:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - name: Build CLI
        run: |
          cd cli
          bun install
          bun build src/index.ts --compile --outfile invoice
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: cli-${{ matrix.os }}
          path: cli/invoice*

  release-electron:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run build:shared
      - run: npm run build:api
      - run: npm run build:web
      - name: Package Electron
        run: |
          if [ "$RUNNER_OS" == "Linux" ]; then
            npm run package:linux
          elif [ "$RUNNER_OS" == "macOS" ]; then
            npm run package:mac
          elif [ "$RUNNER_OS" == "Windows" ]; then
            npm run package:win
          fi
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: electron-${{ matrix.os }}
          path: packages/electron/release/*
```

### Versioning

Use semantic versioning:
```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers the release workflow.

## Distribution Channels

### GitHub Releases

1. Create release from tag
2. Upload built artifacts
3. Write release notes
4. Publish release

### Package Managers

#### Homebrew (macOS/Linux CLI)
Create a formula in homebrew-core

#### Chocolatey (Windows CLI)
Create a package definition

#### Snapcraft (Linux)
Create a snapcraft.yaml

### Auto-Update

Electron supports auto-updates via electron-updater:

```typescript
// packages/electron/src/main.ts
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();
```

Configure in package.json:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "bmsrk",
      "repo": "TSInvoiceGenerator"
    }
  }
}
```

## Environment Variables

### CLI
- `DATABASE_URL`: Database connection string (default: `file:./prisma/dev.db`)

### Electron
- `NODE_ENV`: `development` or `production`
- `DATABASE_URL`: Overrides default database location

## Post-Deployment

### Monitoring

For Electron, consider:
- Crash reporting (Sentry)
- Analytics (optional, privacy-friendly)
- Update notifications

### User Data Migration

When updating the database schema:
1. Include migration files in release
2. Prisma applies migrations automatically on startup
3. Test with real user data first

## Rollback

If a release has issues:

### CLI
- Users can download previous version
- Database is compatible (unless schema changed)

### Electron
- Auto-update can be disabled
- Users can reinstall previous version
- Database backup recommended

## Security

### Code Signing
- **Required for macOS** (notarization)
- **Recommended for Windows** (SmartScreen)
- **Not required for Linux**

### Dependencies
- Run `npm audit` before release
- Update vulnerable packages
- Test thoroughly after updates

### Secrets Management
- Never commit signing certificates
- Use CI/CD secrets for credentials
- Rotate keys regularly

## Testing Deployments

### Before Release
1. Test on all target platforms
2. Verify database migrations
3. Check file associations
4. Test auto-update (Electron)
5. Verify PDF generation
6. Test with fresh database

### Beta Testing
1. Release to small group first
2. Gather feedback
3. Fix critical issues
4. Release to general public

## Troubleshooting

### "Application is damaged" (macOS)
- Need to code sign and notarize

### "Windows protected your PC" (Windows)
- Code signing resolves this

### AppImage won't run (Linux)
- Ensure executable permissions: `chmod +x`

### Database migration fails
- Include rollback instructions
- Test migrations thoroughly

## Resources

- [Electron Builder](https://www.electron.build/)
- [Bun Compile](https://bun.sh/docs/bundler/executables)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Apple Notarization](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
