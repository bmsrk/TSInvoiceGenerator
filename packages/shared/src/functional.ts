/**
 * Functional programming utilities for better code composition and error handling
 */

/**
 * Result type for functional error handling
 * Represents either a successful value (Ok) or an error (Err)
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Create a successful Result
 */
export const Ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

/**
 * Create an error Result
 */
export const Err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * Map over a Result value if Ok, otherwise pass through the error
 */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> => {
  if (result.ok) {
    return Ok(fn(result.value));
  }
  return result;
};

/**
 * Chain Result-returning operations
 */
export const flatMapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> => {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
};

/**
 * Get value from Result or return default
 */
export const getOrElse = <T, E>(
  result: Result<T, E>,
  defaultValue: T
): T => {
  return result.ok ? result.value : defaultValue;
};

/**
 * Pipe function for composing multiple functions left-to-right
 */
export const pipe = <T>(...fns: Array<(arg: T) => T>) => {
  return (value: T): T => fns.reduce((acc, fn) => fn(acc), value);
};

/**
 * Compose functions right-to-left
 */
export const compose = <T>(...fns: Array<(arg: T) => T>) => {
  return (value: T): T => fns.reduceRight((acc, fn) => fn(acc), value);
};

/**
 * Curry a binary function
 */
export const curry2 = <A, B, R>(fn: (a: A, b: B) => R) => {
  return (a: A) => (b: B) => fn(a, b);
};

/**
 * Curry a ternary function
 */
export const curry3 = <A, B, C, R>(fn: (a: A, b: B, c: C) => R) => {
  return (a: A) => (b: B) => (c: C) => fn(a, b, c);
};

/**
 * Partial application helper
 */
export const partial = <A extends any[], R>(
  fn: (...args: A) => R,
  ...partialArgs: Partial<A>
) => {
  return (...remainingArgs: any[]): R => {
    return fn(...([...partialArgs, ...remainingArgs] as A));
  };
};

/**
 * Safe array access that returns Result
 */
export const safeArrayAccess = <T>(
  arr: T[],
  index: number
): Result<T, string> => {
  if (index < 0 || index >= arr.length) {
    return Err(`Index ${index} out of bounds for array of length ${arr.length}`);
  }
  return Ok(arr[index]);
};

/**
 * Safe object property access
 */
export const safeProp = <T, K extends keyof T>(
  obj: T,
  key: K
): Result<T[K], string> => {
  if (key in obj) {
    return Ok(obj[key]);
  }
  return Err(`Property ${String(key)} not found`);
};

/**
 * Memoize a function (caches results)
 */
export const memoize = <Args extends any[], Return>(
  fn: (...args: Args) => Return
): ((...args: Args) => Return) => {
  const cache = new Map<string, Return>();
  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Identity function - returns its argument
 */
export const identity = <T>(x: T): T => x;

/**
 * Constant function - returns a function that always returns the same value
 */
export const constant = <T>(value: T) => (): T => value;

/**
 * Tap function - performs side effect and returns original value
 */
export const tap = <T>(fn: (value: T) => void) => {
  return (value: T): T => {
    fn(value);
    return value;
  };
};
