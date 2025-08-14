import React, { useMemo } from "react";
import { Selectable } from "kysely";
import { Goals } from "../helpers/schema";
import { Skeleton } from "./Skeleton";
import { CheckCircle, Target, Play, Calendar } from "lucide-react";
import styles from "./GoalStats.module.css";

interface GoalStatsProps {
  goals: Selectable<Goals>[];
  todaysGoals: Selectable<Goals>[];
  isLoading: boolean;
}

export const GoalStats: React.FC<GoalStatsProps> = ({ goals, todaysGoals, isLoading }) => {
  const stats = useMemo(() => {
    if (isLoading && goals.length === 0) {
      return { total: 0, completed: 0, active: 0, today: 0 };
    }
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const active = goals.filter(g => g.status === 'in_progress').length;
    const today = todaysGoals.length;
    return { total, completed, active, today };
  }, [goals, todaysGoals, isLoading]);

  if (isLoading && goals.length === 0) {
    return (
      <div className={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.statCard}>
            <Skeleton style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)' }} />
            <div className={styles.statContent}>
              <Skeleton style={{ width: '3rem', height: '2rem' }} />
              <Skeleton style={{ width: '6rem', height: '1rem' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={`${styles.iconWrapper} ${styles.totalIcon}`}>
          <Target size={20} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total Goals</span>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={`${styles.iconWrapper} ${styles.completedIcon}`}>
          <CheckCircle size={20} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={`${styles.iconWrapper} ${styles.activeIcon}`}>
          <Play size={20} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{stats.active}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={`${styles.iconWrapper} ${styles.todayIcon}`}>
          <Calendar size={20} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{stats.today}</span>
          <span className={styles.statLabel}>Today's Goal & Actions</span>
        </div>
      </div>
    </div>
  );
};