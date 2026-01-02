/**
 * List operations for the Grocery List application
 * Requirements: 1.1, 1.2, 2.1, 2.2
 */

import { supabase } from '../supabase';
import { generateListCode, isValidListCodeFormat } from '../utils';
import type { List, ApiError } from '../../types';
import { ErrorCodes } from '../../types';

/**
 * Default categories to create for each new list
 * Requirements: 4.1 - Default category options
 */
const DEFAULT_CATEGORIES = [
  { name: 'Frutta e Verdura', display_order: 1 },
  { name: 'Latticini', display_order: 2 },
  { name: 'Carne e Pesce', display_order: 3 },
  { name: 'Panetteria', display_order: 4 },
  { name: 'Pulizia', display_order: 5 },
  { name: 'Altro', display_order: 6 },
];

/**
 * Creates a new grocery list with a unique code and default categories
 * Requirements: 1.1, 1.2, 1.4
 * 
 * @returns The created list or throws an error
 */
export async function createList(): Promise<List> {
  const maxRetries = 5;
  let attempts = 0;

  while (attempts < maxRetries) {
    const code = generateListCode();
    
    // Try to insert the list with the generated code
    const { data: list, error: listError } = await supabase
      .from('lists')
      .insert({ code })
      .select()
      .single();

    if (listError) {
      // If it's a unique constraint violation, retry with a new code
      if (listError.code === '23505') {
        attempts++;
        continue;
      }
      throw {
        code: ErrorCodes.DATABASE_ERROR,
        message: 'Impossibile creare la lista.',
        details: { error: listError.message },
      } as ApiError;
    }

    // Create default categories for the new list
    const categoriesData = DEFAULT_CATEGORIES.map(cat => ({
      list_id: list.id,
      name: cat.name,
      is_default: true,
      display_order: cat.display_order,
    }));

    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(categoriesData);

    if (categoriesError) {
      // Rollback: delete the list if categories creation fails
      await supabase.from('lists').delete().eq('id', list.id);
      throw {
        code: ErrorCodes.DATABASE_ERROR,
        message: 'Impossibile creare le categorie predefinite.',
        details: { error: categoriesError.message },
      } as ApiError;
    }

    return list as List;
  }

  throw {
    code: ErrorCodes.DATABASE_ERROR,
    message: 'Impossibile generare un codice univoco per la lista.',
  } as ApiError;
}

/**
 * Retrieves a list by its unique code
 * Requirements: 2.1, 2.2
 * 
 * @param code - The list code in format GRO-XXXX
 * @returns The list if found, null otherwise
 */
export async function getListByCode(code: string): Promise<List | null> {
  // Validate code format first
  if (!isValidListCodeFormat(code)) {
    return null;
  }

  const { data, error } = await supabase
    .from('lists')
    .select()
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    // PGRST116 means no rows returned
    if (error.code === 'PGRST116') {
      return null;
    }
    throw {
      code: ErrorCodes.DATABASE_ERROR,
      message: 'Errore durante il recupero della lista.',
      details: { error: error.message },
    } as ApiError;
  }

  return data as List;
}
