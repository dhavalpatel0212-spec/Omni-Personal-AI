import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWeekEvents } from '../endpoints/calendar/events/week_GET.schema';
import { postCreateEvent } from '../endpoints/calendar/events/create_POST.schema';
import { postUpdateEvent } from '../endpoints/calendar/events/update_POST.schema';
import { postDeleteEvent } from '../endpoints/calendar/events/delete_POST.schema';
import { CalendarEventDialog } from './CalendarEventDialog';
import { CalendarEventForm, CalendarEventFormValues } from './CalendarEventForm';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { XCircle } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../helpers/schema';
import { toast } from 'sonner';
import styles from './CalendarManagement.module.css';

const useCalendarEvents = (weekStartDate: Date) => {
  const queryClient = useQueryClient();
  const weekKey = format(weekStartDate, 'yyyy-MM-dd');

  const eventsQuery = useQuery({
    queryKey: ['calendar', 'events', 'week', weekKey],
    queryFn: () => getWeekEvents({ weekOf: weekStartDate }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CalendarEventFormValues) => postCreateEvent(data),
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; event: CalendarEventFormValues }) => postUpdateEvent(data),
    onSuccess: () => {
      toast.success('Event updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
    onError: (error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postDeleteEvent({ eventId: id }),
    onSuccess: () => {
      toast.success('Event deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });

  return { eventsQuery, createMutation, updateMutation, deleteMutation };
};

type CalendarManagementProps = {
  className?: string;
  currentDate: Date;
  onEditEvent: (event: Selectable<CalendarEvents>) => void;
};

export const CalendarManagement = ({ className, currentDate, onEditEvent }: CalendarManagementProps) => {
  const [selectedEventForForm, setSelectedEventForForm] = useState<Selectable<CalendarEvents> | null>(null);
  
  const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const { eventsQuery, createMutation, updateMutation, deleteMutation } = useCalendarEvents(weekStartDate);
  const { data: events, isFetching, error } = eventsQuery;

  const handleEditClick = (event: Selectable<CalendarEvents>) => {
    setSelectedEventForForm(event);
    onEditEvent(event);
  };

  const handleSubmit = (values: CalendarEventFormValues) => {
    if (selectedEventForForm) {
      updateMutation.mutate({ id: selectedEventForForm.id, event: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Effect to listen for form submission from the parent page's dialog
  useEffect(() => {
    const form = document.getElementById('event-form-in-management');
    const handleExternalSubmit = (e: Event) => {
        e.preventDefault();
        // This is a bit of a hack. The form component should ideally be used here.
        // But to avoid re-implementing the form logic, we're just triggering the submit.
        // The actual form data needs to be handled by the form itself.
        // This assumes the form is already populated with the correct data.
    };

    form?.addEventListener('submit', handleExternalSubmit);
    return () => {
        form?.removeEventListener('submit', handleExternalSubmit);
    };
  }, []);


  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* The header is now controlled by the parent page */}
      
      {isFetching && <div className={styles.eventList}><EventListSkeleton /></div>}
      {error && <div className={styles.error}>Error loading events: {error.message}</div>}
      {events && (
        <div className={styles.eventList}>
          {events.length > 0 ? (
            events.map((event: Selectable<CalendarEvents>) => (
              <div key={event.id} className={styles.eventItem} onClick={() => handleEditClick(event)}>
                <div className={styles.eventTime}>
                  <p>{format(new Date(event.startTime), 'p')}</p>
                  <p>{format(new Date(event.endTime), 'p')}</p>
                </div>
                <div className={styles.eventDetails}>
                  <h4 className={styles.eventTitle}>{event.title}</h4>
                  <p className={styles.eventDescription}>{event.description}</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}>
                  <XCircle size={16} />
                </Button>
              </div>
            ))
          ) : (
            <div className={styles.noEvents}>No events for this week.</div>
          )}
        </div>
      )}

      {/* Hidden form for the dialog to use. This is a workaround to avoid lifting all mutation logic up. */}
      <div style={{ display: 'none' }}>
        <CalendarEventForm
          id="event-form-in-management"
          initialData={selectedEventForForm}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  );
};

const EventListSkeleton = () => (
  <>
    {[...Array(3)].map((_, i) => (
      <div key={i} className={styles.eventItem}>
        <div className={styles.eventTime}>
          <Skeleton style={{ width: '60px', height: '16px' }} />
          <Skeleton style={{ width: '60px', height: '16px' }} />
        </div>
        <div className={styles.eventDetails}>
          <Skeleton style={{ width: '200px', height: '20px', marginBottom: 'var(--spacing-1)' }} />
          <Skeleton style={{ width: '300px', height: '16px' }} />
        </div>
      </div>
    ))}
  </>
);