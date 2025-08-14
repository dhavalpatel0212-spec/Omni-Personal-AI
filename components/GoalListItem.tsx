import React, { useState } from "react";
import { Selectable } from "kysely";
import { Goals, GoalPriority, GoalStatus } from "../helpers/schema";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Spinner } from "./Spinner";
import ActionDialog from "./ActionDialog";
import { Calendar, Flag, Plus, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { formatUtcDate } from "../helpers/dateUtils";
import { useUpdateGoal } from "../helpers/useGoals";
import { useGetGoalActions, useAddGoalAction, useUpdateGoalAction } from "../helpers/useGoalActions";
import { useAIGoalRecommendations, AIOperationResult } from "../helpers/useAI";
import { useCelebration } from "../helpers/useCelebration";
import { OutputType as GoalRecommendationsOutput } from "../endpoints/ai/goal_recommendations_POST.schema";
import type { GoalActionType } from "../endpoints/goal/actions_GET.schema";
import { toast } from "sonner";
import styles from "./GoalListItem.module.css";

interface GoalListItemProps {
  goal: Selectable<Goals>;
  onEdit: (goal: Selectable<Goals>) => void;
  className?: string;
}

const priorityMap: Record<GoalPriority, { label: string; variant: "destructive" | "warning" | "success" }> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "warning" },
  low: { label: "Low", variant: "success" },
};

const statusMap: Record<GoalStatus, { label: string; variant: "default" | "secondary" | "success" }> = {
  not_started: { label: "Not Started", variant: "default" },
  in_progress: { label: "In Progress", variant: "secondary" },
  paused: { label: "Paused", variant: "default" },
  completed: { label: "Completed", variant: "success" },
};

