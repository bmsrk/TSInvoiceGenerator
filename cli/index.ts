#!/usr/bin/env bun
/**
 * Invoice Generator CLI - A single-file command-line interface with TUI
 * Built with Bun, Prisma, and Inquirer
 */

import { PrismaClient } from '@prisma/client';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { table } from 'table';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Types
type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

// ===== Utility Functions =====

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function calculateLineTotal(quantity: number, unitPrice: number, taxRate: number): number {
  const subtotal = quantity * unitPrice;
  const tax = subtotal * (taxRate / 100);
  return subtotal + tax;
}

// ===== Database Seeding =====

async function seedDatabase(): Promise<void> {
  console.log(chalk.blue('🌱 Seeding database...'));

  const existingCompanies = await prisma.company.count();
  if (existingCompanies > 0) {
    console.log(chalk.yellow('📦 Database already has data, skipping seed.'));
    return;
  }

  // Create sample companies
  const acmeCorp = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      email: 'billing@acme.com',
      phone: '+1 (555) 123-4567',
      street: '123 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      taxId: 'US-123456789',
      isDefault: true,
    },
  });

  await prisma.company.create({
    data: {
      name: 'Tech Solutions LLC',
      email: 'invoices@techsolutions.io',
      phone: '+1 (555) 987-6543',
      street: '456 Innovation Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
      taxId: 'US-987654321',
    },
  });

  console.log(chalk.green('✅ Created sample companies'));

  // Create sample customers
  const clientCompany = await prisma.customer.create({
    data: {
      name: 'Client Company',
      email: 'accounts@client.com',
      phone: '+1 (555) 987-6543',
      street: '456 Client Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  });

  await prisma.customer.create({
    data: {
      name: 'Startup Inc',
      email: 'finance@startup.io',
      phone: '+1 (555) 555-1234',
      street: '789 Startup Lane',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA',
      taxId: 'US-555123456',
    },
  });

  await prisma.customer.create({
    data: {
      name: 'Global Enterprises',
      email: 'ap@globalent.com',
      street: '321 Corporate Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
  });

  console.log(chalk.green('✅ Created sample customers'));

  // Create sample services
  await prisma.service.createMany({
    data: [
      { description: 'Web Development', defaultRate: 150.0 },
      { description: 'UI/UX Design', defaultRate: 120.0 },
      { description: 'Project Management', defaultRate: 100.0 },
      { description: 'Consulting', defaultRate: 175.0 },
      { description: 'Code Review', defaultRate: 125.0 },
      { description: 'Technical Writing', defaultRate: 85.0 },
      { description: 'Database Design', defaultRate: 140.0 },
      { description: 'API Development', defaultRate: 160.0 },
    ],
  });

  console.log(chalk.green('✅ Created sample services'));

  // Create a sample invoice
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-0001',
      dueDate,
      status: 'PENDING',
      currency: 'USD',
      paymentTerms: 'NET_30',
      notes: 'Thank you for your business!',
      termsAndConditions:
        'Payment is due within 30 days. Late payments may incur a 1.5% monthly interest.',
      companyId: acmeCorp.id,
      customerId: clientCompany.id,
      items: {
        create: [
          {
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 150.0,
            taxRate: 10,
          },
          {
            description: 'UI/UX Design',
            quantity: 20,
            unitPrice: 120.0,
            taxRate: 10,
          },
          {
            description: 'Project Management',
            quantity: 10.5,
            unitPrice: 100.0,
            taxRate: 10,
          },
        ],
      },
    },
  });

  console.log(chalk.green('✅ Created sample invoice'));
  console.log(chalk.green('🎉 Database seeded successfully!'));
}

// ===== TUI Menus =====

async function mainMenu(): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '📋 List Invoices', value: 'list-invoices' },
        { name: '✨ Create Invoice', value: 'create-invoice' },
        { name: '🏢 Manage Companies', value: 'manage-companies' },
        { name: '👥 Manage Customers', value: 'manage-customers' },
        { name: '🛠️  Manage Services', value: 'manage-services' },
        { name: '📊 View Statistics', value: 'stats' },
        { name: '🌱 Seed Database', value: 'seed' },
        { name: '❌ Exit', value: 'exit' },
      ],
    },
  ]);

  switch (action) {
    case 'list-invoices':
      await listInvoices();
      break;
    case 'create-invoice':
      await createInvoiceTUI();
      break;
    case 'manage-companies':
      await manageCompanies();
      break;
    case 'manage-customers':
      await manageCustomers();
      break;
    case 'manage-services':
      await manageServices();
      break;
    case 'stats':
      await showStats();
      break;
    case 'seed':
      await seedDatabase();
      break;
    case 'exit':
      console.log(chalk.blue('👋 Goodbye!'));
      await prisma.$disconnect();
      process.exit(0);
  }

  // Loop back to main menu
  await mainMenu();
}

async function listInvoices(): Promise<void> {
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

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '👁️  View Invoice Details', value: 'view' },
        { name: '🔄 Update Invoice Status', value: 'update-status' },
        { name: '🗑️  Delete Invoice', value: 'delete' },
        { name: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  if (action === 'view') {
    const { invoiceId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'invoiceId',
        message: 'Select an invoice:',
        choices: invoices.map((inv) => ({
          name: `${inv.invoiceNumber} - ${inv.customer.name}`,
          value: inv.id,
        })),
      },
    ]);
    await viewInvoiceDetails(invoiceId);
  } else if (action === 'update-status') {
    const { invoiceId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'invoiceId',
        message: 'Select an invoice:',
        choices: invoices.map((inv) => ({
          name: `${inv.invoiceNumber} - ${inv.customer.name}`,
          value: inv.id,
        })),
      },
    ]);
    await updateInvoiceStatus(invoiceId);
  } else if (action === 'delete') {
    const { invoiceId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'invoiceId',
        message: 'Select an invoice to delete:',
        choices: invoices.map((inv) => ({
          name: `${inv.invoiceNumber} - ${inv.customer.name}`,
          value: inv.id,
        })),
      },
    ]);
    await deleteInvoice(invoiceId);
  }
}

async function viewInvoiceDetails(invoiceId: string): Promise<void> {
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
}

async function updateInvoiceStatus(invoiceId: string): Promise<void> {
  const { status } = await inquirer.prompt([
    {
      type: 'list',
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

async function deleteInvoice(invoiceId: string): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this invoice?',
      default: false,
    },
  ]);

  if (confirm) {
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });
    console.log(chalk.green('\n✅ Invoice deleted successfully\n'));
  }
}

