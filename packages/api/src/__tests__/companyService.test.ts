import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the prisma client used by services (module path includes .js in source)
vi.mock('../db.js', () => ({
  default: {
    company: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from '../db.js';
import * as service from '../services/companyService';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('companyService', () => {
  it('getAllCompanies calls prisma.company.findMany with orderBy', async () => {
    (prisma.company.findMany as any).mockResolvedValueOnce([{ id: 'x', name: 'A' }]);
    const res = await service.getAllCompanies();
    expect(prisma.company.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(res).toEqual([{ id: 'x', name: 'A' }]);
  });

  it('getCompanyById calls findUnique', async () => {
    (prisma.company.findUnique as any).mockResolvedValueOnce({ id: 'c1' });
    const res = await service.getCompanyById('c1');
    expect(prisma.company.findUnique).toHaveBeenCalledWith({ where: { id: 'c1' } });
    expect(res).toEqual({ id: 'c1' });
  });

  it('getDefaultCompany calls findFirst', async () => {
    (prisma.company.findFirst as any).mockResolvedValueOnce({ id: 'default' });
    const res = await service.getDefaultCompany();
    expect(prisma.company.findFirst).toHaveBeenCalledWith({ where: { isDefault: true } });
    expect(res).toEqual({ id: 'default' });
  });

  it('createCompany unsets previous defaults when input.isDefault=true', async () => {
    (prisma.company.updateMany as any).mockResolvedValueOnce({ count: 1 });
    (prisma.company.create as any).mockResolvedValueOnce({ id: 'new' });

    const input = { name: 'X', email: 'x@e', street: '', city: '', state: '', zipCode: '', country: '', isDefault: true } as any;
    const res = await service.createCompany(input);

    expect(prisma.company.updateMany).toHaveBeenCalled();
    expect(prisma.company.create).toHaveBeenCalledWith({ data: input });
    expect(res).toEqual({ id: 'new' });
  });

  it('updateCompany unsets other defaults when setting isDefault', async () => {
    (prisma.company.updateMany as any).mockResolvedValueOnce({ count: 1 });
    (prisma.company.update as any).mockResolvedValueOnce({ id: 'u1' });

    const res = await service.updateCompany({ id: 'u1', isDefault: true } as any);

    expect(prisma.company.updateMany).toHaveBeenCalledWith({ where: { isDefault: true, id: { not: 'u1' } }, data: { isDefault: false } });
    expect(prisma.company.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { isDefault: true } });
    expect(res).toEqual({ id: 'u1' });
  });

  it('deleteCompany returns true on success, false on error', async () => {
    (prisma.company.delete as any).mockResolvedValueOnce({});
    expect(await service.deleteCompany('ok')).toBe(true);

    (prisma.company.delete as any).mockRejectedValueOnce(new Error('fail'));
    expect(await service.deleteCompany('bad')).toBe(false);
  });
});
