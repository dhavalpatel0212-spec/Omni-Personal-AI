import React from 'react';
import { ShoppingItem } from '../endpoints/shopping_list/details_GET.schema';
import { useUpdateShoppingItem } from '../helpers/useShopping';
import { Checkbox } from './Checkbox';
import { Badge } from './Badge';
import { PriceComparisonCard } from './PriceComparisonCard';
import { CategoryEditor } from './CategoryEditor';
import { ShoppingItemCategory, ShoppingItemPriority } from '../helpers/schema';
import styles from './ShoppingItemsList.module.css';

interface ShoppingItemsListProps {
  items: ShoppingItem[];
  shoppingListId: string;
  className?: string;
}

const categoryOrder: Record<ShoppingItemCategory, number> = {
  produce: 1, meat_seafood: 2, dairy: 3, bakery: 4, frozen: 5, 
  pantry: 6, snacks: 7, beverages: 8, household: 9, personal_care: 10, other: 11,
};

const priorityVariant: Record<ShoppingItemPriority, 'destructive' | 'warning' | 'default'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'default',
};

export const ShoppingItemsList: React.FC<ShoppingItemsListProps> = ({ items, shoppingListId, className }) => {
  const updateItemMutation = useUpdateShoppingItem();

  const handleToggleComplete = (item: ShoppingItem) => {
    updateItemMutation.mutate({ 
      itemId: item.id, 
      shoppingListId, 
      isCompleted: !item.isCompleted 
    });
  };

  const hasPrice = (item: ShoppingItem) => {
    return item.estimatedPrice !== null || item.actualPrice !== null;
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<ShoppingItemCategory, ShoppingItem[]>);

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => 
    categoryOrder[a as ShoppingItemCategory] - categoryOrder[b as ShoppingItemCategory]
  ) as ShoppingItemCategory[];

  if (items.length === 0) {
    return <div className={styles.emptyState}>No items in this list yet.</div>;
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {sortedCategories.map(category => (
        <div key={category} className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>{category.replace(/_/g, ' ')}</h3>
          <ul className={styles.itemList}>
            {groupedItems[category].map(item => (
              <li key={item.id} className={`${styles.item} ${item.isCompleted ? styles.completed : ''}`}>
                <div className={styles.itemMain}>
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={item.isCompleted}
                    onChange={() => handleToggleComplete(item)}
                    disabled={updateItemMutation.isPending && updateItemMutation.variables?.itemId === item.id}
                  />
                  <label htmlFor={`item-${item.id}`} className={styles.itemName}>
                    {item.name}
                    {item.quantity && item.quantity > 1 && <span className={styles.quantity}>&times;{item.quantity}</span>}
                  </label>
                  <div className={styles.itemMeta}>
                    <CategoryEditor
                      itemId={item.id}
                      shoppingListId={shoppingListId}
                      currentCategory={item.category}
                      itemName={item.name}
                      className={styles.categoryEditor}
                    />
                    {item.priority && <Badge variant={priorityVariant[item.priority]}>{item.priority}</Badge>}
                  </div>
                </div>
                {hasPrice(item) && (
                  <div className={styles.priceSection}>
                    <PriceComparisonCard
                      estimatedPrice={item.estimatedPrice}
                      actualPrice={item.actualPrice}
                      currency="USD"
                      className={styles.priceCard}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};