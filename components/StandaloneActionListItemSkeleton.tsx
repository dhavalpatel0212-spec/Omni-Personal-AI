import React from 'react';
import { Skeleton } from './Skeleton';
import styles from './StandaloneActionListItemSkeleton.module.css';

export const StandaloneActionListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.mainContent}>
        <div className={styles.titleSection}>
          <Skeleton style={{ height: '24px', width: '24px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
          <div className={styles.titleContent}>
            <Skeleton style={{ height: '1.125rem', width: '80%', marginBottom: 'var(--spacing-1)' }} />
            <Skeleton style={{ height: '0.875rem', width: '60%' }} />
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.tags}>
          <Skeleton style={{ height: '24px', width: '80px', borderRadius: 'var(--radius-full)' }} />
          <Skeleton style={{ height: '24px', width: '110px', borderRadius: 'var(--radius-full)' }} />
        </div>
      </footer>
    </div>
  );
};