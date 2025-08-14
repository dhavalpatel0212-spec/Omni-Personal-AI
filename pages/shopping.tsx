import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useGetShoppingLists, useCreateShoppingList } from '../helpers/useShopping';
import { ShoppingListCard } from '../components/ShoppingListCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Skeleton } from '../components/Skeleton';
import { Plus, Search, Archive, List, AlertCircle, Camera } from 'lucide-react';
import { CreateShoppingListDialog } from '../components/CreateShoppingListDialog';
import { CreateShoppingListFromImageDialog } from '../components/CreateShoppingListFromImageDialog';
import styles from './shopping.module.css';

export default function ShoppingPage() {
  const [isCreateListOpen, setCreateListOpen] = useState(false);
  const [isCreateFromImageOpen, setCreateFromImageOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const { data: lists, isFetching, error } = useGetShoppingLists();

  const filteredLists = useMemo(() => {
    if (!lists) return [];
    return lists
      .filter(list => list.isArchived === showArchived)
      .filter(list => list.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [lists, showArchived, searchTerm]);

  const stats = useMemo(() => {
    if (!lists) return { total: 0, active: 0, archived: 0 };
    const active = lists.filter(l => !l.isArchived).length;
    return {
      total: lists.length,
      active,
      archived: lists.length - active,
    };
  }, [lists]);

  const renderLoadingState = () => (
    <div className={styles.grid}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonHeader}>
            <Skeleton style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)' }} />
            <Skeleton style={{ height: '1.5rem', flex: 1 }} />
          </div>
          <Skeleton style={{ height: '1rem', width: '80%', marginTop: 'var(--spacing-3)' }} />
          <div className={styles.skeletonFooter}>
            <Skeleton style={{ height: '0.5rem', width: '100%' }} />
            <Skeleton style={{ height: '1rem', width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (isFetching) {
      return renderLoadingState();
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <AlertCircle size={48} />
          <h2>Error loading shopping lists</h2>
          <p>{error.message}</p>
        </div>
      );
    }

    if (filteredLists.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h3>{showArchived ? 'No archived lists found' : 'No active lists found'}</h3>
          <p>{searchTerm ? 'Try adjusting your search.' : 'Get started by creating a new list.'}</p>
          {!showArchived && (
            <Button onClick={() => setCreateListOpen(true)}>
              <Plus size={16} /> Create New List
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {filteredLists.map(list => (
          <ShoppingListCard key={list.id} list={list} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Shopping Lists | Floot</title>
        <meta name="description" content="Manage all your shopping lists in one place." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Shopping Lists</h1>
            <p className={styles.subtitle}>
              {stats.active} active lists, {stats.archived} archived.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="outline" onClick={() => setCreateFromImageOpen(true)}>
              <Camera size={16} /> Create from Image
            </Button>
            <Button onClick={() => setCreateListOpen(true)}>
              <Plus size={16} /> New List
            </Button>
          </div>
        </header>

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <Input
              type="search"
              placeholder="Search lists..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.toggleGroup}>
            <Button
              variant={!showArchived ? 'primary' : 'outline'}
              onClick={() => setShowArchived(false)}
            >
              <List size={16} /> Active
            </Button>
            <Button
              variant={showArchived ? 'primary' : 'outline'}
              onClick={() => setShowArchived(true)}
            >
              <Archive size={16} /> Archived
            </Button>
          </div>
        </div>

        <main>
          {renderContent()}
        </main>
      </div>
      <CreateShoppingListDialog
        isOpen={isCreateListOpen}
        onOpenChange={setCreateListOpen}
      />
      <CreateShoppingListFromImageDialog
        isOpen={isCreateFromImageOpen}
        onOpenChange={setCreateFromImageOpen}
      />
    </>
  );
}