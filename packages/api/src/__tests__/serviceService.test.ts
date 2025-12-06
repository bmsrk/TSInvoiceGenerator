import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({
  default: {
    service: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from '../db.js';
import * as serviceModule from '../services/serviceService';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('serviceService', () => {
  it('getAllServices without companyId calls findMany with orderBy', async () => {
    (prisma.service.findMany as any).mockResolvedValueOnce([{ id: 's1', description: 'X' }]);
    const res = await serviceModule.getAllServices();
    expect(prisma.service.findMany).toHaveBeenCalledWith({ where: undefined, orderBy: { description: 'asc' } });
    expect(res).toEqual([{ id: 's1', description: 'X' }]);
  });

  it('getAllServices with companyId filters by companyId', async () => {
    (prisma.service.findMany as any).mockResolvedValueOnce([]);
    await serviceModule.getAllServices('comp1');
    expect(prisma.service.findMany).toHaveBeenCalledWith({ where: { companyId: 'comp1' }, orderBy: { description: 'asc' } });
  });

  it('getServiceById calls findUnique', async () => {
    (prisma.service.findUnique as any).mockResolvedValueOnce({ id: 's1' });
    const res = await serviceModule.getServiceById('s1');
    expect(prisma.service.findUnique).toHaveBeenCalledWith({ where: { id: 's1' } });
    expect(res).toEqual({ id: 's1' });
  });

  it('createService calls create', async () => {
    (prisma.service.create as any).mockResolvedValueOnce({ id: 'new' });
    const inData = { description: 'D', defaultRate: 100, companyId: 'c1' } as any;
    const res = await serviceModule.createService(inData);
    expect(prisma.service.create).toHaveBeenCalledWith({ data: inData });
    expect(res).toEqual({ id: 'new' });
  });

  it('updateService calls update', async () => {
    (prisma.service.update as any).mockResolvedValueOnce({ id: 'u1' });
    const res = await serviceModule.updateService({ id: 'u1', description: 'u' } as any);
    expect(prisma.service.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { description: 'u' } });
    expect(res).toEqual({ id: 'u1' });
  });

  it('deleteService returns true on success and false on failure', async () => {
    (prisma.service.delete as any).mockResolvedValueOnce({});
    expect(await serviceModule.deleteService('ok')).toBe(true);

    (prisma.service.delete as any).mockRejectedValueOnce(new Error('boom'));
    expect(await serviceModule.deleteService('bad')).toBe(false);
  });
});
