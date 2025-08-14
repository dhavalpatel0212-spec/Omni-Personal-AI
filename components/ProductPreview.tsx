import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import styles from './ProductPreview.module.css';

export const ProductPreview = () => {
  return (
    <div className={styles.productPreview}>
      <div className={styles.mockup}>
        <div className={styles.screen}>
          <div className={styles.placeholder}>
            <Monitor className={styles.icon} />
            <div className={styles.text}>
              <div className={styles.title}>Product Demo</div>
              <div className={styles.subtitle}>Coming Soon</div>
            </div>
          </div>
        </div>
        <div className={styles.mobileMockup}>
          <Smartphone className={styles.mobileIcon} />
        </div>
      </div>
    </div>
  );
};