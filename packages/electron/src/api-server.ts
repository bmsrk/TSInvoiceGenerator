import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { app as electronApp } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !electronApp.isPackaged;

// Set up the database path
function setupDatabasePath(): string {
  let dbPath: string;
  
  if (isDev) {
    // In development, use the api package directory
    dbPath = path.join(__dirname, '../../api/prisma/dev.db');
  } else {
    // In production, use the user's app data directory
    const userDataPath = electronApp.getPath('userData');
    dbPath = path.join(userDataPath, 'invoice.db');
    
    // Ensure the directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
  }
  
  // Set the DATABASE_URL environment variable
  process.env.DATABASE_URL = `file:${dbPath}`;
  
  return dbPath;
}

// Initialize database path
const dbPath = setupDatabasePath();
console.log(`📁 Database path: ${dbPath}`);

let server: ServerType | null = null;

/**
 * Start the embedded API server
 */
export async function startServer(): Promise<void> {
  const port = 3001;
  
  try {
    // Create a simple proxy app that will forward requests to the API
    // We import the server module dynamically after setting DATABASE_URL
    const { createApp, initializeDatabase } = await import('@invoice/api/dist/server.js') as {
      createApp: () => Hono;
      initializeDatabase: () => Promise<void>;
    };
    
    // Create the Hono app
    const apiApp = createApp();
    
    // Initialize the database
    await initializeDatabase();
    
    // Start the HTTP server
    server = serve({
      fetch: apiApp.fetch,
      port,
    });
    
    console.log(`🚀 Embedded API server running on http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to start API server:', error);
    throw error;
  }
}

/**
 * Stop the embedded API server
 */
export async function stopServer(): Promise<void> {
  if (server) {
    server.close();
    server = null;
    console.log('🛑 API server stopped');
  }
}

/**
 * Get the database path
 */
export function getDatabasePath(): string {
  return dbPath;
}
