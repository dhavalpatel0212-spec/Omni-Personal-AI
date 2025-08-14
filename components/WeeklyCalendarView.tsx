import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../helpers/schema';
import { getWeekEvents } from '../endpoints/calendar/events/week_GET.schema';
import { Skeleton } from './Skeleton';
import { format, startOfWeek, addDays, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import styles from './WeeklyCalendarView.module.css';

type WeeklyCalendarViewProps = {
  className?: string;
  currentDate: Date;
  onEventClick: (event: Selectable<CalendarEvents>) => void;
};

export const WeeklyCalendarView = ({ className, currentDate, onEventClick }: WeeklyCalendarViewProps) => {
  const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  const { data: events, isFetching, error } = useQuery({
    queryKey: ['calendar', 'events', 'week', format(weekStartDate, 'yyyy-MM-dd')],
    queryFn: () => getWeekEvents({ weekOf: weekStartDate }),
  });

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: weekStartDate,
      end: addDays(weekStartDate, 6),
    });
  }, [weekStartDate]);

  const eventsByDay = useMemo(() => {
    const grouped: Record<string, Selectable<CalendarEvents>[]> = {};
    if (!events) return grouped;

    for (const event of events) {
      const eventDateStr = format(new Date(event.startTime), 'yyyy-MM-dd');
      if (!grouped[eventDateStr]) {
        grouped[eventDateStr] = [];
      }
      grouped[eventDateStr].push(event);
    }
    return grouped;
  }, [events]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Header is now controlled by the parent page */}

      <div className={styles.calendarGrid}>
        <div className={styles.gridHeader}>
          {weekDays.map(day => (
            <div key={day.toString()} className={styles.dayHeader}>
              <span className={styles.dayName}>{format(day, 'eee')}</span>
              <span className={`${styles.dayNumber} ${isToday(day) ? styles.today : ''}`}>
                {format(day, 'd')}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.gridBody}>
          {isFetching && <GridSkeleton />}
          {error && <div className={styles.error}>Error loading events: {(error as Error).message}</div>}
          {!isFetching && !error && weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay[dayKey] || [];
            return (
              <div key={dayKey} className={`${styles.dayColumn} ${isToday(day) ? styles.todayColumn : ''}`}>
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={styles.eventCard}
                    onClick={() => onEventClick(event)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View event: ${event.title}`}
                  >
                    <p className={styles.eventTitle}>{event.title}</p>
                    <p className={styles.eventTime}>{format(new Date(event.startTime), 'p')}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const GridSkeleton = () => (
  <>
    {[...Array(7)].map((_, i) => (
      <div key={i} className={styles.dayColumn}>
        <Skeleton style={{ height: '60px', marginBottom: 'var(--spacing-2)' }} />
        <Skeleton style={{ height: '40px' }} />
      </div>
    ))}
  </>
);