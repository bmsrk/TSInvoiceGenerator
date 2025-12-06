# GitHub Copilot Agent Task Handoff

## Task Summary

Complete comprehensive code refactoring and project reorganization for TSInvoiceGenerator to optimize for two standalone executables (CLI TUI and Electron app) with better code organization, reduced duplication, and improved developer experience.

## Current State Analysis

✅ **Already Completed:**
- Database schema alignment (CLI ↔ API)
- Removed unused Docker/nginx files (archived)
- Updated documentation (README, pkg READMEs)
- Updated root package.json

❌ **Remaining Work (This Task):**
- Reorganize CLI from single 1100-line file into modular structure
- Reorganize API routes into dedicated routes folder
- Enhance shared package with utilities
- Create comprehensive documentation
- Verify all builds and tests pass

## Detailed Implementation Plan

### Phase 1: CLI Reorganization (High Priority)

**Objective**: Break monolithic `cli/index.ts` into logical command modules while maintaining functionality.

**Current Structure:**
```
cli/
├── index.ts (1100 lines - too large)
├── prisma/schema.prisma
└── package.json
```

**Target Structure:**
```
cli/
├── src/
│   ├── index.ts (entry point, ~100 lines)
│   ├── commands/
│   │   ├── index.ts (export all commands)
│   │   ├── invoice.ts (listInvoices, createInvoice, updateStatus, etc.)
│   │   ├── company.ts (listCompanies, createCompany, etc.)
│   │   ├── customer.ts (listCustomers, createCustomer, etc.)
│   │   ├── service.ts (listServices, createService, etc.)
│   │   └── stats.ts (showStatistics)
│   ├── utils/
│   │   ├── index.ts
│   │   ├── tui.ts (menu prompts, selectFromList, etc.)
│   │   ├── formatting.ts (formatCurrency, formatDate, formatTable)
│   │   ├── database.ts (initPrisma, seedDatabase)
│   │   └── constants.ts (menu options, status values)
│   └── types.ts (CLI-specific types)
├── prisma/
│   ├── schema.prisma (updated)
│   └── migrations/
├── src/main.ts or src/cli.ts (after moving)
├── tsconfig.json (add strict type checking)
├── package.json (update bin entry)
└── README.md
```

**Tasks:**
1. Create `src/` directory structure
2. Extract command logic:
   - `invoice.ts`: All invoice CRUD operations
   - `company.ts`: Company management
   - `customer.ts`: Customer management  
   - `service.ts`: Service management
   - `stats.ts`: Statistics display
3. Extract utility functions:
   - `tui.ts`: All prompt/menu logic (showMainMenu, selectOption, etc.)
   - `formatting.ts`: formatCurrency, formatDate, formatTable
   - `database.ts`: Prisma setup, seedDatabase
   - `constants.ts`: Status enum, menu options
4. Create type definitions in `types.ts`
5. Update entry point to orchestrate imports
6. Update `bin` entry in package.json
7. Test: `bun run src/index.ts` and `bun build src/index.ts --compile --outfile invoice`

### Phase 2: API Reorganization (Medium Priority)

**Objective**: Organize API routes and middleware for better structure.

**Current Structure:**
```
packages/api/src/
├── index.ts
├── server.ts
├── db.ts
├── pdf.ts
├── invoiceStore.ts
├── services/ (business logic)
└── __tests__/
```

**Target Structure:**
```
packages/api/src/
├── index.ts (export main app)
├── server.ts (Hono app setup, middleware registration)
├── database.ts (renamed from db.ts - Prisma initialization)
├── pdf.ts (PDF generation - unchanged)
├── services/
│   ├── invoiceService.ts
│   ├── companyService.ts
│   ├── customerService.ts
│   └── serviceService.ts
├── routes/
│   ├── index.ts (register all routes)
│   ├── invoices.ts (GET, POST, PATCH, DELETE routes)
│   ├── companies.ts (GET, POST, PUT, DELETE routes)
│   ├── customers.ts (GET, POST, PUT, DELETE routes)
│   ├── services.ts (GET, POST, PUT, DELETE routes)
│   └── pdf.ts (GET /invoices/:id/pdf)
├── middleware/
│   ├── index.ts
│   └── cors.ts (CORS setup)
└── __tests__/
```

**Tasks:**
1. Create `routes/` directory
2. Create `routes/index.ts` to register all routes
3. Create individual route files (invoices.ts, companies.ts, etc.)
4. Move route handlers from services into routes
5. Create `middleware/` directory
6. Extract CORS and other middleware into `middleware/cors.ts`
7. Update `server.ts` to import and use routes + middleware
8. Rename `db.ts` → `database.ts`
9. Update all imports throughout the package
10. Test: `npm run dev:electron` and verify API works

### Phase 3: Shared Package Enhancement (Medium Priority)

**Objective**: Expand shared utilities for code reuse.

**Current Structure:**
```
packages/shared/src/
├── index.ts
├── money.ts
├── types.ts
└── utils.ts
```

**Target Structure:**
```
packages/shared/src/
├── index.ts (main exports)
├── types.ts (common types - expand)
├── constants.ts (app constants)
├── utils/
│   ├── index.ts
│   ├── money.ts (unchanged)
│   ├── validation.ts (form validators)
│   ├── formatting.ts (shared formatters)
│   └── currency.ts (currency helpers)
└── __tests__/
```

**Tasks:**
1. Create `utils/` subdirectory
2. Move existing `money.ts` → `utils/money.ts`
3. Create `utils/validation.ts` with form validators
   - validateEmail, validatePhone, validateNumber, etc.
4. Create `utils/formatting.ts`
   - formatCurrency (duplicate with CLI), make shared
   - formatDate (duplicate with CLI), make shared
   - formatTable (if needed)
