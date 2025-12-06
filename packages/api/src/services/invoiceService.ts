import prisma from '../database.js';
import type { Invoice, InvoiceLine } from '@prisma/client';
import { generateInvoiceNumber, getDueDateFromPaymentTerms } from '@invoice/shared';
import type { PaymentTerms, CurrencyCode } from '@invoice/shared';

export interface CreateInvoiceInput {
  companyId: string;
  customerId: string;
  currency?: CurrencyCode;
  paymentTerms?: PaymentTerms;
  dueDate?: Date;
  notes?: string;
  termsAndConditions?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }[];
}

export interface UpdateInvoiceStatusInput {
  id: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

export type InvoiceWithRelations = Invoice & {
  company: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    taxId: string | null;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    taxId: string | null;
  };
  items: InvoiceLine[];
};

/**
 * Get all invoices with relations
 */
export async function getAllInvoices(): Promise<InvoiceWithRelations[]> {
  return prisma.invoice.findMany({
    include: {
      company: true,
      customer: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get invoice by ID with relations
 */
export async function getInvoiceById(id: string): Promise<InvoiceWithRelations | null> {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      company: true,
      customer: true,
      items: true,
    },
  });
}

/**
 * Create a new invoice with line items
 */
export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceWithRelations> {
  const createdAt = new Date();
  const paymentTerms = input.paymentTerms || 'NET_30';
  const dueDate = input.dueDate || getDueDateFromPaymentTerms(paymentTerms, createdAt);

  return prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      createdAt,
      dueDate,
      status: 'DRAFT',
      currency: input.currency || 'USD',
      paymentTerms,
      notes: input.notes,
      termsAndConditions: input.termsAndConditions,
      companyId: input.companyId,
      customerId: input.customerId,
      items: {
        create: input.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 0,
        })),
      },
    },
    include: {
      company: true,
      customer: true,
      items: true,
    },
  });
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(input: UpdateInvoiceStatusInput): Promise<InvoiceWithRelations | null> {
  return prisma.invoice.update({
    where: { id: input.id },
    data: { status: input.status },
    include: {
      company: true,
      customer: true,
      items: true,
    },
  });
}

/**
 * Delete an invoice (and its line items via cascade)
 */
export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    await prisma.invoice.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    // Invoice not found or cannot be deleted (e.g., foreign key constraint)
    console.error('Failed to delete invoice:', error);
    return false;
  }
}

/**
 * Convert database invoice to API format (compatible with existing frontend)
 */
export function toApiFormat(invoice: InvoiceWithRelations) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    createdAt: invoice.createdAt,
    dueDate: invoice.dueDate,
    status: invoice.status as 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED',
    currency: invoice.currency as CurrencyCode,
    paymentTerms: invoice.paymentTerms as PaymentTerms,
    notes: invoice.notes || undefined,
    termsAndConditions: invoice.termsAndConditions || undefined,
    from: {
      name: invoice.company.name,
      email: invoice.company.email,
      phone: invoice.company.phone || undefined,
      address: {
        street: invoice.company.street,
        city: invoice.company.city,
        state: invoice.company.state,
        zipCode: invoice.company.zipCode,
        country: invoice.company.country,
      },
      taxId: invoice.company.taxId || undefined,
    },
    to: {
      name: invoice.customer.name,
      email: invoice.customer.email,
      phone: invoice.customer.phone || undefined,
      address: {
        street: invoice.customer.street,
        city: invoice.customer.city,
        state: invoice.customer.state,
        zipCode: invoice.customer.zipCode,
        country: invoice.customer.country,
      },
      taxId: invoice.customer.taxId || undefined,
    },
    items: invoice.items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
    })),
  };
}
