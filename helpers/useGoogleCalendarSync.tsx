import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postSyncGoogleCalendar } from '../endpoints/calendar/google/sync_POST.schema';
import { useGoogleCalendarConnection } from './useGoogleCalendarConnection';
import { toast } from 'sonner';

export const useGoogleCalendarSync = () => {
  const queryClient = useQueryClient();
  const { connectionQuery } = useGoogleCalendarConnection();

  const syncMutation = useMutation({
    mutationFn: postSyncGoogleCalendar,
    onMutate: () => {
      // Check connection status before attempting sync
      const connection = connectionQuery.data;
      if (!connection || !connection.isActive) {
        throw new Error('Google Calendar is not connected. Please connect your Google Calendar first.');
      }
      toast.loading('Syncing Google Calendar events...');
    },
    onSuccess: (data) => {
      toast.success(`Sync complete! ${data.syncedEventsCount} events synced.`);
      // Invalidate queries for calendar events to refetch the new data
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const handleSync = () => {
    // Check connection status before attempting sync
    const connection = connectionQuery.data;
    if (!connection || !connection.isActive) {
      toast.error('Google Calendar is not connected. Please connect your Google Calendar first to sync events.');
      return;
    }

    // Prevent multiple simultaneous sync attempts
    if (syncMutation.isPending) {
      toast.error('Sync is already in progress. Please wait for it to complete.');
      return;
    }

    syncMutation.mutate({});
  };

  return {
    syncMutation,
    handleSync,
    isConnected: connectionQuery.data?.isActive ?? false,
    connectionStatus: connectionQuery.data,
    isCheckingConnection: connectionQuery.isFetching,
  };
};