import React from 'react';
import { useAnalyzeGoals } from '../helpers/useAI';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { BrainCircuit, Sparkles, AlertTriangle } from 'lucide-react';
import styles from './AIGoalsAnalyzer.module.css';

interface AIGoalsAnalyzerProps {
  className?: string;
}

export const AIGoalsAnalyzer: React.FC<AIGoalsAnalyzerProps> = ({ className }) => {
  const { mutate: analyzeGoals, data, isPending, isError, error, reset } = useAnalyzeGoals();

  const handleAnalyze = () => {
    analyzeGoals();
  };

  const renderContent = () => {
    if (isPending) {
      return (
        <div className={styles.resultContainer}>
          <h3 className={styles.resultTitle}>Analyzing your goals...</h3>
          <div className={styles.skeletonContainer}>
            <Skeleton style={{ height: '1.25rem', width: '80%' }} />
            <Skeleton style={{ height: '1rem', width: '95%' }} />
            <Skeleton style={{ height: '1rem', width: '90%' }} />
            <Skeleton style={{ height: '1rem', width: '85%' }} />
            <Skeleton style={{ height: '1.25rem', width: '60%', marginTop: 'var(--spacing-4)' }} />
            <Skeleton style={{ height: '1rem', width: '90%' }} />
            <Skeleton style={{ height: '1rem', width: '80%' }} />
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className={`${styles.resultContainer} ${styles.errorState}`}>
          <div className={styles.errorHeader}>
            <AlertTriangle className={styles.errorIcon} />
            <h3 className={styles.resultTitle}>Analysis Failed</h3>
          </div>
          <p className={styles.errorMessage}>
            {error instanceof Error ? error.message : 'An unknown error occurred.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      );
    }

    if (data) {
      return (
        <div className={styles.resultContainer}>
          <h3 className={styles.resultTitle}>AI-Powered Insights</h3>
          <div
            className={styles.analysisContent}
            dangerouslySetInnerHTML={{ __html: data.analysis.replace(/\n/g, '<br />') }}
          />
          <Button variant="outline" size="sm" onClick={() => reset()} className={styles.analyzeAgainButton}>
            Analyze Again
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.initialState}>
        <div className={styles.iconContainer}>
          <BrainCircuit size={24} />
        </div>
        <h3 className={styles.title}>Get AI-Powered Insights</h3>
        <p className={styles.description}>
          Let our AI analyze your goals to find synergies, suggest priorities, and provide motivational feedback to help you succeed.
        </p>
        <Button onClick={handleAnalyze} disabled={isPending} size="lg">
          <Sparkles size={16} />
          Analyze My Goals
        </Button>
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {renderContent()}
    </div>
  );
};