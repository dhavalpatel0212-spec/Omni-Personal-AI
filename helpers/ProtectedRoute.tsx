import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import styles from './ProtectedRoute.module.css';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState.type === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <img
            src="https://assets.floot.app/512b2b5f-3423-455b-8671-00c2925023d9/a096a08d-579e-4756-9cf5-c60d2a45506f.png"
            alt="OmniPA Logo"
            className={styles.loadingLogo}
          />
          <div className={styles.loadingText}>Loading OmniPA...</div>
        </div>
      </div>
    );
  }

  if (authState.type === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};