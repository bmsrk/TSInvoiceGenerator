import type { Invoice, CreateInvoiceRequest, InvoiceTotals } from '@invoice/shared';

const API_BASE = '/api';

/**
 * Fetch all invoices
 */
export async function fetchInvoices(): Promise<Invoice[]> {
  const response = await fetch(`${API_BASE}/invoices`);
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  return response.json();
}

/**
 * Fetch invoice by ID
 */
export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const response = await fetch(`${API_BASE}/invoices/${id}`);
  if (!response.ok) {
    throw new Error('Invoice not found');
  }
  return response.json();
}

/**
 * Fetch invoice with totals
 */
export async function fetchInvoiceWithTotals(id: string): Promise<{ invoice: Invoice; totals: InvoiceTotals }> {
  const response = await fetch(`${API_BASE}/invoices/${id}/totals`);
  if (!response.ok) {
    throw new Error('Invoice not found');
  }
  return response.json();
}

/**
 * Create new invoice
 */
export async function createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
  const response = await fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create invoice');
  }
  return response.json();
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice> {
  const response = await fetch(`${API_BASE}/invoices/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update invoice status');
  }
  return response.json();
}

/**
 * Delete invoice
 */
export async function deleteInvoice(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/invoices/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete invoice');
  }
}
