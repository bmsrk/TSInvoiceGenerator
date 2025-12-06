# Invoice Generator CLI

A single-file command-line interface with Terminal User Interface (TUI) for managing invoices. Built with **Bun**, Prisma, Inquirer, and Chalk.

## Features

- 🚀 **Built with Bun** - Fast JavaScript runtime and package manager
- 📋 **Single File** - Entire CLI in one TypeScript file for simplicity
- 🎨 **Beautiful TUI** - Interactive terminal interface with menus and tables
- 💾 **SQLite Database** - Lightweight, embedded database with Prisma ORM
- 📊 **Full CRUD** - Manage companies, customers, services, and invoices
- 🧾 **Invoice Management** - Create, view, update, and delete invoices
- 📈 **Statistics** - Quick stats dashboard
- 🌱 **Sample Data** - Auto-seed with example data

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher

## Installation

### Option 1: Run Directly with Bun

```bash
# Install dependencies
bun install

# Generate Prisma client
bunx prisma generate

# Initialize database
bunx prisma migrate dev --name init

# Run the CLI
bun run index.ts
```

### Option 2: Build Standalone Executable

```bash
# Install and set up
bun install
bunx prisma generate
bunx prisma migrate dev --name init

# Build standalone binary
bun build index.ts --compile --outfile invoice

# Run the binary
./invoice
```

The standalone executable includes the Bun runtime and all dependencies, so it can run without needing Node.js or Bun installed on the target system.

## Usage

### Interactive TUI (Default)

Simply run the CLI to launch the interactive menu:

```bash
bun run index.ts
# or if you built the binary:
./invoice
```

Navigate the menus using arrow keys and Enter:

- **List Invoices** - View all invoices in a table
- **Create Invoice** - Interactive invoice creation wizard
- **Manage Companies** - Create and manage your companies
- **Manage Customers** - Create and manage customers
- **Manage Services** - Create and manage service catalog
- **View Statistics** - See quick stats dashboard
- **Seed Database** - Populate with sample data

### Command-Line Commands

You can also use specific commands:

```bash
# Show statistics
bun run index.ts stats
./invoice stats

# List all invoices
bun run index.ts list
./invoice list

# Seed database with sample data
bun run index.ts seed
./invoice seed

# Launch TUI (default)
bun run index.ts tui
./invoice tui
```

## Database

The CLI uses SQLite with Prisma ORM. The database file `invoice.db` is created in the CLI directory.

### Database Schema

- **Company** - Your business information
- **Customer** - Client information
- **Service** - Service catalog with default rates
- **Invoice** - Invoice headers
- **InvoiceLine** - Invoice line items

### Migrations

```bash
# Create a new migration
bunx prisma migrate dev --name migration_name

# Reset database
bunx prisma migrate reset

# View database in Prisma Studio
bunx prisma studio
```

## Environment Variables

Create a `.env` file in the CLI directory:

```env
DATABASE_URL="file:./invoice.db"
```

## Building for Distribution

Build a standalone executable for your platform:

```bash
bun build index.ts --compile --outfile invoice
```

This creates a single binary that includes:
- The Bun runtime
- Your application code
- All dependencies

The binary can be distributed and run without requiring Bun or Node.js to be installed.

## Exporting PDF from the CLI

You can export an invoice to a PDF from the TUI. When viewing invoice details, choose `Export to PDF` and the CLI will attempt to:

- Run `wkhtmltopdf` if it is available on your PATH, piping the generated HTML to wkhtmltopdf and writing a PDF file.
- If `wkhtmltopdf` is not installed or fails, the CLI will save a fallback HTML file (same base name but with .html) that you can convert locally with any HTML→PDF tool (or use the server's API PDF endpoint if you have the API running).

Tip: For the highest-quality PDF output prefer installing `wkhtmltopdf` on your system. On many Linux distributions you can use the package manager; on macOS use Homebrew; on Windows download the official executable from https://wkhtmltopdf.org/.

## Development

The entire CLI is in a single file (`index.ts`) for simplicity:

- **Database operations** - Using Prisma Client
- **TUI** - Built with Inquirer prompts
- **Formatting** - Tables with `table` package, colors with `chalk`
- **CLI** - Command parsing with `commander`

## Features Demo

### Create an Invoice

The interactive invoice wizard guides you through:

1. Select your company
2. Select customer
3. Enter invoice details (number, due date, payment terms)
4. Add line items (manually or from service catalog)
5. Review and create

### View Invoice Details

View complete invoice information:

- Company and customer details
- Line items table with quantities, rates, tax
- Total calculations
- Notes and terms

### Manage Entities

Full CRUD operations for:

- **Companies** - Your business profiles
- **Customers** - Client database
- **Services** - Service catalog with default rates

## License

MIT
