/**
 * Property-Based Test: Item Sorting Within Category
 * **Feature: grocery-list, Property 7: Item Sorting Within Category**
 * **Validates: Requirements 5.4**
 * 
 * Property: For any category containing both bought and unbought items,
 * when displaying items, all unbought items SHALL appear before all bought items.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortItemsWithinCategory } from '../../lib/sorting';
import type { Item } from '../../types';

/**
 * Arbitrary for generating valid Item objects
 */
const itemArbitrary = fc.record({
  id: fc.uuid(),
  list_id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  category: fc.string({ minLength: 1, maxLength: 50 }),
  bought: fc.boolean(),
  created_at: fc.integer({ min: 1577836800000, max: 1893456000000 }) // 2020-01-01 to 2030-01-01
    .map(ts => new Date(ts).toISOString()),
});

/**
 * Arbitrary for generating arrays of items with mixed bought status
 */
const mixedItemsArbitrary = fc.array(itemArbitrary, { minLength: 2, maxLength: 50 })
  .filter(items => {
    // Ensure we have at least one bought and one unbought item
    const hasBought = items.some(item => item.bought);
    const hasUnbought = items.some(item => !item.bought);
    return hasBought && hasUnbought;
  });

describe('Property 7: Item Sorting Within Category', () => {
  it('should place all unbought items before all bought items', () => {
    fc.assert(
      fc.property(mixedItemsArbitrary, (items) => {
        const sorted = sortItemsWithinCategory(items);
        
        // Find the index of the first bought item
        const firstBoughtIndex = sorted.findIndex(item => item.bought);
        
        // If there are bought items, all items after the first bought item should also be bought
        if (firstBoughtIndex !== -1) {
          for (let i = firstBoughtIndex; i < sorted.length; i++) {
            expect(sorted[i].bought).toBe(true);
          }
        }
        
        // All items before the first bought item should be unbought
        for (let i = 0; i < firstBoughtIndex; i++) {
          expect(sorted[i].bought).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all items (no items lost or duplicated)', () => {
    fc.assert(
      fc.property(fc.array(itemArbitrary, { minLength: 0, maxLength: 50 }), (items) => {
        const sorted = sortItemsWithinCategory(items);
        
        // Same length
        expect(sorted.length).toBe(items.length);
        
        // All original items are present
        const originalIds = new Set(items.map(item => item.id));
        const sortedIds = new Set(sorted.map(item => item.id));
        expect(sortedIds).toEqual(originalIds);
      }),
      { numRuns: 100 }
    );
  });

  it('should not modify the original array', () => {
    fc.assert(
      fc.property(fc.array(itemArbitrary, { minLength: 1, maxLength: 20 }), (items) => {
        const originalItems = items.map(item => ({ ...item }));
        sortItemsWithinCategory(items);
        
        // Original array should be unchanged
        expect(items).toEqual(originalItems);
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain relative order within bought/unbought groups by created_at', () => {
    fc.assert(
      fc.property(mixedItemsArbitrary, (items) => {
        const sorted = sortItemsWithinCategory(items);
        
        // Check unbought items are sorted by created_at
        const unboughtItems = sorted.filter(item => !item.bought);
        for (let i = 1; i < unboughtItems.length; i++) {
          const prevTime = new Date(unboughtItems[i - 1].created_at).getTime();
          const currTime = new Date(unboughtItems[i].created_at).getTime();
          expect(currTime).toBeGreaterThanOrEqual(prevTime);
        }
        
        // Check bought items are sorted by created_at
        const boughtItems = sorted.filter(item => item.bought);
        for (let i = 1; i < boughtItems.length; i++) {
          const prevTime = new Date(boughtItems[i - 1].created_at).getTime();
          const currTime = new Date(boughtItems[i].created_at).getTime();
          expect(currTime).toBeGreaterThanOrEqual(prevTime);
        }
      }),
      { numRuns: 100 }
    );
  });
});
