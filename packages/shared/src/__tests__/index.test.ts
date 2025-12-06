import { describe, it, expect } from 'vitest';

import * as shared from '../index';

describe('shared/index exports', () => {
  it('should export utilities and money helpers', () => {
    expect(shared).toHaveProperty('generateId');
    expect(shared).toHaveProperty('toCents');
    expect(shared).toHaveProperty('multiplyMoney');
    // Note: Type-only exports are erased at runtime, so don't assert on 'types' here
  });
});
