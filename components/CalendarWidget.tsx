import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../helpers/schema';
import { getTodayEvents } from '../endpoints/calendar/events/today_GET.schema';
import { getWeekEvents } from '../endpoints/calendar/events/week_GET.schema';
import { useGoogleCalendarSync } from '../helpers/useGoogleCalendarSync';
import { useGoogleCalendarConnection } from '../helpers/useGoogleCalendarConnection';
import { CalendarEventList } from './CalendarEventList';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Calendar, RefreshCw, ArrowRight } from 'lucide-react';
import { format, startOfToday, startOfWeek, addDays, isToday } from 'date-fns';
import styles from './CalendarWidget.module.css';

export const CalendarWidget = ({ className }: { className?: string }) => {
  const [isUpcomingVisible, setUpcomingVisible] = useState(false);
  const { handleSync, syncMutation, isConnected, isCheckingConnection } = useGoogleCalendarSync();
  const { connectMutation } = useGoogleCalendarConnection();

  const { data: todayEvents, isFetching: isFetchingToday, error: todayError } = useQuery({
    queryKey: ['calendar', 'events', 'today'],
    queryFn: getTodayEvents,
  });

  const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const { data: weekEvents, isFetching: isFetchingWeek, error: weekError } = useQuery({
    queryKey: ['calendar', 'events', 'week', format(weekStartDate, 'yyyy-MM-dd')],
    queryFn: () => getWeekEvents({ weekOf: weekStartDate }),
    enabled: isUpcomingVisible,
  });

  const upcomingEvents = weekEvents?.filter(event => !isToday(new Date(event.startTime)));

  const handleConnect = () => {
    connectMutation.mutate({});
  };

  const isLoading = isFetchingToday || (isUpcomingVisible && isFetchingWeek);
  const error = todayError || weekError;

  return (
    <div className={`${styles.widgetContainer} ${className || ''}`}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <Calendar size={20} className={styles.titleIcon} />
          <h3 className={styles.title}>My Calendar</h3>
        </div>
        <div className={styles.actions}>
          {isConnected ? (
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleSync} 
              disabled={syncMutation.isPending || isCheckingConnection}
              aria-label="Sync Google Calendar"
            >
              <RefreshCw size={16} className={syncMutation.isPending ? styles.syncingIcon : ''} />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleConnect}
              disabled={connectMutation.isPending || isCheckingConnection}
            >
              Connect
            </Button>
          )}
          <Button asChild variant="link" size="sm" className={styles.viewAllLink}>
            <Link to="/calendar">
              View All <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        {!isConnected && !isCheckingConnection && (
          <div className={styles.connectionPrompt}>
            <p>Connect your Google Calendar to see your events here.</p>
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
        
        <section>
          <h4 className={styles.sectionTitle}>Today's Events</h4>
          {error && <div className={styles.error}>Error: {(error as Error).message}</div>}
          <CalendarEventList
            events={todayEvents as Selectable<CalendarEvents>[] | undefined}
            isLoading={isFetchingToday}
            // Edit/Delete would be handled on the main calendar page
            onEdit={() => {}} 
            onDelete={() => {}}
            isCompact={true}
          />
        </section>

        <div className={styles.separator}></div>

        <section>
          <button className={styles.upcomingToggle} onClick={() => setUpcomingVisible(!isUpcomingVisible)}>
            <h4 className={styles.sectionTitle}>Upcoming</h4>
            <ArrowRight size={16} className={`${styles.toggleIcon} ${isUpcomingVisible ? styles.toggled : ''}`} />
          </button>
          {isUpcomingVisible && (
            <div className={styles.upcomingContent}>
              {weekError && <div className={styles.error}>Error: {(weekError as Error).message}</div>}
              <CalendarEventList
                events={upcomingEvents as Selectable<CalendarEvents>[] | undefined}
                isLoading={isFetchingWeek}
                onEdit={() => {}}
                onDelete={() => {}}
                isCompact={true}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};