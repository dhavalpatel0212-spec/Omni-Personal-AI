import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Bell, Calendar, Shield, SunMoon, Crown, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '../helpers/useAuth';
import styles from './SettingsLayout.module.css';

const settingsTabs = [
  {
    id: 'profile',
    label: 'Profile & Account',
    icon: User,
    path: '/profile',
  },
  {
    id: 'subscription',
    label: 'Subscription & Billing',
    icon: Crown,
    path: '/settings/subscription',
  },
  {
    id: 'support',
    label: 'Support & Feedback',
    icon: MessageSquare,
    path: '/settings/support',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/settings/notifications',
  },
  {
    id: 'calendar',
    label: 'Calendar Integration',
    icon: Calendar,
    path: '/settings/calendar',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Shield,
    path: '/settings/privacy',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: SunMoon,
    path: '/settings/appearance',
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: Settings,
    path: '/settings/admin',
    adminOnly: true,
  },
];

export const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { authState } = useAuth();

  const isAdmin = authState.type === 'authenticated' && authState.user.role === 'admin';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </header>

      <div className={styles.content}>
        <nav className={styles.sidebar}>
          {settingsTabs
            .filter(tab => !tab.adminOnly || isAdmin)
            .map(tab => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
        </nav>

        <main className={styles.mainPanel}>
          {children}
        </main>
      </div>
    </div>
  );
};