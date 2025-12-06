# Invoice Generator

A modern, full-stack TypeScript invoice generator with **two local executable options**:
- 🖥️ **TUI CLI** - Single-file command-line interface with interactive Terminal UI (Bun-based)
- 💻 **Desktop App** - Standalone Electron executable with embedded web UI (Windows, macOS, Linux)

Both executables use **embedded SQLite databases** for complete offline functionality.

## 🚀 Quick Start

### Option 1: TUI CLI (Lightweight, Terminal-based)

The TUI CLI is a single compiled executable perfect for command-line users:

```bash
# Navigate to CLI directory
cd cli

# Install dependencies
bun install

# Set up database
bunx prisma generate
bunx prisma migrate dev --name init

# Run the CLI
bun run index.ts

# Or build a standalone executable
bun build index.ts --compile --outfile invoice
./invoice
```

See [cli/README.md](cli/README.md) for full CLI documentation.

### Option 2: Electron Desktop App (GUI-based)

The Electron app provides a full graphical interface with embedded API and database:

```bash
# Install all dependencies (from root)
npm install

# Run in development mode
npm run dev:electron

# Build and package for your platform
npm run package:electron      # Current platform
npm run package:win          # Windows
npm run package:mac          # macOS  
npm run package:linux        # Linux
```

See [packages/electron/README.md](packages/electron/README.md) for Electron-specific documentation.

## 🚀 Features

- **🖥️ TUI CLI**: Single-file terminal interface with beautiful interactive menus (Bun-based)
- **💻 Desktop App**: Cross-platform Electron app with embedded API and web UI
- **📦 Embedded Database**: SQLite with Prisma ORM - no external database needed
- **🔌 Offline-First**: Both executables work completely offline
- **Modern Stack**: TypeScript, Bun/Node.js, Hono API, React frontend
- **CRUD Management**: Manage companies, customers, services, and invoices
- **Decimal Support**: Hours and rates accept decimal values (e.g., 1.5 hours)
- **Safe Money Calculations**: Avoids floating-point errors with proper rounding
- **PDF Export**: Export invoices to PDF (Electron uses wkhtmltopdf with Puppeteer fallback)
- **Dark Mode UI**: Beautiful, modern dark theme interface (Electron)
- **Type-Safe**: Full TypeScript support across all packages
- **Status Tracking**: Track invoice status (Draft, Pending, Paid, Overdue, Cancelled)

## 📦 Project Structure

```
ts-invoice-generator/
├── cli/                  # Bun-based TUI CLI (standalone executable)
│   ├── index.ts         # Complete CLI implementation (~1100 lines)
│   ├── prisma/          # Database schema
│   └── package.json     # Bun dependencies
├── packages/
│   ├── shared/          # Shared types, utilities, and money calculations
│   ├── api/             # Hono-based REST API with Prisma/SQLite
│   ├── web/             # React frontend (used by Electron)
│   └── electron/        # Electron desktop application
└── package.json         # Workspace configuration for executables
```

## 🛠️ Prerequisites

