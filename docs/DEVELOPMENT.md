# Development Guide

## Prerequisites

### Required
- **Node.js** 20.x or later
- **npm** 9.x or later
- **Bun** 1.x or later (for CLI development)

### Optional
- **wkhtmltopdf** (for PDF generation, falls back to Puppeteer)
- **Git** for version control

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/bmsrk/TSInvoiceGenerator.git
cd TSInvoiceGenerator
npm install
```

This installs dependencies for all workspaces (shared, api, web, electron, cli).

### 2. Build Shared Package

The shared package must be built before running other packages:

```bash
npm run build:shared
```

### 3. Choose Your Development Path

#### CLI Development
```bash
cd cli
bun install
DATABASE_URL="file:./prisma/dev.db" bun run src/index.ts
```

#### Electron Development
```bash
npm run dev:electron
```

This will:
1. Build the shared package
2. Build the API
3. Start Electron with hot-reload

#### Tauri Development

Prerequisites: Rust toolchain (see [TAURI.md](./TAURI.md))

```bash
# Terminal 1: Start API server
cd packages/api
npm start

# Terminal 2: Start Tauri app
npm run dev:tauri
```

Or use the provided script:
```bash
npm run dev:tauri
```

## Project Structure

```
TSInvoiceGenerator/
├── cli/                    # Bun-based CLI
├── packages/
│   ├── shared/            # Shared utilities
│   ├── api/              # Hono API server
│   ├── web/              # React frontend
│   └── electron/         # Electron wrapper
└── docs/                 # Documentation
```

## Development Workflows

### CLI Development

#### Running the CLI

```bash
cd cli
DATABASE_URL="file:./prisma/dev.db" bun run src/index.ts
```

#### Running Specific Commands

```bash
# Show statistics
DATABASE_URL="file:./prisma/dev.db" bun run src/index.ts stats

# Seed database
DATABASE_URL="file:./prisma/dev.db" bun run src/index.ts seed

# List invoices
DATABASE_URL="file:./prisma/dev.db" bun run src/index.ts list
```

#### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create migration
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name description

# Reset database
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate reset
```

#### Building CLI Executable

```bash
bun build src/index.ts --compile --outfile invoice
./invoice  # Run the compiled executable
```

### API Development

#### Running API Tests

```bash
cd packages/api
npm test
```

#### Running API in Development

The API is typically run via Electron, but you can test it standalone:

```bash
cd packages/api
npm run dev
```

#### Updating Routes

1. Edit files in `src/routes/`
2. Business logic goes in `src/services/`
3. Update `src/routes/index.ts` if adding new routes
4. Run tests: `npm test`

### Web Development

#### Running Web in Development

Web is served by Electron. Make changes and they'll hot-reload:

```bash
npm run dev:electron
```

#### Component Development

1. Components go in `src/components/`
2. Pages go in `src/pages/`
3. Use Tailwind CSS for styling
4. Update `src/api.ts` for API calls

### Electron Development

#### Running Electron

```bash
npm run dev:electron
```

#### Debugging Electron

Use Chrome DevTools:
1. Open DevTools in the Electron window (Ctrl+Shift+I / Cmd+Option+I)
2. Main process logs appear in terminal
3. Renderer process logs appear in DevTools Console

#### Updating Electron Configuration

Edit `packages/electron/src/main.ts` for:
- Window configuration
- API server startup
- Menu bar customization

## Testing

### Running All Tests

```bash
npm test
```

### Running Package-Specific Tests

```bash
# API tests
npm test --workspace=@invoice/api

# Shared tests
npm test --workspace=@invoice/shared
```

### Writing Tests

Tests use Vitest. Example:

```typescript
import { describe, it, expect } from 'vitest';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expectedValue);
  });
});
```

## Building

### Build Shared Package

```bash
npm run build:shared
```

### Build API

```bash
npm run build:api
```

### Build Web

```bash
npm run build:web
```

### Build CLI

```bash
npm run build:cli
```

### Build Electron

```bash
npm run build:electron
```

### Build Tauri

Prerequisites: Rust toolchain installed

