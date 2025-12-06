import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({
  default: {
    customer: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from '../database.js';
import * as service from '../services/customerService';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('customerService', () => {
  it('getAllCustomers calls findMany with orderBy', async () => {
    (prisma.customer.findMany as any).mockResolvedValueOnce([{ id: 'c', name: 'A' }]);
    const res = await service.getAllCustomers();
    expect(prisma.customer.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(res).toEqual([{ id: 'c', name: 'A' }]);
  });

  it('getCustomerById calls findUnique', async () => {
    (prisma.customer.findUnique as any).mockResolvedValueOnce({ id: 'c1' });
    const res = await service.getCustomerById('c1');
    expect(prisma.customer.findUnique).toHaveBeenCalledWith({ where: { id: 'c1' } });
    expect(res).toEqual({ id: 'c1' });
  });

  it('createCustomer calls prisma.create', async () => {
    (prisma.customer.create as any).mockResolvedValueOnce({ id: 'new' });
    const input = { name: 'X', email: 'x@e', street: '', city: '', state: '', zipCode: '', country: '' } as any;
    const res = await service.createCustomer(input);
    expect(prisma.customer.create).toHaveBeenCalledWith({ data: input });
    expect(res).toEqual({ id: 'new' });
  });

  it('updateCustomer calls prisma.update', async () => {
    (prisma.customer.update as any).mockResolvedValueOnce({ id: 'u1' });
    const res = await service.updateCustomer({ id: 'u1', name: 'Updated' } as any);
    expect(prisma.customer.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { name: 'Updated' } });
    expect(res).toEqual({ id: 'u1' });
  });

  it('deleteCustomer returns true on success, false on failure', async () => {
    (prisma.customer.delete as any).mockResolvedValueOnce({});
    expect(await service.deleteCustomer('ok')).toBe(true);

    (prisma.customer.delete as any).mockRejectedValueOnce(new Error('err'));
    expect(await service.deleteCustomer('bad')).toBe(false);
  });
});
