import { describe, it, expect } from 'vitest';
import {
  toCents,
  fromCents,
  multiplyMoney,
  addMoney,
  subtractMoney,
  percentageOf,
  roundMoney,
  parseDecimalInput,
} from '../money';

describe('Money Utility Functions', () => {
  describe('toCents', () => {
    it('should convert dollars to cents', () => {
      expect(toCents(10.99)).toBe(1099);
      expect(toCents(0.01)).toBe(1);
      expect(toCents(100)).toBe(10000);
    });

    it('should handle floating point precision', () => {
      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
      expect(toCents(0.1 + 0.2)).toBe(30);
    });
  });

  describe('fromCents', () => {
    it('should convert cents to dollars', () => {
      expect(fromCents(1099)).toBe(10.99);
      expect(fromCents(1)).toBe(0.01);
      expect(fromCents(10000)).toBe(100);
    });
  });

  describe('multiplyMoney', () => {
    it('should safely multiply decimal values', () => {
      // Hours * Rate
      expect(multiplyMoney(1.5, 100)).toBe(150);
      expect(multiplyMoney(8.25, 125.50)).toBe(1035.38);
    });

    it('should avoid floating point errors', () => {
      // Classic floating point issue: 0.1 * 0.2 = 0.020000000000000004
      expect(multiplyMoney(0.1, 0.2)).toBe(0.02);
    });

    it('should handle decimal hours correctly', () => {
      expect(multiplyMoney(1.25, 100)).toBe(125);
      expect(multiplyMoney(2.5, 150)).toBe(375);
    });
  });

  describe('addMoney', () => {
    it('should safely add multiple amounts', () => {
      expect(addMoney(10.50, 20.25, 5.25)).toBe(36);
      expect(addMoney(0.1, 0.2)).toBe(0.3);
    });

    it('should handle single amount', () => {
      expect(addMoney(10.50)).toBe(10.5);
    });

    it('should handle many amounts', () => {
      expect(addMoney(1, 2, 3, 4, 5)).toBe(15);
    });
  });

  describe('subtractMoney', () => {
    it('should safely subtract amounts', () => {
      expect(subtractMoney(100, 30.50)).toBe(69.5);
      expect(subtractMoney(0.3, 0.1)).toBe(0.2);
    });
  });

  describe('percentageOf', () => {
    it('should calculate tax correctly', () => {
      // 10% of 100
      expect(percentageOf(100, 10)).toBe(10);
      // 8.25% tax on 150
      expect(percentageOf(150, 8.25)).toBe(12.38);
    });

    it('should handle zero percentage', () => {
      expect(percentageOf(100, 0)).toBe(0);
    });
  });

  describe('roundMoney', () => {
    it('should round to 2 decimal places', () => {
      expect(roundMoney(10.999)).toBe(11);
      expect(roundMoney(10.994)).toBe(10.99);
      expect(roundMoney(10.995)).toBe(11);
    });
  });

  describe('parseDecimalInput', () => {
    it('should parse valid decimal strings', () => {
      expect(parseDecimalInput('10.50')).toBe(10.5);
      expect(parseDecimalInput('100')).toBe(100);
      expect(parseDecimalInput('1.25')).toBe(1.25);
    });

    it('should return default value for invalid input', () => {
      expect(parseDecimalInput('abc')).toBe(0);
      expect(parseDecimalInput('', 5)).toBe(5);
      expect(parseDecimalInput('not a number', 10)).toBe(10);
    });

    it('should round result to 2 decimal places', () => {
      expect(parseDecimalInput('10.999')).toBe(11);
    });
  });
});

describe('Invoice Calculation Scenarios', () => {
  it('should calculate invoice line correctly with decimal hours', () => {
    // 1.5 hours at $150/hr with 10% tax
    const hours = 1.5;
    const rate = 150;
    const taxRate = 10;

    const subtotal = multiplyMoney(hours, rate);
    const tax = percentageOf(subtotal, taxRate);
    const total = addMoney(subtotal, tax);

    expect(subtotal).toBe(225);
    expect(tax).toBe(22.5);
    expect(total).toBe(247.5);
  });

  it('should calculate multiple line items correctly', () => {
    const items = [
      { hours: 8.25, rate: 125.50 },
      { hours: 4.5, rate: 100 },
      { hours: 2.75, rate: 175 },
    ];

    const subtotals = items.map(item => multiplyMoney(item.hours, item.rate));
    const total = addMoney(...subtotals);

    expect(subtotals).toEqual([1035.38, 450, 481.25]);
    expect(total).toBe(1966.63);
  });
});