5. Create `utils/currency.ts` for currency calculations
6. Expand `types.ts` with comprehensive type definitions
7. Create `constants.ts` for app-wide constants
8. Update `index.ts` to export all utilities
9. Update CLI to import formatters from shared
10. Update API to import formatters from shared
11. Test: `npm test --workspace=@invoice/shared`

### Phase 4: Documentation (Low Priority)

**Objective**: Create comprehensive developer documentation.

**Create `docs/` folder with:**

1. **ARCHITECTURE.md**
   - System design overview
   - Data flow diagrams (text-based)
   - Component relationships
   - Database schema explanation

2. **DATABASE.md**
   - Prisma schema breakdown
   - Model relationships
   - Migration guide
   - Seeding information

3. **DEVELOPMENT.md**
   - Local setup instructions
   - Running in development
   - CLI development
   - Electron development
   - Web development
   - Debug tips

4. **DEPLOYMENT.md**
   - CLI build and distribution
   - Electron packaging
   - Platform-specific builds
   - GitHub Actions workflows

5. **API.md**
   - REST endpoints reference
   - Request/response examples
   - Error handling
   - PDF generation endpoint

**Tasks:**
1. Create `docs/` folder
2. Write each markdown file
3. Link documentation from README.md
4. Add to .github if needed

### Phase 5: Testing & Verification (High Priority)

**Objective**: Ensure all changes work correctly.

**Tasks:**
1. Run CLI directly:
   ```bash
   cd cli
   bun install
   bun run src/index.ts
   ```
2. Build CLI executable:
   ```bash
   cd cli
   bun build src/index.ts --compile --outfile invoice
   ./invoice
   ```
3. Test Electron development:
   ```bash
   npm install
   npm run dev:electron
   ```
4. Verify API endpoints in Electron
5. Run all tests:
   ```bash
   npm test
   ```
6. Check for TypeScript errors:
   ```bash
   npm run build:shared
   npm run build:api
   npm run build:web
   npm run build --workspace=@invoice/electron
   ```
7. Verify no circular imports
8. Check file structure matches target

## Success Criteria

- [ ] CLI runs with: `cd cli && bun run src/index.ts`
- [ ] CLI builds: `cd cli && bun build src/index.ts --compile --outfile invoice`
- [ ] Electron dev: `npm run dev:electron` (opens with working UI)
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors
- [ ] No circular imports
- [ ] File structure matches target organization
- [ ] Documentation complete and accurate
- [ ] All original functionality preserved
- [ ] Build times reasonable

## File Changes Summary

### New Files
- `cli/src/index.ts` (entry point)
- `cli/src/commands/*.ts` (5 command files)
- `cli/src/utils/*.ts` (4 utility files)
- `cli/src/types.ts`
- `cli/tsconfig.json` (if needed)
- `packages/api/src/routes/*.ts` (5 route files)
- `packages/api/src/middleware/*.ts` (1 middleware file)
- `packages/shared/src/utils/*.ts` (3-4 utility files)
- `packages/shared/src/constants.ts`
- `docs/*.md` (5 documentation files)

### Modified Files
- `cli/index.ts` → will be replaced by new structure
- `cli/package.json` (update bin entry)
- `packages/api/src/index.ts`
- `packages/api/src/server.ts`
- `packages/api/src/db.ts` → `database.ts`
- `packages/shared/src/index.ts`
- Root `README.md` (link to docs)

### Deleted Files
- `cli/index.ts` (content moved to `src/`)
- `packages/api/src/invoiceStore.ts` (if unused after refactoring)

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-----------|--------|-----------|
| Build breaks | Low | High | Comprehensive testing, TypeScript validation |
| Circular imports | Low | High | Careful code review, dependency graph |
| Migration issues | Low | Medium | Test with sample data |
| Type errors | Medium | Medium | Full type checking, strict mode |

## Timeline Estimate

- Phase 1 (CLI): 2-3 hours
- Phase 2 (API): 1.5-2 hours  
- Phase 3 (Shared): 1-1.5 hours
- Phase 4 (Docs): 1-1.5 hours
- Phase 5 (Testing): 1-2 hours
- **Total: 6.5-10 hours**

## Deliverables

1. ✅ Modular CLI structure with commands separated
2. ✅ Organized API routes and middleware
3. ✅ Enhanced shared utilities package
4. ✅ Comprehensive documentation
5. ✅ All tests passing
6. ✅ All original functionality preserved
7. ✅ Feature branch with detailed commits
8. ✅ Pull request with complete description

## Notes for the Agent

1. **Maintain Functionality**: Every feature must work exactly as before
2. **Preserve Compatibility**: CLI and Electron must work as-is
3. **Type Safety**: Use TypeScript strict mode where possible
4. **Code Quality**: Follow existing code style and patterns
5. **Testing**: Run tests frequently during refactoring
6. **Git Commits**: Make logical, well-documented commits
7. **Code Review**: Self-review before PR submission

## Questions to Consider

- Should utility functions be further decomposed?
- Should CLI have its own type definitions or use shared types?
- Should error handling be centralized or per-module?
- Should middleware be applied globally or per-route?

## Related Files

- `REFACTORING_SUMMARY.md` - Previous refactoring work
- `POST_REFACTORING_CHECKLIST.md` - Verification steps
- `REFACTOR_PLAN.md` - This detailed plan

## Start Here

1. Review `REFACTOR_PLAN.md` for full context
2. Review existing code structure
3. Start with Phase 1 (CLI) - most impactful
4. Create feature branch: `git checkout -b refactor/code-organization`
5. Make commits with clear messages
6. When complete, create PR with this description
