import React, { useState } from 'react';
import { useCreateShoppingList, useAddShoppingItems } from '../helpers/useShopping';
import { VisionAIUploader } from './VisionAIUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Camera, Loader } from 'lucide-react';
import { AnalyzedItem } from '../endpoints/ai/analyze_shopping_image_POST.schema';
import styles from './CreateShoppingListFromImageDialog.module.css';

interface CreateShoppingListFromImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateShoppingListFromImageDialog: React.FC<CreateShoppingListFromImageDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [listName, setListName] = useState('');
  const [extractedItems, setExtractedItems] = useState<AnalyzedItem[]>([]);
  const [step, setStep] = useState<'upload' | 'name' | 'creating'>('upload');

  const createListMutation = useCreateShoppingList();
  const addItemsMutation = useAddShoppingItems();

  const handleItemsExtracted = (items: AnalyzedItem[]) => {
    setExtractedItems(items);
    setStep('name');
    
    // Generate a default name based on the items
    const defaultName = `Shopping List - ${new Date().toLocaleDateString()}`;
    setListName(defaultName);
  };

  const handleCreateList = async () => {
    if (!listName.trim() || extractedItems.length === 0) return;

    setStep('creating');

    try {
      // Create the shopping list first
      const listResult = await createListMutation.mutateAsync({
        name: listName.trim(),
        description: `Created from image with ${extractedItems.length} items`,
      });

      if ('shoppingList' in listResult) {
        // Add the extracted items to the new list
        await addItemsMutation.mutateAsync({
          shoppingListId: listResult.shoppingList.id,
          items: extractedItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            addedVia: 'vision_ai',
          })),
        });

        // Reset and close
        handleClose();
      }
    } catch (error) {
      setStep('name');
      console.error('Failed to create shopping list from image:', error);
    }
  };

  const handleClose = () => {
    setListName('');
    setExtractedItems([]);
    setStep('upload');
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 'name') {
      setStep('upload');
      setExtractedItems([]);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className={styles.uploadStep}>
            <DialogHeader>
              <DialogTitle>
                <Camera size={20} />
                Create List from Image
              </DialogTitle>
              <DialogDescription>
                Upload an image of your shopping list, receipt, or products. Our AI will automatically extract the items for you.
              </DialogDescription>
            </DialogHeader>
            
            <VisionAIUploader
              mode="shopping"
              onSaveShoppingItems={handleItemsExtracted}
              className={styles.uploader}
            />
          </div>
        );

      case 'name':
        return (
          <div className={styles.nameStep}>
            <DialogHeader>
              <DialogTitle>Name Your Shopping List</DialogTitle>
              <DialogDescription>
                Found {extractedItems.length} items. Give your list a name before creating it.
              </DialogDescription>
            </DialogHeader>

            <div className={styles.nameForm}>
              <Input
                type="text"
                placeholder="Enter list name..."
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                autoFocus
              />
              
              <div className={styles.itemsPreview}>
                <h4>Items to add:</h4>
                <div className={styles.itemsList}>
                  {extractedItems.map((item, index) => (
                    <div key={index} className={styles.previewItem}>
                      <span className={styles.itemName}>{item.name}</span>
                      {item.quantity && item.quantity > 1 && (
                        <span className={styles.itemQuantity}>×{item.quantity}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.nameActions}>
                <Button variant="outline" onClick={handleBack}>
                  Back to Upload
                </Button>
                <Button 
                  onClick={handleCreateList}
                  disabled={!listName.trim()}
                >
                  Create List
                </Button>
              </div>
            </div>
          </div>
        );

      case 'creating':
        return (
          <div className={styles.creatingStep}>
            <DialogHeader>
              <DialogTitle>Creating Your Shopping List...</DialogTitle>
            </DialogHeader>
            
            <div className={styles.creatingContent}>
              <Loader className="animate-spin" size={32} />
              <p>Adding {extractedItems.length} items to "{listName}"</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={step === 'creating' ? undefined : onOpenChange}>
      <DialogContent className={styles.dialog}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};