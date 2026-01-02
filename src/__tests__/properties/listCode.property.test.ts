/**
 * Property-Based Tests for List Code Generation
 * 
 * **Feature: grocery-list, Property 1: List Code Format Validity**
 * **Validates: Requirements 1.1**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateListCode, isValidListCodeFormat } from '../../lib/utils';

describe('List Code Generation Properties', () => {
  /**
   * Property 1: List Code Format Validity
   * *For any* generated list code, the code SHALL match the pattern 
   * `GRO-[A-Z0-9]{7}` (prefix "GRO-" followed by exactly 7 alphanumeric uppercase characters).
   */
  it('should always generate codes matching GRO-[A-Z0-9]{7} pattern', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const code = generateListCode();
        
        // Must match the exact pattern
        expect(code).toMatch(/^GRO-[A-Z0-9]{7}$/);
        
        // Must be exactly 11 characters
        expect(code.length).toBe(11);
        
        // Must start with GRO-
        expect(code.startsWith('GRO-')).toBe(true);
        
        // The validation function should also pass
        expect(isValidListCodeFormat(code)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid list code formats', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // lowercase letters
          fc.constant('GRO-abcdefg'),
          // wrong prefix
          fc.constant('ABC-1234567'),
          // too short
          fc.constant('GRO-123456'),
          // too long
          fc.constant('GRO-12345678'),
          // missing hyphen
          fc.constant('GRO1234567'),
          // special characters
          fc.constant('GRO-12#4567'),
          // empty string
          fc.constant(''),
          // random strings
          fc.string().filter(s => !s.match(/^GRO-[A-Z0-9]{7}$/))
        ),
        (invalidCode) => {
          expect(isValidListCodeFormat(invalidCode)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
