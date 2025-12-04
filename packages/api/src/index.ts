import { serve } from '@hono/node-server';
import { createApp, initializeDatabase } from './server.js';

// Create the app
const app = createApp();

// Initialize database on startup
initializeDatabase().catch(console.error);

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`🚀 Invoice API running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

// Export for use by Electron
export { createApp, initializeDatabase };
