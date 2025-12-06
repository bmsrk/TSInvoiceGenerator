import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock services used by server
vi.mock('../services/companyService.js', () => ({
  getAllCompanies: vi.fn(),
  getCompanyById: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  deleteCompany: vi.fn(),
}));

vi.mock('../services/customerService.js', () => ({
  getAllCustomers: vi.fn(),
  getCustomerById: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}));

vi.mock('../services/serviceService.js', () => ({
  getAllServices: vi.fn(),
  getServiceById: vi.fn(),
  createService: vi.fn(),
  updateService: vi.fn(),
  deleteService: vi.fn(),
}));

vi.mock('../services/invoiceService.js', () => ({
  getAllInvoices: vi.fn(),
  getInvoiceById: vi.fn(),
  createInvoice: vi.fn(),
  updateInvoiceStatus: vi.fn(),
  deleteInvoice: vi.fn(),
  toApiFormat: vi.fn((i) => i),
}));

vi.mock('../services/seed.js', () => ({ seedDatabase: vi.fn() }));

// Mock PDF generator so tests don't spawn binaries or download Chromium
vi.mock('../pdf.js', () => ({
  htmlToPdf: vi.fn(async () => Buffer.from('%PDF-1.4 dummy')), 
  renderInvoiceHtml: vi.fn((i) => `<html><body>invoice ${i.id}</body></html>`),
}));

// Mock calculateInvoiceTotals from shared to keep results deterministic
vi.mock('@invoice/shared', async () => {
  const original = await vi.importActual<any>('@invoice/shared');
  return {
    ...original,
    calculateInvoiceTotals: (items: any[]) => ({ subtotal: 100, totalTax: 10, total: 110 }),
  };
});

import { createApp } from '../server';
import * as companyService from '../services/companyService.js';
import * as customerService from '../services/customerService.js';
import * as serviceService from '../services/serviceService.js';
import * as invoiceService from '../services/invoiceService.js';
import { seedDatabase } from '../services/seed.js';

beforeEach(() => {
  vi.resetAllMocks();
});

async function doRequest(app: any, method: string, path: string, body?: any) {
  const init: any = { method, headers: { 'content-type': 'application/json' } };
  if (body) init.body = JSON.stringify(body);
  // Hono supports app.request
  const req = new Request('http://localhost' + path, init);
  // Some Hono versions use app.request(req) or app.fetch(req)
  if (typeof app.request === 'function') return await app.request(req);
  return await app.fetch(req);
}

