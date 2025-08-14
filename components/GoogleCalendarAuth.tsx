import React from 'react';
import { useGoogleCalendarConnection } from '../helpers/useGoogleCalendarConnection';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import styles from './GoogleCalendarAuth.module.css';

export const GoogleCalendarAuth = ({ className }: { className?: string }) => {
  const {
    connectionQuery,
    connectMutation,
    disconnectMutation,
  } = useGoogleCalendarConnection();

  const { data: connection, isFetching, error } = connectionQuery;

  const handleConnect = () => {
    connectMutation.mutate({});
  };

  const handleDisconnect = () => {
    if (connection?.id) {
      disconnectMutation.mutate(connection.id);
    }
  };

  if (isFetching) {
    return <GoogleCalendarAuthSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>Error: {error.message}</div>;
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Google Calendar</h3>
        {connection ? (
          <span className={styles.statusConnected}>
            <CheckCircle size={16} /> Connected
          </span>
        ) : (
          <span className={styles.statusDisconnected}>
            <XCircle size={16} /> Not Connected
          </span>
        )}
      </div>
      {connection ? (
        <div className={styles.connectionDetails}>
          <p>
            Connected as: <strong>{connection.calendarId}</strong>
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </div>
      ) : (
        <div className={styles.connectionDetails}>
          <p>Sync your events from Google Calendar.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConnect}
            disabled={connectMutation.isPending}
          >
            {connectMutation.isPending ? 'Connecting...' : 'Connect Google Calendar'}
          </Button>
        </div>
      )}
    </div>
  );
};

const GoogleCalendarAuthSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <h3 className={styles.title}><Skeleton style={{ width: '150px', height: '24px' }} /></h3>
      <Skeleton style={{ width: '100px', height: '20px' }} />
    </div>
    <div className={styles.connectionDetails}>
      <Skeleton style={{ width: '250px', height: '20px', marginBottom: 'var(--spacing-4)' }} />
      <Skeleton style={{ width: '120px', height: '32px' }} />
    </div>
  </div>
);