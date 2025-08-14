import React from 'react';
import { Helmet } from 'react-helmet';
import { PwaManifest } from '../helpers/manifest';
import { Link } from 'react-router-dom';
import { useAuth } from '../helpers/useAuth';
import { 
  Zap, 
} from 'lucide-react';
import { Button } from '../components/Button';
import { LandingHero } from '../components/LandingHero';
import { LandingBenefits } from '../components/LandingBenefits';
import { LandingFeatures } from '../components/LandingFeatures';
import { LandingCTA } from '../components/LandingCTA';
import styles from './landing.module.css';

const LandingPage = () => {
  const { authState } = useAuth();

  const handleGetStarted = () => {
    // Navigate to register page
    window.location.href = '/register';
  };

  return (
    <>
      <Helmet>
        <title>OmniPA - Your Omnipotent Personal Assistant</title>
        <meta name="description" content="Your omnipotent AI-powered personal assistant that simplifies daily planning, goal tracking, smart shopping, mood logging, travel planning, and more. Experience seamless productivity with GPT-4o intelligence." />
        <meta name="keywords" content="AI personal assistant, productivity, goal tracking, shopping lists, mood tracking, travel planning, GPT-4, task management, daily planning" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OmniPA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="OmniPA - Your Omnipotent Personal Assistant" />
        <meta property="og:description" content="Your omnipotent AI-powered personal assistant that simplifies daily planning, goal tracking, smart shopping, mood logging, travel planning, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/icons/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="OmniPA" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="OmniPA - Your Omnipotent Personal Assistant" />
        <meta name="twitter:description" content="Your omnipotent AI-powered personal assistant that simplifies daily planning, goal tracking, smart shopping, mood logging, travel planning, and more." />
        <meta name="twitter:image" content="/icons/twitter-card.png" />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="OmniPA Team" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <PwaManifest />
      
      <div className={styles.landingContainer}>
        {/* Header Section */}
        <header className={styles.landingHeader}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <img 
                src="https://assets.floot.app/512b2b5f-3423-455b-8671-00c2925023d9/a096a08d-579e-4756-9cf5-c60d2a45506f.png" 
                alt="OmniPA Logo" 
                className={styles.logoImage}
              />
              <div className={styles.logoText}>
                <h1 className={styles.brandName}>OmniPA</h1>
                <p className={styles.tagline}>Your life just made very simple</p>
              </div>
            </div>
            <nav className={styles.headerNav}>
              {authState.type === 'authenticated' ? (
                <Button asChild size="lg" className={styles.ctaButton}>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="lg" className={styles.ctaButton}>
                    <Link to="/register">Get Started Free</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <LandingHero 
          onJoinWaitlistClick={handleGetStarted}
          joinedWaitlist={false}
        />

        {/* Benefits Section */}
        <LandingBenefits />

        {/* Features Section */}
        <LandingFeatures />

        {/* CTA Flow Section */}
        <LandingCTA 
          onJoinWaitlistClick={handleGetStarted}
          joinedWaitlist={false}
        />

        {/* Footer CTA */}
        <section className={styles.footerCta}>
          <div className={styles.footerCtaContent}>
            <h2 className={styles.footerCtaTitle}>Ready to Simplify Your Life?</h2>
            <p className={styles.footerCtaDescription}>
              Join thousands of users who are already living smarter with OmniPA.
            </p>
            <Button size="lg" onClick={handleGetStarted}>
              <Zap size={18} />
              Get Started
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingPage;