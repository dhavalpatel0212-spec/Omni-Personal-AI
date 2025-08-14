import type { LucideIcon } from 'lucide-react';
import { Home, Target, Bot, ShoppingCart, Plane } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/goals', label: 'Goal & Actions', icon: Target },
  { to: '/chat', label: 'Your PA', icon: Bot },
  { to: '/shopping', label: 'Shopping', icon: ShoppingCart },
  { to: '/travel', label: 'Travel', icon: Plane },
];