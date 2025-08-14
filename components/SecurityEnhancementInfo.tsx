import React from 'react';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import styles from './SecurityEnhancementInfo.module.css';
import { Separator } from './Separator';

interface SecurityEnhancementInfoProps {
  className?: string;
}

export const SecurityEnhancementInfo = ({ className }: SecurityEnhancementInfoProps) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <ShieldCheck size={28} className={styles.headerIcon} />
        <h3 className={styles.title}>Enhanced Account Lockout Policy</h3>
      </div>
      <p className={styles.intro}>
        Your account's security is our top priority. To prevent unauthorized access, we have implemented an automatic account lockout system.
      </p>

      <Separator className={styles.separator} />

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <AlertTriangle size={20} className={styles.sectionIconWarning} />
          <h4 className={styles.sectionTitle}>Lockout Threshold</h4>
        </div>
        <p className={styles.sectionContent}>
          Your account will be permanently locked after <strong>10 failed login attempts</strong> within a <strong>24-hour period</strong>. This measure is crucial to protect your account from brute-force attacks.
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Info size={20} className={styles.sectionIconInfo} />
          <h4 className={styles.sectionTitle}>What Happens When Locked?</h4>
        </div>
        <p className={styles.sectionContent}>
          If your account is locked, you will be unable to log in, reset your password, or access any of our services. You will be notified that the account is locked for security reasons upon a login attempt.
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Info size={20} className={styles.sectionIconInfo} />
          <h4 className={styles.sectionTitle}>How to Unlock Your Account</h4>
        </div>
        <p className={styles.sectionContent}>
          A locked account cannot be unlocked automatically. You must contact our support team. An administrator will manually review your case and unlock your account after verifying your identity.
        </p>
      </div>
    </div>
  );
};