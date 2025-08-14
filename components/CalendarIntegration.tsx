import React from 'react';
import { useSettings } from '../helpers/useSettings';
import { GoogleCalendarAuth } from './GoogleCalendarAuth';
import { Button } from './Button';
import { Switch } from './Switch';
import { Skeleton } from './Skeleton';
import { Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';
import styles from './CalendarIntegration.module.css';

const supportedProviders = [
  { id: 'google', name: 'Google Calendar' },
  { id: 'apple', name: 'Apple Calendar' },
  { id: 'outlook', name: 'Outlook Calendar' },
  { id: 'yahoo', name: 'Yahoo Calendar' },
];

export const CalendarIntegration = ({ className }: { className?: string }) => {
  const { calendarIntegrationsQuery, connectCalendar, disconnectCalendar } = useSettings();
  const { data: integrations, isFetching, error } = calendarIntegrationsQuery;

  const connectedProviders = new Map(integrations?.map(int => [int.provider, int]));

  const handleConnect = (provider: string) => {
    connectCalendar.mutate(provider);
  };

  const handleDisconnect = (id: string) => {
    disconnectCalendar.mutate(id);
  };

  if (isFetching) {
    return <CalendarIntegrationSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>Error loading calendar integrations: {error.message}</div>;
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h2 className={styles.title}>Calendar Integration</h2>
      <p className={styles.description}>Connect your calendar accounts to sync events.</p>
      
      <div className={styles.integrationList}>
        {supportedProviders.map(provider => {
          // Use GoogleCalendarAuth for Google Calendar provider
          if (provider.id === 'google') {
            return (
              <GoogleCalendarAuth key={provider.id} className={styles.googleCalendarAuth} />
            );
          }

          const integration = connectedProviders.get(provider.id);
          return (
            <div key={provider.id} className={styles.integrationItem}>
              <div className={styles.providerInfo}>
                <Calendar size={24} className={styles.providerIcon} />
                <div>
                  <h3 className={styles.providerName}>{provider.name}</h3>
                  {integration ? (
                    <p className={styles.providerStatusConnected}>
                      <CheckCircle size={14} />
                      Connected as {integration.email}
                    </p>
                  ) : (
                    <p className={styles.providerStatusDisconnected}>
                      <XCircle size={14} />
                      Not connected
                    </p>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                {integration ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDisconnect(integration.id)}
                    disabled={disconnectCalendar.isPending}
                  >
                    {disconnectCalendar.isPending ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleConnect(provider.id)}
                    disabled={connectCalendar.isPending}
                  >
                    <Plus size={16} />
                    {connectCalendar.isPending ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {integrations && integrations.length > 0 && (
        <div className={styles.syncPreferences}>
          <h3 className={styles.sectionTitle}>Sync Preferences</h3>
          <div className={styles.preferenceItem}>
            <div>
              <label htmlFor="twoWaySync">Two-way Sync</label>
              <p>Events created here will be added to your external calendar.</p>
            </div>
            <Switch id="twoWaySync" />
          </div>
          <div className={styles.preferenceItem}>
            <div>
              <label htmlFor="syncFrequency">Sync Frequency</label>
              <p>How often to check for new events.</p>
            </div>
            <span>Every 15 minutes</span>
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarIntegrationSkeleton = () => (
  <div className={styles.container}>
    <h2 className={styles.title}><Skeleton style={{ width: '250px', height: '28px' }} /></h2>
    <p className={styles.description}><Skeleton style={{ width: '350px', height: '20px' }} /></p>
    <div className={styles.integrationList}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={styles.integrationItem}>
          <div className={styles.providerInfo}>
            <Skeleton style={{ width: '40px', height: '40px', borderRadius: 'var(--radius)' }} />
            <div style={{ flex: 1 }}>
              <Skeleton style={{ width: '150px', height: '20px', marginBottom: 'var(--spacing-1)' }} />
              <Skeleton style={{ width: '100px', height: '16px' }} />
            </div>
          </div>
          <div className={styles.actions}>
            <Skeleton style={{ width: '100px', height: '32px' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);