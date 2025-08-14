import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Edit, Loader, Trash2, UploadCloud, X } from 'lucide-react';
import { FileDropzone } from './FileDropzone';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import { postAnalyzeShoppingImage, AnalyzedItem as AnalyzedShoppingItem, OutputType as ShoppingOutputType } from '../endpoints/ai/analyze_shopping_image_POST.schema';
import { postAnalyzeImageForGoals, AnalyzedGoal as AnalyzedGoalItem, OutputType as GoalsOutputType } from '../endpoints/ai/analyze_image_for_goals_POST.schema';
import { ShoppingItemCategoryArrayValues, GoalPriorityArrayValues } from '../helpers/schema';
import styles from './VisionAIUploader.module.css';

type VisionMode = 'shopping' | 'goals';

// Union type for both endpoint results
type VisionResult = ShoppingOutputType | GoalsOutputType;

// Type guards to narrow the union type
const isShoppingResult = (result: VisionResult): result is ShoppingOutputType => {
  return 'items' in result;
};

const isGoalsResult = (result: VisionResult): result is GoalsOutputType => {
  return 'goals' in result;
};

const hasError = (result: VisionResult): result is { error: string } => {
  return 'error' in result;
};

interface VisionAIUploaderProps {
  mode: VisionMode;
  onSaveShoppingItems?: (items: AnalyzedShoppingItem[]) => void;
  onSaveGoals?: (goals: AnalyzedGoalItem[]) => void;
  className?: string;
}

const shoppingSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    quantity: z.number().min(1).optional().default(1),
    category: z.enum(ShoppingItemCategoryArrayValues).optional().default('other'),
    estimated_price: z.number().nullable().optional().default(null),
  })),
});

const goalsSchema = z.object({
  goals: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable().optional(),
    priority: z.enum(GoalPriorityArrayValues).nullable().optional(),
    dueDate: z.string().nullable().optional(),
  })),
});

type ShoppingFormValues = z.infer<typeof shoppingSchema>;
type GoalsFormValues = z.infer<typeof goalsSchema>;

