import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@invoice/shared', () => ({
  createInvoice: (req: any) => ({ id: req.items?.[0]?.description || 'iid-1', invoiceNumber: 'INV-1', createdAt: new Date(), dueDate: new Date(), status: 'DRAFT', from: req.from, to: req.to, items: req.items }),
}));

import * as store from '../invoiceStore';

beforeEach(() => {
  // clear any pre-existing invoices
  const all = store.getAllInvoices().map(i => i.id);
  all.forEach(id => store.deleteInvoice(id));
});

describe('invoiceStore (in-memory)', () => {
  it('starts empty', () => {
    expect(store.getAllInvoices()).toEqual([]);
  });

  it('saveInvoice stores and can be retrieved', () => {
    const created = store.saveInvoice({
      from: { name: 'A', email: 'a@e', address: { street: '', city: '', state: '', zipCode: '', country: 'US' } },
      to: { name: 'B', email: 'b@e', address: { street: '', city: '', state: '', zipCode: '', country: 'US' } },
      items: [{ description: 'my-id', quantity: 1, unitPrice: 100, taxRate: 0 }],
      currency: 'USD',
      paymentTerms: 'NET_30',
    } as any);

    expect(store.getAllInvoices().length).toBe(1);
    expect(store.getInvoiceById(created.id)).toEqual(created);
  });

  it('updateInvoiceStatus updates status when invoice exists', () => {
    const created = store.saveInvoice({
      from: { name: 'A', email: 'a@e', address: { street: '', city: '', state: '', zipCode: '', country: 'US' } },
      to: { name: 'B', email: 'b@e', address: { street: '', city: '', state: '', zipCode: '', country: 'US' } },
      items: [{ description: 'x', quantity: 1, unitPrice: 1, taxRate: 0 }],
      currency: 'USD',
      paymentTerms: 'NET_30',
    } as any);

    const updated = store.updateInvoiceStatus(created.id, 'PAID');
    expect(updated).toBeDefined();
    expect(updated?.status).toBe('PAID');
  });

  it('deleteInvoice removes invoice and returns boolean', () => {
    const created = store.saveInvoice({
      from: { name: 'A', email: 'a@e', address: { street: '', city: '', state: '', zipCode: '', country: 'US' } },
      to: { name: 'B', email: 'b@e', address: { street: '', city: '', state: '', zipCode: '', country: 'US' } },
      items: [{ description: 'del', quantity: 1, unitPrice: 1, taxRate: 0 }],
      currency: 'USD',
      paymentTerms: 'NET_30',
    } as any);

    expect(store.deleteInvoice(created.id)).toBe(true);
    expect(store.getInvoiceById(created.id)).toBeUndefined();
    expect(store.deleteInvoice('notfound')).toBe(false);
  });

  it('seedSampleData adds an invoice', () => {
    // ensure clear
    const before = store.getAllInvoices().length;
    store.seedSampleData();
    const after = store.getAllInvoices().length;
    expect(after).toBeGreaterThanOrEqual(before + 1);
  });
});
