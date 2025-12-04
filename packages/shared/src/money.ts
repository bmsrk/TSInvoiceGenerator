/**
 * Money utility functions for safe decimal calculations
 * All amounts are stored as cents (integers) to avoid floating point errors
 */

/**
 * Convert a decimal amount to cents (integer)
 * @param amount - The decimal amount (e.g., 10.99)
 * @returns The amount in cents (e.g., 1099)
 */
export function toCents(amount: number): number {
  // Use Math.round to handle floating point imprecision
  return Math.round(amount * 100);
}

/**
 * Convert cents (integer) back to a decimal amount
 * @param cents - The amount in cents (e.g., 1099)
 * @returns The decimal amount (e.g., 10.99)
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Safely multiply two decimal amounts (e.g., quantity * rate)
 * Note: For very large amounts (>$10 billion), consider using BigInt
 * @param a - First decimal amount
 * @param b - Second decimal amount
 * @returns The product as a properly rounded decimal
 */
export function multiplyMoney(a: number, b: number): number {
  // Convert to cents, multiply, then convert back
  const aCents = toCents(a);
  const bCents = toCents(b);
  // Divide by 100 extra because both were multiplied by 100
  return Math.round((aCents * bCents) / 100) / 100;
}

/**
 * Safely add decimal amounts
 * @param amounts - Array of decimal amounts to add
 * @returns The sum as a properly rounded decimal
 */
export function addMoney(...amounts: number[]): number {
  const totalCents = amounts.reduce((sum, amount) => sum + toCents(amount), 0);
  return fromCents(totalCents);
}

/**
 * Safely subtract decimal amounts
 * @param from - The amount to subtract from
 * @param amount - The amount to subtract
 * @returns The difference as a properly rounded decimal
 */
export function subtractMoney(from: number, amount: number): number {
  return fromCents(toCents(from) - toCents(amount));
}

/**
 * Calculate percentage of an amount (e.g., for tax calculation)
 * @param amount - The base amount
 * @param percentage - The percentage (e.g., 10 for 10%)
 * @returns The percentage amount
 */
export function percentageOf(amount: number, percentage: number): number {
  const amountCents = toCents(amount);
  const result = Math.round((amountCents * percentage) / 100);
  return fromCents(result);
}

/**
 * Round a monetary amount to 2 decimal places
 * @param amount - The amount to round
 * @returns The rounded amount
 */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Parse a string input to a safe decimal number
 * @param value - The string value to parse
 * @param defaultValue - The default value if parsing fails
 * @returns The parsed decimal number
 */
export function parseDecimalInput(value: string, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return defaultValue;
  }
  return roundMoney(parsed);
}
