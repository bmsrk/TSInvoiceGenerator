/**
 * Electrobun main process for Invoice Generator
 *
 * Responsibilities:
 *  1. Resolve a writable data directory for the SQLite database.
 *  2. Ensure all database tables exist (idempotent SQL migrations via bun:sqlite).
 *  3. Start the Hono REST API server (Bun.serve) on a fixed port.
 *  4. In production, also serve the built React SPA from the same server.
 *  5. Open a BrowserWindow pointed at the server.
 */

import { BrowserWindow } from 'electrobun/bun';
import { join, resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';
import os from 'os';

// ---------------------------------------------------------------------------
// 1. Database path — platform-specific app-data directory
// ---------------------------------------------------------------------------

function getDataDir(): string {
  const appName = 'Invoice Generator';
  switch (process.platform) {
    case 'win32':
      return join(process.env.LOCALAPPDATA || os.homedir(), appName);
    case 'darwin':
      return join(os.homedir(), 'Library', 'Application Support', appName);
    default:
      return join(os.homedir(), '.local', 'share', 'invoice-generator');
  }
}

const dataDir = getDataDir();
mkdirSync(dataDir, { recursive: true });
const dbPath = join(dataDir, 'invoice.db');

// Set DATABASE_URL *before* any Prisma / @invoice/api import so the
// LibSQL adapter connects to the correct file.
process.env.DATABASE_URL = `file:${dbPath}`;

// ---------------------------------------------------------------------------
// 2. Ensure tables exist (idempotent, runs via bun:sqlite before Prisma)
// ---------------------------------------------------------------------------

const { Database } = await import('bun:sqlite');

function ensureSchema(path: string): void {
  const db = new Database(path, { create: true });
  try {
    db.exec(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS "Company" (
        "id"        TEXT    NOT NULL PRIMARY KEY,
        "name"      TEXT    NOT NULL,
        "email"     TEXT    NOT NULL,
        "phone"     TEXT,
        "street"    TEXT    NOT NULL,
        "city"      TEXT    NOT NULL,
        "state"     TEXT    NOT NULL,
        "zipCode"   TEXT    NOT NULL,
        "country"   TEXT    NOT NULL,
        "taxId"     TEXT,
        "logo"      TEXT,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Customer" (
        "id"        TEXT    NOT NULL PRIMARY KEY,
        "name"      TEXT    NOT NULL,
        "email"     TEXT    NOT NULL,
        "phone"     TEXT,
        "street"    TEXT    NOT NULL,
        "city"      TEXT    NOT NULL,
        "state"     TEXT    NOT NULL,
        "zipCode"   TEXT    NOT NULL,
        "country"   TEXT    NOT NULL,
        "taxId"     TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Service" (
        "id"          TEXT    NOT NULL PRIMARY KEY,
        "description" TEXT    NOT NULL,
        "defaultRate" REAL    NOT NULL,
        "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   DATETIME NOT NULL,
        "companyId"   TEXT    NOT NULL,
        CONSTRAINT "Service_companyId_fkey"
          FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Invoice" (
        "id"                 TEXT    NOT NULL PRIMARY KEY,
        "invoiceNumber"      TEXT    NOT NULL,
        "createdAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"          DATETIME NOT NULL,
        "dueDate"            DATETIME NOT NULL,
        "status"             TEXT    NOT NULL DEFAULT 'DRAFT',
        "currency"           TEXT    NOT NULL DEFAULT 'USD',
        "paymentTerms"       TEXT    NOT NULL DEFAULT 'NET_30',
        "notes"              TEXT,
        "termsAndConditions" TEXT,
        "companyId"          TEXT    NOT NULL,
        "customerId"         TEXT    NOT NULL,
        CONSTRAINT "Invoice_companyId_fkey"
          FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Invoice_customerId_fkey"
          FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

      CREATE TABLE IF NOT EXISTS "InvoiceLine" (
        "id"          TEXT  NOT NULL PRIMARY KEY,
        "description" TEXT  NOT NULL,
        "quantity"    REAL  NOT NULL,
        "unitPrice"   REAL  NOT NULL,
        "taxRate"     REAL  NOT NULL DEFAULT 0,
        "invoiceId"   TEXT  NOT NULL,
        CONSTRAINT "InvoiceLine_invoiceId_fkey"
          FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
  } finally {
    db.close();
  }
}

ensureSchema(dbPath);

// ---------------------------------------------------------------------------
// 3. Import the API (after DATABASE_URL is set)
// ---------------------------------------------------------------------------

const { createApp, initializeDatabase } = await import('@invoice/api');

// ---------------------------------------------------------------------------
// 4. Build the Hono app; in production also serve the React SPA
// ---------------------------------------------------------------------------

const app = createApp();

// In production (packaged Electrobun app) the React build lives at
// Resources/web/ — same directory structure that electrobun.config.ts copies
// it to.  In dev mode (ELECTROBUN_BUILD_ENV=dev) we rely on the Vite dev
// server instead, so no static serving is needed here.
const isProduction = process.env.ELECTROBUN_BUILD_ENV !== 'dev';

// Resolve the Resources folder the same way Electrobun does internally:
// CWD is set to the directory that contains bun.exe; Resources is one level up.
const resourcesDir = resolve('../Resources');
const webRoot = join(resourcesDir, 'web');

if (isProduction && existsSync(webRoot)) {
  // Serve the React SPA after all /api/* routes.
  // • Requests with a file extension that exist → serve the file.
  // • Everything else → return index.html (client-side routing).
  app.get('/*', async (c) => {
    const reqPath = c.req.path === '/' ? '/index.html' : c.req.path;
    const candidate = join(webRoot, reqPath);
    const file = Bun.file(candidate);
    if (await file.exists()) {
      return new Response(file);
    }
    // SPA fallback
    return new Response(Bun.file(join(webRoot, 'index.html')));
  });
}

// ---------------------------------------------------------------------------
// 5. Start the API / SPA server
// ---------------------------------------------------------------------------

const port = parseInt(process.env.PORT || '3001', 10);

Bun.serve({ fetch: app.fetch, port });

// Seed the DB with sample data on first run (no-op when data exists).
initializeDatabase().catch((err: unknown) =>
  console.error('[Invoice API] seed error:', err),
);

// ---------------------------------------------------------------------------
// 6. Open the browser window
// ---------------------------------------------------------------------------

// In dev mode Vite runs on 5173 (started separately) and proxies /api → 3001.
// In production the Hono server above serves both SPA and API on the same port.
const windowUrl =
  process.env.ELECTROBUN_BUILD_ENV === 'dev'
    ? `http://localhost:5173`
    : `http://localhost:${port}`;

new BrowserWindow({
  title: 'Invoice Generator',
  frame: { x: 0, y: 0, width: 1200, height: 800 },
  url: windowUrl,
  titleBarStyle: 'default',
  transparent: false,
  passthrough: false,
  navigationRules: null,
  sandbox: false,
  renderer: 'native',
});
