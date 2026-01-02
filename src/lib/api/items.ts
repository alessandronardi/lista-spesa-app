/**
 * Item operations for the Grocery List application
 * Requirements: 3.1, 3.2, 3.4, 3.5, 5.1
 */

import { supabase } from '../supabase';
import { isValidItemName } from '../utils';
import type { Item, ApiError } from '../../types';
import { ErrorCodes } from '../../types';

/**
 * Retrieves all items for a given list
 * 
 * @param listId - The UUID of the list
 * @returns Array of items belonging to the list
 */
export async function getItems(listId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select()
    .eq('list_id', listId)
    .order('created_at', { ascending: true });

  if (error) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Errore durante il recupero degli articoli.',
      details: { error: error.message },
    } as ApiError;
  }

  return data as Item[];
}

/**
 * Adds a new item to a list
 * Requirements: 3.1, 3.2, 3.4
 * 
 * @param listId - The UUID of the list
 * @param name - The item name
 * @param category - The category name
 * @returns The created item
 */
export async function addItem(
  listId: string,
  name: string,
  category: string
): Promise<Item> {
  // Validate item name - reject empty or whitespace-only names
  if (!isValidItemName(name)) {
    throw {
      code: ErrorCodes.INVALID_INPUT,
      message: 'Il nome dell\'articolo non può essere vuoto.',
    } as ApiError;
  }

  // Validate category
  if (!category || category.trim().length === 0) {
    throw {
      code: ErrorCodes.INVALID_INPUT,
      message: 'Seleziona una categoria.',
    } as ApiError;
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      list_id: listId,
      name: name.trim(),
      category: category,
      bought: false, // Requirement 3.1: bought status set to false
    })
    .select()
    .single();

  if (error) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Impossibile aggiungere l\'articolo.',
      details: { error: error.message },
    } as ApiError;
  }

  return data as Item;
}

/**
 * Updates the bought status of an item
 * Requirements: 5.1
 * 
 * @param itemId - The UUID of the item
 * @param bought - The new bought status
 */
export async function updateItemBought(
  itemId: string,
  bought: boolean
): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({ bought })
    .eq('id', itemId);

  if (error) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Impossibile aggiornare lo stato dell\'articolo.',
      details: { error: error.message },
    } as ApiError;
  }
}

/**
 * Deletes an item from a list
 * Requirements: 3.5
 * 
 * @param itemId - The UUID of the item to delete
 */
export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId);

  if (error) {
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Impossibile eliminare l\'articolo.',
      details: { error: error.message },
    } as ApiError;
  }
}