async function createInvoiceTUI(): Promise<void> {
  console.log(chalk.bold('\n✨ Create New Invoice\n'));

  // Select company
  const companies = await prisma.company.findMany();
  if (companies.length === 0) {
    console.log(chalk.red('❌ No companies found. Please create a company first.\n'));
    return;
  }

  const { companyId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'companyId',
      message: 'Select your company:',
      choices: companies.map((c) => ({
        name: `${c.name} (${c.email})`,
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

  const { customerId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'customerId',
      message: 'Select customer:',
      choices: customers.map((c) => ({
        name: `${c.name} (${c.email})`,
        value: c.id,
      })),
    },
  ]);

  // Get invoice details
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  const nextNumber = lastInvoice
    ? `INV-${new Date().getFullYear()}-${String(parseInt(lastInvoice.invoiceNumber.split('-')[2] || '0') + 1).padStart(4, '0')}`
    : `INV-${new Date().getFullYear()}-0001`;

  const { invoiceNumber, dueDate, paymentTerms } = await inquirer.prompt([
    {
      type: 'input',
      name: 'invoiceNumber',
      message: 'Invoice number:',
      default: nextNumber,
    },
    {
      type: 'input',
      name: 'dueDate',
      message: 'Due date (YYYY-MM-DD):',
      default: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'list',
      name: 'paymentTerms',
      message: 'Payment terms:',
      choices: ['NET_15', 'NET_30', 'NET_45', 'NET_60', 'DUE_ON_RECEIPT'],
      default: 'NET_30',
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
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Line items:',
        choices: [
          { name: '➕ Add Line Item', value: 'add' },
          { name: '📋 Add from Services', value: 'add-service' },
          ...(items.length > 0
            ? [{ name: '✅ Finish and Create Invoice', value: 'finish' }]
            : []),
        ],
      },
    ]);

    if (action === 'finish') {
      addingItems = false;
    } else if (action === 'add') {
      const item = await inquirer.prompt([
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
        },
        {
          type: 'number',
          name: 'quantity',
          message: 'Quantity (can be decimal):',
          default: 1,
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
          default: 0,
        },
      ]);
      items.push(item);
      console.log(chalk.green('✅ Item added\n'));
    } else if (action === 'add-service') {
      const services = await prisma.service.findMany();
      if (services.length === 0) {
        console.log(chalk.yellow('⚠️  No services found.\n'));
        continue;
      }

      const { serviceId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'serviceId',
          message: 'Select service:',
          choices: services.map((s) => ({
            name: `${s.description} - ${formatCurrency(s.defaultRate)}/hr`,
            value: s.id,
          })),
        },
      ]);

      const service = services.find((s) => s.id === serviceId)!;
      const { quantity, unitPrice, taxRate } = await inquirer.prompt([
        {
          type: 'number',
          name: 'quantity',
          message: 'Hours/Quantity:',
          default: 1,
        },
        {
          type: 'number',
          name: 'unitPrice',
          message: 'Rate:',
          default: service.defaultRate,
        },
        {
          type: 'number',
          name: 'taxRate',
          message: 'Tax rate (%):',
          default: 0,
        },
      ]);

      items.push({
        description: service.description,
        quantity,
        unitPrice,
        taxRate,
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

async function manageCompanies(): Promise<void> {
  const companies = await prisma.company.findMany();

  console.log(chalk.bold('\n🏢 Companies:\n'));

  if (companies.length === 0) {
    console.log(chalk.yellow('📭 No companies found.\n'));
  } else {
    const data = [
      [
        chalk.bold('Name'),
        chalk.bold('Email'),
        chalk.bold('City, State'),
        chalk.bold('Default'),
      ],
      ...companies.map((c) => [
        c.name,
        c.email,
        `${c.city}, ${c.state}`,
        c.isDefault ? '✓' : '',
      ]),
    ];
    console.log(table(data));
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '➕ Create Company', value: 'create' },
        ...(companies.length > 0
          ? [{ name: '🗑️  Delete Company', value: 'delete' }]
          : []),
        { name: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  if (action === 'create') {
    await createCompany();
  } else if (action === 'delete') {
    const { companyId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'companyId',
        message: 'Select company to delete:',
        choices: companies.map((c) => ({
          name: `${c.name} (${c.email})`,
          value: c.id,
        })),
      },
    ]);
    await deleteCompany(companyId);
  }
}

async function createCompany(): Promise<void> {
  console.log(chalk.bold('\n➕ Create New Company\n'));

  const input = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Company name:' },
    { type: 'input', name: 'email', message: 'Email:' },
    { type: 'input', name: 'phone', message: 'Phone (optional):' },
    { type: 'input', name: 'street', message: 'Street address:' },
    { type: 'input', name: 'city', message: 'City:' },
    { type: 'input', name: 'state', message: 'State:' },
    { type: 'input', name: 'zipCode', message: 'ZIP code:' },
    { type: 'input', name: 'country', message: 'Country:', default: 'USA' },
    { type: 'input', name: 'taxId', message: 'Tax ID (optional):' },
    {
      type: 'confirm',
      name: 'isDefault',
      message: 'Set as default company?',
      default: false,
    },
  ]);

  await prisma.company.create({ data: input });
  console.log(chalk.green('\n✅ Company created successfully!\n'));
}

async function deleteCompany(id: string): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this company?',
      default: false,
    },
  ]);

  if (confirm) {
    try {
      await prisma.company.delete({ where: { id } });
      console.log(chalk.green('\n✅ Company deleted successfully\n'));
    } catch (error) {
      console.log(chalk.red('\n❌ Cannot delete company (may have associated invoices)\n'));
    }
  }
}

async function manageCustomers(): Promise<void> {
  const customers = await prisma.customer.findMany();

  console.log(chalk.bold('\n👥 Customers:\n'));

  if (customers.length === 0) {
    console.log(chalk.yellow('📭 No customers found.\n'));
  } else {
    const data = [
      [chalk.bold('Name'), chalk.bold('Email'), chalk.bold('City, State')],
      ...customers.map((c) => [c.name, c.email, `${c.city}, ${c.state}`]),
    ];
    console.log(table(data));
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '➕ Create Customer', value: 'create' },
        ...(customers.length > 0
          ? [{ name: '🗑️  Delete Customer', value: 'delete' }]
          : []),
        { name: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  if (action === 'create') {
    await createCustomer();
  } else if (action === 'delete') {
    const { customerId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'customerId',
        message: 'Select customer to delete:',
        choices: customers.map((c) => ({
          name: `${c.name} (${c.email})`,
          value: c.id,
        })),
      },
    ]);
    await deleteCustomer(customerId);
  }
}

async function createCustomer(): Promise<void> {
  console.log(chalk.bold('\n➕ Create New Customer\n'));

  const input = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Customer name:' },
    { type: 'input', name: 'email', message: 'Email:' },
    { type: 'input', name: 'phone', message: 'Phone (optional):' },
    { type: 'input', name: 'street', message: 'Street address:' },
    { type: 'input', name: 'city', message: 'City:' },
    { type: 'input', name: 'state', message: 'State:' },
    { type: 'input', name: 'zipCode', message: 'ZIP code:' },
    { type: 'input', name: 'country', message: 'Country:', default: 'USA' },
    { type: 'input', name: 'taxId', message: 'Tax ID (optional):' },
  ]);

  await prisma.customer.create({ data: input });
  console.log(chalk.green('\n✅ Customer created successfully!\n'));
}

