import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../helpers/useAuth';
import { useDashboard } from '../helpers/useDashboard';
import { useMoodData } from '../helpers/useMoodTracking';
import {
  CheckCircle2,
  Loader,
  Target,
  Smile,
  AlertTriangle,
} from 'lucide-react';
import { DashboardStatsCard } from '../components/DashboardStatsCard';
import { TodaysGoals } from '../components/TodaysGoals';
import { TodaysActions } from '../components/TodaysActions';
import { InteractiveMoodPicker } from '../components/InteractiveMoodPicker';
import { MoodTrends } from '../components/MoodTrends';
import { AIMoodInsights } from '../components/AIMoodInsights';
import { AIGoalsAnalyzer } from '../components/AIGoalsAnalyzer';
import { CalendarWidget } from '../components/CalendarWidget';
import { Progress } from '../components/Progress';
import { Skeleton } from '../components/Skeleton';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { authState } = useAuth();
  const {
    data: dashboardData,
    isFetching: isDashboardFetching,
    error: dashboardError,
  } = useDashboard();
  const { data: moodData, isFetching: isMoodFetching } = useMoodData();

  const isFetching = isDashboardFetching || isMoodFetching;
  const user = authState.type === 'authenticated' ? authState.user : null;

  const renderHeader = () => {
    if (!user) {
      return (
        <div className={styles.headerSkeleton}>
          <Skeleton style={{ height: '3rem', width: '350px', borderRadius: 'var(--radius-md)' }} />
          <Skeleton style={{ height: '1.25rem', width: '250px', borderRadius: 'var(--radius-sm)', marginTop: 'var(--spacing-2)' }} />
        </div>
      );
    }
    return (
      <div className={styles.headerContent}>
        <h1 className={styles.headerTitle}>
          Welcome back, {user.displayName}!
        </h1>
        <p className={styles.headerSubtitle}>
          Here's your productivity overview for today
        </p>
      </div>
    );
  };

  if (isFetching && !dashboardData) {
    return (
      <>
        <Helmet>
          <title>Dashboard | OmniPA</title>
        </Helmet>
        <div className={styles.dashboardPage}>
          <header className={styles.header}>{renderHeader()}</header>
          <div className={styles.statsGrid}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                style={{ height: '100px', borderRadius: 'var(--radius-lg)' }}
              />
            ))}
          </div>
          <div className={styles.moodSection}>
            <Skeleton
              style={{ height: '180px', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
          <div className={styles.moodInsightsSection}>
            <Skeleton
              style={{ height: '300px', borderRadius: 'var(--radius-lg)' }}
            />
            <Skeleton
              style={{ height: '300px', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
          <div className={styles.calendarSection}>
            <Skeleton
              style={{ height: '320px', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
          <div className={styles.todaysSection}>
            <Skeleton
              style={{ height: '320px', borderRadius: 'var(--radius-lg)' }}
            />
            <Skeleton
              style={{ height: '320px', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
          <Skeleton
            style={{ height: '200px', borderRadius: 'var(--radius-lg)' }}
          />
          <Skeleton
            style={{ height: '250px', borderRadius: 'var(--radius-lg)' }}
          />
        </div>
      </>
    );
  }

  if (dashboardError) {
    return (
      <>
        <Helmet>
          <title>Error | Dashboard | OmniPA</title>
        </Helmet>
        <div className={`${styles.dashboardPage} ${styles.errorContainer}`}>
          <AlertTriangle size={48} className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Could not load dashboard</h2>
          <p className={styles.errorMessage}>
            {dashboardError instanceof Error
              ? dashboardError.message
              : 'An unknown error occurred.'}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | OmniPA</title>
        <meta
          name="description"
          content="Your personal dashboard for tracking goals, mood, and productivity."
        />
      </Helmet>

      <div className={styles.dashboardPage}>
        <header className={styles.header}>{renderHeader()}</header>

        <div className={styles.statsGrid}>
          <DashboardStatsCard
            icon={<CheckCircle2 />}
            title="Goals Completed"
            value={dashboardData?.goalSummary.completed ?? 0}
            variant="success"
            navigateTo="/goals"
          />
          <DashboardStatsCard
            icon={<Loader />}
            title="Goals In Progress"
            value={dashboardData?.goalSummary.inProgress ?? 0}
            variant="primary"
            navigateTo="/goals"
          />
          <DashboardStatsCard
            icon={<Target />}
            title="Total Active Goals"
            value={
              (dashboardData?.goalSummary.inProgress ?? 0) +
              (dashboardData?.goalSummary.notStarted ?? 0)
            }
            variant="warning"
            navigateTo="/goals"
          />
          <DashboardStatsCard
            icon={<Smile />}
            title="Mood Streak"
            value={`${moodData?.currentStreak ?? 0} Days`}
            variant="purple"
          />
        </div>

        <div className={styles.moodSection}>
          <InteractiveMoodPicker />
        </div>

        <div className={styles.moodInsightsSection}>
          <MoodTrends />
          <AIMoodInsights />
        </div>

        <div className={styles.calendarSection}>
          <CalendarWidget />
        </div>

        <div className={styles.todaysSection}>
          <TodaysGoals />
          <TodaysActions />
        </div>

        <div className={styles.productivityCard}>
          <h3 className={styles.cardTitle}>Overall Productivity</h3>
          <p className={styles.progressLabel}>
            {Math.round(
              dashboardData?.productivityStats.overallProgress ?? 0,
            )}
            %
          </p>
          <Progress
            value={dashboardData?.productivityStats.overallProgress ?? 0}
          />
          <p className={styles.progressSubtext}>
            Based on your goal completion rate. Keep it up!
          </p>
        </div>

        <AIGoalsAnalyzer />
      </div>
    </>
  );
}