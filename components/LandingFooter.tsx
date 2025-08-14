import React from 'react';
import { Link } from 'react-router-dom';

import styles from './LandingFooter.module.css';

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <img 
                src="https://assets.floot.app/512b2b5f-3423-455b-8671-00c2925023d9/a096a08d-579e-4756-9cf5-c60d2a45506f.png" 
                alt="OmniPA Logo" 
                className={styles.logoIcon} 
              />
              <span className={styles.logoText}>OmniPA</span>
            </Link>
            <p className={styles.tagline}>AI-Powered OmniPA</p>
          </div>
          <div className={styles.linksGrid}>
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Product</h4>
              <Link to="/#features" className={styles.footerLink}>
                Features
              </Link>
              <Link to="/pricing" className={styles.footerLink}>
                Pricing
              </Link>
              
            </div>
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Company</h4>
              <Link to="/about" className={styles.footerLink}>
                About Us
              </Link>
              <Link to="/careers" className={styles.footerLink}>
                Careers
              </Link>
              <Link to="/contact" className={styles.footerLink}>
                Contact
              </Link>
            </div>
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Legal</h4>
              <Link to="/privacy" className={styles.footerLink}>
                Privacy Policy
              </Link>
              <Link to="/terms" className={styles.footerLink}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} OmniPA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};