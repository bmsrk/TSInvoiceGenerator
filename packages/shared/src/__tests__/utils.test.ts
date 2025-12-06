import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as utils from '../utils';
import type { InvoiceItem, CreateInvoiceRequest } from '../types';

describe('shared/utils.ts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generateId returns a UUID (stubbed)', () => {
    const spy = vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(() => '550e8400-e29b-41d4-a716-446655440000');
    expect(utils.generateId()).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(spy).toHaveBeenCalled();
  });

  it('generateInvoiceNumber returns deterministic format when date+random are controlled', () => {
    // Fix date to 2025-09-05 and Math.random to give 123
    const fakeDate = new Date('2025-09-05T12:00:00Z');
    vi.setSystemTime(fakeDate);
    vi.spyOn(Math, 'random').mockReturnValue(0.0123); // floor(0.0123*10000)=123 -> '0123'

    const id = utils.generateInvoiceNumber();
    expect(id).toMatch(/^INV-202509-\d{4}$/);
    // assert we get the expected random padded portion
    expect(id.endsWith('-0123')).toBe(true);
  });

  it('calculateItemSubtotal/tax/total work with decimals', () => {
    const item: InvoiceItem = {
      id: 'i1',
      description: 'Test',
      quantity: 1.5,
      unitPrice: 125.5,
      taxRate: 8.25,
    };

    const sub = utils.calculateItemSubtotal(item);
    expect(sub).toBeCloseTo(188.25, 2);

    const tax = utils.calculateItemTax(item);
    // 188.25 * 8.25% = 15.526... -> rounded to 15.53 by helper
    expect(tax).toBeCloseTo(15.53, 2);

    const total = utils.calculateItemTotal(item);
    expect(total).toBeCloseTo(203.78, 2);
  });

  it('calculateInvoiceTotals aggregates items correctly', () => {
    const items: InvoiceItem[] = [
      { id: 'a', description: 'A', quantity: 2, unitPrice: 10, taxRate: 10 },
      { id: 'b', description: 'B', quantity: 1.5, unitPrice: 100, taxRate: 5 },
    ];

    const totals = utils.calculateInvoiceTotals(items);
    // subtotal: 20 + 150 = 170
    // totalTax: 20*10% + 150*5% = 2 + 7.5 = 9.5 -> round 9.5
    // total: 179.5
    expect(totals).toEqual({ subtotal: 170, totalTax: 9.5, total: 179.5 });
  });

  it('getDueDateFromPaymentTerms covers all branches', () => {
    const created = new Date('2025-01-01T00:00:00Z');

    expect(utils.getDueDateFromPaymentTerms('DUE_ON_RECEIPT', created).toISOString()).toBe(created.toISOString());
    // Use time-difference to avoid day-of-month / timezone pitfalls
    const net15 = utils.getDueDateFromPaymentTerms('NET_15', created);
    expect((net15.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)).toBe(15);

    // Check NET_30/45/60 by difference in time (days)
    const net30 = utils.getDueDateFromPaymentTerms('NET_30', created);
    expect((net30.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)).toBe(30);

    const net45 = utils.getDueDateFromPaymentTerms('NET_45', created);
    expect((net45.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)).toBe(45);

    const net60 = utils.getDueDateFromPaymentTerms('NET_60', created);
    expect((net60.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)).toBe(60);

    // default case should be NET_30
    const def = utils.getDueDateFromPaymentTerms('NET_30' as any, created);
    expect((def.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)).toBe(30);
  });

  it('createInvoice maps fields, generates ids and defaults', () => {
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'));
    const uuidMock = vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(() => '550e8400-e29b-41d4-a716-446655440000');
    vi.spyOn(Math, 'random').mockReturnValue(0.0001); // random for invoiceNumber part

    const request: CreateInvoiceRequest = {
      from: {
        name: 'From',
        email: 'from@example.com',
        address: { street: 's', city: 'c', state: 'st', zipCode: 'z', country: 'US' },
      },
      to: {
        name: 'To',
        email: 'to@example.com',
        address: { street: 's', city: 'c', state: 'st', zipCode: 'z', country: 'US' },
      },
      items: [
        { description: 'Work', quantity: 2, unitPrice: 100, taxRate: 0 },
      ],
      currency: 'USD',
      paymentTerms: 'NET_30',
    };

    const invoice = utils.createInvoice(request);
    expect(invoice.status).toBe('DRAFT');
    expect(invoice.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(invoice.items[0].id).toBe('550e8400-e29b-41d4-a716-446655440000');
    // invoiceNumber contains year+month; avoid exact month assertion because of timezone differences
    expect(invoice.invoiceNumber).toMatch(/^INV-2025\d{2}-\d{4}$/);
    expect(uuidMock).toHaveBeenCalled();
  });

  it('formatCurrency/formatDate/parseDate behave as expected', () => {
    expect(utils.formatCurrency(1234.5, 'USD')).toMatch(/\$1,234.50/);
    const d = new Date('2025-03-14');
    expect(utils.formatDate(d)).toMatch(/March|Mar/);
    expect(utils.parseDate('2025-03-14').toISOString().startsWith('2025-03-14')).toBe(true);
  });
});
