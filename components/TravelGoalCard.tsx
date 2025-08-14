import React from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Calendar, MapPin, Users, PoundSterling, Edit, Search } from 'lucide-react';
import type { Selectable } from 'kysely';
import type { TravelGoals } from '../helpers/schema';
import styles from './TravelGoalCard.module.css';

interface TravelGoalCardProps {
  goal: Selectable<TravelGoals>;
  onEdit: () => void;
  onFindDeals: () => void;
}

export const TravelGoalCard: React.FC<TravelGoalCardProps> = ({
  goal,
  onEdit,
  onFindDeals,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.destination}>
          <MapPin size={20} className={styles.icon} />
          <h3 className={styles.title}>{goal.destination}</h3>
        </div>
        <Badge variant={getPriorityVariant(goal.priority)} className={styles.priorityBadge}>
          {goal.priority}
        </Badge>
      </div>

      {goal.description && (
        <p className={styles.description}>{goal.description}</p>
      )}

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <PoundSterling size={16} className={styles.detailIcon} />
          <span>£{Number(goal.budget).toLocaleString()}</span>
        </div>
        <div className={styles.detailItem}>
          <Users size={16} className={styles.detailIcon} />
          <span>{goal.travelers} traveler{goal.travelers > 1 ? 's' : ''}</span>
        </div>
        <div className={styles.detailItem}>
          <Calendar size={16} className={styles.detailIcon} />
          <span>{formatDate(goal.targetDate)}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit size={14} />
          Edit
        </Button>
        <Button size="sm" onClick={onFindDeals}>
          <Search size={14} />
          Find Deals
        </Button>
      </div>
    </div>
  );
};