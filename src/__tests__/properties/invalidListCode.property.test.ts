/**
 * Property Test: Invalid List Code Rejection
 * **Feature: grocery-list, Property 12: Invalid List Code Rejection**
 * **Validates: Requirements 2.2**
 * 
 * For any string that does not correspond to an existing list code,
 * attempting to access the list SHALL return null (not found).
 */

import fc from 'fast-check';
import { isValidListCodeFormat } from '../../lib/utils';
import { it } from 'vitest';
import { it } from 'vitest';
import { it } from 'vitest';
import { it } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';

describe('Property 12: Invalid List Code Rejection', () => {
  /**
   * Property: Invalid format codes are rejected
   * For any string that doesn't match GRO-XXXXXXX format, 
   * isValidListCodeFormat should return false
   */
  it('should reject any string that does not match GRO-XXXXXXX format', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 20 }),
        (randomString) => {
          const isValid = isValidListCodeFormat(randomString);
          const matchesFormat = /^GRO-[A-Z0-9]{7}$/.test(randomString);
          
          // The validation function should return true only if it matches the format
          return isValid === matchesFormat;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Codes with wrong prefix are rejected
   * For any string with a prefix other than "GRO-", validation should fail
   */
  it('should reject codes with wrong prefix', () => {
    // Generate valid suffixes (7 uppercase alphanumeric chars)
    const validSuffixArb = fc.array(
      fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')),
      { minLength: 7, maxLength: 7 }
    ).map(arr => arr.join(''));

    // Generate wrong prefixes (anything but "GRO-")
    const wrongPrefixArb = fc.string({ minLength: 1, maxLength: 5 })
      .filter(s => s !== 'GRO-');

    fc.assert(
      fc.property(
        validSuffixArb,
        wrongPrefixArb,
        (suffix, wrongPrefix) => {
          const invalidCode = wrongPrefix + suffix;
          return isValidListCodeFormat(invalidCode) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Codes with wrong suffix length are rejected
   * For any code with suffix length != 7, validation should fail
   */
  it('should reject codes with wrong suffix length', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }).filter(n => n !== 7),
        (suffixLength) => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let suffix = '';
          for (let i = 0; i < suffixLength; i++) {
            suffix += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          const invalidCode = 'GRO-' + suffix;
          return isValidListCodeFormat(invalidCode) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Codes with lowercase characters are rejected
   * For any code containing lowercase letters, validation should fail
   */
  it('should reject codes with lowercase characters', () => {
    // Generate 7-char strings with at least one lowercase
    const lowercaseSuffixArb = fc.array(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
      { minLength: 7, maxLength: 7 }
    ).map(arr => arr.join(''))
      .filter(s => /[a-z]/.test(s));

    fc.assert(
      fc.property(
        lowercaseSuffixArb,
        (lowercaseSuffix) => {
          const invalidCode = 'GRO-' + lowercaseSuffix;
          return isValidListCodeFormat(invalidCode) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Codes with special characters are rejected
   * For any code containing special characters in suffix, validation should fail
   */
  it('should reject codes with special characters in suffix', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 7, maxLength: 7 })
          .filter(s => /[^A-Z0-9]/.test(s)), // Contains non-alphanumeric
        (specialSuffix) => {
          const invalidCode = 'GRO-' + specialSuffix;
          return isValidListCodeFormat(invalidCode) === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
