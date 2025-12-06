import type { Invoice, CreateInvoiceRequest, InvoiceTotals } from '@invoice/shared';

const API_BASE = '/api';

// ============ Company Types and Functions ============

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export async function fetchCompanies(): Promise<Company[]> {
  const response = await fetch(`${API_BASE}/companies`);
  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }
  return response.json();
}

export async function fetchCompanyById(id: string): Promise<Company> {
  const response = await fetch(`${API_BASE}/companies/${id}`);
  if (!response.ok) {
    throw new Error('Company not found');
  }
  return response.json();
}

export async function createCompany(data: CreateCompanyInput): Promise<Company> {
  const response = await fetch(`${API_BASE}/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create company');
  }
  return response.json();
}

export async function updateCompany(id: string, data: Partial<CreateCompanyInput>): Promise<Company> {
  const response = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update company');
  }
  return response.json();
}

export async function deleteCompany(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete company');
  }
}

// ============ Customer Types and Functions ============

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

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

export async function fetchCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_BASE}/customers`);
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  return response.json();
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const response = await fetch(`${API_BASE}/customers/${id}`);
  if (!response.ok) {
    throw new Error('Customer not found');
  }
  return response.json();
}

export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  const response = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create customer');
  }
  return response.json();
}

export async function updateCustomer(id: string, data: Partial<CreateCustomerInput>): Promise<Customer> {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update customer');
  }
  return response.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete customer');
  }
}

// ============ Service Types and Functions ============

export interface Service {
  id: string;
  description: string;
  defaultRate: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  description: string;
  defaultRate: number;
  companyId: string;
}

export async function fetchServices(companyId?: string): Promise<Service[]> {
  const url = companyId 
    ? `${API_BASE}/services?companyId=${encodeURIComponent(companyId)}`
    : `${API_BASE}/services`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  return response.json();
}

export async function fetchServiceById(id: string): Promise<Service> {
  const response = await fetch(`${API_BASE}/services/${id}`);
  if (!response.ok) {
    throw new Error('Service not found');
  }
  return response.json();
}

export async function createService(data: CreateServiceInput): Promise<Service> {
  const response = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create service');
  }
  return response.json();
}

export async function updateService(id: string, data: Partial<CreateServiceInput>): Promise<Service> {
  const response = await fetch(`${API_BASE}/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update service');
  }
  return response.json();
}

export async function deleteService(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/services/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete service');
  }
}

// ============ Invoice Types and Functions ============

export interface CreateInvoiceWithIdsRequest {
  companyId: string;
  customerId: string;
  currency?: string;
  paymentTerms?: string;
  dueDate?: string;
  notes?: string;
  termsAndConditions?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }[];
}

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
 * Create new invoice (legacy format for backward compatibility)
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
 * Create new invoice with company/customer IDs
 */
export async function createInvoiceWithIds(data: CreateInvoiceWithIdsRequest): Promise<Invoice> {
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
