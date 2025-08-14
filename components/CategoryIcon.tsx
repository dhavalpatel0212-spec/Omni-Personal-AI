import React from 'react';
import {
  Apple,
  Beef,
  Milk,
  Cookie,
  GlassWater,
  Snowflake,
  Sparkles,
  ShoppingCart,
  HeartHandshake,
  Sandwich,
  HelpCircle,
} from 'lucide-react';
import { ShoppingItemCategory } from '../helpers/schema';

interface CategoryInfo {
  icon: React.ElementType;
  label: string;
}

export const categoryInfoMap: Record<ShoppingItemCategory, CategoryInfo> = {
  produce: { icon: Apple, label: 'Produce' },
  meat_seafood: { icon: Beef, label: 'Meat & Seafood' },
  dairy: { icon: Milk, label: 'Dairy' },
  bakery: { icon: Cookie, label: 'Bakery' },
  beverages: { icon: GlassWater, label: 'Beverages' },
  frozen: { icon: Snowflake, label: 'Frozen' },
  pantry: { icon: Sandwich, label: 'Pantry' },
  snacks: { icon: Sparkles, label: 'Snacks' },
  household: { icon: ShoppingCart, label: 'Household' },
  personal_care: { icon: HeartHandshake, label: 'Personal Care' },
  other: { icon: HelpCircle, label: 'Other' },
};

interface CategoryIconProps {
  category: ShoppingItemCategory | null | undefined;
  className?: string;
}

export const CategoryIcon = ({ category, className }: CategoryIconProps) => {
  const info = category ? categoryInfoMap[category] : categoryInfoMap.other;
  const IconComponent = info.icon;
  return <IconComponent className={className} />;
};

export const getCategoryInfo = (category: ShoppingItemCategory | null | undefined): CategoryInfo => {
    if (category && categoryInfoMap[category]) {
        return categoryInfoMap[category];
    }
    return categoryInfoMap.other;
}