async function deleteCustomer(id: string): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this customer?',
      default: false,
    },
  ]);

  if (confirm) {
    try {
      await prisma.customer.delete({ where: { id } });
      console.log(chalk.green('\n✅ Customer deleted successfully\n'));
    } catch (error) {
      console.log(chalk.red('\n❌ Cannot delete customer (may have associated invoices)\n'));
    }
  }
}

async function manageServices(): Promise<void> {
  const services = await prisma.service.findMany();

  console.log(chalk.bold('\n🛠️  Services:\n'));

  if (services.length === 0) {
    console.log(chalk.yellow('📭 No services found.\n'));
  } else {
    const data = [
      [chalk.bold('Description'), chalk.bold('Default Rate')],
      ...services.map((s) => [s.description, formatCurrency(s.defaultRate)]),
    ];
    console.log(table(data));
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '➕ Create Service', value: 'create' },
        ...(services.length > 0
          ? [{ name: '🗑️  Delete Service', value: 'delete' }]
          : []),
        { name: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  if (action === 'create') {
    await createService();
  } else if (action === 'delete') {
    const { serviceId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'serviceId',
        message: 'Select service to delete:',
        choices: services.map((s) => ({
          name: `${s.description} - ${formatCurrency(s.defaultRate)}`,
          value: s.id,
        })),
      },
    ]);
    await deleteService(serviceId);
  }
}

async function createService(): Promise<void> {
  console.log(chalk.bold('\n➕ Create New Service\n'));

  const input = await inquirer.prompt([
    { type: 'input', name: 'description', message: 'Service description:' },
    {
      type: 'number',
      name: 'defaultRate',
      message: 'Default hourly rate:',
    },
  ]);

  await prisma.service.create({ data: input });
  console.log(chalk.green('\n✅ Service created successfully!\n'));
}

async function deleteService(id: string): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this service?',
      default: false,
    },
  ]);

  if (confirm) {
    await prisma.service.delete({ where: { id } });
    console.log(chalk.green('\n✅ Service deleted successfully\n'));
  }
}

async function showStats(): Promise<void> {
  const invoices = await prisma.invoice.findMany({ include: { items: true } });
  const companies = await prisma.company.count();
  const customers = await prisma.customer.count();
  const services = await prisma.service.count();

  const totalRevenue = invoices.reduce((sum, inv) => {
    return (
      sum +
      inv.items.reduce(
        (itemSum, item) =>
          itemSum + calculateLineTotal(item.quantity, item.unitPrice, item.taxRate),
        0
      )
    );
  }, 0);

  const statusCounts = invoices.reduce(
    (acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log(chalk.bold('\n📊 Statistics:\n'));
  console.log(`  Total Invoices: ${chalk.cyan(invoices.length)}`);
  console.log(`  Total Revenue: ${chalk.green(formatCurrency(totalRevenue))}`);
  console.log(`  Companies: ${chalk.cyan(companies)}`);
  console.log(`  Customers: ${chalk.cyan(customers)}`);
  console.log(`  Services: ${chalk.cyan(services)}`);
  console.log('');
  console.log(chalk.bold('  Invoice Status Breakdown:'));
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`    ${status}: ${chalk.cyan(count)}`);
  });
  console.log('');
}

// ===== CLI Setup =====

const program = new Command();

program
  .name('invoice')
  .description('Invoice Generator CLI with TUI - Built with Bun')
  .version('1.0.0');

// Default command: TUI
program
  .command('tui', { isDefault: true })
  .description('Launch interactive TUI (default)')
  .action(async () => {
    console.log(chalk.bold.blue('\n🧾 Invoice Generator CLI\n'));
    await seedDatabase();
    await mainMenu();
  });

// Quick stats
program
  .command('stats')
  .description('Show quick statistics')
  .action(async () => {
    await showStats();
    await prisma.$disconnect();
    process.exit(0);
  });

// List invoices
program
  .command('list')
  .description('List all invoices')
  .action(async () => {
    await listInvoices();
    await prisma.$disconnect();
    process.exit(0);
  });

// Seed database
program
  .command('seed')
  .description('Seed database with sample data')
  .action(async () => {
    await seedDatabase();
    await prisma.$disconnect();
    process.exit(0);
  });

// Parse command line arguments
program.parse();
