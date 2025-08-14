import React, { useState, useMemo, useCallback } from 'react';
import { useRecurringSuggestions } from '../helpers/useRecurringSuggestions';
import { SuggestedItem } from '../endpoints/shopping/recurring_suggestions_GET.schema';
import { useAddShoppingItems } from '../helpers/useShopping';
import { ShoppingItemCategory, ShoppingItemCategoryArrayValues } from '../helpers/schema';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import { AlertCircle, Check, Plus, ShoppingBasket, Sparkles } from 'lucide-react';
import styles from './RecurringSuggestions.module.css';

interface RecurringSuggestionsProps {
  shoppingListId: string;
  className?: string;
  onClose?: () => void;
}

const ConfidenceIndicator: React.FC<{ score: number }> = ({ score }) => {
  const getConfidenceProps = () => {
    if (score >= 0.75) {
      return { variant: 'success', text: 'High' } as const;
    }
    if (score >= 0.5) {
      return { variant: 'warning', text: 'Medium' } as const;
    }
    return { variant: 'outline', text: 'Low' } as const;
  };

  const { variant, text } = getConfidenceProps();

  return (
    <div className={styles.confidenceIndicator}>
      <div className={styles.confidenceBarContainer}>
        <div
          className={`${styles.confidenceBar} ${styles[variant]}`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
      <Badge variant={variant} className={styles.confidenceBadge}>
        {text} Confidence
      </Badge>
    </div>
  );
};

const SuggestionItem: React.FC<{
  suggestion: SuggestedItem;
  isSelected: boolean;
  onToggleSelect: (suggestion: SuggestedItem) => void;
  onQuickAdd: (suggestion: SuggestedItem) => void;
  isAdding: boolean;
}> = ({ suggestion, isSelected, onToggleSelect, onQuickAdd, isAdding }) => {
  const handleCheckboxChange = () => {
    onToggleSelect(suggestion);
  };

  return (
    <div className={`${styles.suggestionItem} ${isSelected ? styles.selected : ''}`}>
      <label className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className={styles.checkbox}
          aria-label={`Select ${suggestion.name}`}
        />
        <span className={styles.customCheckbox}>
          {isSelected && <Check size={12} />}
        </span>
      </label>
      <div className={styles.itemDetails}>
        <span className={styles.itemName}>{suggestion.name}</span>
        <span className={styles.itemReason}>{suggestion.reason}</span>
        <ConfidenceIndicator score={suggestion.confidenceScore} />
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onQuickAdd(suggestion)}
        disabled={isAdding}
        className={styles.quickAddButton}
      >
        <Plus size={16} />
        Add
      </Button>
    </div>
  );
};

