# Release Workflow Documentation

This document describes how to create releases for the Invoice Generator Electron application.

## How the Release Workflow Works

The release workflow (`.github/workflows/release.yml`) automates the process of building and publishing Electron application installers for Windows, macOS, and Linux.

### Workflow Triggers

The workflow is triggered in two ways:

1. **Tag Push (Automatic Release)**: When you push a semantic version tag (e.g., `v1.0.0`, `v2.1.3`), the workflow automatically builds installers for all platforms and creates a GitHub Release with the artifacts.

2. **Manual Dispatch**: You can manually trigger the workflow from the GitHub Actions tab for testing purposes.

### Build Process

The workflow performs the following steps:

1. Checks out the repository
2. Sets up Node.js 18.x with npm caching
3. Caches electron-builder dependencies for faster builds
4. Installs all npm dependencies (`npm ci`)
5. Generates the Prisma client
6. Builds all packages (shared, api, web, electron)
7. Packages the Electron app for the target platform
8. Uploads build artifacts
9. Creates a GitHub Release with all installers (only for tag pushes)

### Build Artifacts

The workflow produces the following installers:

| Platform | Artifacts |
|----------|-----------|
| Windows  | `.exe` (NSIS installer), portable `.exe` |
| macOS    | `.dmg`, `.zip` |
| Linux    | `.AppImage`, `.deb` |

## Creating a Release

### Step 1: Update Version Numbers

Before creating a release, update the version in the relevant `package.json` files:

```bash
# Update version in packages/electron/package.json
# Update version in root package.json (optional)
```

### Step 2: Commit Changes

```bash
git add .
git commit -m "chore: bump version to 1.0.0"
git push origin main
```

### Step 3: Create and Push a Version Tag

```bash
# Create a semantic version tag
git tag v1.0.0

# Push the tag to trigger the release workflow
git push origin v1.0.0
```

### Step 4: Monitor the Build

1. Go to the **Actions** tab in your GitHub repository
2. Watch the "Build and Release Electron App" workflow
3. Once complete, check the **Releases** page for your new release

## Customizing electron-builder Settings

The electron-builder configuration is located in `packages/electron/package.json` under the `build` key.

### App Identity

```json
{
  "build": {
    "appId": "com.invoice.generator",
    "productName": "Invoice Generator"
  }
}
```

### Platform-Specific Targets

You can customize build targets for each platform:

```json
{
  "build": {
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "assets/icon.icns",
      "category": "public.app-category.business"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "assets/icon.png",
      "category": "Office"
    }
  }
}
```

### Available Targets

- **Windows**: `nsis`, `nsis-web`, `portable`, `appx`, `msi`, `squirrel`
- **macOS**: `dmg`, `pkg`, `mas`, `zip`
- **Linux**: `AppImage`, `snap`, `deb`, `rpm`, `freebsd`, `pacman`

## Code Signing

Code signing is essential for distributing your application without security warnings.

### Windows Code Signing

Set these secrets in your repository settings:

| Secret | Description |
|--------|-------------|
| `WIN_CSC_LINK` | Base64-encoded `.pfx` certificate file |
| `WIN_CSC_KEY_PASSWORD` | Password for the certificate |

To encode your certificate:
```bash
base64 -i certificate.pfx | pbcopy  # macOS
base64 certificate.pfx > encoded.txt  # Linux
```

Add to the workflow environment:
```yaml
env:
  WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
  WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
```

### macOS Code Signing and Notarization

Set these secrets for macOS:

| Secret | Description |
|--------|-------------|
| `CSC_LINK` | Base64-encoded `.p12` certificate |
| `CSC_KEY_PASSWORD` | Certificate password |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from appleid.apple.com |
| `APPLE_TEAM_ID` | Your Apple Developer Team ID |

Add to the workflow environment:
```yaml
env:
  CSC_LINK: ${{ secrets.CSC_LINK }}
  CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

Add notarization configuration to `package.json`:
```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "afterSign": "scripts/notarize.js"
  }
}
```

### Linux Signing

Linux packages generally don't require code signing, but you can sign `.deb` packages with GPG if needed.

## Troubleshooting

### "Cannot compute electron version" Error

This error occurs when electron-builder cannot determine a concrete Electron version. The fix is to pin the Electron version to an exact version (no `^` or `~` prefix):

```json
{
  "devDependencies": {
    "electron": "33.2.1"  // Correct: exact version
    // "electron": "^33.2.1"  // Wrong: version range
  }
}
```

### Build Fails on macOS

Ensure you have the correct Xcode command line tools installed. The GitHub Actions runner should have these pre-installed.

### Missing Icons

Create icon files in `packages/electron/assets/`:
- `icon.ico` (Windows) - 256x256 recommended
- `icon.icns` (macOS) - Use iconutil to create from .iconset
- `icon.png` (Linux) - 512x512 recommended

### Artifacts Not Found

Check that the build output directory matches the upload pattern. The default output directory is `packages/electron/release/`.

## Manual Local Build

To build locally without the CI:

```bash
# Install dependencies
npm ci

# Build all packages
npm run build:electron

# Package for your current platform
npm run package:electron

# Or package for a specific platform
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

## Additional Resources

- [electron-builder Documentation](https://www.electron.build/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
