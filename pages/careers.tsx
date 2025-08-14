import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import styles from './careers.module.css';

const CareersPage = () => {
  return (
    <>
      <Helmet>
        <title>Careers | OmniPA</title>
        <meta
          name="description"
          content="Join the OmniPA team and help us build the future of personal assistance. Explore open positions and our company culture."
        />
      </Helmet>
      <div className={styles.pageWrapper}>
        <LandingHeader />
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <div className={styles.comingSoon}>
              <h1 className={styles.title}>Careers</h1>
              <p className={styles.comingSoonMessage}>Coming Soon</p>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
};

export default CareersPage;