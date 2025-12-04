import { useState, useEffect } from 'react';
import type { Customer, CreateCustomerInput } from '../api';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const emptyCustomer: CreateCustomerInput = {
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'USA',
  taxId: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CreateCustomerInput>(emptyCustomer);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditing(null);
    setFormData(emptyCustomer);
    setError(null);
    setShowModal(true);
  }

  function handleEdit(customer: Customer) {
    setEditing(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      street: customer.street,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      country: customer.country,
      taxId: customer.taxId || '',
    });
    setError(null);
    setShowModal(true);
  }

  async function handleDelete(customer: Customer) {
    if (!confirm(`Delete customer "${customer.name}"?`)) return;
    try {
      await deleteCustomer(customer.id);
      await loadCustomers();
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateCustomer(editing.id, formData);
      } else {
        await createCustomer(formData);
      }
      setShowModal(false);
      await loadCustomers();
    } catch (err) {
      setError('Failed to save customer. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof CreateCustomerInput>(field: K, value: CreateCustomerInput[K]) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div>
      <div className="page-title-section">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="page-title">Customers</h2>
            <p className="page-subtitle">Manage your customer list for invoicing</p>
          </div>
          <button className="btn btn-primary" onClick={handleNew}>
            <PlusIcon />
            Add Customer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No customers yet</h3>
            <p>Add your first customer to start creating invoices</p>
            <button className="btn btn-primary" onClick={handleNew}>
              <PlusIcon />
              Add Customer
            </button>
          </div>
        </div>
      ) : (
        <div className="card-list">
          {customers.map(customer => (
            <div key={customer.id} className="card-list-item">
              <div className="card-list-content">
                <div className="card-list-title">{customer.name}</div>
                <div className="card-list-subtitle">{customer.email}</div>
                <div className="card-list-meta">
                  {customer.city}, {customer.state} {customer.zipCode}
                  {customer.phone && <span> • {customer.phone}</span>}
                  {customer.taxId && <span> • Tax ID: {customer.taxId}</span>}
                </div>
              </div>
              <div className="card-list-actions">
                <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(customer)} title="Edit">
                  <EditIcon />
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(customer)} title="Delete">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Customer' : 'Add Customer'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                    {error}
                  </div>
                )}
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Customer Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={e => updateField('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.taxId}
                      onChange={e => updateField('taxId', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.street}
                      onChange={e => updateField('street', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.city}
                      onChange={e => updateField('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.state}
                      onChange={e => updateField('state', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.zipCode}
                      onChange={e => updateField('zipCode', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.country}
                      onChange={e => updateField('country', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
