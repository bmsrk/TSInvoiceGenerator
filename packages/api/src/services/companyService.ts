import prisma from '../db.js';
import type { Company } from '@prisma/client';

export interface CreateCompanyInput {
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  isDefault?: boolean;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: string;
}

/**
 * Get all companies
 */
export async function getAllCompanies(): Promise<Company[]> {
  return prisma.company.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Get company by ID
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  return prisma.company.findUnique({
    where: { id },
  });
}

/**
 * Get the default company
 */
export async function getDefaultCompany(): Promise<Company | null> {
  return prisma.company.findFirst({
    where: { isDefault: true },
  });
}

/**
 * Create a new company
 */
export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  // If this is set as default, unset other defaults first
  if (input.isDefault) {
    await prisma.company.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.company.create({
    data: input,
  });
}

/**
 * Update a company
 */
export async function updateCompany(input: UpdateCompanyInput): Promise<Company | null> {
  const { id, ...data } = input;

  // If setting as default, unset other defaults first
  if (data.isDefault) {
    await prisma.company.updateMany({
      where: { isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  return prisma.company.update({
    where: { id },
    data,
  });
}

/**
 * Delete a company
 */
export async function deleteCompany(id: string): Promise<boolean> {
  try {
    await prisma.company.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}
