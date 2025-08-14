import React from 'react';
import { Link } from 'react-router-dom';
import { useTodayGoals } from '../helpers/useTodayGoals';
import { Skeleton } from './Skeleton';
import { Badge } from './Badge';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Target, CheckCircle, ArrowRight, Info } from 'lucide-react';
import styles from './TodaysGoals.module.css';
import { GoalForToday } from '../endpoints/goals/today_GET.schema';
import { GoalStatus, GoalPriority } from '../helpers/schema';
import { useUpdateGoal } from '../helpers/useGoals';
import { useCelebration } from '../helpers/useCelebration';

const getPriorityVariant = (priority: GoalPriority | null | undefined) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusVariant = (status: GoalStatus | null | undefined) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'default';
    case 'paused':
      return 'warning';
    case 'not_started':
    default:
      return 'outline';
  }
};

const formatTime = (date: Date | null | undefined) => {
  if (!date) return null;
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const GoalItem = ({ goal }: { goal: GoalForToday }) => {
  const updateGoalMutation = useUpdateGoal();
  const { celebrateGoalCompletion } = useCelebration();
  
  const handleToggleComplete = (checked: boolean) => {
    const newStatus: GoalStatus = checked ? 'completed' : 'in_progress';
    updateGoalMutation.mutate({
      goalId: goal.id,
      status: newStatus,
      progress: checked ? 100 : goal.progress || 0,
    });
    
    // Trigger celebration when marking goal as complete
    if (checked) {
      celebrateGoalCompletion();
    }
  };

  const isCompleted = goal.status === 'completed';

  return (
    <li className={styles.item}>
      <div className={styles.itemContent}>
        <Checkbox
          checked={isCompleted}
          onChange={(e) => handleToggleComplete(e.target.checked)}
          disabled={updateGoalMutation.isPending}
        />
        <Target className={styles.itemIcon} size={20} />
        <div className={styles.itemDetails}>
          <span className={`${styles.itemTitle} ${isCompleted ? styles.completed : ''}`}>{goal.title}</span>
          <div className={styles.itemMeta}>
            {goal.priority && <Badge variant={getPriorityVariant(goal.priority)}>{goal.priority}</Badge>}
            {goal.status && <Badge variant={getStatusVariant(goal.status)}>{goal.status.replace('_', ' ')}</Badge>}
          </div>
        </div>
      </div>
      <div className={styles.itemActions}>
        {goal.dueDate && <span className={styles.itemTime}>{formatTime(goal.dueDate)}</span>}
        <Button asChild variant="ghost" size="icon-sm">
          <Link to={`/goals/${goal.id}`}>
            <ArrowRight size={16} />
          </Link>
        </Button>
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

export const TodaysGoals = ({ className }: { className?: string }) => {
  const { data: goalsData, isFetching: isGoalsFetching, error: goalsError } = useTodayGoals();

  const goals = goalsData?.goals ?? [];

  if (goalsError) {
    return (
      <div className={`${styles.card} ${className ?? ''}`}>
        <div className={styles.errorState}>
          <Info size={24} />
          <p>Could not load today's goals. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.header}>
        <Target className={styles.headerIcon} />
        <h3 className={styles.headerTitle}>Today's Goal & Actions</h3>
        <Button asChild variant="link" size="sm">
          <Link to="/goals">View All</Link>
        </Button>
      </div>
      {isGoalsFetching ? (
        <TodaysItemsSkeleton />
      ) : goals.length > 0 ? (
        <ul className={styles.list}>
          {goals.map((goal) => (
            <GoalItem key={`goal-${goal.id}`} goal={goal} />
          ))}
        </ul>
      ) : (
        <EmptyState title="No Goals Due Today" message="Enjoy the clear schedule or get a head start on tomorrow!" />
      )}
    </div>
  );
};