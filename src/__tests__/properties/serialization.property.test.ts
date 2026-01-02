/**
 * Property-Based Tests for Item Serialization
 * 
 * **Feature: grocery-list, Property 10: Item Serialization Round-Trip**
 * **Validates: Requirements 7.6, 7.7**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { serializeItem, deserializeItem, serializeItems, deserializeItems } from '../../lib/utils';
import type { Item } from '../../types';

// Arbitrary for generating valid Item objects
// Using integer timestamps to avoid invalid date issues
const validDateArb = fc.integer({ 
  min: new Date('2000-01-01').getTime(), 
  max: new Date('2100-01-01').getTime() 
}).map(ts => new Date(ts).toISOString());

const itemArbitrary = fc.record({
  id: fc.uuid(),
  list_id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 255 }),
  category: fc.string({ minLength: 1, maxLength: 100 }),
  bought: fc.boolean(),
  created_at: validDateArb,
});

describe('Item Serialization Properties', () => {
  /**
   * Property 10: Item Serialization Round-Trip
   * *For any* valid item object, serializing to JSON and then deserializing back 
   * SHALL produce an equivalent item object.
   */
  it('should round-trip single item through serialization/deserialization', () => {
    fc.assert(
      fc.property(itemArbitrary, (item: Item) => {
        const serialized = serializeItem(item);
        const deserialized = deserializeItem(serialized);
        
        // All properties should be preserved
        expect(deserialized.id).toBe(item.id);
        expect(deserialized.list_id).toBe(item.list_id);
        expect(deserialized.name).toBe(item.name);
        expect(deserialized.category).toBe(item.category);
        expect(deserialized.bought).toBe(item.bought);
        expect(deserialized.created_at).toBe(item.created_at);
      }),
      { numRuns: 100 }
    );
  });

  it('should round-trip array of items through serialization/deserialization', () => {
    fc.assert(
      fc.property(fc.array(itemArbitrary, { minLength: 0, maxLength: 50 }), (items: Item[]) => {
        const serialized = serializeItems(items);
        const deserialized = deserializeItems(serialized);
        
        // Array length should be preserved
        expect(deserialized.length).toBe(items.length);
        
        // Each item should be equivalent
        for (let i = 0; i < items.length; i++) {
          expect(deserialized[i].id).toBe(items[i].id);
          expect(deserialized[i].list_id).toBe(items[i].list_id);
          expect(deserialized[i].name).toBe(items[i].name);
          expect(deserialized[i].category).toBe(items[i].category);
          expect(deserialized[i].bought).toBe(items[i].bought);
          expect(deserialized[i].created_at).toBe(items[i].created_at);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should produce valid JSON when serializing', () => {
    fc.assert(
      fc.property(itemArbitrary, (item: Item) => {
        const serialized = serializeItem(item);
        
        // Should be valid JSON
        expect(() => JSON.parse(serialized)).not.toThrow();
        
        // Parsed JSON should have all expected keys
        const parsed = JSON.parse(serialized);
        expect(parsed).toHaveProperty('id');
        expect(parsed).toHaveProperty('list_id');
        expect(parsed).toHaveProperty('name');
        expect(parsed).toHaveProperty('category');
        expect(parsed).toHaveProperty('bought');
        expect(parsed).toHaveProperty('created_at');
      }),
      { numRuns: 100 }
    );
  });
});
