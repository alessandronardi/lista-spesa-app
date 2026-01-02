'use client';

/**
 * HomePage Component
 * Entry point displaying create/join options for grocery lists
 * Requirements: 1.3, 2.1, 2.3
 */

import { ShoppingCart } from 'lucide-react';
import ListAccessForm from '@/components/ListAccessForm';
import { HEADINGS, INFO_MESSAGES } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-8 dark:from-gray-900 dark:to-gray-950 sm:py-12">
      <main className="flex w-full max-w-md flex-col items-center space-y-6 sm:space-y-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-3 text-center sm:space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-600 shadow-lg sm:h-20 sm:w-20 sm:rounded-2xl">
            <ShoppingCart className="h-8 w-8 text-white sm:h-10 sm:w-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {HEADINGS.APP_TITLE}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            {INFO_MESSAGES.ENTER_CODE}
          </p>
        </div>

        {/* List Access Form */}
        <ListAccessForm />

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 sm:text-sm">
          {INFO_MESSAGES.SHARE_INSTRUCTIONS}
        </p>
      </main>
    </div>
  );
}
