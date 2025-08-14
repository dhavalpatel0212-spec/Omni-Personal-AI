import React from "react";
import { Skeleton } from "./Skeleton";
import styles from "./GoalListItemSkeleton.module.css";

export const GoalListItemSkeleton: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <Skeleton style={{ height: "1.5rem", width: "70%" }} />
          <Skeleton style={{ height: "2rem", width: "2rem", borderRadius: 'var(--radius-sm)' }} />
        </div>
        <Skeleton style={{ height: "1rem", width: "90%", marginBottom: 'var(--spacing-1)' }} />
        <Skeleton style={{ height: "1rem", width: "50%" }} />
        <div className={styles.progressContainer}>
          <Skeleton style={{ height: "0.5rem", flexGrow: 1 }} />
          <Skeleton style={{ height: "1rem", width: "3rem" }} />
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.tags}>
          <Skeleton style={{ height: "1.5rem", width: "6rem", borderRadius: 'var(--radius-full)' }} />
          <Skeleton style={{ height: "1.5rem", width: "5rem", borderRadius: 'var(--radius-full)' }} />
          <Skeleton style={{ height: "1.5rem", width: "7rem", borderRadius: 'var(--radius-full)' }} />
        </div>
      </footer>
    </div>
  );
};