import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { getShoppingLists, ShoppingListWithCounts } from '../endpoints/shopping_lists_GET.schema';
import { postShoppingLists, InputType as CreateListInput } from '../endpoints/shopping_lists_POST.schema';
import { getShoppingListDetails, ShoppingListDetails, InputType as GetDetailsInput } from '../endpoints/shopping_list/details_GET.schema';
import { postShoppingListItems, InputType as AddItemsInput } from '../endpoints/shopping_list/items_POST.schema';
import { postShoppingListItemUpdate, InputType as UpdateItemInput } from '../endpoints/shopping_list/item/update_POST.schema';
import { postShoppingListDelete, InputType as DeleteListInput } from '../endpoints/shopping_list/delete_POST.schema';
import { postAnalyzeShoppingImage, AnalyzedItem } from '../endpoints/ai/analyze_shopping_image_POST.schema';
import { postParseVoiceShopping, InputType as ParseVoiceInput } from '../endpoints/ai/parse_voice_shopping_POST.schema';
import { toast } from 'sonner';

export const shoppingQueryKeys = {
  lists: () => ['shopping', 'lists'] as const,
  list: (id: string) => ['shopping', 'list', id] as const,
};

// Offline storage keys
const OFFLINE_STORAGE_KEYS = {
  lists: 'floot_shopping_lists_offline',
  listDetails: (id: string) => `floot_shopping_list_${id}_offline`,
  pendingChanges: 'floot_shopping_pending_changes',
  lastSync: 'floot_shopping_last_sync',
};

// Types for offline storage
interface PendingChange {
  id: string;
  type: 'create_list' | 'update_item' | 'add_items' | 'delete_list';
  data: any;
  timestamp: number;
  listId?: string;
}

interface OfflineState {
  isOffline: boolean;
  pendingChanges: PendingChange[];
  lastSync: number | null;
}

// Offline storage utilities
const getOfflineData = <T,>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setOfflineData = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save offline data:', error);
  }
};

const removeOfflineData = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove offline data:', error);
  }
};

