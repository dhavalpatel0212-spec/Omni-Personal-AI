import React from 'react';
import { Helmet } from 'react-helmet';
import { FeedbackForm } from '../components/FeedbackForm';
import styles from './settings.support.module.css';

const SettingsSupportPage = () => {
  return (
    <>
      <Helmet>
        <title>Support & Feedback - Settings</title>
        <meta name="description" content="Submit a bug report, feature request, or general feedback." />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Support & Feedback</h2>
          <p className={styles.subtitle}>
            We value your input! Please use this form to report issues, request features, or share your thoughts.
          </p>
        </div>
        <FeedbackForm />
      </div>
    </>
  );
};

export default SettingsSupportPage;