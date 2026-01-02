/**
 * Database types for the Grocery List application
 * Requirements: 7.1, 7.2, 7.3
 */

/**
 * Represents a grocery list container identified by a unique code
 * Requirement 7.1: lists table with id, code, and created_at columns
 */
export interface List {
  id: string;           // UUID
  code: string;         // e.g., "GRO-A1B2"
  created_at: string;   // ISO timestamp
}

/**
 * Represents a single grocery item belonging to a list
 * Requirement 7.2: items table with id, list_id, name, category, bought, and created_at columns
 */
export interface Item {
  id: string;           // UUID
  list_id: string;      // Foreign key to lists
  name: string;
  category: string;     // Category name
  bought: boolean;
  created_at: string;   // ISO timestamp
}

/**
 * Represents a category for organizing grocery items
 * Requirement 7.3: categories table with id, list_id, name, is_default, and created_at columns
 */
export interface Category {
  id: string;           // UUID
  list_id: string;      // Foreign key to lists
  name: string;
  is_default: boolean;
  display_order: number;
  created_at: string;   // ISO timestamp
}

/**
 * Frontend state types for managing list data
 */
export interface ListState {
  list: List | null;
  items: Item[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

/**
 * API error response format
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Error codes used throughout the application
 */
export const ErrorCodes = {
  LIST_NOT_FOUND: 'LIST_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_CATEGORY: 'DUPLICATE_CATEGORY',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
