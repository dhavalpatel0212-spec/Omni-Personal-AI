import React from 'react';
import { Calendar, ListTodo, Heart } from 'lucide-react';
import styles from './LandingBenefits.module.css';

type LandingBenefitsProps = {
  className?: string;
};

export const LandingBenefits = ({ className }: LandingBenefitsProps) => {
  return (
    <section className={`${styles.benefitsSection} ${className || ''}`}>
      <div className={styles.sectionContent}>
        <h2 className={styles.sectionTitle}>Why Choose OmniPA?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Calendar size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Personal Diary & Time Management</h3>
            <p className={styles.benefitDescription}>
              Manage your personal diary and allocate the right time for goals and personal life. Never miss what's important to you.
            </p>
          </div>

          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <ListTodo size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Unified Task Management</h3>
            <p className={styles.benefitDescription}>
              Keep your to-do lists in one place instead of scattered across multiple apps. Everything organized, everything accessible.
            </p>
          </div>

          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Heart size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Personal Care & Tracking</h3>
            <p className={styles.benefitDescription}>
              We care about you and track how you're getting on. Monitor your progress, mood, and well-being with AI insights.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};