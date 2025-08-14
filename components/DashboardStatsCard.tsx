import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardStatsCard.module.css';

type CardVariant = 'primary' | 'success' | 'warning' | 'purple';

interface DashboardStatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  navigateTo?: string;
}

export const DashboardStatsCard = ({
  icon,
  title,
  value,
  variant = 'primary',
  className,
  onClick,
  navigateTo,
}: DashboardStatsCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const isClickable = onClick || navigateTo;
  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${isClickable ? styles.clickable : ''} ${className || ''}`}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
};