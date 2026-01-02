'use client';

/**
 * CategoryManager Component
 * UI for adding and deleting custom categories
 * Requirements: 4.1.1, 4.1.2, 4.1.3, 4.1.5
 */

import { useState } from 'react';
import { Plus, Loader2, Tag, X } from 'lucide-react';
import { createCategory, deleteCategory } from '@/lib/api/categories';
import { isValidCategoryName } from '@/lib/utils';
import type { Category } from '@/types';
import {
  BUTTON_LABELS,
  PLACEHOLDERS,
  ERROR_MESSAGES,
  HEADINGS,
  ARIA_LABELS,
} from '@/lib/constants';

interface CategoryManagerProps {
  listId: string;
  categories: Category[];
  onCategoryCreated: (category: Category) => void;
  onCategoryDeleted: (categoryId: string) => void;
}

export default function CategoryManager({
  listId,
  categories,
  onCategoryCreated,
  onCategoryDeleted,
}: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter to show only custom categories
  const customCategories = categories.filter((cat) => !cat.is_default);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Requirement 4.1.2: Validate empty name
    if (!isValidCategoryName(newCategoryName)) {
      setError(ERROR_MESSAGES.EMPTY_CATEGORY_NAME);
      return;
    }

    // Requirement 4.1.3: Check for duplicate names (case-insensitive)
    const normalizedName = newCategoryName.trim().toLowerCase();
    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === normalizedName
    );
    if (isDuplicate) {
      setError(ERROR_MESSAGES.DUPLICATE_CATEGORY);
      return;
    }

    setIsCreating(true);

    try {
      // Requirement 4.1.1, 4.1.4: Create and persist category
      const newCategory = await createCategory(listId, newCategoryName.trim());
      onCategoryCreated(newCategory);
      setNewCategoryName('');
    } catch (err) {
      setError(ERROR_MESSAGES.CATEGORY_CREATE_FAILED);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setDeletingId(categoryId);
    setError(null);

    try {
      // Requirement 4.1.5: Delete category (items reassigned to "Altro" by API)
      await deleteCategory(categoryId, listId);
      onCategoryDeleted(categoryId);
    } catch (err) {
      // Show Italian error message
      setError(ERROR_MESSAGES.CATEGORY_DELETE_FAILED);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
      >
        <Tag className="h-4 w-4" />
        {HEADINGS.MANAGE_CATEGORIES}
        <span className="text-xs text-gray-400">
          ({customCategories.length})
        </span>
      </button>

      {/* Category Manager Panel */}
      {isOpen && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          {/* Add Category Form */}
          <form onSubmit={handleCreateCategory} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setError(null);
              }}
              placeholder={PLACEHOLDERS.CATEGORY_NAME}
              disabled={isCreating}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
              aria-label={ARIA_LABELS.CATEGORY_INPUT}
            />
            <button
              type="submit"
              disabled={isCreating || !newCategoryName.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {BUTTON_LABELS.ADD_CATEGORY}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <p className="mb-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Custom Categories List */}
          {customCategories.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {HEADINGS.CUSTOM_CATEGORIES}
              </h4>
              <ul className="space-y-1">
                {customCategories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-gray-700"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={deletingId === category.id}
                      className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20"
                      aria-label={ARIA_LABELS.DELETE_CATEGORY}
                    >
                      {deletingId === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <Tag className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nessuna categoria personalizzata
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
