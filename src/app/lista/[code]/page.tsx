'use client';

/**
 * ListDashboard Page
 * Main view for a grocery list with full functionality
 * Requirements: 1.3, 4.2, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, RefreshCw, AlertTriangle, Home, ShoppingBasket } from 'lucide-react';
import {
  ListHeader,
  AddItemForm,
  CategoryManager,
  CategoryGroup,
} from '@/components';
import { getListByCode } from '@/lib/api/lists';
import { getItems } from '@/lib/api/items';
import { getCategories } from '@/lib/api/categories';
import { groupItemsByCategory } from '@/lib/sorting';
import { useListSubscription } from '@/hooks';
import type { List, Item, Category } from '@/types';
import {
  ERROR_MESSAGES,
  HEADINGS,
  BUTTON_LABELS,
} from '@/lib/constants';

export default function ListDashboard() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load list data
  const loadListData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch list by code
      const listData = await getListByCode(code);
      if (!listData) {
        setError(ERROR_MESSAGES.LIST_NOT_FOUND);
        return;
      }
      setList(listData);

      // Fetch items and categories in parallel
      const [itemsData, categoriesData] = await Promise.all([
        getItems(listData.id),
        getCategories(listData.id),
      ]);

      setItems(itemsData);
      setCategories(categoriesData);
    } catch {
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    loadListData();
  }, [loadListData]);

  // Handler for when a new item is added
  const handleItemAdded = (newItem: Item) => {
    setItems((prev) => [...prev, newItem]);
  };

  // Handler for when an item is updated
  const handleItemUpdated = (updatedItem: Item) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Handler for when an item is deleted
  const handleItemDeleted = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Handler for when a category is created
  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  // Handler for when a category is deleted
  const handleCategoryDeleted = (categoryId: string) => {
    // Find the deleted category name
    const deletedCategory = categories.find((cat) => cat.id === categoryId);
    if (deletedCategory) {
      // Update items that were in the deleted category to "Altro"
      setItems((prev) =>
        prev.map((item) =>
          item.category === deletedCategory.name
            ? { ...item, category: 'Altro' }
            : item
        )
      );
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  // Real-time subscription callbacks
  // Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
  const realtimeCallbacks = useMemo(() => ({
    // Requirement 6.1: User A adds item -> User B sees it within 2 seconds
    onItemInsert: (item: Item) => {
      setItems((prev) => {
        // Avoid duplicates (in case we added it locally already)
        if (prev.some((i) => i.id === item.id)) {
          return prev;
        }
        return [...prev, item];
      });
    },
    // Requirement 6.2: User A marks item bought -> User B sees status change
    onItemUpdate: (item: Item) => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i))
      );
    },
    // Requirement 6.3: User A deletes item -> User B sees removal
    onItemDelete: (oldItem: Item) => {
      setItems((prev) => prev.filter((i) => i.id !== oldItem.id));
    },
    // Category real-time updates
    onCategoryInsert: (category: Category) => {
      setCategories((prev) => {
        // Avoid duplicates
        if (prev.some((c) => c.id === category.id)) {
          return prev;
        }
        return [...prev, category];
      });
    },
    onCategoryUpdate: (category: Category) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? category : c))
      );
    },
    onCategoryDelete: (oldCategory: Category) => {
      // Update items that were in the deleted category to "Altro"
      setItems((prev) =>
        prev.map((item) =>
          item.category === oldCategory.name
            ? { ...item, category: 'Altro' }
            : item
        )
      );
      setCategories((prev) => prev.filter((c) => c.id !== oldCategory.id));
    },
  }), []);

  // Requirement 6.4: Establish real-time subscription when user opens list
  // Requirement 6.5: Close subscription when navigating away (handled by hook cleanup)
  useListSubscription(list?.id ?? null, realtimeCallbacks);

  // Group items by category for display
  const categoryGroups = groupItemsByCategory(items, categories);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <ShoppingBasket className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <Loader2 className="absolute -right-1 -top-1 h-6 w-6 animate-spin text-emerald-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {BUTTON_LABELS.LOADING}
          </p>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error || !list) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-lg text-red-600 dark:text-red-400">
            {error || ERROR_MESSAGES.LIST_NOT_FOUND}
          </p>
          <div className="flex gap-3">
            <button
              onClick={loadListData}
              className="flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-2 font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <RefreshCw className="h-4 w-4" />
              {BUTTON_LABELS.RETRY}
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Home className="h-4 w-4" />
              Torna alla Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header with list code */}
      <ListHeader code={list.code} />

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Add Item Form */}
          <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:rounded-xl sm:p-4">
            <AddItemForm
              listId={list.id}
              categories={categories}
              onItemAdded={handleItemAdded}
            />
          </section>

          {/* Category Manager */}
          <section>
            <CategoryManager
              listId={list.id}
              categories={categories}
              onCategoryCreated={handleCategoryCreated}
              onCategoryDeleted={handleCategoryDeleted}
            />
          </section>

          {/* Category Groups with Items */}
          <section className="space-y-4 sm:space-y-6">
            {categoryGroups.length > 0 ? (
              categoryGroups.map(({ category, items: categoryItems }) => (
                <div
                  key={category.id}
                  className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:rounded-xl sm:p-4"
                >
                  <CategoryGroup
                    category={category}
                    items={categoryItems}
                    onItemUpdated={handleItemUpdated}
                    onItemDeleted={handleItemDeleted}
                  />
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900 sm:rounded-xl sm:p-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <ShoppingBasket className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {HEADINGS.NO_ITEMS}
                </p>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  Aggiungi il tuo primo articolo usando il form sopra
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
