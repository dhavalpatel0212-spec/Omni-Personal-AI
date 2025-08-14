import React from 'react';
import { Link } from 'react-router-dom';
import { useTodayActions } from '../helpers/useTodayActions';
import { useUpdateGoalAction } from '../helpers/useGoalActions';
import { useCelebration } from '../helpers/useCelebration';
import { Skeleton } from './Skeleton';
import { Checkbox } from './Checkbox';
import { CheckCircle, ListTodo, Target, Info } from 'lucide-react';
import styles from './TodaysActions.module.css';
import { ActionForToday } from '../endpoints/actions/today_GET.schema';

const formatTime = (date: Date | null | undefined) => {
  if (!date) return null;
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ActionItem = ({ action }: { action: ActionForToday }) => {
  // We need a separate mutation hook instance for each goalId to correctly invalidate queries.
  const { mutate: updateAction, isPending } = useUpdateGoalAction(action.goalId);
  const { celebrateActionCompletion } = useCelebration();

  const handleCheckedChange = (checked: boolean) => {
    updateAction({
      actionId: action.id,
      isCompleted: checked,
    });
    
    // Trigger celebration when marking action as complete
    if (checked) {
      celebrateActionCompletion();
    }
  };

  return (
    <li className={styles.item}>
      <div className={styles.itemContent}>
        <Checkbox
          id={`action-${action.id}`}
          checked={action.isCompleted ?? false}
          onChange={e => handleCheckedChange(e.currentTarget.checked)}
          disabled={isPending}
          aria-label={`Mark action '${action.title}' as complete`}
        />
        <div className={styles.itemDetails}>
          <label htmlFor={`action-${action.id}`} className={styles.itemTitle}>
            {action.title}
          </label>
          <div className={styles.itemMeta}>
            <Link to={`/goals/${action.goalId}`} className={styles.goalLink}>
              <Target size={12} />
              <span>{action.goalTitle}</span>
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.itemActions}>
        {action.dueDate && <span className={styles.itemTime}>{formatTime(action.dueDate)}</span>}
      </div>
    </li>
  );
};

const TodaysItemsSkeleton = () => (
  <ul className={styles.list}>
    {[...Array(3)].map((_, i) => (
      <li key={i} className={styles.item}>
        <div className={styles.itemContent}>
          <Skeleton style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
          <div className={styles.itemDetails}>
            <Skeleton style={{ width: '180px', height: '1rem', marginBottom: 'var(--spacing-1)' }} />
            <Skeleton style={{ width: '120px', height: '0.75rem' }} />
          </div>
        </div>
        <Skeleton style={{ width: '50px', height: '1rem' }} />
      </li>
    ))}
  </ul>
);

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyStateIcon}>
      <CheckCircle size={32} />
    </div>
    <h4 className={styles.emptyStateTitle}>{title}</h4>
    <p className={styles.emptyStateMessage}>{message}</p>
  </div>
);

export const TodaysActions = ({ className }: { className?: string }) => {
  const { data: actionsData, isFetching: isActionsFetching, error: actionsError } = useTodayActions();

  const actions = actionsData?.actions?.filter(action => !action.isCompleted) ?? [];

  if (actionsError) {
    return (
      <div className={`${styles.card} ${className ?? ''}`}>
        <div className={styles.errorState}>
          <Info size={24} />
          <p>Could not load today's actions. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.header}>
        <ListTodo className={styles.headerIcon} />
        <h3 className={styles.headerTitle}>Today's Actions</h3>
      </div>
      {isActionsFetching ? (
        <TodaysItemsSkeleton />
      ) : actions.length > 0 ? (
        <ul className={styles.list}>
          {actions.map((action) => (
            <ActionItem key={`action-${action.id}`} action={action} />
          ))}
        </ul>
      ) : (
        <EmptyState title="No Actions Due Today" message="All your tasks are clear. Time to relax or plan ahead." />
      )}
    </div>
  );
};