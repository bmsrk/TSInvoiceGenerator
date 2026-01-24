# Invoice Generator - Tauri Desktop App

A modern, cross-platform desktop application built with Tauri, providing a lightweight alternative to the Electron version with better performance and smaller binary size.

## 🌟 Features

- **Lightweight**: Tauri apps are significantly smaller than Electron (typically ~10-15MB vs 100+ MB)
- **Fast**: Uses native webview instead of bundling Chromium
- **Secure**: Rust-based backend with strong security defaults
- **Cross-platform**: Build for Windows, macOS, and Linux from a single codebase
- **All Invoice Features**: Complete feature parity with Electron version

## 🛠️ Prerequisites

### For Development

1. **Node.js** v18+ and npm
2. **Rust** - Install from [rustup.rs](https://rustup.rs)
3. **Platform-specific dependencies**:

   **Windows:**
   - Microsoft Visual Studio C++ Build Tools
   - WebView2 (usually pre-installed on Windows 10/11)

   **macOS:**
   - Xcode Command Line Tools: `xcode-select --install`

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.0-dev \
       build-essential \
       curl \
       wget \
       file \
       libssl-dev \
       libgtk-3-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
   ```

## 🚀 Quick Start

### Development Mode

From the repository root:

```bash
# Install all dependencies
PUPPETEER_SKIP_DOWNLOAD=true npm install

# Run Tauri app in development mode
npm run dev:tauri
```

This will:
1. Build the shared and API packages
2. Start the Vite development server
3. Launch the Tauri app with hot-reload enabled

### Building for Production

Build for your current platform:

```bash
npm run build:tauri
```

The output will be in `packages/web/src-tauri/target/release/bundle/`.

**Platform-specific builds:**

- **Windows**: `.msi` and `.exe` installers in `bundle/msi/` and `bundle/nsis/`
- **macOS**: `.dmg` and `.app` in `bundle/dmg/` and `bundle/macos/`
- **Linux**: `.deb` and `.AppImage` in `bundle/deb/` and `bundle/appimage/`

## 📦 Project Structure

```
packages/web/
├── src/                  # React frontend (shared with Electron)
├── src-tauri/           # Tauri-specific files
│   ├── src/
│   │   ├── main.rs      # Rust entry point
│   │   └── lib.rs       # Tauri commands and setup
│   ├── Cargo.toml       # Rust dependencies
│   ├── tauri.conf.json  # Tauri configuration
│   └── icons/           # Application icons
└── package.json         # NPM scripts
```

## ⚙️ Configuration

Key configuration files:

- **`src-tauri/tauri.conf.json`**: Tauri app configuration
  - Window size, title, and behavior
  - Build targets and bundler settings
  - Security policies

- **`src-tauri/Cargo.toml`**: Rust dependencies and metadata

## 🔧 Development Scripts

From repository root:

| Script | Description |
|--------|-------------|
| `npm run dev:tauri` | Run Tauri app in development mode |
| `npm run build:tauri` | Build production app for current platform |

From `packages/web/`:

| Script | Description |
|--------|-------------|
| `npm run tauri dev` | Start Tauri development server |
| `npm run tauri build` | Build production bundle |
| `npm run tauri` | Run any Tauri CLI command |

## 🎯 Tauri vs Electron

### Advantages of Tauri

- **Size**: ~10-15MB vs 100+ MB for Electron
- **Memory**: Uses system webview, lower memory footprint
- **Security**: Rust backend with strict security model
- **Performance**: Faster startup and runtime performance

### Considerations

- **Webview Differences**: Uses system webview (Edge on Windows, Safari on macOS, WebKitGTK on Linux)
- **Platform Support**: Requires Rust toolchain for building
- **Maturity**: Tauri 2.0 is stable but newer than Electron

## 📚 API Server Integration

The Tauri app uses the same embedded API server as the Electron version:

1. **Startup**: API server starts automatically when the app launches
2. **Port**: Runs on `http://localhost:3001` by default
3. **Database**: SQLite database stored in app data directory
4. **Frontend**: React app communicates with local API

## 🏗️ Building for Distribution

### Windows (.exe and .msi)

```bash
npm run build:tauri
```

Outputs:
- `packages/web/src-tauri/target/release/bundle/msi/Invoice Generator_1.0.0_x64_en-US.msi`
- `packages/web/src-tauri/target/release/bundle/nsis/Invoice Generator_1.0.0_x64-setup.exe`

### macOS (.dmg and .app)

```bash
npm run build:tauri
```

Outputs:
- `packages/web/src-tauri/target/release/bundle/dmg/Invoice Generator_1.0.0_x64.dmg`
- `packages/web/src-tauri/target/release/bundle/macos/Invoice Generator.app`

### Linux (.deb and .AppImage)

```bash
npm run build:tauri
```

Outputs:
- `packages/web/src-tauri/target/release/bundle/deb/invoice-generator_1.0.0_amd64.deb`
- `packages/web/src-tauri/target/release/bundle/appimage/invoice-generator_1.0.0_amd64.AppImage`

## 🐛 Troubleshooting

### Build Fails - Missing Dependencies

**Windows:**
Ensure Visual Studio C++ Build Tools are installed.

**macOS:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget file libssl-dev
```

### API Server Not Starting

Check console logs in development mode. The API server should start on port 3001.

### WebView Issues

- **Windows**: Update WebView2 Runtime
- **macOS**: System webview (Safari) is built-in
- **Linux**: Ensure WebKitGTK is installed

## 🔐 Security

Tauri provides several security features:

- **Process Isolation**: Frontend and backend run in separate processes
- **IPC Validation**: All inter-process communication is validated
- **CSP**: Content Security Policy enforced by default
- **No Node.js in Frontend**: No direct filesystem access from web code

## 📖 Resources

- [Tauri Documentation](https://tauri.app/)
- [Tauri v2 Guide](https://v2.tauri.app/start/)
- [Rust Documentation](https://www.rust-lang.org/learn)
- [Repository README](../../README.md)

## 🤝 Contributing

When working on the Tauri app:

1. Test on all target platforms before submitting PR
2. Update this README if adding new features
3. Follow Rust best practices for backend code
4. Maintain feature parity with Electron version

## 📄 License

MIT - Same as parent project
