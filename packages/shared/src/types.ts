/**
 * Address information for business or client
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Business or client information
 */
export interface Party {
  name: string;
  email: string;
  phone?: string;
  address: Address;
  taxId?: string;
}

/**
 * Individual invoice line item
 */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // Percentage (e.g., 10 for 10%)
}

/**
 * Payment terms for the invoice
 */
export type PaymentTerms = 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'DUE_ON_RECEIPT';

/**
 * Invoice status
 */
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

/**
 * Currency codes (ISO 4217)
 */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR';

/**
 * Complete invoice model
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: Date;
  dueDate: Date;
  status: InvoiceStatus;
  from: Party;
  to: Party;
  items: InvoiceItem[];
  currency: CurrencyCode;
  paymentTerms: PaymentTerms;
  notes?: string;
  termsAndConditions?: string;
}

/**
 * Request to create a new invoice
 */
export interface CreateInvoiceRequest {
  from: Party;
  to: Party;
  items: Omit<InvoiceItem, 'id'>[];
  currency: CurrencyCode;
  paymentTerms: PaymentTerms;
  dueDate?: Date;
  notes?: string;
  termsAndConditions?: string;
}

/**
 * Calculated invoice totals
 */
export interface InvoiceTotals {
  subtotal: number;
  totalTax: number;
  total: number;
}
