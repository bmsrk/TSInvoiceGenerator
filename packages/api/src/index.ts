import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import type { CreateInvoiceRequest, Invoice } from '@invoice/shared';
import { calculateInvoiceTotals } from '@invoice/shared';
import {
  getAllInvoices,
  getInvoiceById,
  saveInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  seedSampleData,
} from './invoiceStore.js';

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Invoice Generator API',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Get all invoices
app.get('/api/invoices', (c) => {
  const invoices = getAllInvoices();
  return c.json(invoices);
});

// Get invoice by ID
app.get('/api/invoices/:id', (c) => {
  const id = c.req.param('id');
  const invoice = getInvoiceById(id);
  
  if (!invoice) {
    return c.json({ error: 'Invoice not found' }, 404);
  }
  
  return c.json(invoice);
});

// Get invoice with calculated totals
app.get('/api/invoices/:id/totals', (c) => {
  const id = c.req.param('id');
  const invoice = getInvoiceById(id);
  
  if (!invoice) {
    return c.json({ error: 'Invoice not found' }, 404);
  }
  
  const totals = calculateInvoiceTotals(invoice.items);
  return c.json({
    invoice,
    totals,
  });
});

// Create new invoice
app.post('/api/invoices', async (c) => {
  try {
    const body = await c.req.json<CreateInvoiceRequest>();
    const invoice = saveInvoice(body);
    return c.json(invoice, 201);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

// Update invoice status
app.patch('/api/invoices/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json<{ status: Invoice['status'] }>();
  
  const invoice = updateInvoiceStatus(id, status);
  
  if (!invoice) {
    return c.json({ error: 'Invoice not found' }, 404);
  }
  
  return c.json(invoice);
});

// Delete invoice
app.delete('/api/invoices/:id', (c) => {
  const id = c.req.param('id');
  const deleted = deleteInvoice(id);
  
  if (!deleted) {
    return c.json({ error: 'Invoice not found' }, 404);
  }
  
  return c.json({ success: true });
});

// Seed sample data on startup
seedSampleData();

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`🚀 Invoice API running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
