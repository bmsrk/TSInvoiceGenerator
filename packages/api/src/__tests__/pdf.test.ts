import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('wkhtmltopdf-installer', () => ({ path: '/path/to/wk' }));

describe('pdf helper', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('renderInvoiceHtml produces HTML and contains invoice number and items', async () => {
    const { renderInvoiceHtml } = await vi.importActual<any>('../pdf.js');
    const invoice = {
      id: 'inv-1',
      invoiceNumber: 'INV-2025-0001',
      from: { name: 'Acme' },
      to: { name: 'Bob' },
      items: [{ id: 'i1', description: 'Consulting', quantity: 2, unitPrice: 100, taxRate: 10 }],
      currency: 'USD',
      createdAt: '2025-12-06',
      dueDate: '2025-12-16',
    } as any;

    const html = renderInvoiceHtml(invoice);
    expect(html).toContain('INV-2025-0001');
    expect(html).toContain('Consulting');
  });

  it('htmlToPdf uses wkhtmltopdf when spawn returns a buffer', async () => {
    // Mock child_process.spawn to simulate wkhtmltopdf stdout
    const stdout = { on: vi.fn() } as any;
    const stderr = { on: vi.fn() } as any;

    const events: any = {};
    stdout.on = (evt: string, cb: any) => {
      if (evt === 'data') {
        // call back with PDF bytes and then end
        setTimeout(() => cb(Buffer.from('%PDF-1.4 testpdf')));
      }
    };

    const spawnMock = vi.fn(() => ({
      stdout,
      stderr,
      stdin: { write: vi.fn(() => {}), end: vi.fn(() => {}) },
      on: (evt: string, cb: any) => {
        if (evt === 'close') setTimeout(() => cb(0), 1);
      },
    }));

    vi.doMock('child_process', () => ({ spawn: spawnMock }));

    const { htmlToPdf } = await vi.importActual<any>('../pdf.js');
    const buf = await htmlToPdf('<html></html>');
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.indexOf(Buffer.from('%PDF'))).toBeGreaterThanOrEqual(0);
  });

  it('htmlToPdf falls back to puppeteer when wkhtmltopdf fails', async () => {
    // Make spawn fail
    const spawnMock = vi.fn(() => ({
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      stdin: { write: vi.fn(() => {}), end: vi.fn(() => {}) },
      on: (evt: string, cb: any) => { if (evt === 'close') setTimeout(() => cb(1), 1); },
    }));
    vi.doMock('child_process', () => ({ spawn: spawnMock }));

    // Mock puppeteer
    const pdfBuffer = Buffer.from('%PDF-FALLBACK');
    const page = { setContent: vi.fn(), pdf: vi.fn(async () => pdfBuffer) };
    const browser = { newPage: vi.fn(async () => page), close: vi.fn() };
    // Export a default object with launch() to match how dynamic import resolves default
    vi.doMock('puppeteer', () => ({ default: { launch: vi.fn(async () => browser) } }));

    const { htmlToPdf } = await vi.importActual<any>('../pdf.js');
    const buf = await htmlToPdf('<html></html>');
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.indexOf(Buffer.from('%PDF-FALLBACK'))).toBeGreaterThanOrEqual(0);
  });
});
