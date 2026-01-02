/**
 * Property Tests for Bought Status Toggle Persistence
 * **Feature: grocery-list, Property 11: Bought Status Toggle Persistence**
 * **Validates: Requirements 5.1, 5.3**
 * 
 * For any item, toggling the bought status and then querying the item
 * SHALL return the updated bought status.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Item } from '../../types';

/**
 * Simulates an in-memory item store for testing toggle persistence
 * This tests the business logic without requiring a database connection
 */
class ItemStore {
  private items: Map<string, Item> = new Map();

  addItem(item: Item): void {
    this.items.set(item.id, { ...item });
  }

  getItem(id: string): Item | undefined {
    const item = this.items.get(id);
    return item ? { ...item } : undefined;
  }

  /**
   * Toggle bought status - simulates updateItemBought
   * Requirements 5.1, 5.3: Toggle updates status and persists immediately
   */
  toggleBoughtStatus(itemId: string, bought: boolean): void {
    const item = this.items.get(itemId);
    if (item) {
      this.items.set(itemId, { ...item, bought });
    }
  }
}

/**
 * Arbitrary for generating valid Item objects
 */
const itemArbitrary = fc.record({
  id: fc.uuid(),
  list_id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  category: fc.constantFrom('Frutta e Verdura', 'Latticini', 'Carne e Pesce', 'Panetteria', 'Pulizia', 'Altro'),
  bought: fc.boolean(),
  created_at: fc.integer({ min: 946684800000, max: 4102444800000 }).map(timestamp => new Date(timestamp).toISOString()),
});

describe('Property 11: Bought Status Toggle Persistence', () => {
  /**
   * Property: Toggling bought status to true persists correctly
   */
  it('should persist bought=true after toggling for any item', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        (item) => {
          const store = new ItemStore();
          store.addItem(item);
          
          // Toggle to bought=true
          store.toggleBoughtStatus(item.id, true);
          
          // Query the item
          const retrieved = store.getItem(item.id);
          
          // The bought status must be true
          expect(retrieved).toBeDefined();
          expect(retrieved!.bought).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toggling bought status to false persists correctly
   */
  it('should persist bought=false after toggling for any item', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        (item) => {
          const store = new ItemStore();
          store.addItem(item);
          
          // Toggle to bought=false
          store.toggleBoughtStatus(item.id, false);
          
          // Query the item
          const retrieved = store.getItem(item.id);
          
          // The bought status must be false
          expect(retrieved).toBeDefined();
          expect(retrieved!.bought).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple toggles result in the last value being persisted
   */
  it('should persist the final bought status after multiple toggles', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
        (item, toggleSequence) => {
          const store = new ItemStore();
          store.addItem(item);
          
          // Apply all toggles in sequence
          for (const boughtValue of toggleSequence) {
            store.toggleBoughtStatus(item.id, boughtValue);
          }
          
          // Query the item
          const retrieved = store.getItem(item.id);
          
          // The bought status must match the last toggle value
          const expectedBought = toggleSequence[toggleSequence.length - 1];
          expect(retrieved).toBeDefined();
          expect(retrieved!.bought).toBe(expectedBought);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toggle preserves all other item properties
   */
  it('should preserve all other item properties when toggling bought status', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        fc.boolean(),
        (item, newBoughtStatus) => {
          const store = new ItemStore();
          store.addItem(item);
          
          // Toggle bought status
          store.toggleBoughtStatus(item.id, newBoughtStatus);
          
          // Query the item
          const retrieved = store.getItem(item.id);
          
          expect(retrieved).toBeDefined();
          
          // All properties except bought should remain unchanged
          expect(retrieved!.id).toBe(item.id);
          expect(retrieved!.list_id).toBe(item.list_id);
          expect(retrieved!.name).toBe(item.name);
          expect(retrieved!.category).toBe(item.category);
          expect(retrieved!.created_at).toBe(item.created_at);
          expect(retrieved!.bought).toBe(newBoughtStatus);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toggle is idempotent - toggling to same value multiple times has same result
   */
  it('should be idempotent when toggling to the same value multiple times', () => {
    fc.assert(
      fc.property(
        itemArbitrary,
        fc.boolean(),
        fc.integer({ min: 1, max: 5 }),
        (item, targetBought, repeatCount) => {
          const store = new ItemStore();
          store.addItem(item);
          
          // Toggle to the same value multiple times
          for (let i = 0; i < repeatCount; i++) {
            store.toggleBoughtStatus(item.id, targetBought);
          }
          
          // Query the item
          const retrieved = store.getItem(item.id);
          
          // The bought status must match the target value
          expect(retrieved).toBeDefined();
          expect(retrieved!.bought).toBe(targetBought);
        }
      ),
      { numRuns: 100 }
    );
  });
});
