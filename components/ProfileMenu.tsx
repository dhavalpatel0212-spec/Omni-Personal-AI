import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../helpers/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { Button } from './Button';
import { ThemeModeSwitch } from './ThemeModeSwitch';
import { Skeleton } from './Skeleton';
import { Settings, Calendar, LogOut, LogIn, User, Puzzle, Crown, MessageSquare } from 'lucide-react';
import styles from './ProfileMenu.module.css';

export interface ProfileMenuProps {
  className?: string;
}

export const ProfileMenu = ({ className }: ProfileMenuProps) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  if (authState.type === 'loading') {
    return <Skeleton style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)' }} />;
  }

  if (authState.type === 'unauthenticated') {
    return (
      <Button asChild variant="outline" size="sm">
        <Link to="/login">
          <LogIn size={16} />
          Login
        </Link>
      </Button>
    );
  }

  const { user } = authState;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={styles.avatarButton} aria-label="Open user menu">
            <Avatar>
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={styles.dropdownContent}>
          <DropdownMenuLabel className={styles.userLabel}>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user.displayName}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className={styles.menuIcon} />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className={styles.menuIcon} />
                <span>Settings & Preferences</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings/subscription">
                <Crown className={styles.menuIcon} />
                <span>Subscription & Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings/support">
                <MessageSquare className={styles.menuIcon} />
                <span>Support & Feedback</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings/calendar">
                <Calendar className={styles.menuIcon} />
                <span>Calendar Integration</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Puzzle className={styles.menuIcon} />
              <span>Other Integrations</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className={styles.themeItem}>
            <span>Theme</span>
            <ThemeModeSwitch />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className={styles.logoutItem}>
            <LogOut className={styles.menuIcon} />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};