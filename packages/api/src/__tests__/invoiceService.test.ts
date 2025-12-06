import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({
  default: {
    invoice: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Make shared helpers deterministic
vi.mock('@invoice/shared', () => ({
  generateInvoiceNumber: () => 'INV-TEST-0001',
  getDueDateFromPaymentTerms: () => new Date('2025-01-01T00:00:00Z'),
}));

import prisma from '../database.js';
import * as service from '../services/invoiceService';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('invoiceService', () => {
  it('getAllInvoices calls findMany with include and orderBy', async () => {
    (prisma.invoice.findMany as any).mockResolvedValueOnce([{ id: 'i1' }]);
    const res = await service.getAllInvoices();
    expect(prisma.invoice.findMany).toHaveBeenCalledWith({
      include: { company: true, customer: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(res).toEqual([{ id: 'i1' }]);
  });

  it('getInvoiceById calls findUnique with include', async () => {
    (prisma.invoice.findUnique as any).mockResolvedValueOnce({ id: 'i1' });
    const res = await service.getInvoiceById('i1');
    expect(prisma.invoice.findUnique).toHaveBeenCalledWith({ where: { id: 'i1' }, include: { company: true, customer: true, items: true } });
    expect(res).toEqual({ id: 'i1' });
  });

  it('createInvoice builds payload and calls prisma.create', async () => {
    const input = {
      companyId: 'c1',
      customerId: 'cu1',
      items: [{ description: 'X', quantity: 2, unitPrice: 100 }],
    } as any;

    const created = { id: 'new', invoiceNumber: 'INV-TEST-0001', items: [] } as any;
    (prisma.invoice.create as any).mockResolvedValueOnce(created);

    const res = await service.createInvoice(input);
    expect(prisma.invoice.create).toHaveBeenCalled();
    expect(res).toEqual(created);
  });

  it('updateInvoiceStatus updates and returns result', async () => {
    (prisma.invoice.update as any).mockResolvedValueOnce({ id: 'u1' });
    const res = await service.updateInvoiceStatus({ id: 'u1', status: 'PAID' });
    expect(prisma.invoice.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { status: 'PAID' }, include: { company: true, customer: true, items: true } });
    expect(res).toEqual({ id: 'u1' });
  });

  it('deleteInvoice returns true on success and false on failure', async () => {
    (prisma.invoice.delete as any).mockResolvedValueOnce({});
    expect(await service.deleteInvoice('ok')).toBe(true);

    (prisma.invoice.delete as any).mockRejectedValueOnce(new Error('boom'));
    expect(await service.deleteInvoice('bad')).toBe(false);
  });

  it('toApiFormat maps DB invoice to API shape', () => {
    const dbInvoice = {
      id: 'i1',
      invoiceNumber: 'INV-1',
      createdAt: new Date('2025-01-01'),
      dueDate: new Date('2025-02-01'),
      status: 'DRAFT',
      currency: 'USD',
      paymentTerms: 'NET_30',
      notes: null,
      termsAndConditions: null,
      company: {
        id: 'c', name: 'Comp', email: 'c@e', phone: null, street: 's', city: 'c', state: 'st', zipCode: 'z', country: 'US', taxId: null,
      },
      customer: {
        id: 'cu', name: 'Cus', email: 'cu@e', phone: null, street: 's', city: 'c', state: 'st', zipCode: 'z', country: 'US', taxId: null,
      },
      items: [ { id: 'li', description: 'X', quantity: 1, unitPrice: 100, taxRate: 0 } ],
    } as any;

    const api = service.toApiFormat(dbInvoice);
    expect(api.id).toBe('i1');
    expect(api.items[0].description).toBe('X');
    expect(api.from.name).toBe('Comp');
    expect(api.to.name).toBe('Cus');
  });
});
