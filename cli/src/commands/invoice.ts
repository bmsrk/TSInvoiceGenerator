/**
 * Invoice-related command functions
 */

import prompts from 'prompts';
import chalk from 'chalk';
import { table } from 'table';
import { spawnSync } from 'child_process';
import fs from 'fs';
import { prisma } from '../utils/database';
import { formatCurrency, formatDate, calculateLineTotal, escapeHtml } from '../utils/formatting';

/**
 * List all invoices with actions
 */
export async function listInvoices(): Promise<void> {
  const invoices = await prisma.invoice.findMany({
    include: {
      company: true,
      customer: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (invoices.length === 0) {
    console.log(chalk.yellow('\n📭 No invoices found.\n'));
    return;
  }

  console.log(chalk.bold('\n📋 Invoices:\n'));

  const data = [
    [
      chalk.bold('Number'),
      chalk.bold('Customer'),
      chalk.bold('Status'),
      chalk.bold('Amount'),
      chalk.bold('Due Date'),
    ],
    ...invoices.map((inv) => {
      const total = inv.items.reduce(
        (sum, item) =>
          sum + calculateLineTotal(item.quantity, item.unitPrice, item.taxRate),
        0
      );
      return [
        inv.invoiceNumber,
        inv.customer.name,
        inv.status,
        formatCurrency(total),
        formatDate(inv.dueDate),
      ];
    }),
  ];

  console.log(table(data));

  const { action } = await prompts([
    {
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { title: '👁️  View Invoice Details', value: 'view' },
        { title: '🔄 Update Invoice Status', value: 'update-status' },
        { title: '🗑️  Delete Invoice', value: 'delete' },
        { title: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  if (action === 'view') {
    const { invoiceId } = await prompts([
      {
        type: 'select',
        name: 'invoiceId',
        message: 'Select an invoice:',
        choices: invoices.map((inv) => ({
          title: `${inv.invoiceNumber} - ${inv.customer.name}`,
          value: inv.id,
        })),
      },
    ]);
    await viewInvoiceDetails(invoiceId);
  } else if (action === 'update-status') {
    const { invoiceId } = await prompts([
      {
        type: 'select',
        name: 'invoiceId',
        message: 'Select an invoice:',
        choices: invoices.map((inv) => ({
          title: `${inv.invoiceNumber} - ${inv.customer.name}`,
          value: inv.id,
        })),
      },
    ]);
    await updateInvoiceStatus(invoiceId);
  } else if (action === 'delete') {
    const { invoiceId } = await prompts([
      {
        type: 'select',
        name: 'invoiceId',
        message: 'Select an invoice to delete:',
        choices: invoices.map((inv) => ({
          title: `${inv.invoiceNumber} - ${inv.customer.name}`,
          value: inv.id,
        })),
      },
    ]);
    await deleteInvoice(invoiceId);
  }
}

/**
 * View detailed information about an invoice
 */
export async function viewInvoiceDetails(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      company: true,
      customer: true,
      items: true,
    },
  });

  if (!invoice) {
    console.log(chalk.red('\n❌ Invoice not found.\n'));
    return;
  }

  console.log(chalk.bold(`\n📄 Invoice ${invoice.invoiceNumber}\n`));
  console.log(chalk.bold('From:'));
  console.log(`  ${invoice.company.name}`);
  console.log(`  ${invoice.company.email}`);
  console.log(`  ${invoice.company.street}, ${invoice.company.city}, ${invoice.company.state} ${invoice.company.zipCode}`);
  console.log('');
  console.log(chalk.bold('To:'));
  console.log(`  ${invoice.customer.name}`);
  console.log(`  ${invoice.customer.email}`);
  console.log(`  ${invoice.customer.street}, ${invoice.customer.city}, ${invoice.customer.state} ${invoice.customer.zipCode}`);
  console.log('');
  console.log(chalk.bold('Details:'));
  console.log(`  Status: ${invoice.status}`);
  console.log(`  Due Date: ${formatDate(invoice.dueDate)}`);
  console.log(`  Payment Terms: ${invoice.paymentTerms}`);
  console.log('');

  const itemsData = [
    [
      chalk.bold('Description'),
      chalk.bold('Qty'),
      chalk.bold('Rate'),
      chalk.bold('Tax %'),
      chalk.bold('Total'),
    ],
    ...invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      `${item.taxRate}%`,
      formatCurrency(
        calculateLineTotal(item.quantity, item.unitPrice, item.taxRate)
      ),
    ]),
  ];

  console.log(table(itemsData));

  const total = invoice.items.reduce(
    (sum, item) =>
      sum + calculateLineTotal(item.quantity, item.unitPrice, item.taxRate),
    0
  );
  console.log(chalk.bold(`\n  Grand Total: ${formatCurrency(total)}\n`));

  if (invoice.notes) {
    console.log(chalk.bold('Notes:'));
    console.log(`  ${invoice.notes}\n`);
  }

  // Allow exporting PDF from CLI
  const { exportAction } = await prompts([
    {
      type: 'select',
      name: 'exportAction',
      message: 'Export options',
      choices: [
        { title: '⬇️  Export to PDF (attempt wkhtmltopdf)', value: 'export-pdf' },
        { title: '⬅️  Back', value: 'back' },
      ],
    },
  ]);

  if (exportAction === 'export-pdf') {
    await exportInvoiceToPdf(invoiceId);
  }
}

/**
 * Export an invoice to PDF (or HTML fallback)
 */
export async function exportInvoiceToPdf(invoiceId: string, outPath?: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({ 
    where: { id: invoiceId }, 
    include: { company: true, customer: true, items: true } 
  });
  
  if (!invoice) {
    console.log(chalk.red('❌ Invoice not found.'));
    return;
  }

  outPath = outPath ?? `${invoice.invoiceNumber}.pdf`;

  // Build a minimal HTML like the web/server templates use
  const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${invoice.invoiceNumber}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#0f172a}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #e5e7eb}</style></head><body><h1>${invoice.invoiceNumber}</h1><div>To: ${invoice.customer.name}</div><table><thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${invoice.items.map(i=>`<tr><td>${escapeHtml(i.description)}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">${i.unitPrice}</td><td style="text-align:right">${(i.quantity*i.unitPrice).toFixed(2)}</td></tr>`).join('')}</tbody></table></body></html>`;

  // Attempt to run wkhtmltopdf if available
  try {
    const spawned = spawnSync('wkhtmltopdf', ['-q', '-', '-'], { input: Buffer.from(html) });
    if (spawned.status === 0) {
      fs.writeFileSync(outPath, spawned.stdout);
      console.log(chalk.green(`✅ PDF exported to ${outPath}`));
      return;
    }
    // If wkhtmltopdf returned non-zero, fall-through to saving HTML
    console.log(chalk.yellow('⚠️  wkhtmltopdf returned error — saving HTML instead.'));
  } catch (err) {
    // spawnSync might throw if binary not found
    console.log(chalk.yellow('⚠️  wkhtmltopdf not found on PATH or failed to run.')); 
  }

  // Save HTML fallback to disk
  const htmlOut = outPath.replace(/\.pdf$/i, '.html');
  fs.writeFileSync(htmlOut, html);
  console.log(chalk.green(`✅ Saved invoice HTML to ${htmlOut}. You can convert it using wkhtmltopdf or your preferred tool.`));
}

/**
 * Update the status of an invoice
 */
export async function updateInvoiceStatus(invoiceId: string): Promise<void> {
  const { status } = await prompts([
    {
      type: 'select',
      name: 'status',
      message: 'Select new status:',
      choices: ['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
    },
  ]);

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
  });

  console.log(chalk.green(`\n✅ Invoice status updated to ${status}\n`));
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(invoiceId: string): Promise<void> {
  const { confirm } = await prompts([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this invoice?',
      initial: false,
    },
  ]);

  if (confirm) {
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });
    console.log(chalk.green('\n✅ Invoice deleted successfully\n'));
  }
}

