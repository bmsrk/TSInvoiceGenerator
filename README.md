# Invoice Generator

A modern, fully local/offline invoice generator built with **TypeScript + Electrobun**. Lightweight (~15 MB), fast, and cross-platform.

## ⬇️ Download

Pre-built binaries are available on the [Releases](../../releases) page:

| Platform | Format |
|----------|--------|
| **Windows** | `.exe` (NSIS installer) |
| **macOS** | `.dmg` |
| **Linux** | AppImage / `.sh` installer |

## 🚀 Quick Start (Development)

**Prerequisites:**
- [Node.js](https://nodejs.org/) v20+
- [Bun](https://bun.sh/) (for the Electrobun desktop app and TUI CLI)

```bash
# Clone and install
git clone https://github.com/bmsrk/TSInvoiceGenerator.git
cd TSInvoiceGenerator
npm install

# Run in development mode (Electrobun desktop app)
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
bun run src/index.ts
```

## ✨ Features

- **🖥️ Electrobun Desktop App** — Native performance, tiny footprint (~15 MB)
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
│   ├── web/             # React frontend (Vite)
│   └── app/             # Electrobun desktop wrapper
├── cli/                 # Bun-based TUI CLI (standalone)
└── package.json         # Workspace root
```

## 🎨 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run Electrobun desktop app in development (hot reload) |
| `npm run build` | Build Electrobun app for current platform |
| `npm run dev:web` | Run React web frontend (Vite dev server) |
| `npm run dev:cli` | Run TUI CLI (requires Bun) |
| `npm run build:cli` | Build CLI standalone executable |
| `npm run build:shared` | Compile shared package |
| `npm run build:api` | Compile API package |
| `npm run build:web` | Build React frontend |
| `npm test` | Run all tests |
| `npm run clean` | Clean build artifacts |

## 📖 API Endpoints

The embedded Hono API server provides:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/companies` | List / create companies |
| GET/PUT/DELETE | `/api/companies/:id` | Get / update / delete company |
| GET/POST | `/api/customers` | List / create customers |
| GET/PUT/DELETE | `/api/customers/:id` | Get / update / delete customer |
| GET/POST | `/api/services` | List / create services |
| GET/PUT/DELETE | `/api/services/:id` | Get / update / delete service |
| GET/POST | `/api/invoices` | List / create invoices |
| PATCH | `/api/invoices/:id/status` | Update invoice status |
| GET | `/api/invoices/:id/pdf` | Export invoice as PDF |

## 🗄️ Database

SQLite with Prisma ORM — fully embedded, no server required.

**Models:** Company (with logo), Customer, Service, Invoice, InvoiceLine

## 🔄 CI/CD — Creating a Release

Automated releases via GitHub Actions:

### Desktop App (Electrobun) — `v*.*.*` tag
Push a version tag to build Windows `.exe`, macOS `.dmg`, and Linux AppImage:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The `.github/workflows/electrobun-release.yml` workflow triggers, builds on all three platforms, and attaches the executables to a GitHub Release.

### TUI CLI — `cli-v*.*.*` tag
Push a CLI version tag to build standalone CLI binaries:

```bash
git tag cli-v1.0.0
git push origin cli-v1.0.0
```

The `.github/workflows/release-cli.yml` workflow triggers and attaches CLI binaries to a separate GitHub Release.

### Downloading Releases
Go to the [Releases](../../releases) page and download the binary for your platform under **Assets**.

## 📄 License

MIT
