import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CurrencyCode, PaymentTerms } from '@invoice/shared';
import { formatCurrency, calculateInvoiceTotals, parseDecimalInput } from '@invoice/shared';
import type { Company, Customer, Service } from '../api';
import { fetchCompanies, fetchCustomers, fetchServices, createInvoiceWithIds } from '../api';

interface LineItem {
  id: string;
  description: string;
  hours: string;
  rate: string;
  taxRate: string;
}

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function generateTempId(): string {
  return `temp-${crypto.randomUUID()}`;
}

const emptyLineItem = (): LineItem => ({
  id: generateTempId(),
  description: '',
  hours: '',
  rate: '',
  taxRate: '0',
});

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from database
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Form state
  const [companyId, setCompanyId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('NET_30');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [companiesData, customersData, servicesData] = await Promise.all([
        fetchCompanies(),
        fetchCustomers(),
        fetchServices(),
      ]);
      setCompanies(companiesData);
      setCustomers(customersData);
      setServices(servicesData);

      // Set default company
      const defaultCompany = companiesData.find(c => c.isDefault) || companiesData[0];
      if (defaultCompany) {
        setCompanyId(defaultCompany.id);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  function addLineItem() {
    setLineItems([...lineItems, emptyLineItem()]);
  }

  function removeLineItem(id: string) {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string) {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function addServiceToInvoice(service: Service) {
    setLineItems([
      ...lineItems,
      {
        id: generateTempId(),
        description: service.description,
        hours: '',
        rate: service.defaultRate.toString(),
        taxRate: '0',
      },
    ]);
  }

  // Calculate totals for preview
  function calculateTotals() {
    const items = lineItems
      .filter(item => item.description && item.hours && item.rate)
      .map(item => ({
        id: item.id,
        description: item.description,
        quantity: parseDecimalInput(item.hours),
        unitPrice: parseDecimalInput(item.rate),
        taxRate: parseDecimalInput(item.taxRate),
      }));
    return calculateInvoiceTotals(items);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!companyId) {
      setError('Please select a company');
      return;
    }
    if (!customerId) {
      setError('Please select a customer');
      return;
    }

    const validItems = lineItems.filter(item => 
      item.description && item.hours && item.rate
    );

    if (validItems.length === 0) {
      setError('Please add at least one line item');
      return;
    }

    setSaving(true);
    try {
      await createInvoiceWithIds({
        companyId,
        customerId,
        currency,
        paymentTerms,
        notes: notes || undefined,
        termsAndConditions: termsAndConditions || undefined,
        items: validItems.map(item => ({
          description: item.description,
          quantity: parseDecimalInput(item.hours),
          unitPrice: parseDecimalInput(item.rate),
          taxRate: parseDecimalInput(item.taxRate),
        })),
      });
      navigate('/');
    } catch (err) {
      setError('Failed to create invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title-section">
        <h2 className="page-title">Create New Invoice</h2>
        <p className="page-subtitle">Select company, customer, and add line items</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
          {/* Company Selection */}
          <div className="card">
            <h4 className="mb-4">From (Your Company)</h4>
            {companies.length === 0 ? (
              <p className="text-muted">No companies found. <a href="/companies">Add a company</a> first.</p>
            ) : (
              <div className="form-group">
                <label className="form-label">Select Company *</label>
                <select
                  className="form-select"
                  value={companyId}
                  onChange={e => setCompanyId(e.target.value)}
                  required
                >
                  <option value="">-- Select a company --</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name} {company.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {companyId && (() => {
              const company = companies.find(c => c.id === companyId);
              if (!company) return null;
              return (
                <div className="mt-3 text-sm text-muted">
                  <p>{company.email}</p>
                  <p>{company.street}</p>
                  <p>{company.city}, {company.state} {company.zipCode}</p>
                </div>
              );
            })()}
          </div>

          {/* Customer Selection */}
          <div className="card">
            <h4 className="mb-4">Bill To (Customer)</h4>
            {customers.length === 0 ? (
              <p className="text-muted">No customers found. <a href="/customers">Add a customer</a> first.</p>
            ) : (
              <div className="form-group">
                <label className="form-label">Select Customer *</label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Select a customer --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {customerId && (() => {
              const customer = customers.find(c => c.id === customerId);
              if (!customer) return null;
              return (
                <div className="mt-3 text-sm text-muted">
                  <p>{customer.email}</p>
                  <p>{customer.street}</p>
                  <p>{customer.city}, {customer.state} {customer.zipCode}</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Service Catalog Quick Add */}
        {services.length > 0 && (
          <div className="card mb-6">
            <h4 className="mb-4">Quick Add from Service Catalog</h4>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {services.map(service => (
                <button
                  key={service.id}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => addServiceToInvoice(service)}
                >
                  <PlusIcon />
                  {service.description} ({formatCurrency(service.defaultRate, 'USD')}/hr)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4>Line Items</h4>
            <button type="button" className="btn btn-secondary" onClick={addLineItem}>
              <PlusIcon />
              Add Line Item
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Description</th>
                <th style={{ width: '15%' }}>Hours</th>
                <th style={{ width: '15%' }}>Rate</th>
                <th style={{ width: '10%' }}>Tax %</th>
                <th style={{ width: '15%' }} className="table-right">Amount</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map(item => {
                const hours = parseDecimalInput(item.hours);
                const rate = parseDecimalInput(item.rate);
                const amount = hours * rate;
                return (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={item.description}
                        onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Service description"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={item.hours}
                        onChange={e => updateLineItem(item.id, 'hours', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={item.rate}
                        onChange={e => updateLineItem(item.id, 'rate', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={item.taxRate}
                        onChange={e => updateLineItem(item.id, 'taxRate', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="table-right font-medium">
                      {formatCurrency(amount, currency)}
                    </td>
                    <td>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right font-medium">Subtotal:</td>
                <td className="table-right font-medium">{formatCurrency(totals.subtotal, currency)}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={4} className="text-right font-medium">Tax:</td>
                <td className="table-right font-medium">{formatCurrency(totals.totalTax, currency)}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={4} className="text-right font-bold" style={{ fontSize: '1.125rem' }}>Total:</td>
                <td className="table-right font-bold" style={{ fontSize: '1.125rem', color: 'var(--accent-primary)' }}>
                  {formatCurrency(totals.total, currency)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Hours and rates support decimal values (e.g., 1.5 hours, 125.50 rate)
          </p>
        </div>

        {/* Payment Details */}
        <div className="card mb-6">
          <h4 className="mb-4">Payment Details</h4>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <select
                className="form-select"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value as PaymentTerms)}
              >
                <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                <option value="NET_15">Net 15</option>
                <option value="NET_30">Net 30</option>
                <option value="NET_45">Net 45</option>
                <option value="NET_60">Net 60</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card mb-6">
          <h4 className="mb-4">Additional Information</h4>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Thank you for your business!"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Terms & Conditions</label>
              <textarea
                className="form-textarea"
                value={termsAndConditions}
                onChange={e => setTermsAndConditions(e.target.value)}
                placeholder="Payment terms and conditions..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-between">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
