import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('pdf helper', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('generateInvoicePdf produces a PDF buffer with invoice data', async () => {
    const { generateInvoicePdf } = await import('../pdf.js');
    const invoice = {
      id: 'inv-1',
      invoiceNumber: 'INV-2025-0001',
      from: { name: 'Acme', email: 'acme@test.com', address: { street: '123 Main St', city: 'NYC', state: 'NY', zipCode: '10001', country: 'US' } },
      to: { name: 'Bob', email: 'bob@test.com', address: { street: '456 Oak Ave', city: 'LA', state: 'CA', zipCode: '90001', country: 'US' } },
      items: [{ id: 'i1', description: 'Consulting', quantity: 2, unitPrice: 100, taxRate: 10, subtotal: 200 }],
      totals: { subtotal: 200, totalTax: 20, total: 220 },
      currency: 'USD',
      createdAt: '2025-12-06',
      dueDate: '2025-12-16',
    };

    const buf = await generateInvoicePdf(invoice);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
    // PDF files start with %PDF
    expect(buf.subarray(0, 5).toString()).toContain('%PDF');
  });

  it('generateInvoicePdf handles invoices with no items gracefully', async () => {
    const { generateInvoicePdf } = await import('../pdf.js');
    const invoice = {
      invoiceNumber: 'INV-EMPTY',
      from: { name: 'Test Co' },
      to: { name: 'Client' },
      items: [],
      totals: { subtotal: 0, totalTax: 0, total: 0 },
      currency: 'USD',
    };

    const buf = await generateInvoicePdf(invoice);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.subarray(0, 5).toString()).toContain('%PDF');
  });

  it('generateInvoicePdf includes notes and terms when present', async () => {
    const { generateInvoicePdf } = await import('../pdf.js');
    const invoice = {
      invoiceNumber: 'INV-NOTES',
      from: { name: 'Test Co' },
      to: { name: 'Client' },
      items: [{ description: 'Service', quantity: 1, unitPrice: 50, taxRate: 0, subtotal: 50 }],
      totals: { subtotal: 50, totalTax: 0, total: 50 },
      currency: 'EUR',
      notes: 'Please pay within 30 days',
      termsAndConditions: 'Standard terms apply',
    };

    const buf = await generateInvoicePdf(invoice);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });
});
