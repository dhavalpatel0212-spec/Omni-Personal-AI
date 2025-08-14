import React from 'react';
import { Helmet } from 'react-helmet';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import styles from './terms.module.css';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | OmniPA</title>
        <meta
          name="description"
          content="Read the OmniPA Terms of Service to understand the rules and guidelines for using our application."
        />
      </Helmet>
      <div className={styles.pageWrapper}>
        <LandingHeader />
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <header className={styles.header}>
              <h1 className={styles.title}>Terms of Service</h1>
              <p className={styles.subtitle}>Last Updated: December 15, 2024</p>
            </header>

            <div className={styles.legalContent}>
              <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the OmniPA application (the "Service") operated by OmniPA ("us", "we", or "our").</p>
              <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

              <h2>1. Accounts</h2>
              <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
              <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>

              <h2>2. Intellectual Property</h2>
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of OmniPA and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

              <h2>3. Termination</h2>
              <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
              <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>

              <h2>4. Limitation Of Liability</h2>
              <p>In no event shall OmniPA, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

              <h2>5. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at: <a href="mailto:legal@omnipa.app">legal@omnipa.app</a></p>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
};

export default TermsPage;