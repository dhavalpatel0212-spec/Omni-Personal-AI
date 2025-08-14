import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Selectable } from 'kysely';
import { CalendarEvents } from '../helpers/schema';
import { CalendarIntegration } from '../components/CalendarIntegration';
import { CalendarManagement } from '../components/CalendarManagement';
import styles from './settings.calendar.module.css';

const SettingsCalendarPage = () => {
  const [currentDate] = useState(new Date());

  const handleEditEvent = (event: Selectable<CalendarEvents>) => {
    // In the settings page, we can just log the event or show a simple alert
    // since this is primarily for viewing/managing events, not full editing
    console.log('Event selected:', event);
  };

  return (
    <>
      <Helmet>
        <title>Calendar Integration - Settings</title>
        <meta name="description" content="Connect and manage your calendar integrations." />
      </Helmet>
      <div className={styles.container}>
        <CalendarIntegration />
        <CalendarManagement 
          className={styles.calendarManagement}
          currentDate={currentDate}
          onEditEvent={handleEditEvent}
        />
      </div>
    </>
  );
};

export default SettingsCalendarPage;