import React from 'react';
import { Helmet } from 'react-helmet';
import styles from './settings.appearance.module.css';

const SettingsAppearancePage = () => {
  return (
    <>
      <Helmet>
        <title>Appearance - Settings</title>
        <meta name="description" content="Customize the look and feel of the application." />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <h2>Appearance</h2>
          <p>Appearance settings, including light and dark mode preferences, will be available soon.</p>
        </div>
      </div>
    </>
  );
};

export default SettingsAppearancePage;