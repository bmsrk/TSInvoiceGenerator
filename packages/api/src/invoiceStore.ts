import type { Invoice, CreateInvoiceRequest } from '@invoice/shared';
import { createInvoice, generateId } from '@invoice/shared';

// In-memory storage for invoices (for demo purposes)
const invoices = new Map<string, Invoice>();

/**
 * Get all invoices
 */
export function getAllInvoices(): Invoice[] {
  return Array.from(invoices.values());
}

/**
 * Get invoice by ID
 */
export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.get(id);
}

/**
 * Create a new invoice
 */
export function saveInvoice(request: CreateInvoiceRequest): Invoice {
  const invoice = createInvoice(request);
  invoices.set(invoice.id, invoice);
  return invoice;
}

/**
 * Update invoice status
 */
export function updateInvoiceStatus(id: string, status: Invoice['status']): Invoice | undefined {
  const invoice = invoices.get(id);
  if (invoice) {
    invoice.status = status;
    invoices.set(id, invoice);
    return invoice;
  }
  return undefined;
}

/**
 * Delete invoice
 */
export function deleteInvoice(id: string): boolean {
  return invoices.delete(id);
}

/**
 * Initialize with sample data
 */
export function seedSampleData(): void {
  const sampleInvoice = createInvoice({
    from: {
      name: 'Acme Corp',
      email: 'billing@acme.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
      },
      taxId: 'US-123456789',
    },
    to: {
      name: 'Client Company',
      email: 'accounts@client.com',
      phone: '+1 (555) 987-6543',
      address: {
        street: '456 Client Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
    },
    items: [
      {
        description: 'Web Development Services',
        quantity: 40,
        unitPrice: 150,
        taxRate: 10,
      },
      {
        description: 'UI/UX Design',
        quantity: 20,
        unitPrice: 120,
        taxRate: 10,
      },
      {
        description: 'Project Management',
        quantity: 10,
        unitPrice: 100,
        taxRate: 10,
      },
    ],
    currency: 'USD',
    paymentTerms: 'NET_30',
    notes: 'Thank you for your business!',
    termsAndConditions: 'Payment is due within 30 days. Late payments may incur a 1.5% monthly interest.',
  });

  invoices.set(sampleInvoice.id, sampleInvoice);
}
