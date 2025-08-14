import React from 'react';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../helpers/schema';
import { format, isToday } from 'date-fns';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Pencil, Trash2, MapPin, Users, Calendar as CalendarIcon } from 'lucide-react';
import styles from './CalendarEventList.module.css';

type CalendarEventListProps = {
  events: Selectable<CalendarEvents>[] | undefined;
  isLoading: boolean;
  onEdit: (event: Selectable<CalendarEvents>) => void;
  onDelete: (eventId: number) => void;
  className?: string;
  isCompact?: boolean;
};

export const CalendarEventList = ({
  events,
  isLoading,
  onEdit,
  onDelete,
  className,
  isCompact = false,
}: CalendarEventListProps) => {
  if (isLoading) {
    return <EventListSkeleton isCompact={isCompact} />;
  }

  if (!events || events.length === 0) {
    return (
      <div className={`${styles.noEvents} ${isCompact ? styles.noEventsCompact : ''}`}>
        <CalendarIcon size={isCompact ? 24 : 32} className={styles.noEventsIcon} />
        <p>No events scheduled.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.eventList} ${className || ''}`}>
      {events.map((event) => (
        <div key={event.id} className={`${styles.eventItem} ${isCompact ? styles.compact : ''}`}>
          <div className={styles.eventTime}>
            <p className={styles.time}>
              {format(new Date(event.startTime), 'p')}
            </p>
            {!isCompact && (
              <p className={styles.date}>
                {isToday(new Date(event.startTime)) ? 'Today' : format(new Date(event.startTime), 'MMM d')}
              </p>
            )}
          </div>
          <div className={styles.eventDetails}>
            <h4 className={styles.eventTitle}>{event.title}</h4>
            {event.location && !isCompact && (
              <div className={styles.eventMeta}>
                <MapPin size={14} />
                <span>{event.location}</span>
              </div>
            )}
            {event.attendees && (event.attendees as any[]).length > 0 && !isCompact && (
              <div className={styles.eventMeta}>
                <Users size={14} />
                <span>{(event.attendees as any[]).length} attendees</span>
              </div>
            )}
          </div>
          {!isCompact && (
            <div className={styles.eventActions}>
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(event)} aria-label={`Edit event ${event.title}`}>
                <Pencil size={16} />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onDelete(event.id)} aria-label={`Delete event ${event.title}`}>
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const EventListSkeleton = ({ isCompact }: { isCompact: boolean }) => (
  <div className={styles.eventList}>
    {[...Array(3)].map((_, i) => (
      <div key={i} className={`${styles.eventItem} ${isCompact ? styles.compact : ''}`}>
        <div className={styles.eventTime}>
          <Skeleton style={{ width: '50px', height: '16px' }} />
          {!isCompact && <Skeleton style={{ width: '40px', height: '14px', marginTop: '4px' }} />}
        </div>
        <div className={styles.eventDetails}>
          <Skeleton style={{ width: '70%', height: '20px', marginBottom: 'var(--spacing-1)' }} />
          {!isCompact && <Skeleton style={{ width: '50%', height: '16px' }} />}
        </div>
      </div>
    ))}
  </div>
);