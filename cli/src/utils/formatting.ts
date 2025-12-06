/**
 * Formatting utilities for displaying data in the CLI
 */

/**
 * Format a number as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a date as M/D/YYYY
 */
export function formatDate(date: Date): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

/**
 * Calculate the total for a line item including tax
 */
export function calculateLineTotal(quantity: number, unitPrice: number, taxRate: number): number {
  const subtotal = quantity * unitPrice;
  const tax = subtotal * (taxRate / 100);
  return subtotal + tax;
}

/**
 * Escape HTML special characters to prevent injection
 */
export function escapeHtml(input: unknown): string {
  return String(input).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));
}