### For TUI CLI:
- [Bun](https://bun.sh/) v1.0+

### For Electron App:
- [Node.js](https://nodejs.org/) v18+
- npm (comes with Node.js)

## 🏁 Getting Started

### TUI CLI (Lightweight & Fast)

The simplest and fastest way to use the invoice generator:

```bash
# Navigate to CLI directory
cd cli

# Install dependencies
bun install

# Set up database
bunx prisma generate
bunx prisma migrate dev --name init

# Run the CLI with interactive TUI
bun run index.ts

# Or build and run standalone executable
bun build index.ts --compile --outfile invoice
./invoice
```

**CLI Features:**
- 📋 List and view invoices with formatted tables
- ✨ Create new invoices with interactive wizard
- 🏢 Manage companies, customers, and services
- 📊 View statistics dashboard
- 🌱 Auto-seed with sample data
- 🎨 Beautiful colorized terminal UI

See [cli/README.md](cli/README.md) for detailed CLI documentation.

### Electron Desktop App (Full GUI)

Build a standalone desktop application:

```bash
# From root directory - Install all dependencies
npm install

# Development mode (hot reload)
npm run dev:electron

# Build and package for your platform
npm run package:electron     # Current platform
npm run package:win          # Windows (.exe, .msi)
npm run package:mac          # macOS (.dmg)
npm run package:linux        # Linux (.AppImage, .deb)
```

The packaged application will be in `packages/electron/release/`.

**Electron Features:**
- 🌐 Full web UI with React
- 🖥️ Native desktop menus and shortcuts
- 📁 Embedded SQLite database in user data directory
- 🚀 Embedded API server (no external dependencies)
- 🖨️ PDF export with wkhtmltopdf (Puppeteer fallback)
- 🎨 Modern dark theme interface

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=@invoice/shared
npm test --workspace=@invoice/api
```

## 🖨️ PDF Export

### Electron App
The Electron app includes wkhtmltopdf binary for high-quality PDF export with Puppeteer as fallback.

### CLI
The CLI is terminal-only and doesn't include PDF export. For PDF generation, use the Electron app.

## 🗄️ Database

Both executables use **SQLite** with **Prisma ORM**:

- **CLI**: Database stored in `cli/prisma/dev.db`
- **Electron**: Database stored in user data directory (platform-specific)
  - Windows: `%APPDATA%/Invoice Generator/`
  - macOS: `~/Library/Application Support/Invoice Generator/`
  - Linux: `~/.config/Invoice Generator/`

### Schema
The database includes:
- **Company** - Your business profiles
- **Customer** - Client information
- **Service** - Service catalog with rates
- **Invoice** - Invoice headers
- **InvoiceLine** - Invoice line items


## 📖 Application Screens

### Companies (`/companies`)
Manage your company profiles. Set one as default for quick invoice creation.

### Customers (`/customers`)
Maintain your customer list with contact information, addresses, and tax IDs.

### Services (`/services`)
Create a service catalog with descriptions and default hourly rates.

### Create Invoice (`/invoices/new`)
- Select company and customer from dropdowns
- Quick-add services from your catalog
- Add custom line items with decimal hours and rates
- Automatic tax and total calculations

### Invoice List (`/`)
View all invoices, update status, preview, and export to PDF.

## 📖 API Endpoints

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Get all invoices |
| GET | `/api/invoices/:id` | Get invoice by ID |
| GET | `/api/invoices/:id/totals` | Get invoice with calculated totals |
| POST | `/api/invoices` | Create new invoice |
| PATCH | `/api/invoices/:id/status` | Update invoice status |
| DELETE | `/api/invoices/:id` | Delete invoice |

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | Get all companies |
| GET | `/api/companies/:id` | Get company by ID |
| POST | `/api/companies` | Create new company |
| PUT | `/api/companies/:id` | Update company |
| DELETE | `/api/companies/:id` | Delete company |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create new customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get service by ID |
| POST | `/api/services` | Create new service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |

## 🧪 Data Models

### Company
```typescript
interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  isDefault: boolean;
}
```

### Customer
```typescript
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
}
```

### Service
```typescript
interface Service {
  id: string;
  description: string;
  defaultRate: number; // Supports decimals
}
```

### Invoice
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: Date;
  dueDate: Date;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  from: Party;    // Company info
  to: Party;      // Customer info
  items: InvoiceItem[];
  currency: CurrencyCode;
  paymentTerms: PaymentTerms;
  notes?: string;
  termsAndConditions?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;   // Supports decimal hours (e.g., 1.5)
  unitPrice: number;  // Supports decimal rates
  taxRate: number;
}
```

## 🎨 Available Scripts

### Root Scripts
| Script | Description |
|--------|-------------|
| `npm run dev:cli` | Run TUI CLI (requires Bun) |
| `npm run build:cli` | Build CLI standalone executable |
| `npm run dev:electron` | Run Electron app in development |
| `npm run build:electron` | Build all packages for Electron |
| `npm run package:electron` | Package for current platform |
| `npm run package:win` | Package for Windows |
| `npm run package:mac` | Package for macOS |
| `npm run package:linux` | Package for Linux |
| `npm test` | Run all tests |
| `npm run clean` | Clean build artifacts |

### CLI-specific (in cli/ directory)
| Script | Description |
|--------|-------------|
| `bun run index.ts` | Run CLI directly |
| `bun build index.ts --compile --outfile invoice` | Build standalone executable |
| `bunx prisma generate` | Generate Prisma client |
| `bunx prisma migrate dev` | Run migrations |

## 💡 Key Features

### Decimal Hours and Rates
- Enter `1.5` hours for 1 hour 30 minutes
- Enter `125.50` for a rate of $125.50/hour
- All monetary calculations avoid JavaScript floating-point errors

### Embedded Database
- CLI: SQLite database in `cli/prisma/dev.db`
- Electron: SQLite in user's app data directory
- No external database server required
- Portable and self-contained

### PDF Export (Electron only)
- Server-side rendering with wkhtmltopdf
- Puppeteer fallback if wkhtmltopdf unavailable
- High-quality PDF generation
- Download via `/api/invoices/:id/pdf` endpoint

## 📊 Data Models

The application uses the following main entities:

- **Company** - Your business profile(s)
- **Customer** - Client contact information
- **Service** - Service catalog with default rates  
- **Invoice** - Invoice header with metadata
- **InvoiceLine** - Individual line items on invoices

See Prisma schema files for complete field definitions:
- `cli/prisma/schema.prisma` (CLI)
- `packages/api/prisma/schema.prisma` (Electron/API)

## 📄 License

MIT
