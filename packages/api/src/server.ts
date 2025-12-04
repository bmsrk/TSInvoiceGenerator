import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { InvoiceStatus } from '@invoice/shared';
import { calculateInvoiceTotals } from '@invoice/shared';

// Import services
import * as companyService from './services/companyService.js';
import * as customerService from './services/customerService.js';
import * as serviceService from './services/serviceService.js';
import * as invoiceService from './services/invoiceService.js';
import { seedDatabase } from './services/seed.js';

/**
 * Create and configure the Hono app with all routes
 */
export function createApp(): Hono {
  const app = new Hono();

  // Enable CORS
  app.use('/*', cors());

  // Health check
  app.get('/', (c) => {
    return c.json({
      name: 'Invoice Generator API',
      version: '2.0.0',
      status: 'healthy',
    });
  });

  // ============ Company Routes ============

  app.get('/api/companies', async (c) => {
    const companies = await companyService.getAllCompanies();
    return c.json(companies);
  });

  app.get('/api/companies/:id', async (c) => {
    const id = c.req.param('id');
    const company = await companyService.getCompanyById(id);
    if (!company) {
      return c.json({ error: 'Company not found' }, 404);
    }
    return c.json(company);
  });

  app.post('/api/companies', async (c) => {
    try {
      const body = await c.req.json<companyService.CreateCompanyInput>();
      const company = await companyService.createCompany(body);
      return c.json(company, 201);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  app.put('/api/companies/:id', async (c) => {
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

  app.delete('/api/companies/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await companyService.deleteCompany(id);
    if (!deleted) {
      return c.json({ error: 'Company not found or cannot be deleted' }, 404);
    }
    return c.json({ success: true });
  });

  // ============ Customer Routes ============

  app.get('/api/customers', async (c) => {
    const customers = await customerService.getAllCustomers();
    return c.json(customers);
  });

  app.get('/api/customers/:id', async (c) => {
    const id = c.req.param('id');
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }
    return c.json(customer);
  });

  app.post('/api/customers', async (c) => {
    try {
      const body = await c.req.json<customerService.CreateCustomerInput>();
      const customer = await customerService.createCustomer(body);
      return c.json(customer, 201);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  app.put('/api/customers/:id', async (c) => {
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

  app.delete('/api/customers/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await customerService.deleteCustomer(id);
    if (!deleted) {
      return c.json({ error: 'Customer not found or cannot be deleted' }, 404);
    }
    return c.json({ success: true });
  });

  // ============ Service Routes ============

  app.get('/api/services', async (c) => {
    const services = await serviceService.getAllServices();
    return c.json(services);
  });

  app.get('/api/services/:id', async (c) => {
    const id = c.req.param('id');
    const service = await serviceService.getServiceById(id);
    if (!service) {
      return c.json({ error: 'Service not found' }, 404);
    }
    return c.json(service);
  });

  app.post('/api/services', async (c) => {
    try {
      const body = await c.req.json<serviceService.CreateServiceInput>();
      const service = await serviceService.createService(body);
      return c.json(service, 201);
    } catch (error) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  app.put('/api/services/:id', async (c) => {
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

  app.delete('/api/services/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await serviceService.deleteService(id);
    if (!deleted) {
      return c.json({ error: 'Service not found or cannot be deleted' }, 404);
    }
    return c.json({ success: true });
  });

  // ============ Invoice Routes ============

  app.get('/api/invoices', async (c) => {
    const invoices = await invoiceService.getAllInvoices();
    return c.json(invoices.map(invoiceService.toApiFormat));
  });

  app.get('/api/invoices/:id', async (c) => {
    const id = c.req.param('id');
    const invoice = await invoiceService.getInvoiceById(id);
    
    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }
    
    return c.json(invoiceService.toApiFormat(invoice));
  });

  app.get('/api/invoices/:id/totals', async (c) => {
    const id = c.req.param('id');
    const invoice = await invoiceService.getInvoiceById(id);
    
    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }
    
    const apiInvoice = invoiceService.toApiFormat(invoice);
    const totals = calculateInvoiceTotals(apiInvoice.items);
    return c.json({
      invoice: apiInvoice,
      totals,
    });
  });

  app.post('/api/invoices', async (c) => {
    try {
      const body = await c.req.json<invoiceService.CreateInvoiceInput>();
      const invoice = await invoiceService.createInvoice(body);
      return c.json(invoiceService.toApiFormat(invoice), 201);
    } catch (error) {
      console.error('Error creating invoice:', error);
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  app.patch('/api/invoices/:id/status', async (c) => {
    const id = c.req.param('id');
    const { status } = await c.req.json<{ status: InvoiceStatus }>();
    
    const invoice = await invoiceService.updateInvoiceStatus({ id, status });
    
    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }
    
    return c.json(invoiceService.toApiFormat(invoice));
  });

  app.delete('/api/invoices/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await invoiceService.deleteInvoice(id);
    
    if (!deleted) {
      return c.json({ error: 'Invoice not found' }, 404);
    }
    
    return c.json({ success: true });
  });

  // ============ Seed endpoint for development ============

  app.post('/api/seed', async (c) => {
    try {
      await seedDatabase();
      return c.json({ success: true, message: 'Database seeded successfully' });
    } catch (error) {
      return c.json({ error: 'Failed to seed database' }, 500);
    }
  });

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
