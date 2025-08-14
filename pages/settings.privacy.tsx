import React from 'react';
import { Helmet } from 'react-helmet';
import { SecurityEnhancementInfo } from '../components/SecurityEnhancementInfo';
import { PasswordSecuritySection } from '../components/PasswordSecuritySection';
import styles from './settings.privacy.module.css';

const SettingsPrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy & Security - Settings</title>
        <meta name="description" content="Manage your privacy and security settings." />
      </Helmet>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Privacy & Security</h1>
          <p className={styles.description}>
            Manage your account security settings and review our security policies.
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <PasswordSecuritySection />
          </div>

          <div className={styles.section}>
            <SecurityEnhancementInfo />
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPrivacyPage;