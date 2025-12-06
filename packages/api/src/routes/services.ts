/**
 * Service routes
 */

import { Hono } from 'hono';
import * as serviceService from '../services/serviceService.js';

export function createServiceRoutes(): Hono {
  const app = new Hono();

  // GET /api/services - List all services (optionally filtered by companyId)
  app.get('/', async (c) => {
    const companyId = c.req.query('companyId');
    const services = await serviceService.getAllServices(companyId);
    return c.json(services);
  });

  // GET /api/services/:id - Get a specific service
  app.get('/:id', async (c) => {
    const id = c.req.param('id');
    const service = await serviceService.getServiceById(id);
    if (!service) {
      return c.json({ error: 'Service not found' }, 404);
    }
    return c.json(service);
  });

  // POST /api/services - Create a new service
  app.post('/', async (c) => {
    try {
      const body = await c.req.json<serviceService.CreateServiceInput>();
      const service = await serviceService.createService(body);
      return c.json(service, 201);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  // PUT /api/services/:id - Update a service
  app.put('/:id', async (c) => {
    const id = c.req.param('id');
    try {
      const body = await c.req.json<Partial<serviceService.CreateServiceInput>>();
      const service = await serviceService.updateService({ id, ...body });
      if (!service) {
        return c.json({ error: 'Service not found' }, 404);
      }
      return c.json(service);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  // DELETE /api/services/:id - Delete a service
  app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await serviceService.deleteService(id);
    if (!deleted) {
      return c.json({ error: 'Service not found or cannot be deleted' }, 404);
    }
    return c.json({ success: true });
  });

  return app;
}
