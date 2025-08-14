import React from 'react';
import { Helmet } from 'react-helmet';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import styles from './pricing.module.css';

const PricingPage = () => {
  return (
    <>
      <Helmet>
        <title>Pricing | OmniPA</title>
        <meta
          name="description"
          content="Find the perfect plan for you. Explore OmniPA's pricing tiers and features."
        />
      </Helmet>
      <div className={styles.pageWrapper}>
        <LandingHeader />
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <div className={styles.comingSoon}>
              <h1 className={styles.title}>Pricing</h1>
              <p className={styles.comingSoonMessage}>Coming Soon</p>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
};

export default PricingPage;