/**
 * Company routes
 */

import { Hono } from 'hono';
import * as companyService from '../services/companyService.js';

export function createCompanyRoutes(): Hono {
  const app = new Hono();

  // GET /api/companies - List all companies
  app.get('/', async (c) => {
    const companies = await companyService.getAllCompanies();
    return c.json(companies);
  });

  // GET /api/companies/:id - Get a specific company
  app.get('/:id', async (c) => {
    const id = c.req.param('id');
    const company = await companyService.getCompanyById(id);
    if (!company) {
      return c.json({ error: 'Company not found' }, 404);
    }
    return c.json(company);
  });

  // POST /api/companies - Create a new company
  app.post('/', async (c) => {
    try {
      const body = await c.req.json<companyService.CreateCompanyInput>();
      const company = await companyService.createCompany(body);
      return c.json(company, 201);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  // PUT /api/companies/:id - Update a company
  app.put('/:id', async (c) => {
    const id = c.req.param('id');
    try {
      const body = await c.req.json<Partial<companyService.CreateCompanyInput>>();
      const company = await companyService.updateCompany({ id, ...body });
      if (!company) {
        return c.json({ error: 'Company not found' }, 404);
      }
      return c.json(company);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  // DELETE /api/companies/:id - Delete a company
  app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await companyService.deleteCompany(id);
    if (!deleted) {
      return c.json({ error: 'Company not found or cannot be deleted' }, 404);
    }
    return c.json({ success: true });
  });

  return app;
}
