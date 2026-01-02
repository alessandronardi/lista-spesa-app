/**
 * Property-Based Test: Category Grouping Correctness
 * **Feature: grocery-list, Property 8: Category Grouping Correctness**
 * **Validates: Requirements 4.2**
 * 
 * Property: For any list with items in multiple categories, each item SHALL appear
 * exactly once and SHALL be grouped with other items of the same category.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { groupItemsByCategory } from '../../lib/sorting';
import type { Item, Category } from '../../types';

/**
 * Arbitrary for generating a list of categories with unique names
 */
const categoriesArbitrary = fc.array(
  fc.record({
    id: fc.uuid(),
    list_id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    is_default: fc.boolean(),
    display_order: fc.integer({ min: 1, max: 100 }),
    created_at: fc.integer({ min: 1577836800000, max: 1893456000000 })
      .map(ts => new Date(ts).toISOString()),
  }),
  { minLength: 1, maxLength: 10 }
).map(cats => {
  // Ensure unique names
  const seen = new Set<string>();
  return cats.filter(cat => {
    const lower = cat.name.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}).filter(cats => cats.length > 0);

/**
 * Arbitrary for generating items that belong to given categories
 */
const itemsForCategoriesArbitrary = (categories: Category[]) => {
  if (categories.length === 0) {
    return fc.constant([] as Item[]);
  }
  
  const categoryNames = categories.map(c => c.name);
  const listId = categories[0].list_id;
  
  return fc.array(
    fc.record({
      id: fc.uuid(),
      list_id: fc.constant(listId),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      category: fc.constantFrom(...categoryNames),
      bought: fc.boolean(),
      created_at: fc.integer({ min: 1577836800000, max: 1893456000000 })
        .map(ts => new Date(ts).toISOString()),
    }),
    { minLength: 0, maxLength: 30 }
  );
};

describe('Property 8: Category Grouping Correctness', () => {
  it('should include each item exactly once in the grouped result', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary.chain(cats => 
          itemsForCategoriesArbitrary(cats).map(items => ({ categories: cats, items }))
        ),
        ({ categories, items }) => {
          const grouped = groupItemsByCategory(items, categories);
          
          // Collect all items from grouped result
          const groupedItems: Item[] = [];
          for (const group of grouped) {
            groupedItems.push(...group.items);
          }
          
          // Each item should appear exactly once
          const originalIds = items.map(item => item.id).sort();
          const groupedIds = groupedItems.map(item => item.id).sort();
          
          expect(groupedIds).toEqual(originalIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should group items with the same category together', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary.chain(cats => 
          itemsForCategoriesArbitrary(cats).map(items => ({ categories: cats, items }))
        ),
        ({ categories, items }) => {
          const grouped = groupItemsByCategory(items, categories);
          
          // Each group should only contain items of that category
          for (const group of grouped) {
            for (const item of group.items) {
              expect(item.category).toBe(group.category.name);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not include empty categories in the result', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary.chain(cats => 
          itemsForCategoriesArbitrary(cats).map(items => ({ categories: cats, items }))
        ),
        ({ categories, items }) => {
          const grouped = groupItemsByCategory(items, categories);
          
          // No group should have zero items
          for (const group of grouped) {
            expect(group.items.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include all categories that have items', () => {
    fc.assert(
      fc.property(
        categoriesArbitrary.chain(cats => 
          itemsForCategoriesArbitrary(cats).map(items => ({ categories: cats, items }))
        ),
        ({ categories, items }) => {
          const grouped = groupItemsByCategory(items, categories);
          
          // Find all category names that have items
          const categoriesWithItems = new Set(items.map(item => item.category));
          
          // Find all category names in the grouped result
          const groupedCategoryNames = new Set(grouped.map(g => g.category.name));
          
          // Every category with items should be in the grouped result
          for (const catName of categoriesWithItems) {
            expect(groupedCategoryNames.has(catName)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
