// Types
export type {
  Address,
  Party,
  InvoiceItem,
  PaymentTerms,
  InvoiceStatus,
  CurrencyCode,
  Invoice,
  CreateInvoiceRequest,
  InvoiceTotals,
} from './types';

// Utilities
export {
  generateId,
  generateInvoiceNumber,
  calculateItemSubtotal,
  calculateItemTax,
  calculateItemTotal,
  calculateInvoiceTotals,
  getDueDateFromPaymentTerms,
  createInvoice,
  formatCurrency,
  formatDate,
  parseDate,
} from './utils';

// Money utilities
export {
  toCents,
  fromCents,
  multiplyMoney,
  addMoney,
  subtractMoney,
  percentageOf,
  roundMoney,
  parseDecimalInput,
} from './money';

// Functional programming utilities
export {
  Result,
  Ok,
  Err,
  mapResult,
  flatMapResult,
  getOrElse,
  pipe,
  compose,
  curry2,
  curry3,
  partial,
  safeArrayAccess,
  safeProp,
  memoize,
  identity,
  constant,
  tap,
} from './functional';

export type { Result } from './functional';

// Invoice calculator utilities
export {
  calculateLineSubtotal,
  calculateLineTax,
  calculateLineTotal,
  aggregateInvoiceTotals,
  calculateDiscount,
  applyDiscount,
  formatMoney,
  calculateTotalHours,
  calculateAverageRate,
  groupItemsByDescription,
  mergeItemsByDescription,
} from './calculator';
