import React from 'react';
import { Button } from './Button';
import { Zap, Shield, Smartphone } from 'lucide-react';
import styles from './LandingCTA.module.css';

type LandingCTAProps = {
  className?: string;
  onJoinWaitlistClick: () => void;
  joinedWaitlist: boolean;
};

export const LandingCTA = ({
  className,
  onJoinWaitlistClick,
  joinedWaitlist,
}: LandingCTAProps) => {
  return (
    <section className={`${styles.ctaFlowSection} ${className || ''}`}>
      <div className={styles.sectionContent}>
        <h2 className={styles.sectionTitle}>Get Started in 3 Simple Steps</h2>
        <div className={styles.ctaFlow}>
          <div className={styles.ctaStep}>
            <div className={styles.ctaStepNumber}>1</div>
            <div className={styles.ctaStepContent}>
              <h3 className={styles.ctaStepTitle}>Join the Waitlist</h3>
              <p className={styles.ctaStepDescription}>
                Sign up to get early access to OmniPA and be among the first to experience the future of personal assistance.
              </p>
              <Button onClick={onJoinWaitlistClick} disabled={joinedWaitlist}>
                <Zap size={16} />
                {joinedWaitlist ? 'Already Joined!' : 'Join Waitlist'}
              </Button>
            </div>
          </div>

          <div className={styles.ctaStep}>
            <div className={styles.ctaStepNumber}>2</div>
            <div className={styles.ctaStepContent}>
              <h3 className={styles.ctaStepTitle}>Set Up Your Profile</h3>
              <p className={styles.ctaStepDescription}>
                Personalize your experience and integrate with your calendar to get the most out of OmniPA's intelligent features.
              </p>
              <Button variant="outline">
                <Shield size={16} />
                Learn More
              </Button>
            </div>
          </div>

          <div className={styles.ctaStep}>
            <div className={styles.ctaStepNumber}>3</div>
            <div className={styles.ctaStepContent}>
              <h3 className={styles.ctaStepTitle}>Start Living Smarter</h3>
              <p className={styles.ctaStepDescription}>
                Manage your goals, organize your shopping, plan your travels, and let AI optimize your daily life.
              </p>
              <Button variant="outline">
                <Smartphone size={16} />
                See Features
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};