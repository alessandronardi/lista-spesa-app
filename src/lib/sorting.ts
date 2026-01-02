/**
 * Sorting utilities for the Grocery List application
 * Requirements: 4.2, 4.3, 4.4, 5.4
 */

import type { Item, Category } from '../types';

/**
 * Sorts items within a category: unbought items before bought items
 * Requirement 5.4: Show unbought items before bought items
 * 
 * @param items - Array of items to sort
 * @returns Sorted array with unbought items first, then by created_at within each group
 */
export function sortItemsWithinCategory(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    // Unbought items (bought=false) come first
    if (a.bought !== b.bought) {
      return a.bought ? 1 : -1;
    }
    // Within same bought status, sort by created_at
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

/**
 * Represents a category with its associated items
 */
export interface CategoryWithItems {
  category: Category;
  items: Item[];
}

/**
 * Groups items by category and returns sorted category groups
 * Requirements: 4.2, 4.3, 4.4
 * 
 * - Groups items by their category name
 * - Filters out empty categories (Requirement 4.3)
 * - Orders: default categories first by display_order, then custom alphabetically (Requirement 4.4)
 * 
 * @param items - Array of all items
 * @param categories - Array of all categories
 * @returns Array of CategoryWithItems, sorted and filtered
 */
export function groupItemsByCategory(
  items: Item[],
  categories: Category[]
): CategoryWithItems[] {
  // Create a map of category name to items
  const itemsByCategory = new Map<string, Item[]>();
  
  for (const item of items) {
    const existing = itemsByCategory.get(item.category) || [];
    existing.push(item);
    itemsByCategory.set(item.category, existing);
  }

  // Filter categories to only those with items (Requirement 4.3)
  const categoriesWithItems = categories.filter(
    (cat) => itemsByCategory.has(cat.name) && itemsByCategory.get(cat.name)!.length > 0
  );

  // Sort categories: defaults first by display_order, then custom alphabetically (Requirement 4.4)
  const sortedCategories = sortCategories(categoriesWithItems);

  // Build the result array
  return sortedCategories.map((category) => ({
    category,
    items: itemsByCategory.get(category.name) || [],
  }));
}

/**
 * Sorts categories: default categories first by display_order, then custom alphabetically
 * Requirement 4.4
 * 
 * @param categories - Array of categories to sort
 * @returns Sorted array of categories
 */
export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    // Default categories come first
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    
    // Both default: sort by display_order
    if (a.is_default && b.is_default) {
      return a.display_order - b.display_order;
    }
    
    // Both custom: sort alphabetically
    return a.name.localeCompare(b.name);
  });
}
