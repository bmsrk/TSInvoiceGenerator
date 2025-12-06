import 'dotenv/config';
import { Hono } from 'hono';
import { createCorsMiddleware } from './middleware/index.js';
import { registerRoutes } from './routes/index.js';
import { seedDatabase } from './services/seed.js';

/**
 * Create and configure the Hono app with all routes
 */
export function createApp(): Hono {
  const app = new Hono();

  // Enable CORS middleware
  app.use('/*', createCorsMiddleware());

  // Register all routes
  registerRoutes(app);

  return app;
}

/**
 * Initialize database and seed if empty
 */
export async function initializeDatabase(): Promise<void> {
  await seedDatabase();
}

// Re-export for convenience
export { seedDatabase };