describe('server routes', () => {
  const app = createApp();

  it('GET / returns health', async () => {
    const res = await doRequest(app, 'GET', '/');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('status', 'healthy');
  });

  it('GET /api/companies returns list', async () => {
    (companyService.getAllCompanies as any).mockResolvedValueOnce([{ id: 'c1' }]);
    const res = await doRequest(app, 'GET', '/api/companies');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([{ id: 'c1' }]);
  });

  it('GET /api/companies/:id returns 404 when not found', async () => {
    (companyService.getCompanyById as any).mockResolvedValueOnce(null);
    const res = await doRequest(app, 'GET', '/api/companies/nonexistent');
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('POST /api/companies returns 201 on success', async () => {
    const created = { id: 'c-new', name: 'X' };
    (companyService.createCompany as any).mockResolvedValueOnce(created);
    const res = await doRequest(app, 'POST', '/api/companies', { name: 'X' });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(created);
  });

  it('POST /api/seed calls seedDatabase and returns success', async () => {
    (seedDatabase as any).mockResolvedValueOnce(undefined);
    const res = await doRequest(app, 'POST', '/api/seed');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('success', true);
  });

  it('GET /api/invoices/:id/totals returns totals', async () => {
    const dbInvoice = { id: 'i1' };
    (invoiceService.getInvoiceById as any).mockResolvedValueOnce(dbInvoice);
    (invoiceService.toApiFormat as any).mockImplementationOnce(() => ({ items: [{ id: 'li', quantity: 1, unitPrice: 100 }] }));

    const res = await doRequest(app, 'GET', '/api/invoices/i1/totals');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('totals');
    expect(json.totals).toEqual({ subtotal: 100, totalTax: 10, total: 110 });
  });

  it('GET /api/invoices/:id/pdf returns a PDF stream', async () => {
    const dbInvoice = { id: 'i-pdf', invoiceNumber: 'INV-0001' };
    (invoiceService.getInvoiceById as any).mockResolvedValueOnce(dbInvoice);
    (invoiceService.toApiFormat as any).mockImplementationOnce((i: any) => ({ id: i.id, invoiceNumber: 'INV-0001', items: [] }));

    const res = await doRequest(app, 'GET', '/api/invoices/i-pdf/pdf');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    // We ensure the server returns application/pdf and includes a filename header
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    const cd = res.headers.get('content-disposition') || '';
    expect(cd).toContain('INV-0001');
  });

  it('GET /api/companies/:id returns the company when found', async () => {
    (companyService.getCompanyById as any).mockResolvedValueOnce({ id: 'found' });
    const res = await doRequest(app, 'GET', '/api/companies/found');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ id: 'found' });
  });

  it('PUT /api/companies/:id returns 200 on successful update, 400 on invalid body, 404 when not found', async () => {
    (companyService.updateCompany as any).mockResolvedValueOnce({ id: 'u1' });
    let res = await doRequest(app, 'PUT', '/api/companies/u1', { name: 'New' });
    expect(res.status).toBe(200);

    // simulate update throwing -> 400
    (companyService.updateCompany as any).mockRejectedValueOnce(new Error('bad body'));
    res = await doRequest(app, 'PUT', '/api/companies/u1', { name: 'Bad' });
    expect(res.status).toBe(400);

    // simulate update returning null -> 404
    (companyService.updateCompany as any).mockResolvedValueOnce(null);
    res = await doRequest(app, 'PUT', '/api/companies/u1', { name: 'NotFound' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/companies/:id returns 200 when deleted, 404 when cannot delete', async () => {
    (companyService.deleteCompany as any).mockResolvedValueOnce(true);
    let res = await doRequest(app, 'DELETE', '/api/companies/x');
    expect(res.status).toBe(200);

    (companyService.deleteCompany as any).mockResolvedValueOnce(false);
    res = await doRequest(app, 'DELETE', '/api/companies/x');
    expect(res.status).toBe(404);
  });

  // Customers
  it('GET /api/customers returns list and GET by id supports not found and found', async () => {
    (customerService.getAllCustomers as any).mockResolvedValueOnce([{ id: 'cu1' }]);
    let res = await doRequest(app, 'GET', '/api/customers');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 'cu1' }]);

    (customerService.getCustomerById as any).mockResolvedValueOnce(null);
    res = await doRequest(app, 'GET', '/api/customers/none');
    expect(res.status).toBe(404);

    (customerService.getCustomerById as any).mockResolvedValueOnce({ id: 'cu2' });
    res = await doRequest(app, 'GET', '/api/customers/cu2');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'cu2' });
  });

  it('POST /api/customers returns 201 on success and 400 on invalid request', async () => {
    (customerService.createCustomer as any).mockResolvedValueOnce({ id: 'nc' });
    let res = await doRequest(app, 'POST', '/api/customers', { name: 'A' });
    expect(res.status).toBe(201);

    (customerService.createCustomer as any).mockRejectedValueOnce(new Error('bad'));
    res = await doRequest(app, 'POST', '/api/customers', { name: 'bad' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/customers/:id works and returns 404 when not found', async () => {
    (customerService.updateCustomer as any).mockResolvedValueOnce({ id: 'u' });
    let res = await doRequest(app, 'PUT', '/api/customers/u', { name: 'u' });
    expect(res.status).toBe(200);

    (customerService.updateCustomer as any).mockResolvedValueOnce(null);
    res = await doRequest(app, 'PUT', '/api/customers/u', { name: 'not' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/customers/:id returns 200 or 404', async () => {
    (customerService.deleteCustomer as any).mockResolvedValueOnce(true);
    let res = await doRequest(app, 'DELETE', '/api/customers/x');
    expect(res.status).toBe(200);

    (customerService.deleteCustomer as any).mockResolvedValueOnce(false);
    res = await doRequest(app, 'DELETE', '/api/customers/x');
    expect(res.status).toBe(404);
  });

  // Services endpoints
  it('GET /api/services returns list and accepts companyId', async () => {
    (serviceService.getAllServices as any).mockResolvedValueOnce([{ id: 's1' }]);
    let res = await doRequest(app, 'GET', '/api/services');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 's1' }]);

    (serviceService.getAllServices as any).mockResolvedValueOnce([]);
    res = await doRequest(app, 'GET', '/api/services?companyId=comp');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('GET /api/services/:id 404 when not found & 200 when found', async () => {
    (serviceService.getServiceById as any).mockResolvedValueOnce(null);
    let res = await doRequest(app, 'GET', '/api/services/no');
    expect(res.status).toBe(404);

    (serviceService.getServiceById as any).mockResolvedValueOnce({ id: 's2' });
    res = await doRequest(app, 'GET', '/api/services/s2');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 's2' });
  });

  it('POST/PUT/DELETE /api/services flow', async () => {
    (serviceService.createService as any).mockResolvedValueOnce({ id: 'c1' });
    let res = await doRequest(app, 'POST', '/api/services', { description: 'X' });
    expect(res.status).toBe(201);

    (serviceService.updateService as any).mockResolvedValueOnce({ id: 'u1' });
    res = await doRequest(app, 'PUT', '/api/services/u1', { description: 'U' });
    expect(res.status).toBe(200);

    (serviceService.updateService as any).mockResolvedValueOnce(null);
    res = await doRequest(app, 'PUT', '/api/services/u1', { description: 'missing' });
    expect(res.status).toBe(404);

    (serviceService.deleteService as any).mockResolvedValueOnce(true);
    res = await doRequest(app, 'DELETE', '/api/services/u1');
    expect(res.status).toBe(200);

    (serviceService.deleteService as any).mockResolvedValueOnce(false);
    res = await doRequest(app, 'DELETE', '/api/services/u1');
    expect(res.status).toBe(404);
  });

  // Invoices endpoints: list, get, create, patch, delete
  it('GET /api/invoices returns list and GET by id returns invoice or 404', async () => {
    (invoiceService.getAllInvoices as any).mockResolvedValueOnce([{ id: 'inv1' }]);
    (invoiceService.toApiFormat as any).mockImplementation((i: any) => i);
    let res = await doRequest(app, 'GET', '/api/invoices');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 'inv1' }]);

    (invoiceService.getInvoiceById as any).mockResolvedValueOnce(null);
    res = await doRequest(app, 'GET', '/api/invoices/no');
    expect(res.status).toBe(404);

    (invoiceService.getInvoiceById as any).mockResolvedValueOnce({ id: 'inv2' });
    (invoiceService.toApiFormat as any).mockImplementationOnce((i: any) => ({ id: i.id }));
    res = await doRequest(app, 'GET', '/api/invoices/inv2');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'inv2' });
  });

  it('POST /api/invoices returns created invoice or 400 on error', async () => {
    (invoiceService.createInvoice as any).mockResolvedValueOnce({ id: 'new' });
    (invoiceService.toApiFormat as any).mockImplementation((i: any) => i);
    let res = await doRequest(app, 'POST', '/api/invoices', { items: [] });
    expect(res.status).toBe(201);

    (invoiceService.createInvoice as any).mockRejectedValueOnce(new Error('bad'));
    res = await doRequest(app, 'POST', '/api/invoices', { items: [] });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/invoices/:id/status updates or returns 404', async () => {
    (invoiceService.updateInvoiceStatus as any).mockResolvedValueOnce({ id: 'x' });
    (invoiceService.toApiFormat as any).mockImplementation((i: any) => i);
    let res = await doRequest(app, 'PATCH', '/api/invoices/x/status', { status: 'PAID' });
    expect(res.status).toBe(200);

    (invoiceService.updateInvoiceStatus as any).mockResolvedValueOnce(null);
    res = await doRequest(app, 'PATCH', '/api/invoices/missing/status', { status: 'PAID' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/invoices/:id returns 200 or 404', async () => {
    (invoiceService.deleteInvoice as any).mockResolvedValueOnce(true);
    let res = await doRequest(app, 'DELETE', '/api/invoices/x');
    expect(res.status).toBe(200);

    (invoiceService.deleteInvoice as any).mockResolvedValueOnce(false);
    res = await doRequest(app, 'DELETE', '/api/invoices/x');
    expect(res.status).toBe(404);
  });
});
