# Refactoring Summary

## Goal
Produce 2 local executables with self-embedded SQLite databases:
1. **TUI CLI** - Terminal-based interface (Bun)
2. **Electron App** - Desktop GUI application

## Changes Made

### 1. Database Schema Alignment
- ✅ Fixed CLI Prisma schema to match API schema
- ✅ Added `Service.companyId` relation and `Company.services` relation to CLI schema
- ✅ Both schemas now consistent

### 2. Removed Unused Components

#### Archived Files (moved to `archived/` folder)
- `Dockerfile` - Not needed for local executables
- `Dockerfile.dev` - Not needed for local executables
- `docker-compose.yml` - Not needed for local executables
- `docker-compose.dev.yml` - Not needed for local executables
- `nginx.conf` - Not needed for local executables
- `BUN_MIGRATION.md` - Superseded by main README
- `IMPLEMENTATION_SUMMARY.md` - Superseded by main README

#### Why Archived
These files were for Docker/web deployment scenarios. Since the goal is to produce local executables with embedded databases, they are not part of the core use case but kept for reference.

### 3. Updated Documentation

#### Main README.md
- ✅ Focused on two executable options (CLI and Electron)
- ✅ Removed Docker deployment instructions
- ✅ Removed standalone web server instructions
- ✅ Clarified that web package is only for Electron
- ✅ Updated scripts documentation
- ✅ Added database location information
- ✅ Simplified prerequisites

#### Package READMEs
- ✅ Created `packages/web/README.md` - clarifies it's for Electron only
- ✅ Updated `packages/api/README.md` - clarifies it's embedded in Electron
- ✅ CLI README already comprehensive

### 4. Updated Root package.json
- ✅ Added `cli` to workspaces
- ✅ Removed standalone web/API dev scripts
- ✅ Added CLI-specific scripts (`dev:cli`, `build:cli`)
- ✅ Kept Electron build/package scripts
- ✅ Removed unnecessary lint script (kept test)
- ✅ Simplified clean script

### 5. Project Structure

#### Current Structure (Streamlined)
```
ts-invoice-generator/
├── cli/                      # TUI CLI executable (Bun-based)
│   ├── index.ts             # Single-file implementation
│   ├── prisma/              # CLI database schema
│   └── package.json         # Bun dependencies
├── packages/
│   ├── shared/              # Shared types and utilities
│   ├── api/                 # Embedded API (Electron only)
│   ├── web/                 # React UI (Electron only)
│   └── electron/            # Electron desktop app
├── archived/                # Docker & old docs (reference only)
└── package.json            # Workspace config for executables
```

## Key Points

### CLI (TUI)
- **Runtime**: Bun
- **Database**: `cli/prisma/dev.db`
- **Build**: `bun build --compile` creates standalone executable
- **Features**: Full CRUD, TUI menus, statistics, no PDF export

### Electron App
- **Runtime**: Node.js + Electron
- **Database**: User data directory (platform-specific)
- **Build**: electron-builder for platform packages
- **Features**: Full GUI, embedded API, PDF export, web UI

### Web Package
- **Purpose**: UI layer for Electron only
- **Not standalone**: Requires Electron or external API
- **Development**: Via `npm run dev:electron`

### API Package
- **Purpose**: Embedded server for Electron only
- **Not standalone**: Not meant to run independently
- **Features**: REST endpoints, PDF generation, Prisma ORM

### Shared Package
- **Purpose**: Common types and utilities
- **Used by**: Both CLI and Electron (via API/web)
- **Features**: Type definitions, money calculations

## Dependencies Overview

### Removed
- ❌ Docker runtime dependencies
- ❌ Nginx
- ❌ Standalone web server usage

### Kept
- ✅ Bun (CLI only)
- ✅ Node.js (Electron only)
- ✅ Prisma (both)
- ✅ SQLite (both)
- ✅ wkhtmltopdf + Puppeteer fallback (Electron only)

## Scripts

### Root Scripts (from package.json)
```bash
npm run dev:cli          # Run TUI CLI
npm run build:cli        # Build CLI executable
npm run dev:electron     # Run Electron in dev mode
npm run build:electron   # Build Electron packages
npm run package:electron # Package for current platform
npm run package:win      # Package for Windows
npm run package:mac      # Package for macOS
npm run package:linux    # Package for Linux
npm test                 # Run all tests
npm run clean            # Clean build artifacts
```

### CLI Scripts (from cli/package.json)
```bash
bun run index.ts                                    # Run CLI
bun build index.ts --compile --outfile invoice     # Build executable
bunx prisma generate                               # Generate client
bunx prisma migrate dev                            # Run migrations
```

## Database Locations

### CLI
- **Development**: `cli/prisma/dev.db`
- **Production**: Same location (portable)

### Electron
- **Development**: `packages/api/prisma/dev.db`
- **Production**: OS-specific user data directory
  - Windows: `%APPDATA%/Invoice Generator/invoice.db`
  - macOS: `~/Library/Application Support/Invoice Generator/invoice.db`
  - Linux: `~/.config/Invoice Generator/invoice.db`

## What's NOT Included

The following are intentionally excluded from the two executables:

1. ❌ Docker containerization
2. ❌ Standalone web server
3. ❌ Standalone API server
4. ❌ External database (PostgreSQL, MySQL, etc.)
5. ❌ Cloud deployment configurations
6. ❌ Web-only features

## Testing

Both packages maintain their test suites:
- `packages/shared/` - Money calculations, utilities
- `packages/api/` - API endpoints, PDF generation

Run tests: `npm test`

## Next Steps

### For Users
1. Choose your interface: CLI (TUI) or Electron (GUI)
2. Follow installation instructions in main README
3. Build/run the executable of your choice

### For Developers
1. CLI development: Work in `cli/` with Bun
2. Electron development: Use `npm run dev:electron`
3. Shared code: Update `packages/shared/` for both
4. Database changes: Update both Prisma schemas if needed

## Conclusion

The project is now streamlined to focus on its core goal: providing two local executables for invoice management, each with an embedded SQLite database. Unnecessary Docker and web deployment configurations have been archived but are available for reference if needed.
