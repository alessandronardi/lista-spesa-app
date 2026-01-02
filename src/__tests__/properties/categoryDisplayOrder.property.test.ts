/**
 * Property-Based Test: Category Display Order
 * **Feature: grocery-list, Property 9: Category Display Order**
 * **Validates: Requirements 4.4**
 * 
 * Property: For any list with both default and custom categories containing items,
 * default categories SHALL appear before custom categories, and custom categories
 * SHALL be sorted alphabetically.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { groupItemsByCategory, sortCategories } from '../../lib/sorting';
import type { Item, Category } from '../../types';

/**
 * Arbitrary for generating default categories
 */
const defaultCategoryArbitrary = fc.record({
  id: fc.uuid(),
  list_id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  is_default: fc.constant(true),
  display_order: fc.integer({ min: 1, max: 10 }),
  created_at: fc.integer({ min: 1577836800000, max: 1893456000000 })
    .map(ts => new Date(ts).toISOString()),
});

/**
 * Arbitrary for generating custom categories
 */
const customCategoryArbitrary = fc.record({
  id: fc.uuid(),
  list_id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  is_default: fc.constant(false),
  display_order: fc.integer({ min: 100, max: 200 }),
  created_at: fc.integer({ min: 1577836800000, max: 1893456000000 })
    .map(ts => new Date(ts).toISOString()),
});

/**
 * Arbitrary for generating a mix of default and custom categories with unique names
 */
const mixedCategoriesArbitrary = fc.tuple(
  fc.array(defaultCategoryArbitrary, { minLength: 1, maxLength: 5 }),
  fc.array(customCategoryArbitrary, { minLength: 1, maxLength: 5 })
).map(([defaults, customs]) => {
  // Ensure unique names across all categories
  const seen = new Set<string>();
  const allCats = [...defaults, ...customs];
  return allCats.filter(cat => {
    const lower = cat.name.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}).filter(cats => {
  // Ensure we have at least one default and one custom
  const hasDefault = cats.some(c => c.is_default);
  const hasCustom = cats.some(c => !c.is_default);
  return hasDefault && hasCustom;
});

/**
 * Arbitrary for generating items that belong to given categories
 */
const itemsForCategoriesArbitrary = (categories: Category[]) => {
  if (categories.length === 0) {
    return fc.constant([] as Item[]);
  }
  
  const categoryNames = categories.map(c => c.name);
  const listId = categories[0].list_id;
  
  // Generate at least one item per category to ensure all categories appear
  return fc.tuple(
    ...categoryNames.map(catName => 
      fc.record({
        id: fc.uuid(),
        list_id: fc.constant(listId),
        name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        category: fc.constant(catName),
        bought: fc.boolean(),
        created_at: fc.integer({ min: 1577836800000, max: 1893456000000 })
          .map(ts => new Date(ts).toISOString()),
      })
    )
  );
};

describe('Property 9: Category Display Order', () => {
  it('should place all default categories before all custom categories', () => {
    fc.assert(
      fc.property(
        mixedCategoriesArbitrary.chain(cats => 
          itemsForCategoriesArbitrary(cats).map(items => ({ categories: cats, items }))
        ),
        ({ categories, items }) => {
          const grouped = groupItemsByCategory(items, categories);
          
          // Find the index of the first custom category
          const firstCustomIndex = grouped.findIndex(g => !g.category.is_default);
          
          if (firstCustomIndex !== -1) {
            // All categories before the first custom should be default
            for (let i = 0; i < firstCustomIndex; i++) {
              expect(grouped[i].category.is_default).toBe(true);
            }
            
            // All categories from the first custom onwards should be custom
            for (let i = firstCustomIndex; i < grouped.length; i++) {
              expect(grouped[i].category.is_default).toBe(false);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sort default categories by display_order', () => {
    fc.assert(
      fc.property(
        mixedCategoriesArbitrary.chain(cats => 
          itemsForCategoriesArbitrary(cats).map(items => ({ categories: cats, items }))
        ),
        ({ categories, items }) => {
          const grouped = groupItemsByCategory(items, categories);
          
          // Get only default categories from the result
          const defaultGroups = grouped.filter(g => g.category.is_default);
          
          // Check they are sorted by display_order
          for (let i = 1; i < defaultGroups.length; i++) {
            expect(defaultGroups[i].category.display_order)
              .toBeGreaterThanOrEqual(defaultGroups[i - 1].category.display_order);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sort custom categories alphabetically by name', () => {
    fc.assert(
      fc.property(
        mixedCategoriesArbitrary.chain(cats => 
          itemsForCategoriesArbitrary(cats).map(items => ({ categories: cats, items }))
        ),
        ({ categories, items }) => {
          const grouped = groupItemsByCategory(items, categories);
          
          // Get only custom categories from the result
          const customGroups = grouped.filter(g => !g.category.is_default);
          
          // Check they are sorted alphabetically
          for (let i = 1; i < customGroups.length; i++) {
            const comparison = customGroups[i - 1].category.name
              .localeCompare(customGroups[i].category.name);
            expect(comparison).toBeLessThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sortCategories should maintain the same ordering properties', () => {
    fc.assert(
      fc.property(mixedCategoriesArbitrary, (categories) => {
        const sorted = sortCategories(categories);
        
        // Find the index of the first custom category
        const firstCustomIndex = sorted.findIndex(c => !c.is_default);
        
        if (firstCustomIndex !== -1) {
          // All before first custom should be default
          for (let i = 0; i < firstCustomIndex; i++) {
            expect(sorted[i].is_default).toBe(true);
          }
          
          // All from first custom onwards should be custom
          for (let i = firstCustomIndex; i < sorted.length; i++) {
            expect(sorted[i].is_default).toBe(false);
          }
        }
        
        // Default categories should be sorted by display_order
        const defaults = sorted.filter(c => c.is_default);
        for (let i = 1; i < defaults.length; i++) {
          expect(defaults[i].display_order).toBeGreaterThanOrEqual(defaults[i - 1].display_order);
        }
        
        // Custom categories should be sorted alphabetically
        const customs = sorted.filter(c => !c.is_default);
        for (let i = 1; i < customs.length; i++) {
          expect(customs[i - 1].name.localeCompare(customs[i].name)).toBeLessThanOrEqual(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
