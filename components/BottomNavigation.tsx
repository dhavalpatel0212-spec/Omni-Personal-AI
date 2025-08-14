import React from 'react';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '../helpers/navigationItems';
import styles from './BottomNavigation.module.css';

export interface BottomNavigationProps {
  className?: string;
}

export const BottomNavigation = ({ className }: BottomNavigationProps) => {
  return (
    <nav className={`${styles.navContainer} ${className || ''}`}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
          end={item.to === '/'}
        >
          <item.icon className={styles.icon} size={24} />
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};