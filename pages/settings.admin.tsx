import React from 'react';
import { Helmet } from 'react-helmet';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../helpers/useAuth';
import { AdminAccountManagement } from '../components/AdminAccountManagement';
import { Skeleton } from '../components/Skeleton';
import styles from './settings.admin.module.css';

const SettingsAdminPage = () => {
  const { authState } = useAuth();

  const renderContent = () => {
    if (authState.type === 'loading') {
      return (
        <div className={styles.container}>
          <div className={styles.header}>
            <Skeleton style={{ height: '2rem', width: '200px', marginBottom: 'var(--spacing-2)' }} />
            <Skeleton style={{ height: '1.25rem', width: '400px' }} />
          </div>
          <Skeleton style={{ height: '300px', width: '100%' }} />
        </div>
      );
    }

    if (authState.type !== 'authenticated' || authState.user.role !== 'admin') {
      return (
        <div className={styles.accessDenied}>
          <ShieldAlert size={48} className={styles.accessDeniedIcon} />
          <h2 className={styles.accessDeniedTitle}>Access Denied</h2>
          <p className={styles.accessDeniedText}>
            You do not have the necessary permissions to view this page. This area is restricted to administrators only.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Admin Panel</h2>
          <p className={styles.subtitle}>
            Manage application settings and user accounts.
          </p>
        </div>
        <AdminAccountManagement />
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Admin - Settings</title>
        <meta name="description" content="Administrator settings for Omni Personal Assistant." />
      </Helmet>
      {renderContent()}
    </>
  );
};

export default SettingsAdminPage;