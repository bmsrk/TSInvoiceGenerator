# Functional Programming Best Practices

This document outlines the functional programming principles and patterns used in the Invoice Generator codebase.

## 🎯 Core Principles

### 1. Pure Functions

Functions that:
- Always return the same output for the same input
- Have no side effects
- Don't mutate external state

**Examples from the codebase:**

```typescript
// ✅ GOOD: Pure function
export const calculateLineSubtotal = (
  quantity: number,
  unitPrice: number
): number => {
  return roundMoney(multiplyMoney(quantity, unitPrice));
};

// ❌ BAD: Impure function (side effect)
let total = 0;
const addToTotal = (amount: number) => {
  total += amount; // Mutates external state
  return total;
};
```

### 2. Immutability

Prefer immutable data structures over mutation.

**Examples:**

```typescript
// ✅ GOOD: Immutable update
const updateInvoice = (invoice: Invoice, status: Status): Invoice => ({
  ...invoice,
  status,
});

// ❌ BAD: Mutation
const updateInvoice = (invoice: Invoice, status: Status): Invoice => {
  invoice.status = status; // Mutates input
  return invoice;
};
```

### 3. Function Composition

Build complex operations from simpler functions.

**Examples:**

```typescript
// ✅ GOOD: Composition
const calculateLineTotal = (quantity: number, unitPrice: number, taxRate: number) => {
  const subtotal = calculateLineSubtotal(quantity, unitPrice);
  const tax = calculateLineTax(subtotal, taxRate);
  return addMoney(subtotal, tax);
};

// Using pipe for left-to-right composition
import { pipe } from '@invoice/shared';

const processInvoice = pipe(
  validateInvoice,
  calculateTotals,
  formatForDisplay
);
```

### 4. Declarative Over Imperative

Focus on "what" rather than "how".

**Examples:**

```typescript
// ✅ GOOD: Declarative (functional)
const itemTotals = items.map(item => calculateItemTotal(item));
const total = itemTotals.reduce((sum, amount) => sum + amount, 0);

// ❌ BAD: Imperative
let total = 0;
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  const itemTotal = item.quantity * item.unitPrice;
  total += itemTotal;
}
```

## 🛠️ Functional Utilities

### Result Type for Error Handling

Instead of throwing exceptions, use the `Result` type:

```typescript
import { Result, Ok, Err, mapResult } from '@invoice/shared';

// ✅ GOOD: Functional error handling
const parseInvoiceNumber = (input: string): Result<number, string> => {
  const num = parseInt(input, 10);
  if (isNaN(num)) {
    return Err('Invalid invoice number');
  }
  return Ok(num);
};

// Chain operations
const result = parseInvoiceNumber('123')
  .map(num => num + 1)
  .map(num => `INV-${num}`);

if (result.ok) {
  console.log(result.value); // "INV-124"
} else {
  console.error(result.error);
}
```

### Pipe and Compose

Compose multiple functions:

```typescript
import { pipe, compose } from '@invoice/shared';

// Left-to-right (pipe)
const processInvoice = pipe(
  validateInvoiceData,
  enrichWithDefaults,
  calculateTotals,
  formatCurrency
);

// Right-to-left (compose)
const processInvoice = compose(
  formatCurrency,
  calculateTotals,
  enrichWithDefaults,
  validateInvoiceData
);
```

### Currying

Transform multi-argument functions:

```typescript
import { curry2 } from '@invoice/shared';

const multiply = (a: number, b: number) => a * b;
const curriedMultiply = curry2(multiply);

const double = curriedMultiply(2);
console.log(double(5)); // 10
console.log(double(10)); // 20
```

### Memoization

Cache expensive function results:

```typescript
import { memoize } from '@invoice/shared';

const expensiveCalculation = (invoice: Invoice) => {
  // Complex calculation
  return result;
};

const memoizedCalc = memoize(expensiveCalculation);

// First call: calculates
const result1 = memoizedCalc(invoice);

// Second call with same invoice: returns cached result
const result2 = memoizedCalc(invoice);
```

## 📋 Patterns to Follow

