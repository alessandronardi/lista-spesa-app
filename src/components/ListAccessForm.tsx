'use client';

/**
 * ListAccessForm Component
 * Provides UI for creating a new list or joining an existing one
 * Requirements: 1.3, 2.1, 2.3
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Plus, Loader2, RefreshCw } from 'lucide-react';
import { createList, getListByCode } from '@/lib/api/lists';
import { isValidListCodeFormat } from '@/lib/utils';
import {
  BUTTON_LABELS,
  PLACEHOLDERS,
  ERROR_MESSAGES,
  ARIA_LABELS,
} from '@/lib/constants';

export default function ListAccessForm() {
  const router = useRouter();
  const [listCode, setListCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateList = async () => {
    setError(null);
    setIsCreating(true);

    try {
      const list = await createList();
      // Requirement 1.3: Redirect to list view after creation
      router.push(`/lista/${list.code}`);
    } catch {
      setError(ERROR_MESSAGES.GENERIC_ERROR);
      setIsCreating(false);
    }
  };

  const handleJoinList = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = listCode.trim().toUpperCase();

    // Validate code format
    if (!isValidListCodeFormat(code)) {
      setError(ERROR_MESSAGES.INVALID_CODE_FORMAT);
      return;
    }

    setIsJoining(true);

    try {
      const list = await getListByCode(code);
      
      if (!list) {
        // Requirement 2.2: Display error for invalid/non-existent code
        setError(ERROR_MESSAGES.LIST_NOT_FOUND);
        setIsJoining(false);
        return;
      }

      // Requirement 2.1, 2.3: Grant access and display list
      router.push(`/lista/${list.code}`);
    } catch {
      setError(ERROR_MESSAGES.NETWORK_ERROR);
      setIsJoining(false);
    }
  };

  const isLoading = isCreating || isJoining;

  return (
    <div className="w-full max-w-md space-y-6 sm:space-y-8">
      {/* Create List Section */}
      <div className="space-y-4">
        <button
          onClick={handleCreateList}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:gap-3 sm:rounded-xl sm:px-6 sm:py-4 sm:text-lg"
        >
          {isCreating ? (
            <Loader2 className="h-5 w-5 animate-spin sm:h-6 sm:w-6" />
          ) : (
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
          {isCreating ? BUTTON_LABELS.LOADING : BUTTON_LABELS.CREATE_LIST}
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            oppure
          </span>
        </div>
      </div>

      {/* Join List Section */}
      <form onSubmit={handleJoinList} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="listCode" className="sr-only">
            {ARIA_LABELS.LIST_CODE_INPUT}
          </label>
          <input
            id="listCode"
            type="text"
            value={listCode}
            onChange={(e) => {
              setListCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder={PLACEHOLDERS.LIST_CODE}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-center text-base font-mono tracking-wider placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 sm:rounded-xl sm:py-4 sm:text-lg"
            maxLength={11}
            aria-label={ARIA_LABELS.LIST_CODE_INPUT}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !listCode.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-emerald-600 bg-white px-5 py-3.5 text-base font-semibold text-emerald-600 transition-all hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent dark:hover:bg-emerald-900/20 sm:gap-3 sm:rounded-xl sm:px-6 sm:py-4 sm:text-lg"
        >
          {isJoining ? (
            <Loader2 className="h-5 w-5 animate-spin sm:h-6 sm:w-6" />
          ) : (
            <LogIn className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
          {isJoining ? BUTTON_LABELS.LOADING : BUTTON_LABELS.JOIN_LIST}
        </button>
      </form>

      {/* Error Message with Retry */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-900/20 sm:p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          {error === ERROR_MESSAGES.NETWORK_ERROR && (
            <button
              onClick={() => {
                setError(null);
                if (listCode.trim()) {
                  handleJoinList({ preventDefault: () => {} } as React.FormEvent);
                }
              }}
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-1.5 mx-auto text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {BUTTON_LABELS.RETRY}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
