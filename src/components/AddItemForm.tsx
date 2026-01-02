'use client';

/**
 * AddItemForm Component
 * Form for adding new items with name input and category selector
 * Requirements: 3.1, 3.2, 3.3, 4.1
 */

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { addItem } from '@/lib/api/items';
import { isValidItemName } from '@/lib/utils';
import type { Category, Item } from '@/types';
import {
  BUTTON_LABELS,
  PLACEHOLDERS,
  ERROR_MESSAGES,
  ARIA_LABELS,
} from '@/lib/constants';

interface AddItemFormProps {
  listId: string;
  categories: Category[];
  onItemAdded: (item: Item) => void;
}

export default function AddItemForm({
  listId,
  categories,
  onItemAdded,
}: AddItemFormProps) {
  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Requirement 3.2: Validate item name
    if (!isValidItemName(itemName)) {
      setError(ERROR_MESSAGES.EMPTY_ITEM_NAME);
      return;
    }

    // Requirement 3.3: Validate category selection
    if (!selectedCategory) {
      setError(ERROR_MESSAGES.SELECT_CATEGORY);
      return;
    }

    setIsSubmitting(true);

    try {
      // Requirement 3.1: Add item with bought status false
      const newItem = await addItem(listId, itemName.trim(), selectedCategory);
      onItemAdded(newItem);
      setItemName('');
      // Keep category selected for convenience
    } catch (err) {
      setError(ERROR_MESSAGES.ITEM_ADD_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort categories: defaults first by display_order, then custom alphabetically
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.is_default && b.is_default) {
      return a.display_order - b.display_order;
    }
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Item Name Input */}
        <input
          type="text"
          value={itemName}
          onChange={(e) => {
            setItemName(e.target.value);
            setError(null);
          }}
          placeholder={PLACEHOLDERS.ITEM_NAME}
          disabled={isSubmitting}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          aria-label={ARIA_LABELS.ITEM_INPUT}
        />

        <div className="flex gap-2">
          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setError(null);
            }}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-48 sm:flex-none"
            aria-label={ARIA_LABELS.CATEGORY_SELECTOR}
          >
            <option value="">Categoria...</option>
            {sortedCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !itemName.trim()}
            className="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={BUTTON_LABELS.ADD_ITEM}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
