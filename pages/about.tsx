import React from 'react';
import { Helmet } from 'react-helmet';
import { LandingHeader } from '../components/LandingHeader';
import { LandingFooter } from '../components/LandingFooter';
import styles from './about.module.css';
import { Bot, Target, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us | OmniPA</title>
        <meta
          name="description"
          content="Learn about OmniPA's mission to simplify daily life through intelligent AI-powered assistance."
        />
      </Helmet>
      <div className={styles.pageWrapper}>
        <LandingHeader />
        <main className={styles.mainContent}>
          <div className={styles.contentContainer}>
            <header className={styles.header}>
              <h1 className={styles.title}>Simplifying Complexity, One Task at a Time</h1>
              <p className={styles.subtitle}>
                OmniPA was born from a simple idea: technology should work for you, not the other way around. We're dedicated to building an intelligent assistant that understands your needs and proactively helps you achieve your goals.
              </p>
            </header>

            <section className={styles.section}>
              <div className={styles.sectionIcon}>
                <Target />
              </div>
              <h2 className={styles.sectionTitle}>Our Mission</h2>
              <p className={styles.sectionText}>
                Our mission is to empower individuals to lead more organized, productive, and fulfilling lives by providing a seamless, AI-driven personal assistant. We aim to automate the mundane, clarify objectives, and offer insightful guidance, giving you back the time and mental space to focus on what truly matters.
              </p>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionIcon}>
                <Bot />
              </div>
              <h2 className={styles.sectionTitle}>Our Story</h2>
              <p className={styles.sectionText}>
                Founded by a team of developers, designers, and AI enthusiasts, OmniPA started as a project to solve our own daily struggles with managing tasks, goals, and information overload. We realized that existing productivity tools were often fragmented and required significant manual effort. We envisioned a single, cohesive platform that could intelligently connect the dots between different aspects of life, from planning your day to tracking long-term aspirations.
              </p>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionIcon}>
                <Users />
              </div>
              <h2 className={styles.sectionTitle}>Our Team</h2>
              <p className={styles.sectionText}>
                We are a passionate, remote-first team of innovators united by a common goal. Our culture is built on collaboration, curiosity, and a relentless focus on the user. We believe in building not just a product, but a companion that grows and learns with you.
              </p>
            </section>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
};

export default AboutPage;