import React from 'react';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '../helpers/navigationItems';
import styles from './DesktopNavigation.module.css';

export interface DesktopNavigationProps {
  className?: string;
}

export const DesktopNavigation = ({ className }: DesktopNavigationProps) => {
  return (
    <nav className={`${styles.navContainer} ${className || ''}`}>
      <ul className={styles.navList}>
        {navigationItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              end={item.to === '/'}
            >
              <item.icon className={styles.icon} size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};