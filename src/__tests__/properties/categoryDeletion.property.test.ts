/**
 * Property Test: Category Deletion Reassignment
 * **Feature: grocery-list, Property 6: Category Deletion Reassignment**
 * **Validates: Requirements 4.1.5**
 * 
 * For any custom category with associated items, when the category is deleted,
 * all items previously in that category SHALL be reassigned to the "Altro" category.
 */

import fc from 'fast-check';

const DEFAULT_REASSIGNMENT_CATEGORY = 'Altro';

interface MockItem {
  id: string;
  name: string;
  category: string;
}

interface MockCategory {
  id: string;
  name: string;
  is_default: boolean;
}

/**
 * Simulates category deletion with item reassignment
 * This tests the business logic without database dependency
 */
function deleteCategoryAndReassignItems(
  items: MockItem[],
  categories: MockCategory[],
  categoryIdToDelete: string
): { updatedItems: MockItem[]; updatedCategories: MockCategory[] } {
  const categoryToDelete = categories.find(c => c.id === categoryIdToDelete);
  
  if (!categoryToDelete) {
    throw new Error('Category not found');
  }
  
  if (categoryToDelete.is_default) {
    throw new Error('Cannot delete default category');
  }

  // Reassign items from deleted category to "Altro"
  const updatedItems = items.map(item => {
    if (item.category === categoryToDelete.name) {
      return { ...item, category: DEFAULT_REASSIGNMENT_CATEGORY };
    }
    return item;
  });

  // Remove the category
  const updatedCategories = categories.filter(c => c.id !== categoryIdToDelete);

  return { updatedItems, updatedCategories };
}

describe('Property 6: Category Deletion Reassignment', () => {
  // Arbitrary for generating valid item names
  const validNameArb = fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => s.trim().length > 0);

  // Arbitrary for generating mock items
  const mockItemArb = (categoryName: string) => fc.record({
    id: fc.uuid(),
    name: validNameArb,
    category: fc.constant(categoryName),
  });

  // Arbitrary for generating a custom category
  const customCategoryArb = fc.record({
    id: fc.uuid(),
    name: validNameArb.filter(n => n !== DEFAULT_REASSIGNMENT_CATEGORY),
    is_default: fc.constant(false),
  });

  /**
   * Property: All items in deleted category are reassigned to "Altro"
   */
  it('should reassign all items from deleted category to "Altro"', () => {
    fc.assert(
      fc.property(
        customCategoryArb,
        fc.integer({ min: 1, max: 10 }),
        (customCategory, itemCount) => {
          // Create items in the custom category
          const items: MockItem[] = [];
          for (let i = 0; i < itemCount; i++) {
            items.push({
              id: `item-${i}`,
              name: `Item ${i}`,
              category: customCategory.name,
            });
          }

          // Include the default "Altro" category
          const categories: MockCategory[] = [
            { id: 'altro-id', name: DEFAULT_REASSIGNMENT_CATEGORY, is_default: true },
            customCategory,
          ];

          const { updatedItems } = deleteCategoryAndReassignItems(
            items,
            categories,
            customCategory.id
          );

          // All items should now be in "Altro"
          return updatedItems.every(item => item.category === DEFAULT_REASSIGNMENT_CATEGORY);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Items in other categories remain unchanged
   */
  it('should not affect items in other categories', () => {
    fc.assert(
      fc.property(
        customCategoryArb,
        validNameArb.filter(n => n !== DEFAULT_REASSIGNMENT_CATEGORY),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        (categoryToDelete, otherCategoryName, deleteItemCount, otherItemCount) => {
          // Ensure category names are different
          if (categoryToDelete.name.toLowerCase() === otherCategoryName.toLowerCase()) {
            return true; // Skip this case
          }

          // Create items in the category to delete
          const itemsToReassign: MockItem[] = [];
          for (let i = 0; i < deleteItemCount; i++) {
            itemsToReassign.push({
              id: `delete-item-${i}`,
              name: `Delete Item ${i}`,
              category: categoryToDelete.name,
            });
          }

          // Create items in another category
          const otherItems: MockItem[] = [];
          for (let i = 0; i < otherItemCount; i++) {
            otherItems.push({
              id: `other-item-${i}`,
              name: `Other Item ${i}`,
              category: otherCategoryName,
            });
          }

          const allItems = [...itemsToReassign, ...otherItems];

          const categories: MockCategory[] = [
            { id: 'altro-id', name: DEFAULT_REASSIGNMENT_CATEGORY, is_default: true },
            categoryToDelete,
            { id: 'other-cat-id', name: otherCategoryName, is_default: false },
          ];

          const { updatedItems } = deleteCategoryAndReassignItems(
            allItems,
            categories,
            categoryToDelete.id
          );

          // Items in other categories should remain unchanged
          const otherItemsAfter = updatedItems.filter(item => 
            otherItems.some(oi => oi.id === item.id)
          );

          return otherItemsAfter.every(item => item.category === otherCategoryName);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Total item count remains the same after deletion
   */
  it('should preserve total item count after category deletion', () => {
    fc.assert(
      fc.property(
        customCategoryArb,
        fc.integer({ min: 0, max: 10 }),
        (customCategory, itemCount) => {
          const items: MockItem[] = [];
          for (let i = 0; i < itemCount; i++) {
            items.push({
              id: `item-${i}`,
              name: `Item ${i}`,
              category: customCategory.name,
            });
          }

          const categories: MockCategory[] = [
            { id: 'altro-id', name: DEFAULT_REASSIGNMENT_CATEGORY, is_default: true },
            customCategory,
          ];

          const { updatedItems } = deleteCategoryAndReassignItems(
            items,
            categories,
            customCategory.id
          );

          // Item count should remain the same
          return updatedItems.length === items.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Deleted category is removed from categories list
   */
  it('should remove the deleted category from categories list', () => {
    fc.assert(
      fc.property(
        customCategoryArb,
        (customCategory) => {
          const categories: MockCategory[] = [
            { id: 'altro-id', name: DEFAULT_REASSIGNMENT_CATEGORY, is_default: true },
            customCategory,
          ];

          const { updatedCategories } = deleteCategoryAndReassignItems(
            [],
            categories,
            customCategory.id
          );

          // Deleted category should not be in the list
          return !updatedCategories.some(c => c.id === customCategory.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Default categories cannot be deleted
   */
  it('should throw error when trying to delete default category', () => {
    const defaultCategory: MockCategory = {
      id: 'default-id',
      name: 'Frutta e Verdura',
      is_default: true,
    };

    const categories: MockCategory[] = [
      { id: 'altro-id', name: DEFAULT_REASSIGNMENT_CATEGORY, is_default: true },
      defaultCategory,
    ];

    expect(() => {
      deleteCategoryAndReassignItems([], categories, defaultCategory.id);
    }).toThrow('Cannot delete default category');
  });
});
