/**
 * Constants used throughout the CLI
 */

export const INVOICE_STATUSES = ['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const;

export const MAIN_MENU_CHOICES = [
  { title: '📋 List Invoices', value: 'list-invoices' },
  { title: '✨ Create Invoice', value: 'create-invoice' },
  { title: '🏢 Manage Companies', value: 'manage-companies' },
  { title: '👥 Manage Customers', value: 'manage-customers' },
  { title: '🛠️  Manage Services', value: 'manage-services' },
  { title: '📊 View Statistics', value: 'stats' },
  { title: '🌱 Seed Database', value: 'seed' },
  { title: '❌ Exit', value: 'exit' },
] as const;

export const COMPANY_MENU_CHOICES = [
  { title: '✨ Create Company', value: 'create' },
  { title: '🗑️  Delete Company', value: 'delete' },
  { title: '🔙 Back to Main Menu', value: 'back' },
] as const;

export const CUSTOMER_MENU_CHOICES = [
  { title: '✨ Create Customer', value: 'create' },
  { title: '🗑️  Delete Customer', value: 'delete' },
  { title: '🔙 Back to Main Menu', value: 'back' },
] as const;

export const SERVICE_MENU_CHOICES = [
  { title: '✨ Create Service', value: 'create' },
  { title: '🗑️  Delete Service', value: 'delete' },
  { title: '🔙 Back to Main Menu', value: 'back' },
] as const;