// Offline state management
const useOfflineState = (): OfflineState & {
  addPendingChange: (change: Omit<PendingChange, 'id' | 'timestamp'>) => void;
  removePendingChange: (id: string) => void;
  clearPendingChanges: () => void;
  updateLastSync: () => void;
} => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>(() => 
    getOfflineData<PendingChange[]>(OFFLINE_STORAGE_KEYS.pendingChanges) || []
  );
  const [lastSync, setLastSync] = useState<number | null>(() => 
    getOfflineData<number>(OFFLINE_STORAGE_KEYS.lastSync)
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingChange = useCallback((change: Omit<PendingChange, 'id' | 'timestamp'>) => {
    const newChange: PendingChange = {
      ...change,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setPendingChanges(prev => {
      const updated = [...prev, newChange];
      setOfflineData(OFFLINE_STORAGE_KEYS.pendingChanges, updated);
      return updated;
    });
  }, []);

  const removePendingChange = useCallback((id: string) => {
    setPendingChanges(prev => {
      const updated = prev.filter(change => change.id !== id);
      setOfflineData(OFFLINE_STORAGE_KEYS.pendingChanges, updated);
      return updated;
    });
  }, []);

  const clearPendingChanges = useCallback(() => {
    setPendingChanges([]);
    removeOfflineData(OFFLINE_STORAGE_KEYS.pendingChanges);
  }, []);

  const updateLastSync = useCallback(() => {
    const now = Date.now();
    setLastSync(now);
    setOfflineData(OFFLINE_STORAGE_KEYS.lastSync, now);
  }, []);

  return {
    isOffline,
    pendingChanges,
    lastSync,
    addPendingChange,
    removePendingChange,
    clearPendingChanges,
    updateLastSync,
  };
};

// Hook to expose offline status
export const useOfflineStatus = () => {
  const { isOffline, pendingChanges, lastSync } = useOfflineState();
  
  const hasPendingChanges = useCallback((listId?: string) => {
    if (!listId) return pendingChanges.length > 0;
    return pendingChanges.some(change => change.listId === listId);
  }, [pendingChanges]);

  const getPendingChangesCount = useCallback((listId?: string) => {
    if (!listId) return pendingChanges.length;
    return pendingChanges.filter(change => change.listId === listId).length;
  }, [pendingChanges]);

  return {
    isOffline,
    hasPendingChanges,
    getPendingChangesCount,
    lastSync,
    pendingChangesCount: pendingChanges.length,
  };
};

// Sync pending changes when back online
const useSyncPendingChanges = () => {
  const queryClient = useQueryClient();
  const { isOffline, pendingChanges, removePendingChange, updateLastSync } = useOfflineState();

  const syncChanges = useCallback(async () => {
    if (isOffline || pendingChanges.length === 0) return;

    toast.info('Syncing pending changes...');
    let syncedCount = 0;
    let failedCount = 0;

    // Sort changes by timestamp to maintain order
    const sortedChanges = [...pendingChanges].sort((a, b) => a.timestamp - b.timestamp);

    for (const change of sortedChanges) {
      try {
        switch (change.type) {
          case 'create_list':
            await postShoppingLists(change.data);
            break;
          case 'add_items':
            await postShoppingListItems(change.data);
            break;
          case 'update_item':
            await postShoppingListItemUpdate(change.data);
            break;
          case 'delete_list':
            await postShoppingListDelete(change.data);
            break;
        }
        
        removePendingChange(change.id);
        syncedCount++;
      } catch (error) {
        console.error('Failed to sync change:', change, error);
        failedCount++;
      }
    }

    if (syncedCount > 0) {
      updateLastSync();
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['shopping'] });
      toast.success(`Synced ${syncedCount} changes successfully`);
    }

    if (failedCount > 0) {
      toast.error(`Failed to sync ${failedCount} changes`);
    }
  }, [isOffline, pendingChanges, removePendingChange, updateLastSync, queryClient]);

  useEffect(() => {
    if (!isOffline && pendingChanges.length > 0) {
      // Delay sync slightly to allow network to stabilize
      const timer = setTimeout(syncChanges, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, pendingChanges.length, syncChanges]);

  return { syncChanges };
};

export const useGetShoppingLists = () => {
  const { isOffline } = useOfflineState();
  useSyncPendingChanges(); // Auto-sync when online

  return useQuery({
    queryKey: shoppingQueryKeys.lists(),
    queryFn: async () => {
      if (isOffline) {
        const offlineData = getOfflineData<ShoppingListWithCounts[]>(OFFLINE_STORAGE_KEYS.lists);
        if (offlineData) return offlineData;
        throw new Error('No offline data available');
      }

      const result = await getShoppingLists();
      if ('error' in result) throw new Error(result.error);
      
      // Cache data for offline use
      setOfflineData(OFFLINE_STORAGE_KEYS.lists, result.shoppingLists);
      return result.shoppingLists;
    },
    staleTime: isOffline ? Infinity : 5 * 60 * 1000, // 5 minutes when online, never stale when offline
  });
};

export const useCreateShoppingList = () => {
  const queryClient = useQueryClient();
  const { isOffline, addPendingChange } = useOfflineState();
  
  return useMutation({
    mutationFn: async (newList: CreateListInput) => {
      if (isOffline) {
        // Store as pending change
        addPendingChange({
          type: 'create_list',
          data: newList,
        });
        
        // Optimistically update local cache
        const currentLists = queryClient.getQueryData<ShoppingListWithCounts[]>(shoppingQueryKeys.lists()) || [];
        const optimisticList: ShoppingListWithCounts = {
          id: `temp_${Date.now()}`,
          name: newList.name,
          description: newList.description || null,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 0, // Placeholder
          totalItems: 0,
          completedItems: 0,
        };
        
        queryClient.setQueryData(shoppingQueryKeys.lists(), [...currentLists, optimisticList]);
        return { success: true };
      }
      
      return postShoppingLists(newList);
    },
    onSuccess: () => {
      toast.success(isOffline ? 'Shopping list saved offline!' : 'Shopping list created!');
      if (!isOffline) {
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() });
      }
    },
    onError: (error) => {
      toast.error(`Failed to create list: ${error.message}`);
    },
  });
};

export const useGetShoppingListDetails = (params: GetDetailsInput, options?: { enabled?: boolean }) => {
  const { isOffline } = useOfflineState();
  
  return useQuery({
    queryKey: shoppingQueryKeys.list(params.shoppingListId),
    queryFn: async () => {
      if (isOffline) {
        const offlineData = getOfflineData<ShoppingListDetails>(
          OFFLINE_STORAGE_KEYS.listDetails(params.shoppingListId)
        );
        if (offlineData) return offlineData;
        throw new Error('No offline data available for this list');
      }

      const result = await getShoppingListDetails(params);
      if ('error' in result) throw new Error(result.error);
      
      // Cache data for offline use
      setOfflineData(OFFLINE_STORAGE_KEYS.listDetails(params.shoppingListId), result.shoppingList);
      return result.shoppingList;
    },
    enabled: !!params.shoppingListId && (options?.enabled ?? true),
    staleTime: isOffline ? Infinity : 5 * 60 * 1000,
  });
};

