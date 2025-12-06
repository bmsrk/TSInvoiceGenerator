/**
 * Type definitions for the CLI
 */

export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type MainMenuAction =
  | 'list-invoices'
  | 'create-invoice'
  | 'manage-companies'
  | 'manage-customers'
  | 'manage-services'
  | 'stats'
  | 'seed'
  | 'exit';

export type CompanyAction = 'create' | 'delete' | 'back';
export type CustomerAction = 'create' | 'delete' | 'back';
export type ServiceAction = 'create' | 'delete' | 'back';
