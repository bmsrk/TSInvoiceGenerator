import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Try to locate a wkhtmltopdf binary from the installed npm installer package
function getWkhtmltopdfBinaryPath(): string | null {
  try {
    // wkhtmltopdf-installer commonly exports the path as the default export
    // or as `.path` when using CommonJS. Try both.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const installer = require('wkhtmltopdf-installer');
    if (!installer) return null;
    if (typeof installer === 'string') return installer;
    if (installer.path) return installer.path;
  } catch (err) {
    return null;
  }
  return null;
}

async function htmlToPdfWithWkhtmltopdf(html: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const wkPath = getWkhtmltopdfBinaryPath() || 'wkhtmltopdf';

    // Spawn wkhtmltopdf: read from stdin (-) and write to stdout (-)
    const args = ['-q', '--enable-local-file-access', '-', '-'];
    const child = spawn(wkPath, args, { stdio: ['pipe', 'pipe', 'pipe'] });

    const chunks: Buffer[] = [];

    child.stdout.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    let stderr = '';
    child.stderr.on('data', (c) => (stderr += c.toString()));

    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code && code !== 0) return reject(new Error(`wkhtmltopdf failed: ${code} ${stderr}`));
      resolve(Buffer.concat(chunks));
    });

    // Write HTML
    child.stdin.write(html, () => child.stdin.end());
  });
}

async function htmlToPdfWithPuppeteer(html: string): Promise<Buffer> {
  // Lazy import puppeteer so testing environments don't need it unless used.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const puppeteerModule = await import('puppeteer');
  const puppeteer = (puppeteerModule as any).default ?? puppeteerModule;
  // Fallback using Puppeteer which downloads Chromium and renders to PDF.
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    return pdf;
  } finally {
    await browser.close();
  }
}

export async function htmlToPdf(html: string): Promise<Buffer> {
  try {
    const buf = await htmlToPdfWithWkhtmltopdf(html);
    return buf;
  } catch (err) {
    // If wkhtmltopdf isn't present or fails, fallback to Puppeteer
    // Emit a console warning so the server log shows the fallback.
    // eslint-disable-next-line no-console
    console.warn('wkhtmltopdf failed or not available — falling back to Puppeteer', err?.toString?.());
    return htmlToPdfWithPuppeteer(html);
  }
}

export function renderInvoiceHtml(invoice: any): string {
  // Minimal printable HTML for invoices — keep styles inline for consistent printing.
  const itemsHtml = (invoice.items || [])
    .map((it: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb">${escapeHtml(it.description)}</td>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb">${it.quantity}</td>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb">${escapeHtml(formatCurrency(it.unitPrice, invoice.currency))}</td>
        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb">${it.taxRate}%</td>
        <td style="padding: 8px; text-align: right; font-weight: 600; border-bottom: 1px solid #e5e7eb">${escapeHtml(formatCurrency(it.subtotal ?? (it.unitPrice * it.quantity), invoice.currency))}</td>
      </tr>
    `)
    .join('\n');

  const totals = invoice.totals || { subtotal: 0, totalTax: 0, total: 0 };

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${escapeHtml(invoice.invoiceNumber || 'Invoice')}</title>
      <style>
        body { font-family: Inter, Arial, Helvetica, sans-serif; color: #0f172a; padding: 24px; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { font-size: 20px; margin: 0 0 8px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { text-transform: uppercase; font-size: 11px; color: #6b7280; text-align: left; padding: 8px 0; }
        td { font-size: 13px; }
        .totals { width: 300px; margin-left: auto; margin-top: 16px; }
        .totals div { display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb }
        .title { color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h1>${escapeHtml(invoice.from?.name || '')}</h1>
            <div>${escapeHtml(invoice.from?.email || '')}</div>
            <div>${escapeHtml(invoice.from?.phone || '')}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px; color:#6b7280">INVOICE</div>
            <div style="font-weight:700; font-size:16px">${escapeHtml(invoice.invoiceNumber || '')}</div>
            <div style="font-size:13px">${escapeHtml(invoice.createdAt || '')}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:16px; gap:20px">
          <div>
            <div class="title">Bill To</div>
            <div style="font-weight:700">${escapeHtml(invoice.to?.name || '')}</div>
            <div style="color:#6b7280">${escapeHtml(invoice.to?.email || '')}</div>
            <div style="color:#6b7280">${escapeHtml(invoice.to?.address?.street || '')}</div>
          </div>
          <div style="text-align:right">
            <div class="title">Issue Date</div>
            <div>${escapeHtml(invoice.createdAt || '')}</div>
            <div style="margin-top:8px" class="title">Due Date</div>
            <div>${escapeHtml(invoice.dueDate || '')}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align:right">Qty</th>
              <th style="text-align:right">Rate</th>
              <th style="text-align:right">Tax</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal</span><strong>${escapeHtml(formatCurrency(totals.subtotal, invoice.currency))}</strong></div>
          <div><span>Tax</span><strong>${escapeHtml(formatCurrency(totals.totalTax, invoice.currency))}</strong></div>
          <div style="font-size:16px; font-weight:700"><span>Total</span><strong>${escapeHtml(formatCurrency(totals.total, invoice.currency))}</strong></div>
        </div>

        ${invoice.notes ? `<div style="margin-top:24px"><div class="title">Notes</div><div>${escapeHtml(invoice.notes)}</div></div>` : ''}
      </div>
    </body>
  </html>`;
}

function escapeHtml(input: unknown): string {
  const s = String(input ?? '');
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

function formatCurrency(amount: unknown, currency?: string) {
  try {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(num);
  } catch (_e) {
    return String(amount ?? '0');
  }
}
