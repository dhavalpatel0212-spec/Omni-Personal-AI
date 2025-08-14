import React from 'react';
import { Helmet } from 'react-helmet';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import styles from './contact.module.css';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | OmniPA</title>
        <meta
          name="description"
          content="Get in touch with the OmniPA team for support, press inquiries, or general questions."
        />
      </Helmet>
      <div className={styles.pageWrapper}>
        <LandingHeader />
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <div className={styles.comingSoon}>
              <h1 className={styles.title}>Contact</h1>
              <p className={styles.comingSoonMessage}>Coming Soon</p>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
};

export default ContactPage;