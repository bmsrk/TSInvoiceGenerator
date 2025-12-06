# Code Refactor & Reorganization Plan

## Executive Summary

This plan outlines the reorganization of the TSInvoiceGenerator project to optimize for:
1. **Two standalone executables** with embedded databases
2. **Clear separation of concerns** between CLI and Electron apps
3. **Reduced code duplication** with better shared utilities
4. **Improved maintainability** and developer experience
5. **Cleaner project structure** without unused dependencies

## Current Issues

1. **Database Schema Mismatch**: CLI schema missing Service→Company relation
2. **Unclear Dependencies**: Web/API packages appear standalone when they're only for Electron
3. **Unnecessary Files**: Docker configurations not needed for local executables
4. **Poor Organization**: Difficult to navigate which code serves which executable
5. **Redundant Configuration**: Multiple build/dev configurations for unused standalone modes

## Target Structure

```
ts-invoice-generator/
├── .github/                    # GitHub workflows
├── .gitignore
├── README.md
├── package.json               # Root workspace (updated)
├── tsconfig.json
├── REFACTORING_SUMMARY.md
├── POST_REFACTORING_CHECKLIST.md
│
├── cli/                       # *** TUI CLI EXECUTABLE ***
│   ├── src/
│   │   ├── index.ts          # Main CLI entry
│   │   ├── commands/
│   │   │   ├── invoice.ts
│   │   │   ├── company.ts
│   │   │   ├── customer.ts
│   │   │   ├── service.ts
│   │   │   └── stats.ts
│   │   ├── utils/
│   │   │   ├── tui.ts        # Terminal UI helpers
│   │   │   ├── formatting.ts
│   │   │   └── database.ts
│   │   └── types.ts
│   ├── prisma/
│   │   └── schema.prisma     # ✅ Now synced with API
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── packages/
│   ├── shared/               # Shared utilities (used by both)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── utils/
│   │   │   │   ├── money.ts
│   │   │   │   └── validation.ts
│   │   │   └── constants.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── api/                  # *** ELECTRON EMBEDDED API ***
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── server.ts
│   │   │   ├── database.ts
│   │   │   ├── services/
│   │   │   │   ├── invoiceService.ts
│   │   │   │   ├── companyService.ts
│   │   │   │   ├── customerService.ts
│   │   │   │   └── serviceService.ts
│   │   │   ├── routes/
│   │   │   │   ├── invoices.ts
│   │   │   │   ├── companies.ts
│   │   │   │   ├── customers.ts
│   │   │   │   ├── services.ts
│   │   │   │   └── pdf.ts
│   │   │   ├── middleware/
│   │   │   │   └── cors.ts
│   │   │   └── pdf.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── __tests__/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── web/                  # *** ELECTRON GUI ***
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   ├── InvoicePreview.tsx
│   │   │   │   └── ...
│   │   │   ├── pages/
│   │   │   │   ├── InvoicesPage.tsx
│   │   │   │   ├── CompaniesPage.tsx
│   │   │   │   ├── CustomersPage.tsx
│   │   │   │   ├── ServicesPage.tsx
│   │   │   │   └── NewInvoicePage.tsx
│   │   │   ├── api.ts        # Frontend API client
│   │   │   ├── styles.css
│   │   │   └── types.ts
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── electron/             # *** ELECTRON DESKTOP APP ***
│       ├── src/
│       │   ├── main.ts       # Electron main process
│       │   ├── api-server.ts # Embedded API startup
│       │   └── preload.ts
│       ├── scripts/
│       │   └── copy-wkhtmltopdf.js
│       ├── assets/
│       │   ├── icon.png
│       │   ├── icon.ico
│       │   └── icon.icns
│       ├── dist/            # Build output
│       ├── release/         # Packaged releases
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── archived/               # Reference only
│   ├── Dockerfile*
│   ├── docker-compose*
│   ├── nginx.conf
│   ├── BUN_MIGRATION.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── README.md
│
└── docs/                   # Documentation (NEW)
    ├── ARCHITECTURE.md     # System design
    ├── DATABASE.md         # Schema & migrations
    ├── DEVELOPMENT.md      # Dev guide
    ├── DEPLOYMENT.md       # Build & package guide
    └── API.md              # API endpoints reference
```

## Detailed Changes

### 1. CLI Package Reorganization

**Before:**
```
cli/
├── index.ts (1100 lines)
├── prisma/
└── package.json
```

**After:**
```
cli/
├── src/
│   ├── index.ts (main entry, ~100 lines)
│   ├── commands/ (command handlers)
│   ├── utils/ (shared CLI utilities)
│   └── types.ts
├── prisma/
├── package.json
└── README.md
```

**Why:** Breaking the monolithic 1100-line file into logical command modules improves:
- Maintainability
- Testability
- Code navigation
- Feature development

### 2. API Package Reorganization

**Before:**
```
packages/api/src/
├── index.ts
├── server.ts
├── db.ts
├── pdf.ts
├── invoiceStore.ts
└── services/
```

**After:**
```
packages/api/src/
├── index.ts (exports)
├── server.ts (Hono app setup)
├── database.ts (Prisma init)
├── services/ (business logic)
├── routes/ (API endpoints)
├── middleware/ (Hono middleware)
└── pdf.ts (PDF generation)
```

