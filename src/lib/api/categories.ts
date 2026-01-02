/**
 * Category operations for the Grocery List application
 * Requirements: 4.1.1, 4.1.2, 4.1.3, 4.1.4, 4.1.5
 */

import { supabase } from '../supabase';
import { isValidCategoryName } from '../utils';
import type { Category, ApiError } from '../../types';
import { ErrorCodes } from '../../types';

/** Default category name for reassignment when custom categories are deleted */
const DEFAULT_REASSIGNMENT_CATEGORY = 'Altro';

/**
 * Retrieves all categories for a given list
 * 
 * @param listId - The UUID of the list
 * @returns Array of categories belonging to the list
 */
export async function getCategories(listId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select()
    .eq('list_id', listId)
    .order('display_order', { ascending: true });

  if (error) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Errore durante il recupero delle categorie.',
      details: { error: error.message },
    } as ApiError;
  }

  return data as Category[];
}

/**
 * Checks if a category name already exists in a list (case-insensitive)
 * Requirements: 4.1.3 - Category names must be unique within a list
 * 
 * @param listId - The UUID of the list
 * @param name - The category name to check
 * @returns true if the name already exists
 */
export async function categoryNameExists(
  listId: string,
  name: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('list_id', listId)
    .ilike('name', name.trim());

  if (error) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Errore durante la verifica del nome categoria.',
      details: { error: error.message },
    } as ApiError;
  }

  return data.length > 0;
}

/**
 * Creates a new custom category for a list
 * Requirements: 4.1.1, 4.1.2, 4.1.3, 4.1.4
 * 
 * @param listId - The UUID of the list
 * @param name - The category name
 * @returns The created category
 */
export async function createCategory(
  listId: string,
  name: string
): Promise<Category> {
  // Validate category name - reject empty or whitespace-only names
  // Requirements: 4.1.2
  if (!isValidCategoryName(name)) {
    throw {
      code: ErrorCodes.INVALID_INPUT,
      message: 'Il nome della categoria non può essere vuoto.',
    } as ApiError;
  }

  // Check for duplicate names (case-insensitive)
  // Requirements: 4.1.3
  const exists = await categoryNameExists(listId, name);
  if (exists) {
    throw {
      code: ErrorCodes.DUPLICATE_CATEGORY,
      message: 'Una categoria con questo nome esiste già.',
    } as ApiError;
  }

  // Get the highest display_order for custom categories
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('display_order')
    .eq('list_id', listId)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = existingCategories && existingCategories.length > 0
    ? existingCategories[0].display_order + 1
    : 100;

  const { data, error } = await supabase
    .from('categories')
    .insert({
      list_id: listId,
      name: name.trim(),
      is_default: false,
      display_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Impossibile creare la categoria.',
      details: { error: error.message },
    } as ApiError;
  }

  return data as Category;
}

/**
 * Deletes a custom category and reassigns its items to "Altro"
 * Requirements: 4.1.5
 * 
 * @param categoryId - The UUID of the category to delete
 * @param listId - The UUID of the list (for item reassignment)
 */
export async function deleteCategory(
  categoryId: string,
  listId: string
): Promise<void> {
  // First, get the category to check if it's a default category
  const { data: category, error: fetchError } = await supabase
    .from('categories')
    .select()
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Categoria non trovata.',
      details: { error: fetchError.message },
    } as ApiError;
  }

  // Prevent deletion of default categories
  if (category.is_default) {
    throw {
      code: ErrorCodes.INVALID_INPUT,
      message: 'Non è possibile eliminare le categorie predefinite.',
    } as ApiError;
  }

  // Reassign items in this category to "Altro"
  // Requirements: 4.1.5
  const { error: updateError } = await supabase
    .from('items')
    .update({ category: DEFAULT_REASSIGNMENT_CATEGORY })
    .eq('list_id', listId)
    .eq('category', category.name);

  if (updateError) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Errore durante la riassegnazione degli articoli.',
      details: { error: updateError.message },
    } as ApiError;
  }

  // Delete the category
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (deleteError) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Impossibile eliminare la categoria.',
      details: { error: deleteError.message },
    } as ApiError;
  }
}
