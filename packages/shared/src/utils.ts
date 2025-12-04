import type { Invoice, InvoiceItem, InvoiceTotals, CreateInvoiceRequest, PaymentTerms } from './types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a unique invoice number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

/**
 * Calculate line item total (quantity * unitPrice)
 */
export function calculateItemSubtotal(item: InvoiceItem): number {
  return item.quantity * item.unitPrice;
}

/**
 * Calculate line item tax
 */
export function calculateItemTax(item: InvoiceItem): number {
  const subtotal = calculateItemSubtotal(item);
  return subtotal * (item.taxRate / 100);
}

/**
 * Calculate line item total including tax
 */
export function calculateItemTotal(item: InvoiceItem): number {
  return calculateItemSubtotal(item) + calculateItemTax(item);
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(items: InvoiceItem[]): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const totalTax = items.reduce((sum, item) => sum + calculateItemTax(item), 0);
  const total = subtotal + totalTax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Get due date based on payment terms
 */
export function getDueDateFromPaymentTerms(paymentTerms: PaymentTerms, createdAt: Date = new Date()): Date {
  const dueDate = new Date(createdAt);
  
  switch (paymentTerms) {
    case 'DUE_ON_RECEIPT':
      return dueDate;
    case 'NET_15':
      dueDate.setDate(dueDate.getDate() + 15);
      return dueDate;
    case 'NET_30':
      dueDate.setDate(dueDate.getDate() + 30);
      return dueDate;
    case 'NET_45':
      dueDate.setDate(dueDate.getDate() + 45);
      return dueDate;
    case 'NET_60':
      dueDate.setDate(dueDate.getDate() + 60);
      return dueDate;
    default:
      dueDate.setDate(dueDate.getDate() + 30);
      return dueDate;
  }
}

/**
 * Create a new invoice from request
 */
export function createInvoice(request: CreateInvoiceRequest): Invoice {
  const createdAt = new Date();
  const dueDate = request.dueDate || getDueDateFromPaymentTerms(request.paymentTerms, createdAt);

  return {
    id: generateId(),
    invoiceNumber: generateInvoiceNumber(),
    createdAt,
    dueDate,
    status: 'DRAFT',
    from: request.from,
    to: request.to,
    items: request.items.map(item => ({
      ...item,
      id: generateId(),
    })),
    currency: request.currency,
    paymentTerms: request.paymentTerms,
    notes: request.notes,
    termsAndConditions: request.termsAndConditions,
  };
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}
