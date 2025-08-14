import React, { useState, useEffect } from 'react';
import { PartyPopper, Sparkles, Star } from 'lucide-react';
import styles from './GoalCelebration.module.css';

interface GoalCelebrationProps {
  /**
   * Controls the visibility of the celebration overlay.
   */
  isOpen: boolean;
  /**
   * Callback function to be invoked when the celebration animation is complete and the component should be closed.
   */
  onClose: () => void;
  /**
   * The type of achievement being celebrated, which determines the message displayed.
   */
  type: 'goal' | 'action';
  /**
   * Optional className to be applied to the root element.
   */
  className?: string;
}

const messages = {
  goal: 'Goal Completed!',
  action: 'Great Job!',
};

const DURATION = 4000; // 4 seconds

export const GoalCelebration: React.FC<GoalCelebrationProps> = ({
  isOpen,
  onClose,
  type,
  className,
}) => {
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsRendering(true);
      timer = setTimeout(() => {
        onClose();
      }, DURATION);
    } else {
      // Allow fade-out animation to complete before unmounting
      timer = setTimeout(() => {
        setIsRendering(false);
      }, 500); // Corresponds to animation-duration
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isRendering) {
    return null;
  }

  const confettiElements = Array.from({ length: 50 }).map((_, i) => (
    <div
      key={i}
      className={styles.confetti}
      style={
        {
          '--i': Math.random(),
          '--d': Math.random() * 2 + 1, // delay
          '--r': Math.random() * 360, // rotation
        } as React.CSSProperties
      }
    />
  ));

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.visible : ''} ${
        className ?? ''
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div className={styles.confettiContainer}>{confettiElements}</div>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <PartyPopper size={48} className={styles.mainIcon} />
          <Sparkles size={24} className={`${styles.sparkle} ${styles.sparkle1}`} />
          <Sparkles size={20} className={`${styles.sparkle} ${styles.sparkle2}`} />
          <Star size={22} className={`${styles.star} ${styles.star1}`} />
          <Star size={18} className={`${styles.star} ${styles.star2}`} />
        </div>
        <h2 className={styles.title}>{messages[type]}</h2>
        <p className={styles.subtitle}>
          {type === 'goal'
            ? "You've reached a new milestone. Keep up the amazing work!"
            : 'One step closer to your goal!'}
        </p>
      </div>
    </div>
  );
};