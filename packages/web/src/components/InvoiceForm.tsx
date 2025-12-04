import { useState, useEffect } from 'react';
import type { CreateInvoiceRequest, CurrencyCode, PaymentTerms } from '@invoice/shared';
import { createInvoice } from '../api';

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ServiceInput {
  projectName: string;
  hours: string;
}

interface SavedCompany {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// LocalStorage keys
const STORAGE_KEYS = {
  MY_COMPANY: 'invoice_my_company',
  SAVED_CLIENTS: 'invoice_saved_clients',
  HOURLY_RATE: 'invoice_hourly_rate',
  TAX_RATE: 'invoice_tax_rate',
};

// Load saved data from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Save data to localStorage
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

const defaultService: ServiceInput = {
  projectName: '',
  hours: '',
};

export default function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved data
  const [savedMyCompany, setSavedMyCompany] = useState<SavedCompany | null>(() => 
    loadFromStorage(STORAGE_KEYS.MY_COMPANY, null)
  );
  const [savedClients, setSavedClients] = useState<SavedCompany[]>(() => 
    loadFromStorage(STORAGE_KEYS.SAVED_CLIENTS, [])
  );
  const [savedRate, setSavedRate] = useState<string>(() => 
    loadFromStorage(STORAGE_KEYS.HOURLY_RATE, '100')
  );
  const [savedTaxRate, setSavedTaxRate] = useState<string>(() => 
    loadFromStorage(STORAGE_KEYS.TAX_RATE, '0')
  );

  // My Company (From) state
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromPhone, setFromPhone] = useState('');
  const [fromStreet, setFromStreet] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [fromState, setFromState] = useState('');
  const [fromZip, setFromZip] = useState('');
  const [fromCountry, setFromCountry] = useState('USA');

  // Client (To) state
  const [toName, setToName] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [toPhone, setToPhone] = useState('');
  const [toStreet, setToStreet] = useState('');
  const [toCity, setToCity] = useState('');
  const [toState, setToState] = useState('');
  const [toZip, setToZip] = useState('');
  const [toCountry, setToCountry] = useState('USA');

  // Selected saved client
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // Services (Project Name + Hours)
  const [services, setServices] = useState<ServiceInput[]>([{ ...defaultService }]);
  
  // Rate and other settings
  const [hourlyRate, setHourlyRate] = useState(savedRate);
  const [taxRate, setTaxRate] = useState(savedTaxRate);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('NET_30');
  const [notes, setNotes] = useState('');

  // Load My Company data on mount
  useEffect(() => {
    if (savedMyCompany) {
      setFromName(savedMyCompany.name);
      setFromEmail(savedMyCompany.email);
      setFromPhone(savedMyCompany.phone || '');
      setFromStreet(savedMyCompany.address.street);
      setFromCity(savedMyCompany.address.city);
      setFromState(savedMyCompany.address.state);
      setFromZip(savedMyCompany.address.zipCode);
      setFromCountry(savedMyCompany.address.country);
    }
  }, []);

  // Save My Company
  const handleSaveMyCompany = () => {
    const myCompany: SavedCompany = {
      id: 'my-company',
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
    };
    saveToStorage(STORAGE_KEYS.MY_COMPANY, myCompany);
    setSavedMyCompany(myCompany);
  };

  // Save current client
  const handleSaveClient = () => {
    if (!toName || !toEmail) return;
    
    const newClient: SavedCompany = {
      id: Date.now().toString(),
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
    };
    
    // Check if client already exists (by name)
    const existingIndex = savedClients.findIndex(c => c.name === toName);
    let updatedClients: SavedCompany[];
    
    if (existingIndex >= 0) {
      updatedClients = [...savedClients];
      updatedClients[existingIndex] = newClient;
    } else {
      updatedClients = [...savedClients, newClient];
    }
    
    saveToStorage(STORAGE_KEYS.SAVED_CLIENTS, updatedClients);
    setSavedClients(updatedClients);
    setSelectedClientId(newClient.id);
  };

  // Load a saved client
  const handleLoadClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = savedClients.find(c => c.id === clientId);
    if (client) {
      setToName(client.name);
      setToEmail(client.email);
      setToPhone(client.phone || '');
      setToStreet(client.address.street);
      setToCity(client.address.city);
      setToState(client.address.state);
      setToZip(client.address.zipCode);
      setToCountry(client.address.country);
    }
  };

  // Delete a saved client
  const handleDeleteClient = (clientId: string) => {
    const updatedClients = savedClients.filter(c => c.id !== clientId);
    saveToStorage(STORAGE_KEYS.SAVED_CLIENTS, updatedClients);
    setSavedClients(updatedClients);
    if (selectedClientId === clientId) {
      setSelectedClientId('');
    }
  };

  // Save hourly rate
  const handleSaveRate = () => {
    saveToStorage(STORAGE_KEYS.HOURLY_RATE, hourlyRate);
    saveToStorage(STORAGE_KEYS.TAX_RATE, taxRate);
    setSavedRate(hourlyRate);
    setSavedTaxRate(taxRate);
  };

  const addService = () => {
    setServices([...services, { ...defaultService }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof ServiceInput, value: string) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
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
        items: services.map(service => ({
          description: service.projectName,
          quantity: parseFloat(service.hours) || 0,
          unitPrice: parseFloat(hourlyRate) || 0,
          taxRate: parseFloat(taxRate) || 0,
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

        {/* From Section - My Company */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4>From (My Company)</h4>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSaveMyCompany}
              disabled={!fromName || !fromEmail}
            >
              {savedMyCompany ? '✓ Update Saved' : 'Save My Company'}
            </button>
          </div>
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

        {/* To Section - Client */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4>Bill To (Client)</h4>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSaveClient}
              disabled={!toName || !toEmail}
            >
              Save Client
            </button>
          </div>
          
          {/* Saved Clients Dropdown */}
          {savedClients.length > 0 && (
            <div className="form-group mb-4">
              <label className="form-label">Load Saved Client</label>
              <div className="flex gap-2">
                <select
                  className="form-select"
                  value={selectedClientId}
                  onChange={e => handleLoadClient(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">-- Select a saved client --</option>
                  {savedClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {selectedClientId && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteClient(selectedClientId)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
          
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

        {/* Rate Settings */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4>Rate Settings</h4>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSaveRate}
            >
              {savedRate === hourlyRate && savedTaxRate === taxRate ? '✓ Saved' : 'Save Rate'}
            </button>
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Hourly Rate *</label>
              <input
                type="number"
                className="form-input"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                min="0"
                step="0.01"
                placeholder="100"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                className="form-input"
                value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4>Services</h4>
            <button type="button" className="btn btn-secondary" onClick={addService}>
              + Add Service
            </button>
          </div>
          
          {services.map((service, index) => (
            <div key={index} className="card mb-3" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="grid grid-3" style={{ alignItems: 'end' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={service.projectName}
                    onChange={e => updateService(index, 'projectName', e.target.value)}
                    placeholder="Website Development"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hours (decimal) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={service.hours}
                    onChange={e => updateService(index, 'hours', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="10.5"
                    required
                  />
                </div>
                <div className="form-group">
                  {services.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeService(index)}
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
