import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({
  default: {
    company: { count: vi.fn(), create: vi.fn(), createMany: vi.fn(), updateMany: vi.fn(), delete: vi.fn() },
    customer: { create: vi.fn() },
    service: { createMany: vi.fn() },
    invoice: { create: vi.fn() },
  },
}));

import prisma from '../database.js';
import { seedDatabase } from '../services/seed';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('seedDatabase', () => {
  it('skips when database already has companies', async () => {
    (prisma.company.count as any).mockResolvedValueOnce(2);
    await seedDatabase();

    expect(prisma.company.count).toHaveBeenCalled();
    // Should NOT create new companies when count > 0
    expect(prisma.company.create).not.toHaveBeenCalled();
  });

  it('creates sample data when empty', async () => {
    (prisma.company.count as any).mockResolvedValueOnce(0);
    (prisma.company.create as any).mockResolvedValueOnce({ id: 'acme' });
    (prisma.company.create as any).mockResolvedValueOnce({ id: 'tech' });
    (prisma.customer.create as any).mockResolvedValue({ id: 'client' });
    (prisma.customer.create as any).mockResolvedValueOnce({ id: 'client2' });
    (prisma.customer.create as any).mockResolvedValueOnce({ id: 'client3' });
    (prisma.service.createMany as any).mockResolvedValueOnce({ count: 8 });
    (prisma.invoice.create as any).mockResolvedValueOnce({ id: 'inv1' });

    await seedDatabase();

    expect(prisma.company.create).toHaveBeenCalled();
    expect(prisma.customer.create).toHaveBeenCalled();
    expect(prisma.service.createMany).toHaveBeenCalled();
    expect(prisma.invoice.create).toHaveBeenCalled();
  });
});
