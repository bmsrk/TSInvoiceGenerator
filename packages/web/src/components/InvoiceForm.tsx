import { useState } from 'react';
import type { CreateInvoiceRequest, CurrencyCode, PaymentTerms } from '@invoice/shared';
import { createInvoice } from '../api';

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ItemInput {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
}

const defaultItem: ItemInput = {
  description: '',
  quantity: '1',
  unitPrice: '0',
  taxRate: '10',
};

export default function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromPhone, setFromPhone] = useState('');
  const [fromStreet, setFromStreet] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [fromState, setFromState] = useState('');
  const [fromZip, setFromZip] = useState('');
  const [fromCountry, setFromCountry] = useState('USA');

  const [toName, setToName] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [toPhone, setToPhone] = useState('');
  const [toStreet, setToStreet] = useState('');
  const [toCity, setToCity] = useState('');
  const [toState, setToState] = useState('');
  const [toZip, setToZip] = useState('');
  const [toCountry, setToCountry] = useState('USA');

  const [items, setItems] = useState<ItemInput[]>([{ ...defaultItem }]);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('NET_30');
  const [notes, setNotes] = useState('');

  const addItem = () => {
    setItems([...items, { ...defaultItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItemInput, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const request: CreateInvoiceRequest = {
        from: {
          name: fromName,
          email: fromEmail,
          phone: fromPhone || undefined,
          address: {
            street: fromStreet,
            city: fromCity,
            state: fromState,
            zipCode: fromZip,
            country: fromCountry,
          },
        },
        to: {
          name: toName,
          email: toEmail,
          phone: toPhone || undefined,
          address: {
            street: toStreet,
            city: toCity,
            state: toState,
            zipCode: toZip,
            country: toCountry,
          },
        },
        items: items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          taxRate: parseFloat(item.taxRate) || 0,
        })),
        currency,
        paymentTerms,
        notes: notes || undefined,
      };

      await createInvoice(request);
      onSuccess();
    } catch (err) {
      setError('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {error && (
          <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        {/* From Section */}
        <div className="mb-6">
          <h4 className="mb-4">From (Your Business)</h4>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                className="form-input"
                value={fromName}
                onChange={e => setFromName(e.target.value)}
                placeholder="Acme Corp"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={fromEmail}
                onChange={e => setFromEmail(e.target.value)}
                placeholder="billing@acme.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={fromPhone}
                onChange={e => setFromPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-input"
                value={fromStreet}
                onChange={e => setFromStreet(e.target.value)}
                placeholder="123 Business Ave"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={fromCity}
                onChange={e => setFromCity(e.target.value)}
                placeholder="San Francisco"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-input"
                value={fromState}
                onChange={e => setFromState(e.target.value)}
                placeholder="CA"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ZIP Code *</label>
              <input
                type="text"
                className="form-input"
                value={fromZip}
                onChange={e => setFromZip(e.target.value)}
                placeholder="94102"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input
                type="text"
                className="form-input"
                value={fromCountry}
                onChange={e => setFromCountry(e.target.value)}
                placeholder="USA"
                required
              />
            </div>
          </div>
        </div>

        {/* To Section */}
        <div className="mb-6">
          <h4 className="mb-4">Bill To (Client)</h4>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Client Name *</label>
              <input
                type="text"
                className="form-input"
                value={toName}
                onChange={e => setToName(e.target.value)}
                placeholder="Client Company"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="accounts@client.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={toPhone}
                onChange={e => setToPhone(e.target.value)}
                placeholder="+1 (555) 987-6543"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-input"
                value={toStreet}
                onChange={e => setToStreet(e.target.value)}
                placeholder="456 Client Street"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={toCity}
                onChange={e => setToCity(e.target.value)}
                placeholder="New York"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-input"
                value={toState}
                onChange={e => setToState(e.target.value)}
                placeholder="NY"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ZIP Code *</label>
              <input
                type="text"
                className="form-input"
                value={toZip}
                onChange={e => setToZip(e.target.value)}
                placeholder="10001"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input
                type="text"
                className="form-input"
                value={toCountry}
                onChange={e => setToCountry(e.target.value)}
                placeholder="USA"
                required
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4>Line Items</h4>
            <button type="button" className="btn btn-secondary" onClick={addItem}>
              + Add Item
            </button>
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="card mb-3" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="grid grid-4" style={{ alignItems: 'end' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={item.description}
                    onChange={e => updateItem(index, 'description', e.target.value)}
                    placeholder="Web Development Services"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={item.unitPrice}
                    onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={item.taxRate}
                    onChange={e => updateItem(index, 'taxRate', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Details */}
        <div className="mb-6">
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
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Thank you for your business!"
          />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}
