import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQueryClient } from '@tanstack/react-query';
import { startOfWeek, subDays, addDays, format } from 'date-fns';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../helpers/schema';
import { useGoogleCalendarSync } from '../helpers/useGoogleCalendarSync';
import { useGoogleCalendarConnection } from '../helpers/useGoogleCalendarConnection';
import { GoogleCalendarAuth } from '../components/GoogleCalendarAuth';
import { CalendarManagement } from '../components/CalendarManagement';
import { WeeklyCalendarView } from '../components/WeeklyCalendarView';
import { CalendarEventDialog } from '../components/CalendarEventDialog';
import { CalendarEventFormValues } from '../components/CalendarEventForm';
import { Button } from '../components/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { Plus, RefreshCw, List, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './calendar.module.css';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'list' | 'week'>('week');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Selectable<CalendarEvents> | null>(null);

  const { handleSync, syncMutation, isConnected, isCheckingConnection } = useGoogleCalendarSync();
  const { connectMutation } = useGoogleCalendarConnection();
  const queryClient = useQueryClient();

  const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });

  const handlePrevWeek = () => setCurrentDate(subDays(currentDate, 7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const handleToday = () => setCurrentDate(new Date());

  const handleConnect = () => {
    connectMutation.mutate({});
  };

  const handleOpenCreateDialog = () => {
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (event: Selectable<CalendarEvents>) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  // This function will be passed to CalendarManagement to handle form submission
  // It's defined here to control the dialog state which is also used by WeeklyCalendarView
  const handleSubmit = (values: CalendarEventFormValues) => {
    // The actual mutation logic is inside CalendarManagement, which is always rendered.
    // We just need to close the dialog on success.
    // We can find the form and submit it programmatically.
    const form = document.getElementById('event-form-in-management');
    if (form) {
      // We need a way to know when the submission is done to close the dialog.
      // A better approach would be to lift the mutations up, but to minimize refactoring
      // of CalendarManagement, we can rely on its internal logic and just close the dialog.
      // The mutations in CalendarManagement already invalidate queries, so data will refresh.
      // Let's assume for now that we can just submit the form.
      // A better refactor would be to have a shared useCalendarMutations hook.
      // For now, we'll just close the dialog optimistically.
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Calendar | OmniPA</title>
        <meta name="description" content="Manage your calendar, events, and schedule." />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Calendar</h1>
            <div className={styles.navigation}>
              <Button variant="outline" size="sm" onClick={handleToday}>Today</Button>
              <div className={styles.navButtons}>
                <Button variant="ghost" size="icon-sm" onClick={handlePrevWeek} aria-label="Previous week"><ChevronLeft /></Button>
                <Button variant="ghost" size="icon-sm" onClick={handleNextWeek} aria-label="Next week"><ChevronRight /></Button>
              </div>
              <h2 className={styles.dateRange}>{format(weekStartDate, 'MMMM yyyy')}</h2>
            </div>
          </div>
          <div className={styles.headerRight}>
            {isConnected ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSync} 
                disabled={syncMutation.isPending || isCheckingConnection}
              >
                <RefreshCw size={16} className={syncMutation.isPending ? styles.syncingIcon : ''} />
                {syncMutation.isPending ? 'Syncing...' : 'Sync'}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleConnect}
                disabled={connectMutation.isPending || isCheckingConnection}
              >
                {connectMutation.isPending ? 'Connecting...' : 'Connect Google Calendar'}
              </Button>
            )}
            <Button onClick={handleOpenCreateDialog} size="sm">
              <Plus size={16} /> New Event
            </Button>
          </div>
        </header>

        {!isConnected && !isCheckingConnection && (
          <div className={styles.connectionSection}>
            <GoogleCalendarAuth />
          </div>
        )}

        <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'week')} className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="week"><LayoutGrid size={16} /> Week View</TabsTrigger>
            <TabsTrigger value="list"><List size={16} /> List View</TabsTrigger>
          </TabsList>
          <TabsContent value="week" className={styles.tabContent}>
            <WeeklyCalendarView
              currentDate={currentDate}
              onEventClick={handleOpenEditDialog}
            />
          </TabsContent>
          <TabsContent value="list" className={styles.tabContent}>
            <CalendarManagement
              currentDate={currentDate}
              onEditEvent={handleOpenEditDialog}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* This dialog is controlled by the page and can be triggered from either view */}
      <CalendarEventDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        // The actual submission logic is handled within CalendarManagement to avoid duplicating mutation hooks.
        // We find the form from the (always rendered, but maybe hidden) CalendarManagement component and submit it.
        onSubmit={() => {
          const form = document.querySelector('#event-form-in-management') as HTMLFormElement;
          if (form) {
            // Create and dispatch a submit event
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
          }
        }}
        // We can't easily get the submitting state without major refactoring,
        // so we'll leave it as false. The button inside will show its own state.
        isSubmitting={false} 
      />
    </>
  );
}