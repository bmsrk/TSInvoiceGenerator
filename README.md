# Invoice Generator

A modern, full-stack TypeScript invoice generator with **multiple interfaces**:
- 🖥️ **CLI with TUI** - Single-file command-line interface with interactive Terminal UI (Built with **Bun**)
- 🌐 **Web Application** - React-based web interface (Built with Node.js, Hono, React, and SQLite)
- 💻 **Desktop App** - Standalone executable via Electron (Windows, macOS, Linux)

## 🚀 Quick Start - CLI with TUI (Recommended)

The fastest way to get started is with the new **Bun-based CLI**:

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

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

## 📸 Screenshots

### Dashboard with Dark Mode
![Dashboard](https://github.com/user-attachments/assets/aee3ce04-4db4-4779-8328-e68933f90c93)

### Create Invoice Form
![Create Form](https://github.com/user-attachments/assets/fdd356c7-2de2-4b13-8e89-14626ca873cf)

### Invoice Preview
![Invoice Preview](https://github.com/user-attachments/assets/d4080c3a-5bae-46dc-ac95-32000a36e469)

## 🚀 Features

- **🖥️ CLI with TUI**: Single-file command-line interface with beautiful Terminal UI (Built with Bun)
- **💻 Desktop App**: Standalone executable via Electron (Windows, macOS, Linux)
- **🌐 Web Interface**: React-based modern dark theme UI
- **Modern Stack**: Bun/Node.js, Hono API, React frontend, SQLite database
- **Persistent Storage**: SQLite database with Prisma ORM
- **CRUD Management**: Manage companies, customers, and services
- **Decimal Support**: Hours and rates accept decimal values (e.g., 1.5 hours)
- **Safe Money Calculations**: Avoids floating-point errors with proper rounding
- **PDF Export**: Export invoices to PDF (web version)
- **Dark Mode UI**: Beautiful, modern dark theme interface
- **Type-Safe**: Full TypeScript support across all packages
- **Docker Support**: Run with Docker Compose for easy deployment
- **Status Tracking**: Track invoice status (Draft, Pending, Paid, Overdue)

## 📦 Project Structure

```
ts-invoice-generator/
├── cli/                  # NEW: Bun-based single-file CLI with TUI
│   ├── index.ts         # Complete CLI in one file
│   ├── prisma/          # Database schema
│   └── package.json     # Bun dependencies
├── packages/
│   ├── shared/          # Shared types, utilities, and money calculations
│   ├── api/             # Hono-based REST API with Prisma/SQLite
│   ├── web/             # React frontend with Vite
│   └── electron/        # Electron desktop application
├── Dockerfile           # Production Docker build
├── Dockerfile.dev       # Development Docker build
├── docker-compose.yml   # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
├── nginx.conf           # Nginx config for serving frontend
├── package.json         # Root package with workspace config
└── tsconfig.json        # Base TypeScript configuration
```

## 🛠️ Prerequisites

- [Bun](https://bun.sh/) v1.0+ (for CLI)
- [Node.js](https://nodejs.org/) v18+ (for web/electron)
- npm (comes with Node.js)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

## 🏁 Getting Started

### Option 1: CLI with TUI (NEW - Recommended ⭐)

The simplest and fastest way to use the invoice generator:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

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

Features:
- 📋 List and view invoices
- ✨ Create new invoices interactively
- 🏢 Manage companies, customers, and services
- 📊 View statistics dashboard
- 🌱 Auto-seed with sample data

See [cli/README.md](cli/README.md) for detailed CLI documentation.

### Option 2: Desktop Application (Electron)

Build a standalone executable for your platform:

```bash
# Install dependencies
npm install

# Build and package for your platform
npm run package:electron     # Build for current platform
npm run package:win          # Build for Windows (.exe)
npm run package:mac          # Build for macOS (.dmg)
npm run package:linux        # Build for Linux (.AppImage, .deb)
```

The packaged application will be in `packages/electron/release/`.

### Option 3: Local Development (Web + API)

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Build the shared package

```bash
npm run build:shared
```

#### 3. Set up the database

```bash
cd packages/api
cp .env.example .env
npx prisma migrate dev
cd ../..
```

#### 4. Start Development Servers

Run both API and web development servers:

```bash
# Terminal 1: Start API server (port 3001)
npm run dev:api

# Terminal 2: Start web server (port 5173)
npm run dev:web
```

#### 5. Access the Application

- **Web UI**: http://localhost:5173
- **API**: http://localhost:3001

### Option 4: Docker Deployment

#### 1. Build and run with Docker Compose

```bash
# Build the web frontend first (required for nginx)
npm install
npm run build:shared
npm run build

# Start the containers
docker-compose up -d
```

#### 2. Access the Application

- **Web UI**: http://localhost:8080
- **API**: http://localhost:3001

The SQLite database is persisted in a Docker volume named `invoice-generator-data`.

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `NODE_ENV` | `development` | Environment mode |
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `WEB_PORT` | `8080` | Web UI port (Docker only) |

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

## 🎨 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:api` | Run API server only |
| `npm run dev:web` | Run web frontend only |
| `npm run build` | Build all packages |
| `npm run build:shared` | Build shared package (run first!) |
| `npm run lint` | Run TypeScript type checking |
| `npm run test` | Run tests |
| `npm run clean` | Clean all build artifacts and dependencies |

### Electron Scripts
| Script | Description |
|--------|-------------|
| `npm run dev:electron` | Run Electron app in development mode |
| `npm run build:electron` | Build all packages for Electron |
| `npm run package:electron` | Package for current platform |
| `npm run package:win` | Package for Windows (.exe, .nsis) |
| `npm run package:mac` | Package for macOS (.dmg) |
| `npm run package:linux` | Package for Linux (.AppImage, .deb) |

### API-specific Scripts
| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |

## 🧪 Testing

Run all tests:
```bash
npm run test
```

The test suite includes:
- Money utility functions (floating-point safe calculations)
- Invoice calculation scenarios with decimal hours

## 💡 Key Features Explained

### Decimal Hours and Rates
The application supports decimal values for hours worked and hourly rates:
- Enter `1.5` hours for 1 hour 30 minutes
- Enter `125.50` for a rate of $125.50/hour

### Safe Money Calculations
All monetary calculations use the money utility module (`packages/shared/src/money.ts`) to avoid JavaScript floating-point errors:
```typescript
// Instead of: 0.1 + 0.2 = 0.30000000000000004
// We get: addMoney(0.1, 0.2) = 0.3
```

### PDF Export
The PDF export feature uses html2canvas and jsPDF. The export button is automatically hidden from the PDF output using the `data-html2canvas-ignore` attribute.

## 📝 Sample Data

On first startup, the database is seeded with sample data:
- 2 companies (Acme Corp, Tech Solutions LLC)
- 3 customers (Client Company, Startup Inc, Global Enterprises)
- 8 service types (Web Development, UI/UX Design, etc.)
- 1 sample invoice

## 🔧 Customization

### Adding New Invoice Fields

1. Update the Prisma schema in `packages/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev` to update the database
3. Update the types in `packages/shared/src/types.ts`
4. Update the API handlers in `packages/api/src/services/invoiceService.ts`
5. Update the form in `packages/web/src/pages/NewInvoicePage.tsx`
6. Update the preview in `packages/web/src/components/InvoicePreview.tsx`

### Changing the Theme

Edit the CSS variables in `packages/web/src/styles.css`:

```css
:root {
  --bg-primary: #0f0f1a;
  --accent-primary: #8b5cf6;
  /* ... other variables */
}
```

## 📄 License

MIT
