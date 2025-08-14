import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Textarea } from './Textarea';
import { useAddShoppingItems } from '../helpers/useShopping';
import { ShoppingItemCategoryArrayValues, ShoppingItemPriorityArrayValues, ShoppingItemCategory, ShoppingItemPriority } from '../helpers/schema';
import styles from './AddShoppingItemDialog.module.css';

interface AddShoppingItemDialogProps {
  shoppingListId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddShoppingItemDialog: React.FC<AddShoppingItemDialogProps> = ({ shoppingListId, open, onOpenChange }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | undefined>(1);
  const [category, setCategory] = useState<ShoppingItemCategory | ''>('');
  const [priority, setPriority] = useState<ShoppingItemPriority | ''>('');
  const [notes, setNotes] = useState('');

  const addItemsMutation = useAddShoppingItems();

  const resetForm = () => {
    setName('');
    setQuantity(1);
    setCategory('');
    setPriority('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addItemsMutation.mutate({
      shoppingListId,
      items: [{
        name: name.trim(),
        quantity: quantity || null,
        category: category || null,
        priority: priority || null,
        notes: notes.trim() || null,
        addedVia: 'manual',
      }],
    }, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Manually add an item to your shopping list. For bulk additions, try the voice or image options.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="itemName">Item Name</label>
            <Input id="itemName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Organic Milk" required />
          </div>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label htmlFor="itemQuantity">Quantity</label>
              <Input id="itemQuantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} min="1" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="itemCategory">Category</label>
              <Select value={category} onValueChange={(value) => setCategory(value as ShoppingItemCategory)}>
                <SelectTrigger id="itemCategory"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {ShoppingItemCategoryArrayValues.map(cat => <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="itemPriority">Priority</label>
            <Select value={priority} onValueChange={(value) => setPriority(value as ShoppingItemPriority)}>
              <SelectTrigger id="itemPriority"><SelectValue placeholder="Select priority" /></SelectTrigger>
              <SelectContent>
                {ShoppingItemPriorityArrayValues.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="itemNotes">Notes</label>
            <Textarea id="itemNotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., 2% fat, lactose-free" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={addItemsMutation.isPending}>
              {addItemsMutation.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};