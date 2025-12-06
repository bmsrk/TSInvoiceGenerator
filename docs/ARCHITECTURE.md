# Architecture Documentation

## System Overview

TSInvoiceGenerator is a dual-mode invoice management system that produces two standalone executables:

1. **CLI (TUI)** - Terminal-based interface built with Bun
2. **Electron App** - Desktop GUI application with embedded API server

Both applications use embedded SQLite databases and operate independently with no external dependencies.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  TSInvoiceGenerator Project                  │
└─────────────────────────────────────────────────────────────┘
                           │
      ┌────────────────────┴────────────────────┐
      │                                         │
┌─────▼─────┐                         ┌────────▼────────┐
│ CLI (TUI) │                         │  Electron App   │
│  (Bun)    │                         │   (Node.js)     │
└───────────┘                         └─────────────────┘
      │                                         │
      │                                   ┌─────┴─────┐
      │                                   │           │
┌─────▼──────┐                      ┌────▼───┐  ┌────▼────┐
│   Prisma   │                      │  API   │  │   Web   │
│  (SQLite)  │                      │ Server │  │  (React)│
└────────────┘                      └────┬───┘  └─────────┘
                                         │
                                    ┌────▼───┐
                                    │ Prisma │
                                    │(SQLite)│
                                    └────────┘
```

## Project Structure

### Monorepo Organization

The project uses **npm workspaces** for managing multiple packages:

```
TSInvoiceGenerator/
├── cli/                    # Bun-based CLI executable
├── packages/
│   ├── shared/            # Shared utilities and types
│   ├── api/              # API server (embedded in Electron)
│   ├── web/              # React UI (embedded in Electron)
│   └── electron/         # Electron desktop app
└── docs/                 # Documentation
```

### CLI Architecture

The CLI has been refactored from a monolithic 1100-line file into a modular structure:

```
cli/
├── src/
│   ├── index.ts               # Entry point (~100 lines)
│   ├── commands/              # Command modules
│   │   ├── invoice.ts        # Invoice operations
│   │   ├── company.ts        # Company management
│   │   ├── customer.ts       # Customer management
│   │   ├── service.ts        # Service management
│   │   └── stats.ts          # Statistics display
│   ├── utils/                # Utilities
│   │   ├── database.ts       # Prisma client & seeding
│   │   ├── tui.ts           # Terminal UI helpers
│   │   ├── formatting.ts    # Data formatting
│   │   └── constants.ts     # App constants
│   └── types.ts             # TypeScript types
└── prisma/
    └── schema.prisma        # Database schema
```

**Key Features:**
- Commander.js for CLI argument parsing
- Prompts for interactive TUI
- Chalk for colored terminal output
- Table for data display
- Direct Prisma access to SQLite

### API Architecture

The API has been reorganized into routes and middleware:

```
packages/api/src/
├── server.ts                # App configuration
├── database.ts             # Prisma client
├── pdf.ts                  # PDF generation
├── services/               # Business logic
│   ├── companyService.ts
│   ├── customerService.ts
│   ├── serviceService.ts
│   ├── invoiceService.ts
│   └── seed.ts
├── routes/                 # API endpoints
│   ├── index.ts           # Route registration
│   ├── companies.ts
│   ├── customers.ts
│   ├── services.ts
│   ├── invoices.ts
│   └── seed.ts
└── middleware/            # Middleware
    ├── index.ts
    └── cors.ts
