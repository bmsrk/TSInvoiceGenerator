/**
 * Pure functional invoice calculation utilities
 * All functions are pure - no side effects, referentially transparent
 */

import {
  multiplyMoney,
  addMoney,
  percentageOf,
  roundMoney,
  toCents,
  fromCents,
} from './money';
import type { InvoiceItem, InvoiceTotals } from './types';

/**
 * Pure function to calculate subtotal for a single line item
 */
export const calculateLineSubtotal = (
  quantity: number,
  unitPrice: number
): number => {
  return roundMoney(multiplyMoney(quantity, unitPrice));
};

/**
 * Pure function to calculate tax for a single line item
 */
export const calculateLineTax = (
  subtotal: number,
  taxRate: number
): number => {
  return roundMoney(percentageOf(subtotal, taxRate));
};

/**
 * Pure function to calculate total for a single line item
 */
export const calculateLineTotal = (
  quantity: number,
  unitPrice: number,
  taxRate: number
): number => {
  const subtotal = calculateLineSubtotal(quantity, unitPrice);
  const tax = calculateLineTax(subtotal, taxRate);
  return roundMoney(addMoney(subtotal, tax));
};

/**
 * Pure function to aggregate line items into invoice totals
 * Uses immutable reduce pattern
 */
export const aggregateInvoiceTotals = (
  items: ReadonlyArray<InvoiceItem>
): InvoiceTotals => {
  const initial: InvoiceTotals = {
    subtotal: 0,
    tax: 0,
    total: 0,
  };

  return items.reduce((totals, item) => {
    const itemSubtotal = calculateLineSubtotal(item.quantity, item.unitPrice);
    const itemTax = calculateLineTax(itemSubtotal, item.taxRate);

    return {
      subtotal: roundMoney(addMoney(totals.subtotal, itemSubtotal)),
      tax: roundMoney(addMoney(totals.tax, itemTax)),
      total: roundMoney(addMoney(totals.total, addMoney(itemSubtotal, itemTax))),
    };
  }, initial);
};

/**
 * Pure function to calculate discount amount
 */
export const calculateDiscount = (
  subtotal: number,
  discountPercentage: number
): number => {
  return roundMoney(percentageOf(subtotal, discountPercentage));
};

/**
 * Pure function to apply discount to totals
 */
export const applyDiscount = (
  totals: InvoiceTotals,
  discountPercentage: number
): InvoiceTotals => {
  const discount = calculateDiscount(totals.subtotal, discountPercentage);
  const newSubtotal = roundMoney(addMoney(totals.subtotal, -discount));
  const newTax = calculateLineTax(newSubtotal, 0); // Recalculate if needed
  
  return {
    subtotal: newSubtotal,
    tax: totals.tax, // Tax typically stays the same
    total: roundMoney(addMoney(newSubtotal, totals.tax)),
  };
};

/**
 * Pure function to format money value to currency string
 */
export const formatMoney = (
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Pure function to calculate total hours from line items
 */
export const calculateTotalHours = (
  items: ReadonlyArray<InvoiceItem>
): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Pure function to calculate average hourly rate
 */
export const calculateAverageRate = (
  items: ReadonlyArray<InvoiceItem>
): number => {
  if (items.length === 0) return 0;
  
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const totalHours = calculateTotalHours(items);
  
  return totalHours > 0 ? roundMoney(totalAmount / totalHours) : 0;
};

/**
 * Pure function to group items by description
 */
export const groupItemsByDescription = (
  items: ReadonlyArray<InvoiceItem>
): Map<string, ReadonlyArray<InvoiceItem>> => {
  return items.reduce((groups, item) => {
    const existing = groups.get(item.description) || [];
    groups.set(item.description, [...existing, item]);
    return groups;
  }, new Map<string, ReadonlyArray<InvoiceItem>>());
};

/**
 * Pure function to merge items with same description
 */
export const mergeItemsByDescription = (
  items: ReadonlyArray<InvoiceItem>
): ReadonlyArray<InvoiceItem> => {
  const grouped = groupItemsByDescription(items);
  
  return Array.from(grouped.entries()).map(([description, groupItems]) => {
    const totalQuantity = groupItems.reduce((sum, item) => sum + item.quantity, 0);
    const avgUnitPrice = groupItems.reduce((sum, item) => sum + item.unitPrice, 0) / groupItems.length;
    const avgTaxRate = groupItems.reduce((sum, item) => sum + item.taxRate, 0) / groupItems.length;
    
    // Use first item as template
    const firstItem = groupItems[0];
    
    return {
      ...firstItem,
      quantity: totalQuantity,
      unitPrice: roundMoney(avgUnitPrice),
      taxRate: avgTaxRate,
    };
  });
};
