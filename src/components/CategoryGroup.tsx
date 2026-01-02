'use client';

/**
 * CategoryGroup Component
 * Displays a category section with header and sorted item list
 * Requirements: 4.2, 5.4
 */

import {
  Apple,
  Milk,
  Fish,
  Croissant,
  Sparkles,
  Package,
  Tag,
} from 'lucide-react';
import GroceryItem from './GroceryItem';
import { sortItemsWithinCategory } from '@/lib/sorting';
import type { Item, Category } from '@/types';
import { CATEGORY_NAMES } from '@/lib/constants';

/**
 * Returns the appropriate icon for a category
 */
function getCategoryIcon(categoryName: string) {
  const iconClass = 'h-5 w-5';
  
  switch (categoryName) {
    case CATEGORY_NAMES.FRUIT_VEG:
      return <Apple className={iconClass} />;
    case CATEGORY_NAMES.DAIRY:
      return <Milk className={iconClass} />;
    case CATEGORY_NAMES.MEAT_FISH:
      return <Fish className={iconClass} />;
    case CATEGORY_NAMES.BAKERY:
      return <Croissant className={iconClass} />;
    case CATEGORY_NAMES.CLEANING:
      return <Sparkles className={iconClass} />;
    case CATEGORY_NAMES.OTHER:
      return <Package className={iconClass} />;
    default:
      return <Tag className={iconClass} />;
  }
}

interface CategoryGroupProps {
  category: Category;
  items: Item[];
  onItemUpdated: (item: Item) => void;
  onItemDeleted: (itemId: string) => void;
}

export default function CategoryGroup({
  category,
  items,
  onItemUpdated,
  onItemDeleted,
}: CategoryGroupProps) {
  // Requirement 5.4: Sort unbought items before bought items
  const sortedItems = sortItemsWithinCategory(items);

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Category Header */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span className="text-emerald-600 dark:text-emerald-400">
          {getCategoryIcon(category.name)}
        </span>
        <h2 className="text-base font-semibold sm:text-lg">{category.name}</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500 sm:text-sm">
          ({items.length})
        </span>
      </div>

      {/* Items List */}
      <div className="space-y-1.5 pl-5 sm:space-y-2 sm:pl-7">
        {sortedItems.map((item) => (
          <GroceryItem
            key={item.id}
            item={item}
            onItemUpdated={onItemUpdated}
            onItemDeleted={onItemDeleted}
          />
        ))}
      </div>
    </div>
  );
}
