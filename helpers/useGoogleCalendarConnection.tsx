import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGoogleConnection } from '../endpoints/calendar/google/connection_GET.schema';
import { postConnectGoogleCalendar } from '../endpoints/calendar/google/connect_POST.schema';
import { postDisconnectGoogleCalendar } from '../endpoints/calendar/google/disconnect_POST.schema';
import { toast } from 'sonner';
import { OAuthPopupMessage } from './oauthPopupMessage';

const GOOGLE_CONNECTION_QUERY_KEY = ['googleCalendar', 'connection'];

export const useGoogleCalendarConnection = () => {
  const queryClient = useQueryClient();

  const connectionQuery = useQuery({
    queryKey: GOOGLE_CONNECTION_QUERY_KEY,
    queryFn: getGoogleConnection,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const connectMutation = useMutation({
    mutationFn: (input: { redirectUrl?: string } = {}) => postConnectGoogleCalendar(input),
    onSuccess: (data: { authorizeUrl: string }) => {
      handleOAuthPopup(data.authorizeUrl);
    },
    onError: (error) => {
      toast.error(`Failed to start connection: ${error.message}`);
    },
  });

  const handleOAuthPopup = (authorizeUrl: string) => {
    // Check if popups are supported
    if (typeof window === 'undefined') {
      toast.error('OAuth not supported in this environment');
      return;
    }

    // Open popup window
    const popup = window.open(
      authorizeUrl,
      'google-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
    );

    if (!popup) {
      toast.error('Popup blocked. Please allow popups for this site and try again.');
      return;
    }

    // Monitor popup for completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // If popup was closed without success message, it might have been closed manually
        // We'll refresh the connection status to check if it succeeded
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: GOOGLE_CONNECTION_QUERY_KEY });
        }, 1000);
      }
    }, 1000);

    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      const message = event.data as OAuthPopupMessage;
      
      if (message.type === 'OAUTH_SUCCESS' && message.provider === 'google') {
        clearInterval(checkClosed);
        popup.close();
        toast.success('Google Calendar connected successfully!');
        queryClient.invalidateQueries({ queryKey: GOOGLE_CONNECTION_QUERY_KEY });
        window.removeEventListener('message', handleMessage);
      } else if (message.type === 'OAUTH_TOKEN_SUCCESS' && message.provider === 'google') {
        clearInterval(checkClosed);
        popup.close();
        toast.success('Google Calendar connected successfully!');
        queryClient.invalidateQueries({ queryKey: GOOGLE_CONNECTION_QUERY_KEY });
        window.removeEventListener('message', handleMessage);
      } else if (message.type === 'OAUTH_ERROR' && message.provider === 'google') {
        clearInterval(checkClosed);
        popup.close();
        toast.error(`Connection failed: ${message.error.message}`);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup after 5 minutes (timeout)
    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        toast.error('Connection timed out. Please try again.');
      }
    }, 5 * 60 * 1000);
  };

  const disconnectMutation = useMutation({
    mutationFn: (connectionId: number) => postDisconnectGoogleCalendar({ connectionId }),
    onSuccess: () => {
      toast.success('Google Calendar disconnected successfully.');
      queryClient.invalidateQueries({ queryKey: GOOGLE_CONNECTION_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Failed to disconnect: ${error.message}`);
    },
  });

  return {
    connectionQuery,
    connectMutation,
    disconnectMutation,
  };
};