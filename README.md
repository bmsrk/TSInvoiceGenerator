# Invoice Generator

A modern, fully local/offline invoice generator built with **TypeScript + Tauri v2**. Lightweight (~10–15 MB), fast, and cross-platform.

## ⬇️ Download

Pre-built binaries are available on the [Releases](../../releases) page:

| Platform | Format |
|----------|--------|
| **Windows** | `.exe` (NSIS installer) |
| **macOS** | `.dmg` |
| **Linux** | `.AppImage` |

## 🚀 Quick Start (Development)

**Prerequisites:**
- [Node.js](https://nodejs.org/) v20+
- [Rust](https://rustup.rs/) toolchain (for Tauri)

```bash
# Clone and install
git clone https://github.com/bmsrk/TSInvoiceGenerator.git
cd TSInvoiceGenerator
npm install

# Run in development mode (defaults to Tauri)
npm run dev

# Build for your platform
npm run build
```

### TUI CLI (Alternative)

A lightweight terminal interface is also available:

```bash
cd cli
bun install
bunx prisma generate
bunx prisma migrate dev --name init
bun run index.ts
```

## ✨ Features

- **🖥️ Tauri v2 Desktop App** — Native performance, tiny footprint (~10–15 MB)
- **📦 100% Offline** — Embedded SQLite database, no internet required
- **🖨️ PDF Export** — Pure TypeScript PDF generation (pdfmake, no native binaries)
- **🏢 Company Branding** — Logo upload and persistence per company profile
- **📄 Live Invoice Preview** — See invoices rendered in-app before exporting
- **💰 Decimal-Safe Calculations** — Proper rounding for hours and monetary values
- **🌙 Dark Mode UI** — Clean, modern dark theme
- **📊 Status Tracking** — Draft → Pending → Paid → Overdue → Cancelled
- **🔧 Full CRUD** — Companies, customers, services, and invoices

## 📦 Project Structure

```
ts-invoice-generator/
├── packages/
│   ├── shared/          # Shared types, utilities, money calculations
│   ├── api/             # Hono REST API + Prisma/SQLite + PDF generation
│   └── web/             # React frontend + Tauri v2 wrapper
│       └── src-tauri/   # Tauri Rust backend
├── cli/                 # Bun-based TUI CLI (standalone)
└── package.json         # Workspace root
```

## 🎨 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run Tauri app in development (hot reload) |
| `npm run build` | Build Tauri app for current platform |
| `npm run dev:tauri` | Same as `npm run dev` |
| `npm run build:tauri` | Same as `npm run build` |
| `npm run dev:cli` | Run TUI CLI (requires Bun) |
| `npm run build:cli` | Build CLI standalone executable |
| `npm test` | Run all tests |
| `npm run clean` | Clean build artifacts |

## 📖 API Endpoints

The embedded Hono API server provides:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List / GET / POST / PUT / DELETE companies |
| GET | `/api/customers` | List / GET / POST / PUT / DELETE customers |
| GET | `/api/services` | List / GET / POST / PUT / DELETE services |
| GET | `/api/invoices` | List / GET / POST / PATCH status / DELETE invoices |
| GET | `/api/invoices/:id/pdf` | Export invoice as PDF |

## 🗄️ Database

SQLite with Prisma ORM — fully embedded, no server required.

**Models:** Company (with logo), Customer, Service, Invoice, InvoiceLine

## 🔄 CI/CD

Automated releases via GitHub Actions (`.github/workflows/tauri-release.yml`):
- Triggers on version tags (`v*.*.*`) or GitHub Release creation
- Builds for Windows, macOS, and Linux using `tauri-apps/tauri-action`
- Uploads binaries to GitHub Releases automatically

## 📄 License

MIT
