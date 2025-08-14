import React from 'react';
import { Brain, TrendingUp, Target, Calendar } from 'lucide-react';
import { useMoodInsights } from '../helpers/useMoodTracking';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import styles from './MoodInsights.module.css';

export const MoodInsights: React.FC = () => {
  const { data: insights, isFetching } = useMoodInsights();

  if (isFetching) {
    return (
      <div className={styles.container}>
        <Skeleton style={{ height: '1.5rem', width: '120px' }} />
        <div className={styles.insightsList}>
          <Skeleton style={{ height: '80px', width: '100%' }} />
          <Skeleton style={{ height: '80px', width: '100%' }} />
          <Skeleton style={{ height: '80px', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>
          <Brain size={18} />
          AI Mood Insights
        </h3>
        <div className={styles.emptyState}>
          <Brain size={32} />
          <p>Log more moods to get AI-powered insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <Brain size={18} />
        AI Mood Insights
      </h3>
      
      <div className={styles.insightsList}>
        {insights.map((insight, index) => (
          <div key={index} className={styles.insightCard}>
            <div className={styles.insightHeader}>
              <div className={styles.insightIcon}>
                {insight.type === 'correlation' && <Target size={16} />}
                {insight.type === 'trend' && <TrendingUp size={16} />}
                {insight.type === 'pattern' && <Calendar size={16} />}
              </div>
              <Badge variant={insight.sentiment === 'positive' ? 'success' : insight.sentiment === 'neutral' ? 'outline' : 'warning'}>
                {insight.category}
              </Badge>
            </div>
            <p className={styles.insightText}>{insight.message}</p>
            {insight.suggestion && (
              <p className={styles.insightSuggestion}>
                💡 {insight.suggestion}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};