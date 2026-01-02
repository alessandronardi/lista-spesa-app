/**
 * Italian language constants for the Grocery List application
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

/**
 * Default category names in Italian
 * Requirements: 9.2
 */
export const CATEGORY_NAMES = {
  FRUIT_VEG: 'Frutta e Verdura',
  DAIRY: 'Latticini',
  MEAT_FISH: 'Carne e Pesce',
  BAKERY: 'Panetteria',
  CLEANING: 'Pulizia',
  OTHER: 'Altro',
} as const;

/**
 * Default categories array with display order
 */
export const DEFAULT_CATEGORIES = [
  { name: CATEGORY_NAMES.FRUIT_VEG, display_order: 1 },
  { name: CATEGORY_NAMES.DAIRY, display_order: 2 },
  { name: CATEGORY_NAMES.MEAT_FISH, display_order: 3 },
  { name: CATEGORY_NAMES.BAKERY, display_order: 4 },
  { name: CATEGORY_NAMES.CLEANING, display_order: 5 },
  { name: CATEGORY_NAMES.OTHER, display_order: 6 },
] as const;

/**
 * Button labels in Italian
 * Requirements: 9.3
 */
export const BUTTON_LABELS = {
  CREATE_LIST: 'Crea Lista',
  JOIN_LIST: 'Unisciti',
  ADD_ITEM: 'Aggiungi',
  DELETE: 'Elimina',
  COPY: 'Copia',
  COPIED: 'Copiato!',
  ADD_CATEGORY: 'Aggiungi Categoria',
  CANCEL: 'Annulla',
  CONFIRM: 'Conferma',
  SAVE: 'Salva',
  LOADING: 'Caricamento...',
  RETRY: 'Riprova',
} as const;

/**
 * Placeholder texts in Italian
 * Requirements: 9.3
 */
export const PLACEHOLDERS = {
  ITEM_NAME: 'Nome articolo...',
  CATEGORY_NAME: 'Nome categoria...',
  LIST_CODE: 'Codice lista (es. GRO-A1B2C3D)',
  SEARCH: 'Cerca...',
} as const;

/**
 * Page titles and headings in Italian
 * Requirements: 9.1
 */
export const HEADINGS = {
  APP_TITLE: 'Lista della Spesa',
  CREATE_OR_JOIN: 'Crea o Unisciti a una Lista',
  YOUR_LIST: 'La Tua Lista',
  CATEGORIES: 'Categorie',
  CUSTOM_CATEGORIES: 'Categorie Personalizzate',
  ITEMS: 'Articoli',
  SHARE_CODE: 'Condividi questo codice',
  NO_ITEMS: 'Nessun articolo',
  MANAGE_CATEGORIES: 'Gestisci Categorie',
} as const;

/**
 * Error messages in Italian
 * Requirements: 9.4
 */
export const ERROR_MESSAGES = {
  LIST_NOT_FOUND: 'Lista non trovata. Verifica il codice.',
  NETWORK_ERROR: 'Errore di connessione. Riprova.',
  ITEM_ADD_FAILED: 'Impossibile aggiungere l\'articolo.',
  ITEM_DELETE_FAILED: 'Impossibile eliminare l\'articolo.',
  ITEM_UPDATE_FAILED: 'Impossibile aggiornare l\'articolo.',
  CATEGORY_CREATE_FAILED: 'Impossibile creare la categoria.',
  CATEGORY_DELETE_FAILED: 'Impossibile eliminare la categoria.',
  EMPTY_ITEM_NAME: 'Il nome dell\'articolo non può essere vuoto.',
  EMPTY_CATEGORY_NAME: 'Il nome della categoria non può essere vuoto.',
  SELECT_CATEGORY: 'Seleziona una categoria.',
  DUPLICATE_CATEGORY: 'Una categoria con questo nome esiste già.',
  CANNOT_DELETE_DEFAULT: 'Non è possibile eliminare le categorie predefinite.',
  REALTIME_DISCONNECTED: 'Connessione persa. Riconnessione...',
  GENERIC_ERROR: 'Si è verificato un errore. Riprova.',
  INVALID_CODE_FORMAT: 'Formato codice non valido. Usa il formato GRO-XXXXXXX.',
} as const;

/**
 * Success messages in Italian
 */
export const SUCCESS_MESSAGES = {
  ITEM_ADDED: 'Articolo aggiunto.',
  ITEM_DELETED: 'Articolo eliminato.',
  CATEGORY_CREATED: 'Categoria creata.',
  CATEGORY_DELETED: 'Categoria eliminata.',
  CODE_COPIED: 'Codice copiato negli appunti!',
} as const;

/**
 * Informational messages in Italian
 */
export const INFO_MESSAGES = {
  ENTER_CODE: 'Inserisci il codice della lista per unirti',
  CREATE_NEW: 'Oppure crea una nuova lista',
  SHARE_INSTRUCTIONS: 'Condividi questo codice con altri per collaborare',
  ITEMS_REASSIGNED: 'Gli articoli sono stati spostati in "Altro".',
} as const;

/**
 * Accessibility labels in Italian
 */
export const ARIA_LABELS = {
  TOGGLE_BOUGHT: 'Segna come acquistato',
  DELETE_ITEM: 'Elimina articolo',
  DELETE_CATEGORY: 'Elimina categoria',
  COPY_CODE: 'Copia codice lista',
  CATEGORY_SELECTOR: 'Seleziona categoria',
  ITEM_INPUT: 'Nome articolo',
  CATEGORY_INPUT: 'Nome categoria',
  LIST_CODE_INPUT: 'Codice lista',
} as const;
