import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useGetShoppingListDetails, useUpdateShoppingItem, useAddShoppingItems } from '../helpers/useShopping';
import { ShoppingItemsList } from '../components/ShoppingItemsList';
import { AddShoppingItemDialog } from '../components/AddShoppingItemDialog';
import { VisionAIUploader } from '../components/VisionAIUploader';
import { RecurringSuggestions } from '../components/RecurringSuggestions';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../components/Collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/Dialog';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { Progress } from '../components/Progress';
import { AlertCircle, ArrowLeft, Plus, Settings, CheckCircle, Camera, Sparkles, ChevronDown } from 'lucide-react';
import styles from './shopping.$listId.module.css';

export default function ShoppingListPage() {
  const { listId } = useParams<{ listId: string }>();
  const [isAddItemOpen, setAddItemOpen] = useState(false);
  const [isVisionAIOpen, setVisionAIOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);

  const { data: listDetails, isFetching, error } = useGetShoppingListDetails(
    { shoppingListId: listId! },
    { enabled: !!listId }
  );

  const addItemsMutation = useAddShoppingItems();

  const progress = useMemo(() => {
    if (!listDetails?.items) return 0;
    const total = listDetails.items.length;
    if (total === 0) return 0;
    const completed = listDetails.items.filter(item => item.isCompleted).length;
    return (completed / total) * 100;
  }, [listDetails]);

  if (isFetching) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Skeleton style={{ height: '2.5rem', width: '250px' }} />
          <div className={styles.actions}>
            <Skeleton style={{ height: '2.5rem', width: '120px' }} />
            <Skeleton style={{ height: '2.5rem', width: '40px' }} />
          </div>
        </header>
        <div className={styles.progressContainer}>
          <Skeleton style={{ height: '0.75rem' }} />
        </div>
        <div className={styles.itemsContainer}>
          <Skeleton style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  if (error || !listDetails) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <AlertCircle size={48} />
          <h2>{error ? 'Error loading list' : 'List not found'}</h2>
          <p>{error?.message || 'The requested shopping list could not be found.'}</p>
          <Button asChild variant="outline">
            <Link to="/shopping"><ArrowLeft size={16} /> Back to Lists</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completedItems = listDetails.items.filter(i => i.isCompleted).length;
  const totalItems = listDetails.items.length;

  return (
    <>
      <Helmet>
        <title>{listDetails.name} | Shopping List</title>
        <meta name="description" content={listDetails.description || `Details for ${listDetails.name}`} />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <Button asChild variant="ghost" size="icon" className={styles.backButton}>
              <Link to="/shopping" aria-label="Back to shopping lists">
                <ArrowLeft />
              </Link>
            </Button>
            <div>
              <h1 className={styles.title}>{listDetails.name}</h1>
              {listDetails.description && <p className={styles.description}>{listDetails.description}</p>}
            </div>
          </div>
          <div className={styles.actions}>
            <Button onClick={() => setAddItemOpen(true)}>
              <Plus size={16} /> Add Item
            </Button>
            <Button onClick={() => setVisionAIOpen(true)} variant="secondary">
              <Camera size={16} /> Vision AI
            </Button>
            <Button variant="outline" size="icon" aria-label="List Settings">
              <Settings />
            </Button>
          </div>
        </header>

        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>
              <CheckCircle size={14} />
              {completedItems} / {totalItems} items completed
            </span>
            <span className={styles.progressPercentage}>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <Collapsible open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen} className={styles.suggestionsSection}>
          <CollapsibleTrigger className={styles.suggestionsTrigger}>
            <div className={styles.suggestionsHeader}>
              <div className={styles.suggestionsTitle}>
                <Sparkles size={20} />
                <span>Smart Suggestions</span>
              </div>
              <ChevronDown size={20} className={styles.chevronIcon} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className={styles.suggestionsContent}>
            <RecurringSuggestions shoppingListId={listId!} className={styles.suggestions} />
          </CollapsibleContent>
        </Collapsible>

        <main className={styles.itemsContainer}>
          <ShoppingItemsList items={listDetails.items} shoppingListId={listId!} />
        </main>
      </div>
      <AddShoppingItemDialog
        shoppingListId={listId!}
        open={isAddItemOpen}
        onOpenChange={setAddItemOpen}
      />
      
      <Dialog open={isVisionAIOpen} onOpenChange={setVisionAIOpen}>
        <DialogContent className={styles.visionDialog}>
          <DialogHeader>
            <DialogTitle>Extract Items with Vision AI</DialogTitle>
          </DialogHeader>
          <VisionAIUploader
            mode="shopping"
            onSaveShoppingItems={(items) => {
              addItemsMutation.mutate({
                shoppingListId: listId!,
                items: items.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  category: item.category,
                  addedVia: 'vision_ai'
                }))
              });
              setVisionAIOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}