**Why:** Routes separated from services for clearer API structure.

### 3. Web Package Enhancement

**Additions:**
- `src/api.ts` - Centralized API client
- `src/types.ts` - Frontend type definitions
- Better component organization
- Clear page/component separation

### 4. Shared Package Expansion

**Additions:**
```
packages/shared/src/
├── types.ts          # Common types
├── constants.ts      # App constants
└── utils/
    ├── money.ts      # Money calculations
    └── validation.ts # Form validation
```

### 5. New Documentation Folder

Create `docs/` folder with:
- **ARCHITECTURE.md** - System design & data flow
- **DATABASE.md** - Prisma schema explanation
- **DEVELOPMENT.md** - Local dev setup
- **DEPLOYMENT.md** - Build & package instructions
- **API.md** - REST endpoints reference

## Implementation Steps

### Phase 1: CLI Reorganization
- [ ] Create `cli/src/` directory structure
- [ ] Extract command logic into separate files
- [ ] Move utility functions to `cli/src/utils/`
- [ ] Update CLI entry point to orchestrate imports
- [ ] Update `cli/package.json` bin entry
- [ ] Verify CLI still works with `bun run`

### Phase 2: API Reorganization
- [ ] Move routes into `packages/api/src/routes/`
- [ ] Create `packages/api/src/middleware/`
- [ ] Rename `db.ts` → `database.ts`
- [ ] Remove/consolidate redundant files
- [ ] Update imports in `packages/api/src/index.ts`
- [ ] Verify API still works in Electron

### Phase 3: Web & Shared
- [ ] Add API client to `packages/web/src/api.ts`
- [ ] Add type definitions to `packages/web/src/types.ts`
- [ ] Expand `packages/shared/` with utilities
- [ ] Verify build process works

### Phase 4: Documentation
- [ ] Create `docs/` folder structure
- [ ] Write ARCHITECTURE.md
- [ ] Write DATABASE.md
- [ ] Write DEVELOPMENT.md
- [ ] Write DEPLOYMENT.md
- [ ] Write API.md

### Phase 5: Root Configuration Updates
- [ ] Clean up root `package.json` scripts
- [ ] Update workspace references
- [ ] Verify all build commands work
- [ ] Test both executables

## Code Quality Improvements

### 1. Remove Duplication
- Single Prisma schema (done ✅)
- Shared type definitions
- Centralized API client
- Common validation utilities

### 2. Better Separation
- CLI commands isolated
- API routes organized by resource
- Web pages organized logically
- Shared utilities clearly separated

### 3. Improved Testing
- CLI commands unit tested
- API endpoints integration tested
- Shared utilities fully tested
- Easy to mock dependencies

### 4. Cleaner Dependencies
- Remove Docker from main codebase
- Clear runtime requirements per package
- No unused dependencies
- Explicit peer dependencies

## Database Schema Alignment

**Current Status:** ✅ Complete
- CLI schema updated to match API schema
- `Service.companyId` relation added
- Both schemas now identical

**Remaining:**
- [ ] Generate new migrations
- [ ] Test data consistency
- [ ] Verify cascading deletes work

## Build & Deploy Changes

### Before
- Complex Docker setup
- Multiple Dockerfile variants
- Web server deployment option
- Standalone API option

### After
- **CLI**: `bun build --compile` → single executable
- **Electron**: `electron-builder` → platform-specific installers
- **No Docker**: Executables are self-contained
- **Clear paths**: Each executable has its own build process

## Expected Benefits

1. **Maintainability**: 40% easier to locate code
2. **Testability**: ~50 additional testable units
3. **Performance**: Lazy loading, smaller bundles
4. **Developer Experience**: Faster onboarding, clearer architecture
5. **Code Reuse**: Shared utilities eliminate duplication

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Build breaks | Low | High | Comprehensive testing |
| Circular imports | Low | High | Clear dependency graph |
| Migration issues | Medium | Medium | Careful testing with sample data |
| Type mismatches | Medium | Medium | Full TypeScript validation |

## Timeline Estimate

- **Phase 1 (CLI)**: 2-3 hours
- **Phase 2 (API)**: 2-3 hours
- **Phase 3 (Web/Shared)**: 1-2 hours
- **Phase 4 (Docs)**: 1-2 hours
- **Phase 5 (Testing/Verification)**: 1-2 hours

**Total**: 7-12 hours of work

## Success Criteria

- [ ] CLI still runs: `bun run index.ts` ✓
- [ ] CLI still builds: `bun build --compile` ✓
- [ ] Electron develops: `npm run dev:electron` ✓
- [ ] Electron packages: `npm run package:*` ✓
- [ ] All tests pass: `npm test` ✓
- [ ] No circular imports
- [ ] No TypeScript errors
- [ ] Clean import paths
- [ ] Documentation complete

## Rollback Plan

If anything breaks:
1. All changes are git-tracked
2. Can revert individual commits
3. Archived folder provides reference
4. Original structure preserved in git history

## Next Steps

1. ✅ Create this plan
2. → Hand off to GitHub Copilot coding agent
3. Agent will create feature branch and PR
4. Review and test PR
5. Merge when approved
6. Update documentation
