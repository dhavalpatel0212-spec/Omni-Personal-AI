import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import { postAiMood_insights } from '../endpoints/ai/mood_insights_POST.schema';
import { Skeleton } from './Skeleton';
import styles from './AIMoodInsights.module.css';

const AIMoodInsightsSkeleton = () => (
  <div className={styles.card}>
    <div className={styles.header}>
      <Skeleton style={{ height: '28px', width: '28px', borderRadius: 'var(--radius-sm)' }} />
      <Skeleton style={{ height: '24px', width: '200px' }} />
    </div>
    <div className={styles.insightsContainer}>
      <div className={styles.insightSection}>
        <div className={styles.insightHeader}>
          <Skeleton style={{ height: '20px', width: '20px', borderRadius: '50%' }} />
          <Skeleton style={{ height: '20px', width: '180px' }} />
        </div>
        <div className={styles.insightList}>
          <Skeleton style={{ height: '16px', width: '90%' }} />
          <Skeleton style={{ height: '16px', width: '80%' }} />
        </div>
      </div>
      <div className={styles.insightSection}>
        <div className={styles.insightHeader}>
          <Skeleton style={{ height: '20px', width: '20px', borderRadius: '50%' }} />
          <Skeleton style={{ height: '20px', width: '220px' }} />
        </div>
        <div className={styles.insightList}>
          <Skeleton style={{ height: '16px', width: '95%' }} />
          <Skeleton style={{ height: '16px', width: '85%' }} />
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className={`${styles.card} ${styles.stateContainer}`}>
    <div className={styles.stateIconWrapper}>
      <Brain className={styles.stateIcon} />
    </div>
    <h4 className={styles.stateTitle}>Not Enough Data for Insights</h4>
    <p className={styles.stateText}>
      Keep logging your mood for a few more days. Once we have enough data, AI-powered insights will appear here to help you understand your patterns.
    </p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className={`${styles.card} ${styles.stateContainer}`}>
    <div className={`${styles.stateIconWrapper} ${styles.errorIconWrapper}`}>
      <AlertCircle className={styles.stateIcon} />
    </div>
    <h4 className={`${styles.stateTitle} ${styles.errorTitle}`}>Failed to Generate Insights</h4>
    <p className={styles.stateText}>{message}</p>
  </div>
);

export const AIMoodInsights = ({ className }: { className?: string }) => {
  const { data, isFetching, error } = useQuery({
    queryKey: ['ai', 'moodInsights'],
    queryFn: () => postAiMood_insights(),
    retry: 1,
    staleTime: 1000 * 60 * 60, // Stale for 1 hour
  });

  if (isFetching) {
    return <AIMoodInsightsSkeleton />;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    if (errorMessage.includes('Not enough mood data')) {
      return <EmptyState />;
    }
    return <ErrorState message={errorMessage} />;
  }

  if (!data || (data.positiveObservations.length === 0 && data.improvementSuggestions.length === 0)) {
    return <EmptyState />;
  }

  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.header}>
        <Brain className={styles.titleIcon} />
        <h3 className={styles.title}>AI-Powered Insights</h3>
      </div>

      <div className={styles.insightsContainer}>
        {data.positiveObservations.length > 0 && (
          <div className={styles.insightSection}>
            <div className={styles.insightHeader}>
              <Sparkles className={`${styles.insightIcon} ${styles.positiveIcon}`} />
              <h4 className={styles.insightTitle}>Positive Observations</h4>
            </div>
            <ul className={styles.insightList}>
              {data.positiveObservations.map((obs, index) => (
                <li key={index}>{obs}</li>
              ))}
            </ul>
          </div>
        )}

        {data.improvementSuggestions.length > 0 && (
          <div className={styles.insightSection}>
            <div className={styles.insightHeader}>
              <Lightbulb className={`${styles.insightIcon} ${styles.suggestionIcon}`} />
              <h4 className={styles.insightTitle}>Improvement Suggestions</h4>
            </div>
            <ul className={styles.insightList}>
              {data.improvementSuggestions.map((sug, index) => (
                <li key={index}>{sug}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};