export const VisionAIUploader: React.FC<VisionAIUploaderProps> = ({
  mode,
  onSaveShoppingItems,
  onSaveGoals,
  className,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shoppingForm = useForm<ShoppingFormValues>({
    resolver: zodResolver(shoppingSchema),
    defaultValues: { items: [] },
  });
  const { fields: shoppingFields, append: appendShopping, remove: removeShopping } = useFieldArray({ control: shoppingForm.control, name: "items" });

  const goalsForm = useForm<GoalsFormValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: { goals: [] },
  });
  const { fields: goalFields, append: appendGoal, remove: removeGoal } = useFieldArray({ control: goalsForm.control, name: "goals" });

  const analyzeMutation = useMutation<VisionResult, Error, FormData>({
    mutationFn: async (formData: FormData): Promise<VisionResult> => {
      setError(null);
      if (mode === 'shopping') {
        return await postAnalyzeShoppingImage(formData);
      }
      return await postAnalyzeImageForGoals(formData);
    },
    onSuccess: (data) => {
      if (hasError(data)) {
        setError(data.error);
        return;
      }
      
      if (mode === 'shopping' && isShoppingResult(data)) {
        shoppingForm.reset({ items: data.items });
      } else if (mode === 'goals' && isGoalsResult(data)) {
        goalsForm.reset({ goals: data.goals });
      }
    },
    onError: (err) => {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during analysis.');
      }
      console.error("Analysis failed:", err);
    },
  });

  const handleFileSelect = useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  }, []);

  const handleAnalyze = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('image', selectedFile);
    analyzeMutation.mutate(formData);
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    analyzeMutation.reset();
    shoppingForm.reset({ items: [] });
    goalsForm.reset({ goals: [] });
  };

  const handleShoppingSubmit = (data: ShoppingFormValues) => {
    onSaveShoppingItems?.(data.items);
    resetState();
  };

  const handleGoalsSubmit = (data: GoalsFormValues) => {
    onSaveGoals?.(data.goals);
    resetState();
  };

  const renderContent = () => {
    if (analyzeMutation.isPending) {
      return (
        <div className={styles.stateContainer}>
          <Skeleton style={{ height: '200px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
          <div className={styles.stateText}>
            <Loader className="animate-spin" />
            <p>Analyzing image, please wait...</p>
          </div>
        </div>
      );
    }

    if (analyzeMutation.isSuccess && !error) {
      return (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <h3><CheckCircle size={20} /> AI Analysis Complete</h3>
            <p>Review and edit the extracted items below before saving.</p>
          </div>
          {mode === 'shopping' ? (
            <form onSubmit={shoppingForm.handleSubmit(handleShoppingSubmit)}>
              <div className={styles.resultsList}>
                {shoppingFields.map((field, index) => (
                  <div key={field.id} className={styles.resultItem}>
                    <Controller name={`items.${index}.name`} control={shoppingForm.control} render={({ field }) => <input {...field} placeholder="Item Name" className={styles.input} />} />
                    <Controller name={`items.${index}.quantity`} control={shoppingForm.control} render={({ field }) => <input {...field} type="number" placeholder="Qty" className={`${styles.input} ${styles.quantityInput}`} />} />
                    <Controller name={`items.${index}.category`} control={shoppingForm.control} render={({ field }) => (
                      <select {...field} className={styles.select}>
                        {ShoppingItemCategoryArrayValues.map(cat => <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>)}
                      </select>
                    )} />
                    <Button variant="ghost" size="icon-sm" onClick={() => removeShopping(index)} aria-label="Remove item"><Trash2 size={16} /></Button>
                  </div>
                ))}
              </div>
              <div className={styles.resultsActions}>
                <Button type="button" variant="outline" onClick={resetState}>Discard</Button>
                <Button type="submit">Save Items</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={goalsForm.handleSubmit(handleGoalsSubmit)}>
              <div className={styles.resultsList}>
                {goalFields.map((field, index) => (
                  <div key={field.id} className={`${styles.resultItem} ${styles.goalItem}`}>
                    <div className={styles.goalMain}>
                      <Controller name={`goals.${index}.title`} control={goalsForm.control} render={({ field }) => <input {...field} placeholder="Goal Title" className={styles.input} />} />
                      <Controller name={`goals.${index}.description`} control={goalsForm.control} render={({ field }) => <textarea {...field} value={field.value ?? ''} placeholder="Description (optional)" className={`${styles.input} ${styles.textarea}`} />} />
                    </div>
                    <div className={styles.goalMeta}>
                      <Controller name={`goals.${index}.priority`} control={goalsForm.control} render={({ field }) => (
                        <select {...field} value={field.value ?? ''} className={styles.select}>
                          <option value="">No Priority</option>
                          {GoalPriorityArrayValues.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                        </select>
                      )} />
                      <Controller name={`goals.${index}.dueDate`} control={goalsForm.control} render={({ field }) => <input {...field} value={field.value ?? ''} type="date" className={styles.input} />} />
                      <Button variant="ghost" size="icon-sm" onClick={() => removeGoal(index)} aria-label="Remove goal"><Trash2 size={16} /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.resultsActions}>
                <Button type="button" variant="outline" onClick={resetState}>Discard</Button>
                <Button type="submit">Save Goals</Button>
              </div>
            </form>
          )}
        </div>
      );
    }

    return (
      <div className={styles.uploadContainer}>
        {!selectedFile ? (
          <FileDropzone
            onFilesSelected={handleFileSelect}
            accept="image/png, image/jpeg, image/webp"
            maxFiles={1}
            icon={<UploadCloud size={48} />}
            title={`Upload an image to find ${mode}`}
            subtitle="Drag & drop or click to select a file."
          />
        ) : (
          <div className={styles.previewContainer}>
            {preview && <img src={preview} alt="Preview" className={styles.previewImage} />}
            <div className={styles.previewActions}>
              <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending}>
                {`Analyze for ${mode}`}
              </Button>
              <Button variant="outline" onClick={resetState} disabled={analyzeMutation.isPending}>
                Choose another
              </Button>
            </div>
          </div>
        )}
        {error && (
          <div className={styles.errorContainer}>
            <AlertCircle size={20} />
            <p>{error}</p>
            <Button variant="ghost" size="icon-sm" onClick={() => setError(null)} aria-label="Clear error"><X size={16} /></Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {renderContent()}
    </div>
  );
};