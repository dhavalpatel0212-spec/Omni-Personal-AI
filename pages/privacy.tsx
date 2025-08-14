import React from 'react';
import { Helmet } from 'react-helmet';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import styles from './privacy.module.css';

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | OmniPA</title>
        <meta
          name="description"
          content="Read the OmniPA Privacy Policy to understand how we collect, use, and protect your data."
        />
      </Helmet>
      <div className={styles.pageWrapper}>
        <LandingHeader />
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <header className={styles.header}>
              <h1 className={styles.title}>Privacy Policy</h1>
              <p className={styles.subtitle}>Last Updated: December 15, 2024</p>
            </header>

            <div className={styles.legalContent}>
              <p>Welcome to OmniPA. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.</p>

              <h2>1. Information We Collect</h2>
              <p>We may collect information about you in a variety of ways. The information we may collect via the Application depends on the content and materials you use, and includes:</p>
              <ul>
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Application.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.</li>
                <li><strong>Data from AI Features:</strong> Content, such as text, images, or voice commands, that you provide when using our AI-powered features. This data is processed to provide the service and may be used to improve our AI models, subject to your settings.</li>
              </ul>

              <h2>2. Use of Your Information</h2>
              <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
              <ul>
                <li>Create and manage your account.</li>
                <li>Email you regarding your account or order.</li>
                <li>Enable user-to-user communications.</li>
                <li>Generate a personal profile about you to make future visits to the Application more personalized.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
              </ul>

              <h2>3. Disclosure of Your Information</h2>
              <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
              <ul>
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
              </ul>

              <h2>4. Contact Us</h2>
              <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@omnipa.app">privacy@omnipa.app</a></p>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
};

export default PrivacyPage;