export const GoalListItem: React.FC<GoalListItemProps> = ({ goal, onEdit, className }) => {
  const { title, description, dueDate, priority, status } = goal;
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Array<{ title: string; description: string }>>([]);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<GoalActionType | undefined>(undefined);
  
  const updateGoalMutation = useUpdateGoal();
  const addGoalActionMutation = useAddGoalAction();
  const updateGoalActionMutation = useUpdateGoalAction(goal.id);
  const { celebrateGoalCompletion, celebrateActionCompletion } = useCelebration();
  
  const { data: actions = [], isFetching: actionsLoading } = useGetGoalActions(goal.id, { 
    enabled: isExpanded 
  });

  const aiRecommendationsMutation = useAIGoalRecommendations();

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const handleToggleComplete = (checked: boolean) => {
    const newStatus: GoalStatus = checked ? 'completed' : 'in_progress';
    const wasNotCompleted = status !== 'completed';
    
    updateGoalMutation.mutate({
      goalId: goal.id,
      status: newStatus,
      progress: checked ? 100 : goal.progress || 0,
    });

    // Trigger celebration only when marking as complete (not unchecking)
    if (checked && wasNotCompleted) {
      celebrateGoalCompletion();
      console.log(`Celebrating goal completion: ${title}`);
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAiActions = () => {
    aiRecommendationsMutation.mutate(
      { goalId: goal.id },
      {
        onSuccess: (data) => {
          // Type guard to check if data is an AIOperationResult
          const isAIOperationResult = (data: any): data is AIOperationResult<GoalRecommendationsOutput> => {
            return typeof data === 'object' && data !== null && 'data' in data && 'modelInfo' in data;
          };
          
          const recommendations = isAIOperationResult(data) 
            ? data.data.recommendations 
            : (data as GoalRecommendationsOutput).recommendations;
          
          setAiRecommendations(recommendations);
          setIsExpanded(true);
        },
      }
    );
  };

  const handleActionToggle = (actionId: number, completed: boolean) => {
    const action = actions.find(a => a.id === actionId);
    const wasNotCompleted = action && !action.isCompleted;
    
    updateGoalActionMutation.mutate({
      actionId,
      isCompleted: completed,
    });

    // Trigger celebration only when marking as complete (not unchecking)
    if (completed && wasNotCompleted) {
      celebrateActionCompletion();
      console.log(`Celebrating action completion: ${action?.title}`);
    }
  };

  const handleAddRecommendedAction = (recommendation: { title: string; description: string }) => {
    addGoalActionMutation.mutate({
      goalId: goal.id,
      title: recommendation.title,
      description: recommendation.description,
    });
    
    // Remove the recommendation from the list after adding
    setAiRecommendations(prev => prev.filter(r => r.title !== recommendation.title));
  };

  const handleOpenActionDialog = (action?: GoalActionType) => {
    setCurrentAction(action);
    setIsActionDialogOpen(true);
  };

  const handleCloseActionDialog = () => {
    setIsActionDialogOpen(false);
    setCurrentAction(undefined);
  };

  const handleEditAction = (action: GoalActionType) => {
    handleOpenActionDialog(action);
  };

  const isCompleted = status === 'completed';
  const completedActions = actions.filter(action => action.isCompleted).length;
  const totalActions = actions.length;
  const actionCountText = totalActions > 0 ? `${completedActions}/${totalActions} actions` : '0 actions';

  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Checkbox
              checked={isCompleted}
              onChange={(e) => handleToggleComplete(e.target.checked)}
              disabled={updateGoalMutation.isPending}
            />
            <div className={styles.titleContent}>
          <h3 className={`${styles.title} ${isCompleted ? styles.completed : ''}`}>
            {title}
          </h3>
              {description && (
                <p className={styles.description}>{description}</p>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleExpanded}
            >
              <Plus size={14} />
              {isExpanded ? "Add Action" : "View Actions"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAiActions}
              disabled={aiRecommendationsMutation.isPending}
            >
              {aiRecommendationsMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <Sparkles size={14} />
              )}
              Get AI Help
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleToggleExpanded}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.expandedContent}>
          {actionsLoading && (
            <div className={styles.loadingActions}>
              <Spinner size="sm" />
              <span>Loading actions...</span>
            </div>
          )}
          
          {!actionsLoading && (
            <div className={styles.actionsSection}>
              <h4 className={styles.sectionTitle}>Actions</h4>
              {actions.length > 0 ? (
                <div className={styles.actionsList}>
                  {actions.map((action) => (
                    <div key={action.id} className={styles.actionItem}>
                      <Checkbox
                        checked={action.isCompleted}
                        onChange={(e) => handleActionToggle(action.id, e.target.checked)}
                        disabled={updateGoalActionMutation.isPending}
                      />
                      <div 
                        className={styles.actionContent}
                        onClick={() => handleEditAction(action)}
                      >
                        <span className={`${styles.actionTitle} ${action.isCompleted ? styles.completed : ''}`}>
                          {action.title}
                        </span>
                        {action.description && (
                          <span className={styles.actionDescription}>
                            {action.description}
                          </span>
                        )}
                        {(action.priority || action.dueDate) && (
                          <div className={styles.actionMeta}>
                            {action.priority && (
                              <Badge 
                                variant={priorityMap[action.priority].variant}
                                className={styles.actionBadge}
                              >
                                <Flag size={10} className={styles.badgeIcon} />
                                {priorityMap[action.priority].label}
                              </Badge>
                            )}
                            {action.dueDate && (
                              <Badge 
                                variant="outline"
                                className={styles.actionBadge}
                              >
                                <Calendar size={10} className={styles.badgeIcon} />
                                {formatUtcDate(new Date(action.dueDate))}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>
                    No steps yet. Break this goal into simple actions you can take.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenActionDialog()}
                  >
                    <Plus size={14} />
                    Add First Step
                  </Button>
                </div>
              )}
            </div>
          )}

          {aiRecommendations.length > 0 && (
            <div className={styles.recommendationsSection}>
              <h4 className={styles.sectionTitle}>Suggested Steps</h4>
              <div className={styles.recommendationsList}>
                {aiRecommendations.map((recommendation, index) => (
                  <div key={index} className={styles.recommendationItem}>
                    <div className={styles.recommendationContent}>
                      <span className={styles.recommendationTitle}>
                        {recommendation.title}
                      </span>
                      <span className={styles.recommendationDescription}>
                        {recommendation.description}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddRecommendedAction(recommendation)}
                      disabled={addGoalActionMutation.isPending}
                    >
                      <Plus size={14} />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <footer className={styles.footer}>
        <div className={styles.tags}>
          {status && (
            <Badge 
              variant={statusMap[status].variant}
              onClick={() => onEdit(goal)}
              style={{ cursor: 'pointer' }}
            >
              {statusMap[status].label}
            </Badge>
          )}
          {priority && (
            <Badge 
              variant={priorityMap[priority].variant}
              onClick={() => onEdit(goal)}
              style={{ cursor: 'pointer' }}
            >
              <Flag size={12} className={styles.badgeIcon} />
              {priorityMap[priority].label}
            </Badge>
          )}
          {formattedDueDate && (
            <Badge 
              variant="outline"
              onClick={() => onEdit(goal)}
              style={{ cursor: 'pointer' }}
            >
              <Calendar size={12} className={styles.badgeIcon} />
              {formattedDueDate}
            </Badge>
          )}
        </div>
        <div className={styles.actionCount}>
          {actionCountText}
        </div>
      </footer>

      <ActionDialog
        isOpen={isActionDialogOpen}
        onOpenChange={handleCloseActionDialog}
        goalId={goal.id}
        action={currentAction}
      />
    </div>
  );
};