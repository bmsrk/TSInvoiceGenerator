/**
 * Customer routes
 */

import { Hono } from 'hono';
import * as customerService from '../services/customerService.js';

export function createCustomerRoutes(): Hono {
  const app = new Hono();

  // GET /api/customers - List all customers
  app.get('/', async (c) => {
    const customers = await customerService.getAllCustomers();
    return c.json(customers);
  });

  // GET /api/customers/:id - Get a specific customer
  app.get('/:id', async (c) => {
    const id = c.req.param('id');
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }
    return c.json(customer);
  });

  // POST /api/customers - Create a new customer
  app.post('/', async (c) => {
    try {
      const body = await c.req.json<customerService.CreateCustomerInput>();
      const customer = await customerService.createCustomer(body);
      return c.json(customer, 201);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  // PUT /api/customers/:id - Update a customer
  app.put('/:id', async (c) => {
    const id = c.req.param('id');
    try {
      const body = await c.req.json<Partial<customerService.CreateCustomerInput>>();
      const customer = await customerService.updateCustomer({ id, ...body });
      if (!customer) {
        return c.json({ error: 'Customer not found' }, 404);
      }
      return c.json(customer);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  // DELETE /api/customers/:id - Delete a customer
  app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await customerService.deleteCustomer(id);
    if (!deleted) {
      return c.json({ error: 'Customer not found or cannot be deleted' }, 404);
    }
    return c.json({ success: true });
  });

  return app;
}