const RecurringSuggestionsSkeleton: React.FC = () => (
  <div className={styles.skeletonContainer}>
    <Skeleton style={{ height: '2rem', width: '40%', marginBottom: 'var(--spacing-4)' }} />
    {[...Array(3)].map((_, i) => (
      <div key={i} style={{ marginBottom: 'var(--spacing-6)' }}>
        <Skeleton style={{ height: '1.5rem', width: '30%', marginBottom: 'var(--spacing-3)' }} />
        {[...Array(2)].map((_, j) => (
          <div key={j} className={styles.skeletonItem}>
            <Skeleton style={{ height: '1.25rem', width: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <div className={styles.skeletonItemDetails}>
              <Skeleton style={{ height: '1.25rem', width: '40%' }} />
              <Skeleton style={{ height: '0.875rem', width: '60%', marginTop: 'var(--spacing-1)' }} />
            </div>
            <Skeleton style={{ height: '2rem', width: '5rem' }} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const isValidShoppingItemCategory = (category: string | null): category is ShoppingItemCategory => {
  return category !== null && ShoppingItemCategoryArrayValues.includes(category as ShoppingItemCategory);
};

const safeCategory = (category: string | null): ShoppingItemCategory | null => {
  return isValidShoppingItemCategory(category) ? category : null;
};

export const RecurringSuggestions: React.FC<RecurringSuggestionsProps> = ({
  shoppingListId,
  className,
}) => {
  const { data, isFetching, error } = useRecurringSuggestions();
  const { mutate: addItems, isPending: isAdding } = useAddShoppingItems();
  const [selectedItems, setSelectedItems] = useState<SuggestedItem[]>([]);

  const handleToggleSelect = useCallback((suggestion: SuggestedItem) => {
    setSelectedItems((prev) =>
      prev.some((item) => item.name === suggestion.name)
        ? prev.filter((item) => item.name !== suggestion.name)
        : [...prev, suggestion]
    );
  }, []);

  const handleQuickAdd = useCallback((suggestion: SuggestedItem) => {
    addItems({
      shoppingListId,
      items: [{ name: suggestion.name, category: safeCategory(suggestion.category), addedVia: 'suggestion' }],
    });
  }, [addItems, shoppingListId]);

  const handleBulkAdd = useCallback(() => {
    if (selectedItems.length === 0) return;
    addItems(
      {
        shoppingListId,
        items: selectedItems.map((s) => ({ name: s.name, category: safeCategory(s.category), addedVia: 'suggestion' })),
      },
      {
        onSuccess: () => {
          setSelectedItems([]);
        },
      }
    );
  }, [addItems, shoppingListId, selectedItems]);

  const groupedSuggestions = useMemo(() => {
    if (!data?.suggestions) return {} as Record<ShoppingItemCategory | 'other', SuggestedItem[]>;
    return data.suggestions.reduce((acc, suggestion) => {
      const category = isValidShoppingItemCategory(suggestion.category) ? suggestion.category : 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(suggestion);
      return acc;
    }, {} as Record<ShoppingItemCategory | 'other', SuggestedItem[]>);
  }, [data?.suggestions]);

  const categoryOrder: (ShoppingItemCategory | 'other')[] = [
    'produce', 'meat_seafood', 'dairy', 'bakery', 'pantry', 'frozen', 'beverages', 'snacks', 'household', 'personal_care', 'other'
  ];

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedSuggestions).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a as ShoppingItemCategory | 'other');
      const bIndex = categoryOrder.indexOf(b as ShoppingItemCategory | 'other');
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [groupedSuggestions]);

  const renderContent = () => {
    if (isFetching) {
      return <RecurringSuggestionsSkeleton />;
    }

    if (error) {
      return (
        <div className={styles.stateMessage}>
          <AlertCircle size={48} className={styles.errorIcon} />
          <h3>Error Loading Suggestions</h3>
          <p>{error.message}</p>
        </div>
      );
    }

    if (!data?.suggestions || data.suggestions.length === 0) {
      return (
        <div className={styles.stateMessage}>
          <ShoppingBasket size={48} className={styles.infoIcon} />
          <h3>No Suggestions Yet</h3>
          <p>As you complete shopping lists, we'll learn your habits and suggest items here.</p>
        </div>
      );
    }

    return (
      <>
        {sortedCategories.map((category) => (
          <div key={category} className={styles.categoryGroup}>
            <h3 className={styles.categoryTitle}>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <div className={styles.suggestionsList}>
              {(groupedSuggestions[category as ShoppingItemCategory | 'other'] || []).map((suggestion: SuggestedItem) => (
                <SuggestionItem
                  key={suggestion.name}
                  suggestion={suggestion}
                  isSelected={selectedItems.some((item) => item.name === suggestion.name)}
                  onToggleSelect={handleToggleSelect}
                  onQuickAdd={handleQuickAdd}
                  isAdding={isAdding}
                />
              ))}
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <Sparkles className={styles.titleIcon} />
          <h2 className={styles.title}>Recurring Item Suggestions</h2>
        </div>
        <p className={styles.subtitle}>
          Based on your purchase history, here are some items you might need.
        </p>
      </header>
      <div className={styles.content}>
        {renderContent()}
      </div>
      {data && data.suggestions.length > 0 && (
        <footer className={styles.footer}>
          <Button
            size="lg"
            onClick={handleBulkAdd}
            disabled={selectedItems.length === 0 || isAdding}
            className={styles.bulkAddButton}
          >
            {isAdding ? 'Adding...' : `Add ${selectedItems.length} Selected Item${selectedItems.length !== 1 ? 's' : ''}`}
          </Button>
        </footer>
      )}
    </div>
  );
};