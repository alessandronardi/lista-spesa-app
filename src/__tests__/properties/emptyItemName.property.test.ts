/**
 * Property Test: Empty Item Name Rejection
 * **Feature: grocery-list, Property 3: Empty Item Name Rejection**
 * **Validates: Requirements 3.2**
 * 
 * For any string composed entirely of whitespace (including empty string),
 * attempting to add it as an item name SHALL be rejected.
 */

import fc from 'fast-check';
import { isValidItemName } from '../../lib/utils';

describe('Property 3: Empty Item Name Rejection', () => {
  /**
   * Property: Empty strings are rejected
   */
  it('should reject empty string as item name', () => {
    expect(isValidItemName('')).toBe(false);
  });

  /**
   * Property: Whitespace-only strings are rejected
   * For any string composed entirely of whitespace characters,
   * validation should return false
   */
  it('should reject any string composed entirely of whitespace', () => {
    // Generate strings of only whitespace characters
    const whitespaceOnlyArb = fc.array(
      fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v'),
      { minLength: 0, maxLength: 20 }
    ).map(arr => arr.join(''));

    fc.assert(
      fc.property(
        whitespaceOnlyArb,
        (whitespaceString) => {
          return isValidItemName(whitespaceString) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-empty strings with content are accepted
   * For any string that contains at least one non-whitespace character,
   * validation should return true
   */
  it('should accept any string with at least one non-whitespace character', () => {
    // Generate strings with at least one non-whitespace character
    const validNameArb = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        validNameArb,
        (validName) => {
          return isValidItemName(validName) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Strings with leading/trailing whitespace but content are accepted
   */
  it('should accept strings with leading/trailing whitespace if they have content', () => {
    const contentArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);
    
    const whitespaceArb = fc.array(
      fc.constantFrom(' ', '\t'),
      { minLength: 0, maxLength: 5 }
    ).map(arr => arr.join(''));

    fc.assert(
      fc.property(
        whitespaceArb,
        contentArb,
        whitespaceArb,
        (leadingWs, content, trailingWs) => {
          const nameWithWhitespace = leadingWs + content + trailingWs;
          return isValidItemName(nameWithWhitespace) === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
