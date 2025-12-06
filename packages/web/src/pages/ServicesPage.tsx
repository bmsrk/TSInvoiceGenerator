import { useState, useEffect } from 'react';
import { formatCurrency } from '@invoice/shared';
import type { Service, CreateServiceInput, Company } from '../api';
import { fetchServices, createService, updateService, deleteService, fetchCompanies } from '../api';

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

const emptyService: CreateServiceInput = {
  description: '',
  defaultRate: 0,
  companyId: '',
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [formData, setFormData] = useState<CreateServiceInput>(emptyService);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadServices();
  }, [selectedCompanyFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const companiesData = await fetchCompanies();
      setCompanies(companiesData);
      
      // Set default company as filter if available
      const defaultCompany = companiesData.find(c => c.isDefault) || companiesData[0];
      if (defaultCompany) {
        setSelectedCompanyFilter(defaultCompany.id);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadServices() {
    try {
      const data = await fetchServices(selectedCompanyFilter || undefined);
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  }

  function handleNew() {
    setEditing(null);
    const defaultCompany = companies.find(c => c.isDefault) || companies[0];
    setFormData({
      ...emptyService,
      companyId: selectedCompanyFilter || (defaultCompany ? defaultCompany.id : ''),
    });
    setError(null);
    setShowModal(true);
  }

  function handleEdit(service: Service) {
    setEditing(service);
    setFormData({
      description: service.description,
      defaultRate: service.defaultRate,
      companyId: service.companyId,
    });
    setError(null);
    setShowModal(true);
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Delete service "${service.description}"?`)) return;
    try {
      await deleteService(service.id);
      await loadServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateService(editing.id, formData);
      } else {
        await createService(formData);
      }
      setShowModal(false);
      await loadServices();
    } catch (err) {
      setError('Failed to save service. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-title-section">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="page-title">Services</h2>
            <p className="page-subtitle">Manage your service catalog with hourly rates</p>
          </div>
          <button className="btn btn-primary" onClick={handleNew}>
            <PlusIcon />
            Add Service
          </button>
        </div>
      </div>

      {/* Company Filter */}
      {companies.length > 0 && (
        <div className="card mb-6">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Company</label>
            <select
              className="form-select"
              value={selectedCompanyFilter}
              onChange={e => setSelectedCompanyFilter(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} {company.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No services yet</h3>
            <p>Add services to your catalog for quick invoice line item creation</p>
            <button className="btn btn-primary" onClick={handleNew}>
              <PlusIcon />
              Add Service
            </button>
          </div>
        </div>
      ) : (
        <div className="card-list">
          {services.map(service => {
            const company = companies.find(c => c.id === service.companyId);
            return (
              <div key={service.id} className="card-list-item">
                <div className="card-list-content">
                  <div className="card-list-title">{service.description}</div>
                  <div className="card-list-subtitle">
                    Default Rate: {formatCurrency(service.defaultRate, 'USD')}/hour
                    {company && <span style={{ marginLeft: '1rem', color: 'var(--text-tertiary)' }}>• {company.name}</span>}
                  </div>
                </div>
                <div className="card-list-actions">
                  <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(service)} title="Edit">
                    <EditIcon />
                  </button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(service)} title="Delete">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Service' : 'Add Service'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <select
                    className="form-select"
                    value={formData.companyId}
                    onChange={e => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
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
                <div className="form-group">
                  <label className="form-label">Service Description *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Default Hourly Rate (USD) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.defaultRate || ''}
                    onChange={e => setFormData(prev => ({ ...prev, defaultRate: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    placeholder="100.00"
                    required
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Supports decimal values (e.g., 125.50)
                  </p>
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
