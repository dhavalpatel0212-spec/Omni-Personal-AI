import React from 'react';
import { Helmet } from 'react-helmet';
import { NotificationSettings } from '../components/NotificationSettings';
import styles from './settings.notifications.module.css';

const SettingsNotificationsPage = () => {
  return (
    <>
      <Helmet>
        <title>Notifications - Settings</title>
        <meta name="description" content="Manage your notification preferences." />
      </Helmet>
      <div className={styles.container}>
        <NotificationSettings />
      </div>
    </>
  );
};

export default SettingsNotificationsPage;