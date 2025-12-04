import { useState, useEffect } from 'react';
import type { Invoice, InvoiceTotals } from '@invoice/shared';
import { calculateInvoiceTotals, formatCurrency, formatDate } from '@invoice/shared';
import { fetchInvoices, updateInvoiceStatus, deleteInvoice } from './api';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';

// Icons as simple SVG components
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: Invoice['status']) {
    try {
      await updateInvoiceStatus(id, status);
      await loadInvoices();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        await loadInvoices();
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  }

  function handleInvoiceCreated() {
    setShowCreateModal(false);
    loadInvoices();
  }

  // Calculate stats
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => {
      const totals = calculateInvoiceTotals(inv.items);
      return sum + totals.total;
    }, 0),
    paid: invoices.filter(inv => inv.status === 'PAID').length,
    pending: invoices.filter(inv => inv.status === 'PENDING').length,
    overdue: invoices.filter(inv => inv.status === 'OVERDUE').length,
  };

  const getStatusClass = (status: string): string => {
    return status.toLowerCase();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <h1>Invoice Generator</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <PlusIcon />
            New Invoice
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon purple">
              <FileIcon />
            </div>
            <div className="stat-card-label">Total Invoices</div>
            <div className="stat-card-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green">
              <DollarIcon />
            </div>
            <div className="stat-card-label">Total Amount</div>
            <div className="stat-card-value">{formatCurrency(stats.totalAmount, 'USD')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon yellow">
              <ClockIcon />
            </div>
            <div className="stat-card-label">Pending</div>
            <div className="stat-card-value">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon red">
              <AlertIcon />
            </div>
            <div className="stat-card-label">Overdue</div>
            <div className="stat-card-value">{stats.overdue}</div>
          </div>
        </div>

        {/* Invoice List Section */}
        <div className="section-title">
          <h2>Invoices</h2>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <FileIcon />
              <h3>No invoices yet</h3>
              <p>Create your first invoice to get started</p>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <PlusIcon />
                Create Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="invoice-list">
            {invoices.map(invoice => {
              const totals = calculateInvoiceTotals(invoice.items);
              return (
                <div key={invoice.id} className="invoice-item">
                  <div className="invoice-number">{invoice.invoiceNumber}</div>
                  <div className="invoice-client">{invoice.to.name}</div>
                  <div className="invoice-amount">{formatCurrency(totals.total, invoice.currency)}</div>
                  <div>
                    <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => setSelectedInvoice(invoice)}
                      title="View Invoice"
                    >
                      <EyeIcon />
                    </button>
                    {invoice.status === 'DRAFT' && (
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => handleStatusChange(invoice.id, 'PENDING')}
                        title="Send Invoice"
                      >
                        <CheckIcon />
                      </button>
                    )}
                    {invoice.status === 'PENDING' && (
                      <button
                        className="btn btn-success btn-icon"
                        onClick={() => handleStatusChange(invoice.id, 'PAID')}
                        title="Mark as Paid"
                      >
                        <CheckIcon />
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleDelete(invoice.id)}
                      title="Delete Invoice"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Invoice</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <InvoiceForm onSuccess={handleInvoiceCreated} onCancel={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h3>Invoice {selectedInvoice.invoiceNumber}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedInvoice(null)}>
                ×
              </button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              <InvoicePreview invoice={selectedInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
