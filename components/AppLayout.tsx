import React from 'react';
import { useAuth } from '../helpers/useAuth';
import { useLocation } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';
import { BottomNavigation } from './BottomNavigation';
import { AuthLoadingState } from './AuthLoadingState';

import styles from './AppLayout.module.css';
import { DesktopNavigation } from './DesktopNavigation';
import { Link } from 'react-router-dom';

export interface AppLayoutProps {
  children: React.ReactNode;
  /**
   * Determines if the layout chrome (header, nav) should be rendered.
   * Set to 'minimal' for pages like login/signup that don't need navigation.
   * Defaults to 'full'.
   */
  variant?: 'full' | 'minimal';
}

export const AppLayout = ({ children, variant = 'full' }: AppLayoutProps) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (variant === 'minimal') {
    return <main className={styles.minimalContainer}>{children}</main>;
  }

  if (authState.type === 'loading') {
    return <AuthLoadingState title="Loading Your Workspace..." />;
  }

  if (authState.type === 'unauthenticated') {
    // If we're on the homepage, render children without app chrome to allow landing page to show
    if (location.pathname === '/') {
      return <main className={styles.minimalContainer}>{children}</main>;
    }
    
    // For other authenticated routes, a router-level protection should redirect to login.
    // This case handles the brief moment before redirection or if a protected page is accessed directly.
    // We show a loader to prevent flashing unstyled content before the redirect logic kicks in.
    return <AuthLoadingState title="Redirecting to login..." />;
  }

  // Authenticated state
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.logo}>
            <img 
              src="https://assets.floot.app/512b2b5f-3423-455b-8671-00c2925023d9/a096a08d-579e-4756-9cf5-c60d2a45506f.png" 
              alt="OmniPA Logo" 
              className={styles.logoIcon} 
            />
            <span className={styles.logoText}>OmniPA</span>
          </Link>
        </div>
        <div className={styles.headerCenter}>
          <DesktopNavigation />
        </div>
        <div className={styles.headerRight}>
          <ProfileMenu />
        </div>
      </header>
      <main className={styles.mainContent}>{children}</main>
      <BottomNavigation />
    </div>
  );
};