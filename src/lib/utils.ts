/**
 * Utility functions for the Grocery List application
 * Requirements: 1.1, 1.4, 3.2, 4.1.2, 7.6, 7.7
 */

import type { Item } from '../types';

/**
 * Generates a unique list code in the format GRO-XXXXXXX
 * where X is an alphanumeric uppercase character (A-Z, 0-9)
 */
export function generateListCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GRO-';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validates if a string matches the list code format GRO-XXXXXXX
 */
export function isValidListCodeFormat(code: string): boolean {
  return /^GRO-[A-Z0-9]{7}$/.test(code);
}

/**
 * Serialized item format for JSON storage
 * Requirements: 7.6
 */
export interface SerializedItem {
  id: string;
  list_id: string;
  name: string;
  category: string;
  bought: boolean;
  created_at: string;
}

/**
 * Serializes an Item object to JSON string for database persistence
 * Requirements: 7.6
 */
export function serializeItem(item: Item): string {
  const serialized: SerializedItem = {
    id: item.id,
    list_id: item.list_id,
    name: item.name,
    category: item.category,
    bought: item.bought,
    created_at: item.created_at,
  };
  return JSON.stringify(serialized);
}

/**
 * Deserializes a JSON string back to an Item object
 * Requirements: 7.7
 */
export function deserializeItem(json: string): Item {
  const parsed = JSON.parse(json) as SerializedItem;
  return {
    id: parsed.id,
    list_id: parsed.list_id,
    name: parsed.name,
    category: parsed.category,
    bought: parsed.bought,
    created_at: parsed.created_at,
  };
}

/**
 * Serializes an array of Items to JSON string
 * Requirements: 7.6
 */
export function serializeItems(items: Item[]): string {
  return JSON.stringify(items.map(item => ({
    id: item.id,
    list_id: item.list_id,
    name: item.name,
    category: item.category,
    bought: item.bought,
    created_at: item.created_at,
  })));
}

/**
 * Deserializes a JSON string back to an array of Items
 * Requirements: 7.7
 */
export function deserializeItems(json: string): Item[] {
  const parsed = JSON.parse(json) as SerializedItem[];
  return parsed.map(item => ({
    id: item.id,
    list_id: item.list_id,
    name: item.name,
    category: item.category,
    bought: item.bought,
    created_at: item.created_at,
  }));
}


/**
 * Validates an item name
 * Requirements: 3.2 - Empty names should be rejected
 * 
 * @param name - The item name to validate
 * @returns true if valid, false if invalid (empty or whitespace only)
 */
export function isValidItemName(name: string): boolean {
  return name.trim().length > 0;
}

/**
 * Validates a category name
 * Requirements: 4.1.2 - Empty category names should be rejected
 * 
 * @param name - The category name to validate
 * @returns true if valid, false if invalid (empty or whitespace only)
 */
export function isValidCategoryName(name: string): boolean {
  return name.trim().length > 0;
}
