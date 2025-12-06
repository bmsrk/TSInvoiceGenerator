import prisma from '../database.js';
import type { Customer } from '@prisma/client';

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  id: string;
}

/**
 * Get all customers
 */
export async function getAllCustomers(): Promise<Customer[]> {
  return prisma.customer.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Get customer by ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  return prisma.customer.findUnique({
    where: { id },
  });
}

/**
 * Create a new customer
 */
export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  return prisma.customer.create({
    data: input,
  });
}

/**
 * Update a customer
 */
export async function updateCustomer(input: UpdateCustomerInput): Promise<Customer | null> {
  const { id, ...data } = input;

  return prisma.customer.update({
    where: { id },
    data,
  });
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await prisma.customer.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}
