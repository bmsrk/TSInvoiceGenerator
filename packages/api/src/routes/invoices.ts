/**
 * Invoice routes
 */

import { Hono } from 'hono';
import type { InvoiceStatus } from '@invoice/shared';
import { calculateInvoiceTotals } from '@invoice/shared';
import * as invoiceService from '../services/invoiceService.js';
import { htmlToPdf, renderInvoiceHtml } from '../pdf.js';

export function createInvoiceRoutes(): Hono {
  const app = new Hono();

  // GET /api/invoices - List all invoices
  app.get('/', async (c) => {
    const invoices = await invoiceService.getAllInvoices();
    return c.json(invoices.map(invoiceService.toApiFormat));
  });

  // GET /api/invoices/:id - Get a specific invoice
  app.get('/:id', async (c) => {
    const id = c.req.param('id');
    const invoice = await invoiceService.getInvoiceById(id);
    
    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }
    
    return c.json(invoiceService.toApiFormat(invoice));
  });

  // GET /api/invoices/:id/pdf - Export invoice as PDF
  app.get('/:id/pdf', async (c) => {
    const id = c.req.param('id');
    const invoice = await invoiceService.getInvoiceById(id);

    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }

    const apiInvoice = invoiceService.toApiFormat(invoice);

    // Include totals so the template can show them if needed
    const totals = calculateInvoiceTotals(apiInvoice.items);
    const invoiceWithTotals = { ...apiInvoice, totals };

    const html = renderInvoiceHtml(invoiceWithTotals as any);

    try {
      const pdfBuffer = await htmlToPdf(html);
      // Convert Buffer to Uint8Array for Response
      const uint8Array = new Uint8Array(pdfBuffer);
      return new Response(uint8Array, { 
        status: 200,
        headers: { 
          'Content-Type': 'application/pdf', 
          'Content-Disposition': `attachment; filename="${apiInvoice.invoiceNumber}.pdf"` 
        }
      });
    } catch (err) {
      console.error('PDF generation failed', err);
      return c.json({ error: 'Failed to generate PDF' }, 500);
    }
  });

  // GET /api/invoices/:id/totals - Get invoice with totals
  app.get('/:id/totals', async (c) => {
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

  // POST /api/invoices - Create a new invoice
  app.post('/', async (c) => {
    try {
      const body = await c.req.json<invoiceService.CreateInvoiceInput>();
      const invoice = await invoiceService.createInvoice(body);
      return c.json(invoiceService.toApiFormat(invoice), 201);
    } catch (error) {
      console.error('Error creating invoice:', error);
      return c.json({ error: 'Invalid request body' }, 400);
    }
  });

  // PATCH /api/invoices/:id/status - Update invoice status
  app.patch('/:id/status', async (c) => {
    const id = c.req.param('id');
    const { status } = await c.req.json<{ status: InvoiceStatus }>();
    
    const invoice = await invoiceService.updateInvoiceStatus({ id, status });
    
    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }
    
    return c.json(invoiceService.toApiFormat(invoice));
  });

  // DELETE /api/invoices/:id - Delete an invoice
  app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await invoiceService.deleteInvoice(id);
    
    if (!deleted) {
      return c.json({ error: 'Invoice not found' }, 404);
    }
    
    return c.json({ success: true });
  });

  return app;
}
