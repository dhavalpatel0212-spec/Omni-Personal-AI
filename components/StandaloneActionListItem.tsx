import React from 'react';
import { Selectable } from 'kysely';
import { StandaloneActions, ActionPriority } from '../helpers/schema';
import { useUpdateStandaloneAction } from '../helpers/useStandaloneActions';
import { Badge } from './Badge';
import { Checkbox } from './Checkbox';
import { Flag, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import styles from './StandaloneActionListItem.module.css';

interface StandaloneActionListItemProps {
  action: Selectable<StandaloneActions>;
  onEdit: (action: Selectable<StandaloneActions>) => void;
  className?: string;
}

const priorityMap: Record<ActionPriority, { label: string; variant: 'destructive' | 'warning' | 'success' }> = {
  high: { label: 'High', variant: 'destructive' },
  medium: { label: 'Medium', variant: 'warning' },
  low: { label: 'Low', variant: 'success' },
};

export const StandaloneActionListItem: React.FC<StandaloneActionListItemProps> = ({ action, onEdit, className }) => {
  const { id, title, description, dueDate, priority, isCompleted } = action;

  const updateActionMutation = useUpdateStandaloneAction();

  const handleToggleComplete = (checked: boolean) => {
    updateActionMutation.mutate(
      {
        actionId: id,
        isCompleted: checked,
      },
      {
        onSuccess: () => {
          toast.success(`Action "${title}" marked as ${checked ? 'complete' : 'incomplete'}.`);
        },
        onError: (error) => {
          if (error instanceof Error) {
            toast.error(`Failed to update action: ${error.message}`);
          } else {
            toast.error('An unknown error occurred while updating the action.');
          }
        },
      },
    );
  };

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.mainContent}>
        <div className={styles.titleSection}>
          <Checkbox
            checked={!!isCompleted}
            onChange={(e) => handleToggleComplete(e.target.checked)}
            disabled={updateActionMutation.isPending}
            aria-label={`Mark action "${title}" as complete`}
          />
          <div className={styles.titleContent}>
            <h3 className={`${styles.title} ${isCompleted ? styles.completed : ''}`}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.tags}>
          {priority && (
            <Badge
              variant={priorityMap[priority].variant}
              onClick={() => onEdit(action)}
              style={{ cursor: 'pointer' }}
              aria-label={`Edit action priority: ${priorityMap[priority].label}`}
            >
              <Flag size={12} className={styles.badgeIcon} />
              {priorityMap[priority].label}
            </Badge>
          )}
          {formattedDueDate && (
            <Badge
              variant="outline"
              onClick={() => onEdit(action)}
              style={{ cursor: 'pointer' }}
              aria-label={`Edit action due date: ${formattedDueDate}`}
            >
              <Calendar size={12} className={styles.badgeIcon} />
              {formattedDueDate}
            </Badge>
          )}
        </div>
      </footer>
    </div>
  );
};