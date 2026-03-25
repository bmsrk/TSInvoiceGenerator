import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { createRequire } from 'module';

// Load embedded Roboto fonts from pdfmake's vfs_fonts bundle.
// pdfmake ships fonts as base64-encoded data in vfs_fonts.js
const require_ = createRequire(import.meta.url);
const vfsFonts: Record<string, string> = require_('pdfmake/build/vfs_fonts.js');

function fontBuffer(name: string): Buffer {
  const data = vfsFonts[name];
  if (!data) throw new Error(`Font ${name} not found in pdfmake vfs_fonts`);
  return Buffer.from(data, 'base64');
}

const fonts = {
  Roboto: {
    normal: fontBuffer('Roboto-Regular.ttf'),
    bold: fontBuffer('Roboto-Medium.ttf'),
    italics: fontBuffer('Roboto-Italic.ttf'),
    bolditalics: fontBuffer('Roboto-MediumItalic.ttf'),
  },
};

const printer = new PdfPrinter(fonts as any);

type Margin4 = [number, number, number, number];

function formatCurrency(amount: unknown, currency?: string): string {
  try {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(num);
  } catch (err) {
    console.warn('formatCurrency fallback:', err);
    return String(amount ?? '0');
  }
}

function formatDateStr(d: unknown): string {
  if (!d) return '';
  const date = new Date(String(d));
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Generate a PDF buffer from an invoice object using pdfmake (pure TypeScript, no native binaries).
 */
export async function generateInvoicePdf(invoice: any): Promise<Buffer> {
  const totals = invoice.totals || { subtotal: 0, totalTax: 0, total: 0 };
  const items: any[] = invoice.items || [];

  // Build company logo header if available
  const headerLeft: Content[] = [];
  if (invoice.from?.logo) {
    try {
      headerLeft.push({ image: invoice.from.logo, width: 60, margin: [0, 0, 0, 8] });
    } catch (err) {
      console.warn('Failed to load company logo for PDF:', err);
    }
  }
  headerLeft.push(
    { text: invoice.from?.name || '', style: 'companyName' },
    { text: invoice.from?.email || '', style: 'companyDetail' },
    { text: invoice.from?.phone || '', style: 'companyDetail' },
  );

  if (invoice.from?.address) {
    const addr = invoice.from.address;
    const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
    if (parts.length > 0) {
      headerLeft.push({ text: parts.join(', '), style: 'companyDetail' });
    }
  }

  const docDefinition: TDocumentDefinitions = {
    content: [
      // Header
      {
        columns: [
          { stack: headerLeft, width: '*' },
          {
            stack: [
              { text: 'INVOICE', style: 'invoiceLabel' },
              { text: invoice.invoiceNumber || '', style: 'invoiceNumber' },
              { text: formatDateStr(invoice.createdAt), style: 'headerDate' },
            ],
            width: 'auto',
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Bill To + Dates
      {
        columns: [
          {
            stack: [
              { text: 'BILL TO', style: 'sectionLabel' },
              { text: invoice.to?.name || '', bold: true, margin: [0, 4, 0, 2] },
              { text: invoice.to?.email || '', color: '#6b7280', fontSize: 9 },
              { text: invoice.to?.address?.street || '', color: '#6b7280', fontSize: 9 },
              {
                text: [
                  invoice.to?.address?.city || '',
                  invoice.to?.address?.state ? `, ${invoice.to.address.state}` : '',
                  invoice.to?.address?.zipCode ? ` ${invoice.to.address.zipCode}` : '',
                ].join(''),
                color: '#6b7280',
                fontSize: 9,
              },
              { text: invoice.to?.address?.country || '', color: '#6b7280', fontSize: 9 },
            ],
            width: '*',
          },
          {
            stack: [
              { text: 'ISSUE DATE', style: 'sectionLabel' },
              { text: formatDateStr(invoice.createdAt), margin: [0, 4, 0, 8] },
              { text: 'DUE DATE', style: 'sectionLabel' },
              { text: formatDateStr(invoice.dueDate), margin: [0, 4, 0, 0] },
            ],
            width: 'auto',
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Items table
      {
        table: {
          headerRows: 1,
          widths: ['*', 40, 70, 40, 80],
          body: [
            [
              { text: 'Description', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader', alignment: 'right' },
              { text: 'Rate', style: 'tableHeader', alignment: 'right' },
              { text: 'Tax', style: 'tableHeader', alignment: 'right' },
              { text: 'Amount', style: 'tableHeader', alignment: 'right' },
            ],
            ...items.map((it: any) => [
              { text: it.description || '', fontSize: 10 },
              { text: String(it.quantity ?? 0), fontSize: 10, alignment: 'right' as const },
              { text: formatCurrency(it.unitPrice, invoice.currency), fontSize: 10, alignment: 'right' as const },
              { text: `${it.taxRate ?? 0}%`, fontSize: 10, alignment: 'right' as const },
              {
                text: formatCurrency(it.subtotal ?? (it.unitPrice * it.quantity), invoice.currency),
                fontSize: 10,
                bold: true,
                alignment: 'right' as const,
              },
            ]),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i <= 1 ? '#374151' : '#e5e7eb'),
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 0, 0, 20],
      },

      // Totals
      {
        columns: [
          { text: '', width: '*' },
          {
            table: {
              widths: [100, 100],
              body: [
                [
                  { text: 'Subtotal', color: '#6b7280', alignment: 'right' },
                  { text: formatCurrency(totals.subtotal, invoice.currency), alignment: 'right' },
                ],
                [
                  { text: 'Tax', color: '#6b7280', alignment: 'right' },
                  { text: formatCurrency(totals.totalTax, invoice.currency), alignment: 'right' },
                ],
                [
                  { text: 'Total', bold: true, fontSize: 13, alignment: 'right' },
                  { text: formatCurrency(totals.total, invoice.currency), bold: true, fontSize: 13, alignment: 'right', color: '#7c3aed' },
                ],
              ],
            },
            layout: {
              hLineWidth: (i: number) => (i === 0 ? 0 : 0.5),
              vLineWidth: () => 0,
              hLineColor: () => '#e5e7eb',
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
            width: 'auto',
          },
        ],
      },

      // Notes
      ...(invoice.notes
        ? [
            { text: 'Notes', style: 'sectionLabel', margin: [0, 20, 0, 4] as Margin4 },
            { text: invoice.notes, fontSize: 9, color: '#6b7280' } as Content,
          ]
        : []),

      // Terms & Conditions
      ...(invoice.termsAndConditions
        ? [
            { text: 'Terms & Conditions', style: 'sectionLabel', margin: [0, 12, 0, 4] as Margin4 },
            { text: invoice.termsAndConditions, fontSize: 9, color: '#6b7280' } as Content,
          ]
        : []),
    ],

    styles: {
      companyName: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
      companyDetail: { fontSize: 9, color: '#6b7280' },
      invoiceLabel: { fontSize: 10, color: '#6b7280' },
      invoiceNumber: { fontSize: 14, bold: true, margin: [0, 2, 0, 2] },
      headerDate: { fontSize: 10, color: '#6b7280' },
      sectionLabel: { fontSize: 8, color: '#6b7280', bold: true },
      tableHeader: { fontSize: 8, bold: true, color: '#6b7280' },
    },

    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
    },

    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
  };

  return new Promise<Buffer>((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
}