### 1. Separation of Concerns

Separate pure business logic from side effects:

```typescript
// Pure business logic
const calculateInvoiceTotals = (items: InvoiceItem[]): InvoiceTotals => {
  return aggregateInvoiceTotals(items);
};

// Side effects in separate layer
const saveInvoice = async (invoice: Invoice): Promise<void> => {
  const totals = calculateInvoiceTotals(invoice.items);
  await database.insert({ ...invoice, ...totals });
};
```

### 2. Higher-Order Functions

Functions that take or return other functions:

```typescript
// Filter factory
const createStatusFilter = (status: InvoiceStatus) => {
  return (invoice: Invoice) => invoice.status === status;
};

const paidInvoices = invoices.filter(createStatusFilter('PAID'));
const draftInvoices = invoices.filter(createStatusFilter('DRAFT'));
```

### 3. Avoid Temporal Coupling

Don't rely on order of execution:

```typescript
// ❌ BAD: Temporal coupling
class InvoiceService {
  private invoice: Invoice;
  
  setInvoice(invoice: Invoice) {
    this.invoice = invoice;
  }
  
  calculateTotal() {
    // Depends on setInvoice being called first!
    return this.invoice.items.reduce(...);
  }
}

// ✅ GOOD: Pure function
const calculateInvoiceTotal = (invoice: Invoice): number => {
  return invoice.items.reduce(...);
};
```

### 4. Use Read-only Types

Enforce immutability with TypeScript:

```typescript
// Function signature guarantees no mutation
const processItems = (
  items: ReadonlyArray<InvoiceItem>
): ReadonlyArray<ProcessedItem> => {
  return items.map(processItem);
};
```

## 🚫 Anti-Patterns to Avoid

### 1. Hidden Side Effects

```typescript
// ❌ BAD: Hidden mutation
const calculateTotals = (invoice: Invoice) => {
  invoice.total = invoice.items.reduce(...); // Mutates input!
  return invoice.total;
};

// ✅ GOOD: Returns new object
const calculateTotals = (invoice: Invoice): Invoice => {
  const total = invoice.items.reduce(...);
  return { ...invoice, total };
};
```

### 2. Shared Mutable State

```typescript
// ❌ BAD: Shared state
let currentInvoice: Invoice | null = null;

const setCurrentInvoice = (invoice: Invoice) => {
  currentInvoice = invoice;
};

// ✅ GOOD: Pass state explicitly
const processInvoice = (invoice: Invoice) => {
  // Work with passed parameter
  return calculateTotals(invoice);
};
```

### 3. Mutation in Reduce

```typescript
// ❌ BAD: Mutating accumulator
items.reduce((acc, item) => {
  acc.total += item.price; // Mutation!
  return acc;
}, { total: 0 });

// ✅ GOOD: Immutable update
items.reduce((acc, item) => {
  return {
    ...acc,
    total: acc.total + item.price
  };
}, { total: 0 });
```

## 🧪 Testing Benefits

Functional code is easier to test:

```typescript
// Pure functions are trivial to test
describe('calculateLineSubtotal', () => {
  it('calculates subtotal correctly', () => {
    expect(calculateLineSubtotal(2, 50)).toBe(100);
  });
  
  it('handles decimals', () => {
    expect(calculateLineSubtotal(1.5, 75.50)).toBe(113.25);
  });
});

// No mocking needed!
// No setup/teardown!
// No state to manage!
```

## 📚 Resources

- **Shared Package**: See `packages/shared/src/functional.ts` for utility functions
- **Calculator**: See `packages/shared/src/calculator.ts` for pure calculation examples
- **Money Utils**: See `packages/shared/src/money.ts` for immutable money operations

## 🎓 Key Takeaways

1. **Keep functions pure** when possible
2. **Avoid mutations** - create new objects instead
3. **Compose** small functions into larger operations
4. **Separate** pure logic from side effects
5. **Use types** to enforce immutability
6. **Test** becomes trivial with pure functions

By following these principles, the codebase becomes:
- More predictable
- Easier to test
- Easier to reason about
- Less prone to bugs
- More maintainable