```

**Key Features:**
- Hono framework for fast HTTP routing
- Service layer pattern for business logic
- Routes organize HTTP endpoints
- PDF generation via wkhtmltopdf + Puppeteer fallback
- Prisma ORM for database access

### Web Architecture

React-based UI served by Electron:

```
packages/web/src/
├── main.tsx               # React entry point
├── App.tsx               # Main application
├── components/           # Reusable components
│   ├── Layout.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoicePreview.tsx
│   └── ...
├── pages/               # Page components
│   ├── InvoicesPage.tsx
│   ├── CompaniesPage.tsx
│   ├── CustomersPage.tsx
│   └── ...
└── api.ts              # API client
```

**Key Features:**
- React Router for navigation
- React Hook Form for form management
- Tailwind CSS for styling
- API client abstracts backend calls

### Electron Architecture

Desktop application wrapper:

```
packages/electron/src/
├── main.ts           # Electron main process
├── api-server.ts     # Embedded API startup
└── preload.ts        # Preload script
```

**Key Features:**
- Embeds Node.js API server
- Serves React web UI
- Platform-specific database location
- Automatic API server lifecycle management

### Shared Package

Common utilities used by all packages:

```
packages/shared/src/
├── index.ts         # Main exports
├── types.ts         # Shared type definitions
├── money.ts         # Money calculations
└── utils.ts         # Utility functions
```

## Data Flow

### CLI Data Flow

```
User Input (Terminal)
    ↓
Commands (invoice.ts, company.ts, etc.)
    ↓
Prisma Client
    ↓
SQLite Database (cli/prisma/dev.db)
    ↓
Terminal Output (formatted with chalk/table)
```

### Electron Data Flow

```
User Action (Web UI)
    ↓
API Request (via fetch)
    ↓
Hono Routes (routes/*.ts)
    ↓
Service Layer (services/*.ts)
    ↓
Prisma Client
    ↓
SQLite Database (user data directory)
    ↓
JSON Response
    ↓
React UI Update
```

## Database Schema

Both CLI and Electron use the same Prisma schema with the following models:

- **Company** - Business information
- **Customer** - Client information
- **Service** - Service catalog with rates
- **Invoice** - Invoice headers
- **InvoiceItem** - Line items within invoices

See [DATABASE.md](./DATABASE.md) for detailed schema documentation.

## Key Design Decisions

### 1. Dual-Mode Approach

- **Why**: Different users prefer different interfaces
- **Benefit**: Flexibility without code duplication

### 2. Embedded Databases

- **Why**: Simplifies deployment and eliminates server requirements
- **Benefit**: True standalone executables

### 3. Monorepo Structure

- **Why**: Share code between CLI and Electron while maintaining separation
- **Benefit**: Reduced duplication, easier maintenance

### 4. Service Layer Pattern

- **Why**: Separate business logic from HTTP routing
- **Benefit**: Testable, reusable logic

### 5. Modular CLI

- **Why**: Original 1100-line file was hard to maintain
- **Benefit**: Better organization, easier testing, faster development

## Technology Stack

### CLI Stack
- **Runtime**: Bun (JavaScript runtime)
- **Database**: Prisma + SQLite
- **UI**: Commander.js + Prompts + Chalk
- **Build**: Bun compile

### Electron Stack
- **Runtime**: Node.js
- **Framework**: Electron
- **API**: Hono
- **Database**: Prisma + SQLite
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **PDF**: wkhtmltopdf + Puppeteer fallback

## Deployment

### CLI Deployment
```bash
cd cli
bun build src/index.ts --compile --outfile invoice
# Produces: invoice (or invoice.exe on Windows)
```

### Electron Deployment
```bash
npm run package:electron
# Produces platform-specific installers in packages/electron/release/
```

## Security Considerations

1. **No External API**: All data stays local
2. **File System Access**: Limited to database and PDF exports
3. **HTML Sanitization**: User input is escaped in PDF generation
4. **No Network Exposure**: Electron API runs on localhost only

## Performance Characteristics

- **CLI Startup**: < 100ms (Bun is fast)
- **Electron Startup**: 1-2 seconds
- **Database Queries**: < 10ms (SQLite in-memory)
- **PDF Generation**: 1-3 seconds (depends on invoice size)

## Future Enhancements

Potential areas for expansion:
- Multi-currency support
- Invoice templates
- Email integration
- Cloud backup
- Mobile companion app
- Multi-language support
