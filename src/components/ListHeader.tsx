'use client';

/**
 * ListHeader Component
 * Displays list code with copy-to-clipboard functionality
 * Requirements: 2.4
 */

import { useState } from 'react';
import { Copy, Check, ShoppingCart } from 'lucide-react';
import {
  HEADINGS,
  BUTTON_LABELS,
  SUCCESS_MESSAGES,
  ARIA_LABELS,
} from '@/lib/constants';

interface ListHeaderProps {
  code: string;
}

export default function ListHeader({ code }: ListHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:py-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 sm:h-10 sm:w-10 sm:rounded-xl">
            <ShoppingCart className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </div>
          <h1 className="hidden text-xl font-bold text-gray-900 dark:text-white sm:block">
            {HEADINGS.APP_TITLE}
          </h1>
        </div>

        {/* List Code with Copy Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-mono text-base font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 sm:text-lg">
            {code}
          </span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm"
            aria-label={ARIA_LABELS.COPY_CODE}
            title={HEADINGS.SHARE_CODE}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4" />
                <span className="hidden text-emerald-600 sm:inline">{BUTTON_LABELS.COPIED}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{BUTTON_LABELS.COPY}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
