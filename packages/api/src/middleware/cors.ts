/**
 * CORS middleware configuration for the API
 */

import { cors } from 'hono/cors';

/**
 * Create and configure CORS middleware
 */
export function createCorsMiddleware() {
  return cors();
}