/**
 * Create a new invoice through TUI
 */
export async function createInvoiceTUI(): Promise<void> {
  console.log(chalk.bold('\n✨ Create New Invoice\n'));

  // Select company
  const companies = await prisma.company.findMany();
  if (companies.length === 0) {
    console.log(chalk.red('❌ No companies found. Please create a company first.\n'));
    return;
  }

  const { companyId } = await prompts([
    {
      type: 'select',
      name: 'companyId',
      message: 'Select your company:',
      choices: companies.map((c) => ({
        title: `${c.name} (${c.email})`,
        value: c.id,
      })),
    },
  ]);

  // Select customer
  const customers = await prisma.customer.findMany();
  if (customers.length === 0) {
    console.log(chalk.red('❌ No customers found. Please create a customer first.\n'));
    return;
  }

  const { customerId } = await prompts([
    {
      type: 'select',
      name: 'customerId',
      message: 'Select customer:',
      choices: customers.map((c) => ({
        title: `${c.name} (${c.email})`,
        value: c.id,
      })),
    },
  ]);

  // Get invoice details
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  
  // Generate next invoice number with validation
  let nextNumber = `INV-${new Date().getFullYear()}-0001`;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('-');
    if (parts.length === 3 && !isNaN(parseInt(parts[2]))) {
      const nextNum = parseInt(parts[2]) + 1;
      nextNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;
    }
  }
  
  // Days to milliseconds constant
  const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

  const { invoiceNumber, dueDate, paymentTerms } = await prompts([
    {
      type: 'input',
      name: 'invoiceNumber',
      message: 'Invoice number:',
      initial: nextNumber,
    },
    {
      type: 'input',
      name: 'dueDate',
      message: 'Due date (YYYY-MM-DD):',
      initial: new Date(Date.now() + DAYS_30_MS)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'select',
      name: 'paymentTerms',
      message: 'Payment terms:',
      choices: ['NET_15', 'NET_30', 'NET_45', 'NET_60', 'DUE_ON_RECEIPT'],
      initial: 1,
    },
  ]);

  // Add line items
  const items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }> = [];

  let addingItems = true;
  while (addingItems) {
    const { action } = await prompts([
      {
        type: 'select',
        name: 'action',
        message: 'Line items:',
        choices: [
          { title: '➕ Add Line Item', value: 'add' },
          { title: '📋 Add from Services', value: 'add-service' },
          ...(items.length > 0
            ? [{ title: '✅ Finish and Create Invoice', value: 'finish' }]
            : []),
        ],
      },
    ]);

    if (action === 'finish') {
      addingItems = false;
    } else if (action === 'add') {
      const itemResponse = await prompts([
        {
          type: 'text',
          name: 'description',
          message: 'Description:',
        },
        {
          type: 'number',
          name: 'quantity',
          message: 'Quantity (can be decimal):',
          initial: 1,
        },
        {
          type: 'number',
          name: 'unitPrice',
          message: 'Unit price:',
        },
        {
          type: 'number',
          name: 'taxRate',
          message: 'Tax rate (%):',
          initial: 0,
        },
      ]);
      items.push(itemResponse as any);
      console.log(chalk.green('✅ Item added\n'));
    } else if (action === 'add-service') {
      const services = await prisma.service.findMany();
      if (services.length === 0) {
        console.log(chalk.yellow('⚠️  No services found.\n'));
        continue;
      }

      const { serviceId } = await prompts([
        {
          type: 'select',
          name: 'serviceId',
          message: 'Select service:',
          choices: services.map((s) => ({
            title: `${s.description} - ${formatCurrency(s.defaultRate)}/hr`,
            value: s.id,
          })),
        },
      ]);

      const service = services.find((s) => s.id === serviceId)!;
      const numResponse = await prompts([
        {
          type: 'number',
          name: 'quantity',
          message: 'Hours/Quantity:',
          initial: 1,
        },
        {
          type: 'number',
          name: 'unitPrice',
          message: 'Rate:',
          initial: service.defaultRate,
        },
        {
          type: 'number',
          name: 'taxRate',
          message: 'Tax rate (%):',
          initial: 0,
        },
      ]);

      items.push({
        description: service.description,
        quantity: numResponse.quantity,
        unitPrice: numResponse.unitPrice,
        taxRate: numResponse.taxRate,
      });
      console.log(chalk.green('✅ Service item added\n'));
    }
  }

  if (items.length === 0) {
    console.log(chalk.red('❌ Cannot create invoice without line items.\n'));
    return;
  }

  // Create the invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      dueDate: new Date(dueDate),
      status: 'DRAFT',
      currency: 'USD',
      paymentTerms,
      companyId,
      customerId,
      items: {
        create: items,
      },
    },
    include: {
      items: true,
    },
  });

  const total = invoice.items.reduce(
    (sum, item) =>
      sum + calculateLineTotal(item.quantity, item.unitPrice, item.taxRate),
    0
  );

  console.log(chalk.green(`\n✅ Invoice created successfully!`));
  console.log(chalk.bold(`   Number: ${invoice.invoiceNumber}`));
  console.log(chalk.bold(`   Total: ${formatCurrency(total)}\n`));
}
