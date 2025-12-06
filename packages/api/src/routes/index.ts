/**
 * Routes registration
 */

import { Hono } from 'hono';
import { createCompanyRoutes } from './companies.js';
import { createCustomerRoutes } from './customers.js';
import { createServiceRoutes } from './services.js';
import { createInvoiceRoutes } from './invoices.js';
import { createSeedRoute } from './seed.js';

/**
 * Register all API routes
 */
export function registerRoutes(app: Hono): void {
  // Health check
  app.get('/', (c) => {
    return c.json({
      name: 'Invoice Generator API',
      version: '2.0.0',
      status: 'healthy',
    });
  });

  // Register resource routes
  app.route('/api/companies', createCompanyRoutes());
  app.route('/api/customers', createCustomerRoutes());
  app.route('/api/services', createServiceRoutes());
  app.route('/api/invoices', createInvoiceRoutes());
  app.route('/api/seed', createSeedRoute());
}
