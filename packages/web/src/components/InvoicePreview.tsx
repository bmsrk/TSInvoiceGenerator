import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Invoice } from '@invoice/shared';
import {
  calculateInvoiceTotals,
  calculateItemSubtotal,
  formatCurrency,
  formatDate,
} from '@invoice/shared';

interface InvoicePreviewProps {
  invoice: Invoice;
}

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const totals = calculateInvoiceTotals(invoice.items);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!invoiceRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="invoice-preview" ref={invoiceRef}>
      {/* Header */}
      <div className="invoice-preview-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              {invoice.from.name}
            </h2>
            <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>{invoice.from.email}</p>
            {invoice.from.phone && (
              <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>{invoice.from.phone}</p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              INVOICE
            </h3>
            <p style={{ fontSize: '0.875rem' }}>{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="invoice-preview-body">
        {/* Dates and Client Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.5rem' }}>
              Bill To
            </h4>
            <p style={{ fontWeight: '600' }}>{invoice.to.name}</p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{invoice.to.email}</p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {invoice.to.address.street}<br />
              {invoice.to.address.city}, {invoice.to.address.state} {invoice.to.address.zipCode}<br />
              {invoice.to.address.country}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.25rem' }}>
                Issue Date
              </h4>
              <p>{formatDate(new Date(invoice.createdAt))}</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.25rem' }}>
                Due Date
              </h4>
              <p>{formatDate(new Date(invoice.dueDate))}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                Description
              </th>
              <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                Qty
              </th>
              <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                Rate
              </th>
              <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                Tax
              </th>
              <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem 0' }}>{item.description}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>{item.taxRate}%</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: '500' }}>
                  {formatCurrency(calculateItemSubtotal(item), invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span>{formatCurrency(totals.subtotal, invoice.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ color: '#6b7280' }}>Tax</span>
              <span>{formatCurrency(totals.totalTax, invoice.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
              <span>Total</span>
              <span style={{ color: '#8b5cf6' }}>{formatCurrency(totals.total, invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {(invoice.notes || invoice.termsAndConditions) && (
        <div className="invoice-preview-footer">
          {invoice.notes && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>Notes</h4>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{invoice.notes}</p>
            </div>
          )}
          {invoice.termsAndConditions && (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>Terms & Conditions</h4>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{invoice.termsAndConditions}</p>
            </div>
          )}
        </div>
      )}

      {/* Status Badge and Export Button */}
      <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Payment Terms: </span>
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
            {invoice.paymentTerms.replace(/_/g, ' ')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className={`status-badge ${invoice.status.toLowerCase()}`}>
            {invoice.status}
          </span>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: exporting ? 'wait' : 'pointer',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            <DownloadIcon />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
