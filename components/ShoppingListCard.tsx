import React from 'react';
import { Link } from 'react-router-dom';
import { List, CheckCircle, Trash2 } from 'lucide-react';
import { Progress } from './Progress';
import { Button } from './Button';
import { useDeleteShoppingList, useOfflineStatus } from '../helpers/useShopping';
import { ShoppingListWithCounts } from '../endpoints/shopping_lists_GET.schema';
import styles from './ShoppingListCard.module.css';

interface ShoppingListCardProps {
  list: ShoppingListWithCounts;
  className?: string;
}

export const ShoppingListCard: React.FC<ShoppingListCardProps> = ({ list, className }) => {
  const deleteListMutation = useDeleteShoppingList();
  const { isOffline, hasPendingChanges } = useOfflineStatus();

  const progress = list.totalItems > 0 ? (list.completedItems / list.totalItems) * 100 : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the list "${list.name}"?`)) {
      deleteListMutation.mutate({ shoppingListId: list.id });
    }
  };

  return (
    <Link to={`/shopping/${list.id}`} className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <List size={24} />
        </div>
        <h3 className={styles.title}>
          {list.name}
          {hasPendingChanges(list.id) && <span className={styles.syncIndicator} title="Has pending changes">●</span>}
        </h3>
        <Button
          variant="ghost"
          size="icon-sm"
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={deleteListMutation.isPending}
          aria-label={`Delete ${list.name}`}
        >
          <Trash2 size={16} />
        </Button>
      </div>
      {list.description && <p className={styles.description}>{list.description}</p>}
      <div className={styles.footer}>
        <div className={styles.progressWrapper}>
          <Progress value={progress} />
        <span className={styles.progressText}>
          <CheckCircle size={14} />
          {list.completedItems} of {list.totalItems} done
          {isOffline && <span className={styles.offlineIndicator} title="Offline mode">📱</span>}
        </span>
        </div>
      </div>
    </Link>
  );
};