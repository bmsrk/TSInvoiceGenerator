import prisma from '../database.js';
import type { Service } from '@prisma/client';

export interface CreateServiceInput {
  description: string;
  defaultRate: number;
  companyId: string;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: string;
}

/**
 * Get all services, optionally filtered by company
 */
export async function getAllServices(companyId?: string): Promise<Service[]> {
  return prisma.service.findMany({
    where: companyId ? { companyId } : undefined,
    orderBy: { description: 'asc' },
  });
}

/**
 * Get service by ID
 */
export async function getServiceById(id: string): Promise<Service | null> {
  return prisma.service.findUnique({
    where: { id },
  });
}

/**
 * Create a new service
 */
export async function createService(input: CreateServiceInput): Promise<Service> {
  return prisma.service.create({
    data: input,
  });
}

/**
 * Update a service
 */
export async function updateService(input: UpdateServiceInput): Promise<Service | null> {
  const { id, ...data } = input;

  return prisma.service.update({
    where: { id },
    data,
  });
}

/**
 * Delete a service
 */
export async function deleteService(id: string): Promise<boolean> {
  try {
    await prisma.service.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}
