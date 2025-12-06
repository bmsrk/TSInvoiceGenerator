# Bun Migration Guide

This guide explains how the CLI uses Bun and how to optionally migrate other packages to use Bun.

## Current State

- **CLI** (`cli/`) - ✅ **Using Bun**
  - Runtime: Bun
  - Package manager: npm (Bun's package manager had crashes, so we use npm for installation)
  - Build: `bun build --compile` for standalone executables
  - Run: `bun run index.ts`

- **Existing Packages** - Still using Node.js + npm
  - `packages/api/` - Hono API server
  - `packages/web/` - React web frontend
  - `packages/shared/` - Shared types and utilities
  - `packages/electron/` - Electron desktop app

## Why Bun for CLI?

The CLI benefits from Bun's features:

1. **Fast Runtime** - Bun is significantly faster than Node.js
2. **Built-in TypeScript** - No need for `ts-node` or compilation step
3. **Standalone Executables** - `bun build --compile` creates single-file binaries
4. **Smaller Footprint** - Single-file CLI vs multi-package monorepo

## Migrating Other Packages to Bun (Optional)

If you want to migrate the existing packages to use Bun:

### 1. Migrate the API (`packages/api/`)

```bash
cd packages/api

# Replace package.json scripts
# Change:
#   "dev": "tsx watch src/index.ts"
# To:
#   "dev": "bun --hot src/index.ts"

# Run with Bun
bun run dev
```

**Notes:**
- Bun supports most Node.js APIs
- `@hono/node-server` works fine with Bun
- Prisma works with Bun

### 2. Migrate the Web Frontend (`packages/web/`)

```bash
cd packages/web

# Vite works with Bun
bun run dev
bun run build
```

**Notes:**
- Vite is fully compatible with Bun
- React works perfectly with Bun

### 3. Update Root Package Scripts

In root `package.json`, you could change:

```json
{
  "scripts": {
    "dev:api": "bun run dev --workspace=@invoice/api",
    "dev:web": "bun run dev --workspace=@invoice/web"
  }
}
```

### 4. Replace `npm` with `bun` Commands

Throughout the project:

- `npm install` → `bun install`
- `npm run dev` → `bun run dev`
- `npx prisma` → `bunx prisma`

## Current Approach - Hybrid

We're using a **hybrid approach**:

- **New CLI** uses Bun for performance and standalone builds
- **Existing packages** continue using Node.js/npm to avoid breaking changes
- Both can coexist in the same repository

This allows:
- ✅ Fast, modern CLI experience with Bun
- ✅ Stable, tested web/electron packages with Node.js
- ✅ No breaking changes to existing workflows
- ✅ Gradual migration path if desired

## Testing Bun with Existing Packages

You can test running existing packages with Bun without changing anything:

```bash
# Test API with Bun
cd packages/api
bun run src/index.ts

# Test build with Bun
cd packages/shared
bun run build  # Uses tsc, but Bun runs it
```

## Recommendations

1. **Keep CLI with Bun** - It's optimized for this use case
2. **Keep existing packages with Node.js** - Unless you have specific performance needs
3. **Consider Bun for new packages** - If starting fresh, Bun is a great choice
4. **Test before switching** - Ensure all dependencies work with Bun

## Known Issues

- Bun's package manager (`bun install`) may crash in some environments
  - Workaround: Use `npm install` or `pnpm install` with Bun runtime
- Some Node.js-specific modules may not work with Bun
  - Check https://bun.sh/docs/runtime/nodejs-apis for compatibility

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Bun Runtime APIs](https://bun.sh/docs/runtime/nodejs-apis)
- [Bun vs Node.js Performance](https://bun.sh/docs/runtime/performance)
