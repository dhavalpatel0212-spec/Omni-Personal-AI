import React from 'react';
import { useMoodData, useLogMood } from '../helpers/useMoodTracking';
import { Skeleton } from './Skeleton';
import styles from './InteractiveMoodPicker.module.css';
import { toast } from 'sonner';

const moods = [
  { emoji: '😄', value: 5, label: 'Excellent' },
  { emoji: '😊', value: 4, label: 'Good' },
  { emoji: '😐', value: 3, label: 'Okay' },
  { emoji: '😢', value: 2, label: 'Sad' },
  { emoji: '😡', value: 1, label: 'Angry' },
];

export const InteractiveMoodPicker = ({ className }: { className?: string }) => {
  const { data, isFetching, error } = useMoodData();
  const { mutate: logMood, isPending } = useLogMood();

  const handleMoodLog = (mood: typeof moods[0]) => {
    logMood(
      { moodValue: mood.value, emoji: mood.emoji },
      {
        onSuccess: () => {
          toast.success(`Mood logged as "${mood.label}"!`);
        },
        onError: (err) => {
          if (err instanceof Error) {
            toast.error(`Failed to log mood: ${err.message}`);
          } else {
            toast.error('An unknown error occurred while logging mood.');
          }
          console.error("Failed to log mood:", err);
        },
      }
    );
  };

  if (isFetching) {
    return <MoodPickerSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <p className={styles.error}>Could not load mood data. Please try again later.</p>
      </div>
    );
  }

  if (data?.todaysMood) {
    return (
      <div className={`${styles.container} ${styles.loggedContainer} ${className || ''}`}>
        <h3 className={styles.title}>Today's Mood</h3>
        <div className={styles.loggedMood}>
          <span className={styles.loggedEmoji}>{data.todaysMood.emoji}</span>
          <p className={styles.loggedText}>You've already logged your mood today. Keep it up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <h3 className={styles.title}>How are you feeling?</h3>
      <div className={styles.moodsGrid}>
        {moods.map((mood) => (
          <button
            key={mood.value}
            className={styles.moodButton}
            onClick={() => handleMoodLog(mood)}
            disabled={isPending}
            aria-label={`Log mood as ${mood.label}`}
          >
            <span className={styles.moodEmoji}>{mood.emoji}</span>
            <span className={styles.moodLabel}>{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const MoodPickerSkeleton = ({ className }: { className?: string }) => (
  <div className={`${styles.container} ${className || ''}`}>
    <Skeleton style={{ height: '1.5rem', width: '70%', margin: '0 auto var(--spacing-4) auto', borderRadius: 'var(--radius-sm)' }} />
    <div className={styles.moodsGrid}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className={styles.moodButtonSkeleton}>
          <Skeleton style={{ height: '2.5rem', width: '2.5rem', borderRadius: 'var(--radius-full)', margin: '0 auto' }} />
          <Skeleton style={{ height: '1rem', width: '80%', margin: 'var(--spacing-2) auto 0 auto', borderRadius: 'var(--radius-sm)' }} />
        </div>
      ))}
    </div>
  </div>
);