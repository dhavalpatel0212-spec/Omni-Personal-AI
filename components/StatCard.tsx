import React from 'react';
import { TrendingUp, Users, Star, Zap } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  value: string;
  label: string;
  trend?: string;
  icon: 'users' | 'star' | 'trending' | 'zap';
}

export const StatCard = ({ value, label, trend, icon }: StatCardProps) => {
  const icons = {
    users: Users,
    star: Star,
    trending: TrendingUp,
    zap: Zap,
  };
  
  const Icon = icons[icon];

  return (
    <div className={styles.statCard}>
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} />
      </div>
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
        {trend && <div className={styles.trend}>+{trend}% this month</div>}
      </div>
    </div>
  );
};