export const useAddShoppingItems = () => {
  const queryClient = useQueryClient();
  const { isOffline, addPendingChange } = useOfflineState();
  
  return useMutation({
    mutationFn: async (vars: AddItemsInput) => {
      if (isOffline) {
        addPendingChange({
          type: 'add_items',
          data: vars,
          listId: vars.shoppingListId,
        });
        
        // Optimistically update local cache
        const currentList = queryClient.getQueryData<ShoppingListDetails>(
          shoppingQueryKeys.list(vars.shoppingListId)
        );
        
        if (currentList) {
          const newItems = vars.items.map((item, index) => ({
            id: `temp_${Date.now()}_${index}`,
            name: item.name,
            category: item.category || 'other',
            quantity: item.quantity || 1,
            unit: null,
            notes: item.notes || null,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            shoppingListId: vars.shoppingListId,
            estimatedPrice: null,
            actualPrice: null,
            priority: item.priority || null,
            addedVia: item.addedVia || null,
          }));
          
          queryClient.setQueryData(shoppingQueryKeys.list(vars.shoppingListId), {
            ...currentList,
            items: [...currentList.items, ...newItems],
          });
        }
        
        return { success: true };
      }
      
      return postShoppingListItems(vars);
    },
    onSuccess: (data, variables) => {
      toast.success(isOffline 
        ? `${variables.items.length} item(s) saved offline.`
        : `${variables.items.length} item(s) added.`
      );
      
      if (!isOffline) {
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.list(variables.shoppingListId) });
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() });
      }
    },
    onError: (error) => {
      toast.error(`Failed to add items: ${error.message}`);
    },
  });
};

export const useUpdateShoppingItem = () => {
  const queryClient = useQueryClient();
  const { isOffline, addPendingChange } = useOfflineState();
  
  return useMutation({
    mutationFn: async (vars: UpdateItemInput) => {
      if (isOffline) {
        addPendingChange({
          type: 'update_item',
          data: vars,
          listId: vars.shoppingListId,
        });
        
        // Optimistically update local cache
        const currentList = queryClient.getQueryData<ShoppingListDetails>(
          shoppingQueryKeys.list(vars.shoppingListId)
        );
        
        if (currentList) {
          const { itemId, shoppingListId, ...updates } = vars;
          const updatedItems = currentList.items.map(item =>
            item.id === vars.itemId
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          );
          
          queryClient.setQueryData(shoppingQueryKeys.list(vars.shoppingListId), {
            ...currentList,
            items: updatedItems,
          });
        }
        
        return { success: true };
      }
      
      return postShoppingListItemUpdate(vars);
    },
    onSuccess: (data, variables) => {
      if (!isOffline) {
        queryClient.invalidateQueries({ queryKey: ['shopping', 'list'] });
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() });
      }
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
};

export const useDeleteShoppingList = () => {
  const queryClient = useQueryClient();
  const { isOffline, addPendingChange } = useOfflineState();
  
  return useMutation({
    mutationFn: async (vars: DeleteListInput) => {
      if (isOffline) {
        addPendingChange({
          type: 'delete_list',
          data: vars,
          listId: vars.shoppingListId,
        });
        
        // Optimistically update local cache
        const currentLists = queryClient.getQueryData<ShoppingListWithCounts[]>(shoppingQueryKeys.lists()) || [];
        const updatedLists = currentLists.filter(list => list.id !== vars.shoppingListId);
        queryClient.setQueryData(shoppingQueryKeys.lists(), updatedLists);
        
        return { success: true };
      }
      
      return postShoppingListDelete(vars);
    },
    onSuccess: () => {
      toast.success(isOffline ? 'Shopping list deleted offline.' : 'Shopping list deleted.');
      if (!isOffline) {
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() });
      }
    },
    onError: (error) => {
      toast.error(`Failed to delete list: ${error.message}`);
    },
  });
};

// AI Hooks (these don't work offline)
export const useAnalyzeShoppingImage = () => {
  const { isOffline } = useOfflineState();
  
  return useMutation<
    { items: AnalyzedItem[] },
    Error,
    FormData
  >({
    mutationFn: async (formData: FormData) => {
      if (isOffline) {
        throw new Error('Image analysis requires an internet connection');
      }
      
      const result = await postAnalyzeShoppingImage(formData);
      if ('error' in result) throw new Error(result.error);
      return result;
    },
    onError: (error) => {
      toast.error(`Image analysis failed: ${error.message}`);
    },
  });
};

export const useParseVoiceShopping = () => {
  const { isOffline } = useOfflineState();
  
  return useMutation<
    { items: AnalyzedItem[] },
    Error,
    ParseVoiceInput
  >({
    mutationFn: async (vars: ParseVoiceInput) => {
      if (isOffline) {
        throw new Error('Voice parsing requires an internet connection');
      }
      
      const result = await postParseVoiceShopping(vars);
      if ('error' in result) throw new Error(result.error);
      
      // Add estimated_price field to maintain consistency with image analysis
      const itemsWithPrice = result.items.map(item => ({
        ...item,
        estimated_price: item.estimated_price ?? null
      }));
      
      return { items: itemsWithPrice };
    },
    onError: (error) => {
      toast.error(`Voice parsing failed: ${error.message}`);
    },
  });
};

// Export the main helper as default
export default {
  useGetShoppingLists,
  useCreateShoppingList,
  useGetShoppingListDetails,
  useAddShoppingItems,
  useUpdateShoppingItem,
  useDeleteShoppingList,
  useAnalyzeShoppingImage,
  useParseVoiceShopping,
  useOfflineStatus,
  shoppingQueryKeys,
};