```bash
npm run build:tauri
```

Output will be in `packages/web/src-tauri/target/release/bundle/`

## Package Management

### Adding Dependencies

```bash
# Root dependency
npm install <package>

# Workspace dependency
npm install <package> --workspace=@invoice/api

# CLI dependency (use bun)
cd cli && bun add <package>
```

### Removing Dependencies

```bash
npm uninstall <package> --workspace=@invoice/api
```

## Common Tasks

### Adding a New API Route

1. Create route file in `packages/api/src/routes/`:
```typescript
// packages/api/src/routes/myroute.ts
import { Hono } from 'hono';

export function createMyRoute(): Hono {
  const app = new Hono();
  
  app.get('/', async (c) => {
    return c.json({ message: 'Hello' });
  });
  
  return app;
}
```

2. Register in `packages/api/src/routes/index.ts`:
```typescript
import { createMyRoute } from './myroute.js';

export function registerRoutes(app: Hono): void {
  // ... existing routes
  app.route('/api/myroute', createMyRoute());
}
```

3. Add tests in `packages/api/src/__tests__/`

### Adding a New CLI Command

1. Create command file in `cli/src/commands/`:
```typescript
// cli/src/commands/mycommand.ts
import { prisma } from '../utils/database';
import chalk from 'chalk';

export async function myCommand(): Promise<void> {
  console.log(chalk.green('Hello from my command!'));
}
```

2. Export in `cli/src/commands/index.ts`:
```typescript
export * from './mycommand';
```

3. Register in `cli/src/index.ts`:
```typescript
import { myCommand } from './commands';

program
  .command('mycommand')
  .description('My new command')
  .action(async () => {
    await myCommand();
    await prisma.$disconnect();
    process.exit(0);
  });
```

### Updating the Database Schema

1. Edit `cli/prisma/schema.prisma` and `packages/api/prisma/schema.prisma`
2. Generate migration for CLI:
```bash
cd cli
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name description
```
3. Generate migration for API:
```bash
cd packages/api
npx prisma migrate dev --name description
```
4. Update TypeScript types if needed
5. Test both CLI and Electron

## Debugging

### CLI Debugging

Use Bun's built-in debugger:
```bash
bun --inspect src/index.ts
```

Or use tsx for Node debugging:
```bash
npx tsx --inspect src/index.ts
```

### API Debugging

Add breakpoints in VS Code and use the debugger configuration.

### Electron Debugging

- **Main Process**: Console logs appear in terminal
- **Renderer Process**: Use Chrome DevTools (Ctrl+Shift+I)

## Code Style

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use explicit types for function parameters and return values
- Avoid `any` when possible

### Formatting

- Use Prettier (if configured)
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings

### File Organization

- One component/service per file
- Use descriptive file names
- Group related files in directories
- Export from index.ts files

## Troubleshooting

### "Cannot find module" Error

Rebuild the shared package:
```bash
npm run build:shared
```

### Database Locked Error

Close all applications using the database file and try again.

### Prisma Generate Fails

```bash
cd cli  # or packages/api
npx prisma generate --schema=./prisma/schema.prisma
```

### Electron Won't Start

1. Check that API is built: `npm run build:api`
2. Check that web is built: `npm run build:web`
3. Check console for errors

### Tests Failing

1. Rebuild shared package: `npm run build:shared`
2. Clear test cache: `npx vitest --clearCache`
3. Check for database conflicts

## Performance Tips

1. **Build Shared Once**: Only rebuild when you change shared code
2. **Use Hot Reload**: Electron dev mode supports hot reload
3. **Skip Tests**: Use `npm run build:api --skip-test` for faster builds (not recommended)
4. **Parallel Builds**: Modern npm runs workspace builds in parallel

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Hono Documentation](https://hono.dev/)
- [React Documentation](https://react.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Vitest Documentation](https://vitest.dev/)

## Getting Help

1. Check existing documentation in `docs/`
2. Review GitHub issues
3. Check console/terminal output for errors
4. Use TypeScript compiler for type errors: `npm run build`
