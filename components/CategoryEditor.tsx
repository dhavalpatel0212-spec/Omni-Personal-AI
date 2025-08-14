import React, { useState } from 'react';
import { Pencil, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { Button } from './Button';
import { Badge } from './Badge';
import { useUpdateShoppingItem } from '../helpers/useShopping';
import { useSubmitCategoryCorrection } from '../helpers/useSubmitCategoryCorrection';
import { ShoppingItemCategory, ShoppingItemCategoryArrayValues } from '../helpers/schema';
import { getCategoryInfo, categoryInfoMap, CategoryIcon } from './CategoryIcon';
import styles from './CategoryEditor.module.css';

interface CategoryEditorProps {
  itemId: string;
  shoppingListId: string;
  currentCategory: ShoppingItemCategory | null;
  itemName: string;
  className?: string;
}

export const CategoryEditor = ({
  itemId,
  shoppingListId,
  currentCategory,
  itemName,
  className,
}: CategoryEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState('');
  const { mutate: updateItem, isPending } = useUpdateShoppingItem();
  const { mutate: submitCorrection } = useSubmitCategoryCorrection();

  const handleCategoryChange = (newCategory: ShoppingItemCategory) => {
    const previousCategory = currentCategory;
    setIsOpen(false);

    updateItem(
      {
        itemId,
        shoppingListId,
        category: newCategory,
      },
      {
        onSuccess: () => {
          toast.success(`Category updated to ${getCategoryInfo(newCategory).label}`, {
            action: {
              label: 'Undo',
              onClick: () => handleUndo(previousCategory),
            },
          });

          // Submit category correction in the background if there was a change
          if (previousCategory && previousCategory !== newCategory) {
            submitCorrection({
              corrections: [
                {
                  itemName,
                  originalCategory: previousCategory,
                  correctedCategory: newCategory,
                  context: context.trim() || null,
                },
              ],
            });
          }

          // Clear context after submission
          setContext('');
        },
        onError: (error) => {
          // Error toast is handled by the hook, but we can add specific logic here if needed
          console.error('Failed to update category:', error);
        },
      },
    );
  };

  const handleUndo = (previousCategory: ShoppingItemCategory | null) => {
    updateItem(
      {
        itemId,
        shoppingListId,
        category: previousCategory,
      },
      {
        onSuccess: () => {
          toast.success('Change reverted.');
        },
      },
    );
  };

  const categoryInfo = getCategoryInfo(currentCategory);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className={styles.triggerButton} disabled={isPending}>
            <Badge variant="outline" className={styles.badge}>
              <CategoryIcon category={currentCategory} className={styles.badgeIcon} />
              <span>{categoryInfo.label}</span>
              {isPending ? (
                <Loader2 className={`${styles.actionIcon} ${styles.spinner}`} />
              ) : (
                <Pencil className={styles.actionIcon} />
              )}
            </Badge>
          </button>
        </PopoverTrigger>
        <PopoverContent className={styles.popoverContent} align="start">
          <div className={styles.popoverHeader}>
            <h4 className={styles.popoverTitle}>Change Category</h4>
            <p className={styles.popoverDescription}>
              Select a new category for "{itemName}".
            </p>
          </div>
          <div className={styles.categoryGrid}>
            {ShoppingItemCategoryArrayValues.map((category) => {
              const info = getCategoryInfo(category);
              const isSelected = category === currentCategory;
              return (
                <button
                  key={category}
                  className={`${styles.categoryItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleCategoryChange(category)}
                  aria-label={`Set category to ${info.label}`}
                >
                  <CategoryIcon category={category} className={styles.categoryIcon} />
                  <span className={styles.categoryLabel}>{info.label}</span>
                  {isSelected && <Check className={styles.checkIcon} />}
                </button>
              );
            })}
          </div>
          <div className={styles.popoverFooter}>
            <div className={styles.contextSection}>
              <label htmlFor={`context-${itemId}`} className={styles.contextLabel}>
                Optional: Why is this the correct category?
              </label>
              <textarea
                id={`context-${itemId}`}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., This is a frozen dessert, not dairy..."
                className={styles.contextInput}
                rows={2}
                maxLength={200}
              />
              <p className={styles.contextHint}>
                This helps improve our AI categorization for future items.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};