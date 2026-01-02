'use client';

/**
 * GroceryItem Component
 * Displays a single grocery item with checkbox and delete button
 * Requirements: 5.1, 5.2, 2.2 (Error Handling)
 */

import { useState } from 'react';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import { updateItemBought, deleteItem } from '@/lib/api/items';
import type { Item } from '@/types';
import { ARIA_LABELS, ERROR_MESSAGES } from '@/lib/constants';

interface GroceryItemProps {
  item: Item;
  onItemUpdated: (item: Item) => void;
  onItemDeleted: (itemId: string) => void;
}

export default function GroceryItem({
  item,
  onItemUpdated,
  onItemDeleted,
}: GroceryItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleBought = async () => {
    if (isUpdating || isDeleting) return;
    
    setIsUpdating(true);
    setError(null);
    const newBoughtStatus = !item.bought;

    try {
      // Requirement 5.1: Update bought status in database
      await updateItemBought(item.id, newBoughtStatus);
      onItemUpdated({ ...item, bought: newBoughtStatus });
    } catch {
      // Show Italian error message
      setError(ERROR_MESSAGES.ITEM_UPDATE_FAILED);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isUpdating || isDeleting) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      await deleteItem(item.id);
      onItemDeleted(item.id);
    } catch {
      // Show Italian error message
      setError(ERROR_MESSAGES.ITEM_DELETE_FAILED);
      setIsDeleting(false);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all sm:gap-3 sm:px-4 sm:py-3 ${
        item.bought
          ? 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      } ${error ? 'border-red-300 dark:border-red-700' : ''}`}
    >
      {/* Checkbox - larger touch target on mobile */}
      <button
        onClick={handleToggleBought}
        disabled={isUpdating || isDeleting}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors sm:h-6 sm:w-6 ${
          item.bought
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-gray-300 hover:border-emerald-500 dark:border-gray-600'
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label={ARIA_LABELS.TOGGLE_BOUGHT}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : item.bought ? (
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : null}
      </button>

      {/* Item Name - Requirement 5.2: Strikethrough when bought */}
      <span
        className={`flex-1 text-sm transition-all sm:text-base ${
          item.bought
            ? 'text-gray-400 line-through dark:text-gray-500'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {item.name}
      </span>

      {/* Delete Button - always visible on mobile, hover on desktop */}
      <button
        onClick={handleDelete}
        disabled={isUpdating || isDeleting}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 sm:h-8 sm:w-8 sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20"
        aria-label={ARIA_LABELS.DELETE_ITEM}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

      {/* Error Indicator */}
      {error && (
        <div className="absolute -top-2 right-0 flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-3 w-3" />
          <span className="hidden sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
}
