import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { useCreateShoppingList } from '../helpers/useShopping';
import styles from './CreateShoppingListDialog.module.css';

interface CreateShoppingListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateShoppingListDialog: React.FC<CreateShoppingListDialogProps> = ({ isOpen, onOpenChange }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createListMutation = useCreateShoppingList();

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createListMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    }, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Shopping List</DialogTitle>
          <DialogDescription>
            Give your new list a name and an optional description to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="listName">List Name</label>
            <Input
              id="listName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Groceries"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="listDescription">Description (Optional)</label>
            <Textarea
              id="listDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., For the week of July 22nd"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createListMutation.isPending}>
              {createListMutation.isPending ? 'Creating...' : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};