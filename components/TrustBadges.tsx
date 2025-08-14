import React from 'react';
import { Badge } from './Badge';
import { Star, Users, Shield, Award } from 'lucide-react';
import styles from './TrustBadges.module.css';

export const TrustBadges = () => {
  return (
    <div className={styles.trustBadges}>
      <div className={styles.badge}>
        <Award className={styles.icon} />
        <span className={styles.text}>Backed by Top Investors</span>
      </div>
      <div className={styles.badge}>
        <Shield className={styles.icon} />
        <span className={styles.text}>Enterprise Security</span>
      </div>
      <div className={styles.badge}>
        <Users className={styles.icon} />
        <span className={styles.text}>50K+ Happy Users</span>
      </div>
      <div className={styles.badge}>
        <Star className={styles.icon} />
        <span className={styles.text}>4.9★ App Store</span>
      </div>
    </div>
  );
};