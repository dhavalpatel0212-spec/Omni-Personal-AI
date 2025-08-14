import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile } from '../endpoints/user/profile_GET.schema';
import { getNotificationSettings, OutputType as NotificationSettings } from '../endpoints/settings/notifications_GET.schema';
import { getCalendarIntegrations, OutputType as CalendarIntegrations } from '../endpoints/calendar/integrations_GET.schema';
import { postConnectCalendar } from '../endpoints/calendar/connect_POST.schema';
import { postDisconnectCalendar } from '../endpoints/calendar/disconnect_POST.schema';
import { User } from './User';

// Placeholder types for mutation payloads, as endpoints don't exist yet.
type UserProfileUpdatePayload = Partial<User>;
type NotificationSettingsUpdatePayload = Partial<NotificationSettings>;

// Query keys
const PROFILE_QUERY_KEY = ['settings', 'profile'];
const NOTIFICATIONS_QUERY_KEY = ['settings', 'notifications'];
const CALENDAR_INTEGRATIONS_QUERY_KEY = ['settings', 'calendarIntegrations'];

export const useSettings = () => {
  const queryClient = useQueryClient();

  // --- QUERIES ---

  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getUserProfile,
  });

  const notificationSettingsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotificationSettings,
  });

  const calendarIntegrationsQuery = useQuery({
    queryKey: CALENDAR_INTEGRATIONS_QUERY_KEY,
    queryFn: getCalendarIntegrations,
  });

  // --- MUTATIONS ---
  // Note: The mutation functions are placeholders as the update endpoints do not exist.
  // In a real implementation, these would call the respective POST/PUT endpoint helpers.

  const updateUserProfile = useMutation({
    mutationFn: async (data: UserProfileUpdatePayload) => {
      console.log('Simulating profile update with:', data);
      // const response = await updateUserProfileEndpoint(data);
      // if (response.error) throw new Error(response.error);
      // return response.user;
      return { ...profileQuery.data, ...data } as User; // Simulate success
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedUser);
      // Also update the global auth state if necessary
      // queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
      console.log('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });

  const updateNotificationSettings = useMutation({
    mutationFn: async (data: NotificationSettingsUpdatePayload) => {
      console.log('Simulating notification settings update with:', data);
      return { ...notificationSettingsQuery.data, ...data } as NotificationSettings;
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, updatedSettings);
      console.log('Notification settings updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update notification settings:', error);
    },
  });

  const connectCalendar = useMutation({
    mutationFn: async (provider: string) => {
      const response = await postConnectCalendar({ provider: provider as any });
      
      // Open OAuth flow in popup window
      const popup = window.open(
        response.authorizeUrl,
        'oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Wait for popup to close (indicating OAuth completion)
      return new Promise<void>((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            resolve();
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          if (!popup.closed) {
            popup.close();
            reject(new Error('OAuth flow timed out'));
          }
        }, 300000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_INTEGRATIONS_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Failed to connect calendar:', error);
    },
  });

  const disconnectCalendar = useMutation({
    mutationFn: async (integrationId: string) => {
      await postDisconnectCalendar({ accountId: integrationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALENDAR_INTEGRATIONS_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Failed to disconnect calendar:', error);
    },
  });

  return {
    profileQuery,
    notificationSettingsQuery,
    calendarIntegrationsQuery,
    updateUserProfile,
    updateNotificationSettings,
    connectCalendar,
    disconnectCalendar,
  };
};