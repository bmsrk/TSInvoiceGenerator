/**
 * Seed route for database initialization
 */

import { Hono } from 'hono';
import { seedDatabase } from '../services/seed.js';

export function createSeedRoute(): Hono {
  const app = new Hono();

  // POST /api/seed - Seed database with sample data
  app.post('/', async (c) => {
    try {
      await seedDatabase();
      return c.json({ success: true, message: 'Database seeded successfully' });
    } catch (error) {
      return c.json({ error: 'Failed to seed database' }, 500);
    }
  });

  return app;
}
