import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from './Button';
import styles from './LandingHeader.module.css';
import { useAuth } from '../helpers/useAuth';

export const LandingHeader = () => {
  const { authState } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img 
            src="https://assets.floot.app/512b2b5f-3423-455b-8671-00c2925023d9/a096a08d-579e-4756-9cf5-c60d2a45506f.png" 
            alt="OmniPA Logo" 
            className={styles.logoIcon} 
          />
          <span className={styles.logoText}>OmniPA</span>
        </Link>
        <nav className={styles.nav}>
          <Link to="/#features" className={styles.navLink}>
            Features
          </Link>
          <Link to="/pricing" className={styles.navLink}>
            Pricing
          </Link>
          <Link to="/about" className={styles.navLink}>
            About
          </Link>
        </nav>
        <div className={styles.actions}>
          {authState.type === 'authenticated' ? (
            <Button asChild size="lg" className={styles.ctaButton}>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className={styles.loginButton}>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild size="lg" className={styles.ctaButton}>
                <Link to="/register">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};