/**
 * Real-time subscription hook for grocery list updates
 * Requirements: 6.1, 6.2, 6.3, 6.4
 * 
 * Handles INSERT, UPDATE, DELETE events for items and categories
 * to enable real-time collaboration between users.
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Item, Category } from '@/types';

type ItemPayload = RealtimePostgresChangesPayload<Item>;
type CategoryPayload = RealtimePostgresChangesPayload<Category>;

export interface UseListSubscriptionCallbacks {
  onItemInsert?: (item: Item) => void;
  onItemUpdate?: (item: Item) => void;
  onItemDelete?: (oldItem: Item) => void;
  onCategoryInsert?: (category: Category) => void;
  onCategoryUpdate?: (category: Category) => void;
  onCategoryDelete?: (oldCategory: Category) => void;
}

/**
 * Hook to subscribe to real-time changes for a grocery list
 * 
 * @param listId - The UUID of the list to subscribe to
 * @param callbacks - Callback functions for handling different event types
 * 
 * Requirements:
 * - 6.1: User A adds item -> User B sees it within 2 seconds
 * - 6.2: User A marks item bought -> User B sees status change within 2 seconds
 * - 6.3: User A deletes item -> User B sees removal within 2 seconds
 * - 6.4: Establish real-time subscription when user opens list
 */
export function useListSubscription(
  listId: string | null,
  callbacks: UseListSubscriptionCallbacks
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  // Store callbacks in refs to avoid re-subscribing on callback changes
  const callbacksRef = useRef(callbacks);
  
  // Update ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const handleItemChange = useCallback((payload: ItemPayload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        if (newRecord && callbacksRef.current.onItemInsert) {
          callbacksRef.current.onItemInsert(newRecord as Item);
        }
        break;
      case 'UPDATE':
        if (newRecord && callbacksRef.current.onItemUpdate) {
          callbacksRef.current.onItemUpdate(newRecord as Item);
        }
        break;
      case 'DELETE':
        if (oldRecord && callbacksRef.current.onItemDelete) {
          callbacksRef.current.onItemDelete(oldRecord as Item);
        }
        break;
    }
  }, []);

  const handleCategoryChange = useCallback((payload: CategoryPayload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        if (newRecord && callbacksRef.current.onCategoryInsert) {
          callbacksRef.current.onCategoryInsert(newRecord as Category);
        }
        break;
      case 'UPDATE':
        if (newRecord && callbacksRef.current.onCategoryUpdate) {
          callbacksRef.current.onCategoryUpdate(newRecord as Category);
        }
        break;
      case 'DELETE':
        if (oldRecord && callbacksRef.current.onCategoryDelete) {
          callbacksRef.current.onCategoryDelete(oldRecord as Category);
        }
        break;
    }
  }, []);

  useEffect(() => {
    // Don't subscribe if no listId
    if (!listId) {
      return;
    }

    // Create channel for this list
    const channel = supabase
      .channel(`list-${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `list_id=eq.${listId}`,
        },
        handleItemChange
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `list_id=eq.${listId}`,
        },
        handleCategoryChange
      )
      .subscribe();

    channelRef.current = channel;

    // Requirement 6.5: Close subscription when navigating away
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [listId, handleItemChange, handleCategoryChange]);

  // Return a function to manually unsubscribe if needed
  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return { unsubscribe };
}
