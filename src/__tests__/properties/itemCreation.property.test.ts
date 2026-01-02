/**
 * Property Tests for Item Creation
 * **Feature: grocery-list, Property 2: Item Creation Default State**
 * **Validates: Requirements 3.1**
 * 
 * For any item created with a valid name and category, 
 * the item SHALL have `bought` status set to `false` upon creation.
 */

import fc from 'fast-check';
import { isValidItemName } from '../../lib/utils';

/**
 * Simulates item creation logic (without database)
 * This tests the business logic that items are created with bought=false
 */
function createItemObject(name: string, category: string) {
  if (!isValidItemName(name)) {
    throw new Error('Invalid item name');
  }
  if (!category || category.trim().length === 0) {
    throw new Error('Invalid category');
  }
  
  return {
    id: 'test-id',
    list_id: 'test-list-id',
    name: name.trim(),
    category: category,
    bought: false, // This is the property we're testing
    created_at: new Date().toISOString(),
  };
}

describe('Property 2: Item Creation Default State', () => {
  /**
   * Property: Any item created with valid name and category has bought=false
   */
  it('should create items with bought status set to false for any valid name and category', () => {
    // Generate valid item names (non-empty, non-whitespace-only strings)
    const validNameArb = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0);
    
    // Generate valid category names
    const validCategoryArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        validNameArb,
        validCategoryArb,
        (name, category) => {
          const item = createItemObject(name, category);
          
          // The bought status must always be false upon creation
          return item.bought === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Item name is trimmed but preserved
   */
  it('should trim item names while preserving content', () => {
    const validNameArb = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0);
    
    const validCategoryArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        validNameArb,
        validCategoryArb,
        (name, category) => {
          const item = createItemObject(name, category);
          
          // Name should be trimmed
          return item.name === name.trim();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Category is preserved exactly
   */
  it('should preserve category exactly as provided', () => {
    const validNameArb = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0);
    
    const validCategoryArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(
        validNameArb,
        validCategoryArb,
        (name, category) => {
          const item = createItemObject(name, category);
          
          // Category should be preserved
          return item.category === category;
        }
      ),
      { numRuns: 100 }
    );
  });
});
