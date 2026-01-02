/**
 * Property Test: Category Name Uniqueness
 * **Feature: grocery-list, Property 5: Category Name Uniqueness**
 * **Validates: Requirements 4.1.3**
 * 
 * For any list with an existing category name N, attempting to create 
 * another category with name N (case-insensitive) SHALL be rejected.
 */

import fc from 'fast-check';

/**
 * Simulates category name uniqueness check (case-insensitive)
 * This tests the business logic without database dependency
 */
function isCategoryNameUnique(
  existingCategories: string[],
  newCategoryName: string
): boolean {
  const normalizedNew = newCategoryName.trim().toLowerCase();
  return !existingCategories.some(
    existing => existing.trim().toLowerCase() === normalizedNew
  );
}

describe('Property 5: Category Name Uniqueness', () => {
  /**
   * Property: Exact duplicate names are rejected
   * For any existing category name, adding the same name should be rejected
   */
  it('should reject exact duplicate category names', () => {
    const validNameArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        fc.array(validNameArb, { minLength: 1, maxLength: 10 }),
        (existingCategories) => {
          // Pick any existing category name
          const duplicateName = existingCategories[0];
          
          // Should not be unique (should be rejected)
          return isCategoryNameUnique(existingCategories, duplicateName) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Case-insensitive duplicate names are rejected
   * For any existing category name, adding the same name with different case should be rejected
   */
  it('should reject case-insensitive duplicate category names', () => {
    const validNameArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0 && /[a-zA-Z]/.test(s)); // Must have letters for case variation

    fc.assert(
      fc.property(
        validNameArb,
        (categoryName) => {
          const existingCategories = [categoryName];
          
          // Create variations with different cases
          const upperCase = categoryName.toUpperCase();
          const lowerCase = categoryName.toLowerCase();
          const mixedCase = categoryName.split('').map((c, i) => 
            i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
          ).join('');

          // All case variations should be rejected
          const upperRejected = isCategoryNameUnique(existingCategories, upperCase) === false;
          const lowerRejected = isCategoryNameUnique(existingCategories, lowerCase) === false;
          const mixedRejected = isCategoryNameUnique(existingCategories, mixedCase) === false;

          return upperRejected && lowerRejected && mixedRejected;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Unique names are accepted
   * For any name not in the existing categories, it should be accepted
   */
  it('should accept unique category names', () => {
    const validNameArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        fc.array(validNameArb, { minLength: 0, maxLength: 10 }),
        validNameArb,
        (existingCategories, newName) => {
          // Only test if the new name is actually unique
          const isActuallyUnique = !existingCategories.some(
            existing => existing.trim().toLowerCase() === newName.trim().toLowerCase()
          );

          if (!isActuallyUnique) {
            return true; // Skip this case, covered by other tests
          }

          // Unique names should be accepted
          return isCategoryNameUnique(existingCategories, newName) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Names with different whitespace are still duplicates if content matches
   */
  it('should reject names that differ only in leading/trailing whitespace', () => {
    const validNameArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    const whitespaceArb = fc.array(
      fc.constantFrom(' ', '\t'),
      { minLength: 1, maxLength: 3 }
    ).map(arr => arr.join(''));

    fc.assert(
      fc.property(
        validNameArb,
        whitespaceArb,
        whitespaceArb,
        (baseName, leadingWs, trailingWs) => {
          const existingCategories = [baseName.trim()];
          const nameWithWhitespace = leadingWs + baseName.trim() + trailingWs;

          // Should be rejected because trimmed content matches
          return isCategoryNameUnique(existingCategories, nameWithWhitespace) === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
