import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useGoals, useCreateGoal } from "../helpers/useGoals";
import { useGetStandaloneActions } from "../helpers/useStandaloneActions";
import { useAnalyzeGoals } from "../helpers/useAI";
import { useDashboard } from "../helpers/useDashboard";
import { Button } from "../components/Button";
import { CreateGoalDialog } from "../components/CreateGoalDialog";
import { CreateStandaloneActionDialog } from "../components/CreateStandaloneActionDialog";
import { StandaloneActionListItem } from "../components/StandaloneActionListItem";
import { EditStandaloneActionDialog } from "../components/EditStandaloneActionDialog";
import { GoalListItem } from "../components/GoalListItem";
import { GoalListItemSkeleton } from "../components/GoalListItemSkeleton";
import { StandaloneActionListItemSkeleton } from "../components/StandaloneActionListItemSkeleton";
import { GoalStats } from "../components/GoalStats";
import { EditGoalDialog } from "../components/EditGoalDialog";
import { Progress } from "../components/Progress";
import { Skeleton } from "../components/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import { AlertCircle, Plus, Sparkles, ListFilter, BarChart2, TrendingUp, Camera } from "lucide-react";
import {
  GoalStatus,
  GoalPriority,
  GoalStatusArrayValues,
  GoalPriorityArrayValues,
} from "../helpers/schema";
import { GoalSortBy, SortOrder } from "../endpoints/goals_GET.schema";
import type { Selectable } from "kysely";
import type { Goals, StandaloneActions } from "../helpers/schema";
import styles from "./goals.module.css";
import { toast } from "sonner";
import { VisionAIUploader } from "../components/VisionAIUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/Dialog";
import type { AnalyzedGoal } from "../endpoints/ai/analyze_image_for_goals_POST.schema";

const GoalsPage: React.FC = () => {
  console.log('GoalsPage render - checking for infinite loop', new Date().toISOString());
  
  const [isCreateGoalOpen, setCreateGoalOpen] = useState(false);
  const [isCreateActionOpen, setCreateActionOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Selectable<Goals> | null>(null);
  const [editingAction, setEditingAction] = useState<Selectable<StandaloneActions> | null>(null);
  const [isAiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [isVisionAiOpen, setVisionAiOpen] = useState(false);

  const [filters, setFilters] = useState<{
    status?: GoalStatus;
    priority?: GoalPriority;
  }>({});

  const [sorting, setSorting] = useState<{
    sortBy: GoalSortBy;
    sortOrder: SortOrder;
  }>({ sortBy: "createdAt", sortOrder: "desc" });

  const {
    data: goalsData,
    isFetching: isLoadingGoals,
    error: goalsError,
  } = useGoals({
    status: filters.status,
    priority: filters.priority,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
  });

  const {
    data: actionsData,
    isFetching: isLoadingActions,
    error: actionsError,
  } = useGetStandaloneActions({
    status: filters.status === 'completed' ? 'completed' : filters.status === 'in_progress' || filters.status === 'not_started' || filters.status === 'paused' ? 'pending' : undefined,
    priority: filters.priority,
    sortBy: sorting.sortBy === 'createdAt' ? 'createdAt' : sorting.sortBy === 'dueDate' ? 'dueDate' : sorting.sortBy === 'priority' ? 'priority' : sorting.sortBy === 'title' ? 'title' : 'createdAt',
    sortOrder: sorting.sortOrder,
  });

  const { 
    data: dashboardData, 
    isFetching: isDashboardFetching, 
    error: dashboardError 
  } = useDashboard();

  const analyzeGoalsMutation = useAnalyzeGoals();
  const createGoalMutation = useCreateGoal();

  const handleAnalyzeGoals = () => {
    analyzeGoalsMutation.mutate(undefined, {
      onSuccess: () => {
        setAiAnalysisOpen(true);
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        toast.error(`AI analysis failed: ${message}`);
      }
    });
  };

  const handleVisionAiGoals = async (goals: AnalyzedGoal[]) => {
    try {
      const promises = goals.map(goal => {
        const goalData = {
          title: goal.title,
          description: goal.description || undefined,
          priority: goal.priority || undefined,
          dueDate: goal.dueDate ? new Date(goal.dueDate) : undefined,
        };
        return createGoalMutation.mutateAsync(goalData);
      });
      
      await Promise.all(promises);
      setVisionAiOpen(false);
      toast.success(`Successfully created ${goals.length} goal${goals.length > 1 ? 's' : ''} from your image!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create goals";
      toast.error(`Failed to create goals: ${message}`);
    }
  };

  const goals = goalsData?.goals ?? [];
  const actions = actionsData?.actions ?? [];

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K] | "all"
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-") as [GoalSortBy, SortOrder];
    setSorting({ sortBy, sortOrder });
  };

  // Separate goals into open and completed
  const { openGoals, completedGoals } = useMemo(() => {
    const open = goals.filter(goal => goal.status !== 'completed');
    const completed = goals.filter(goal => goal.status === 'completed');
    return { openGoals: open, completedGoals: completed };
  }, [goals]);

  // Separate actions into open and completed
  const { openActions, completedActions } = useMemo(() => {
    const open = actions.filter(action => !action.isCompleted);
    const completed = actions.filter(action => action.isCompleted);
    return { openActions: open, completedActions: completed };
  }, [actions]);

  // Get today's goals (due today)
  const todaysGoals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return goals.filter(goal => {
      if (!goal.dueDate) return false;
      const dueDate = new Date(goal.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate < tomorrow;
    });
  }, [goals]);

  const renderGoalSection = (sectionGoals: Selectable<Goals>[], title: string, count: number) => {
    if (sectionGoals.length === 0) return null;

    return (
      <div className={styles.goalSection}>
        <h3 className={styles.sectionHeader}>
          {title} ({count})
        </h3>
        <div className={styles.goalsList}>
          {sectionGoals.map((goal) => (
            <GoalListItem
              key={goal.id}
              goal={goal}
              onEdit={() => setEditingGoal(goal)}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderActionSection = (sectionActions: Selectable<StandaloneActions>[], title: string, count: number) => {
    if (sectionActions.length === 0) return null;

    return (
      <div className={styles.goalSection}>
        <h3 className={styles.sectionHeader}>
          {title} ({count})
        </h3>
        <div className={styles.goalsList}>
          {sectionActions.map((action) => (
            <StandaloneActionListItem
              key={action.id}
              action={action}
              onEdit={() => setEditingAction(action)}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const isLoadingGoalsInitial = isLoadingGoals && !goals.length;
    const isLoadingActionsInitial = isLoadingActions && !actions.length;
    const isLoading = isLoadingGoalsInitial || isLoadingActionsInitial;
    const hasError = goalsError || actionsError;
    const isEmpty = goals.length === 0 && actions.length === 0;

    if (isLoading) {
      return (
        <div className={styles.goalsContent}>
          {isLoadingGoalsInitial && (
            <div className={styles.goalSection}>
              <h3 className={styles.sectionHeader}>Loading Goals...</h3>
              <div className={styles.goalsList}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <GoalListItemSkeleton key={`goal-skeleton-${i}`} />
                ))}
              </div>
            </div>
          )}
          {isLoadingActionsInitial && (
            <div className={styles.goalSection}>
              <h3 className={styles.sectionHeader}>Loading Actions...</h3>
              <div className={styles.goalsList}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <StandaloneActionListItemSkeleton key={`action-skeleton-${i}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (hasError) {
      return (
        <div className={styles.errorState}>
          <AlertCircle size={48} className={styles.errorIcon} />
          <h2>Failed to load data</h2>
          <p>{goalsError?.message || actionsError?.message}</p>
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className={styles.emptyState}>
          <h3>No goals or actions found</h3>
          <p>Get started by creating your first goal or action.</p>
          <div className={styles.emptyStateButtons}>
            <Button onClick={() => setCreateGoalOpen(true)}>
              <Plus size={16} />
              Create Goal
            </Button>
            <Button variant="outline" onClick={() => setCreateActionOpen(true)}>
              <Plus size={16} />
              Create Action
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.goalsContent}>
        {renderGoalSection(openGoals, "Open Goals", openGoals.length)}
        {renderActionSection(openActions, "Open Actions", openActions.length)}
        {renderGoalSection(completedGoals, "Completed Goals", completedGoals.length)}
        {renderActionSection(completedActions, "Completed Actions", completedActions.length)}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Goal & Actions | OmniPA</title>
        <meta name="description" content="Manage your personal and professional goals." />
      </Helmet>
      <div className={styles.pageContainer}>
        <div className={styles.backgroundElements}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
        </div>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>Goal & Actions</span>
          </h1>
          <div className={styles.headerActions}>
            <Button variant="secondary" onClick={handleAnalyzeGoals} disabled={analyzeGoalsMutation.isPending}>
              <Sparkles size={16} />
              {analyzeGoalsMutation.isPending ? "Analyzing..." : "AI Insights"}
            </Button>
            <Button variant="secondary" onClick={() => setVisionAiOpen(true)}>
              <Camera size={16} />
              Import from Image
            </Button>
            <Button onClick={() => setCreateGoalOpen(true)}>
              <Plus size={16} />
              Add Goal
            </Button>
            <Button variant="outline" onClick={() => setCreateActionOpen(true)}>
              <Plus size={16} />
              Add Action
            </Button>
          </div>
        </header>

        <div className={styles.statsWrapper}>
          <GoalStats goals={goals} todaysGoals={todaysGoals} isLoading={isLoadingGoals} />
        </div>

        <div className={styles.controlsContainer}>
          <div className={styles.filterGroup}>
            <Select
              value={filters.status || "all"}
              onValueChange={(value: GoalStatus | "all") =>
                handleFilterChange("status", value)
              }
            >
              <SelectTrigger className={styles.selectTrigger}>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {GoalStatusArrayValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || "all"}
              onValueChange={(value: GoalPriority | "all") =>
                handleFilterChange("priority", value)
              }
            >
              <SelectTrigger className={styles.selectTrigger}>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {GoalPriorityArrayValues.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sorting.sortBy}-${sorting.sortOrder}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className={styles.selectTrigger}>
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="dueDate-asc">Due Date (Asc)</SelectItem>
                <SelectItem value="dueDate-desc">Due Date (Desc)</SelectItem>
                <SelectItem value="priority-asc">Priority (Low to High)</SelectItem>
                <SelectItem value="priority-desc">Priority (High to Low)</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.addButtonGroup}>
            <Button onClick={() => setCreateGoalOpen(true)}>
              <Plus size={16} />
              Add Goal
            </Button>
            <Button variant="outline" onClick={() => setCreateActionOpen(true)}>
              <Plus size={16} />
              Add Action
            </Button>
          </div>
        </div>

        <main>{renderContent()}</main>
      </div>

      <CreateGoalDialog
        isOpen={isCreateGoalOpen}
        onOpenChange={setCreateGoalOpen}
      />
      
      <CreateStandaloneActionDialog
        isOpen={isCreateActionOpen}
        onOpenChange={setCreateActionOpen}
      />
      
      {editingGoal && (
        <EditGoalDialog
          isOpen={!!editingGoal}
          onOpenChange={(isOpen) => !isOpen && setEditingGoal(null)}
          goal={editingGoal}
        />
      )}

      {editingAction && (
        <EditStandaloneActionDialog
          isOpen={!!editingAction}
          onOpenChange={(isOpen) => !isOpen && setEditingAction(null)}
          action={editingAction}
        />
      )}

      <Dialog open={isVisionAiOpen} onOpenChange={setVisionAiOpen}>
        <DialogContent className={styles.visionAiDialog}>
          <DialogHeader>
            <DialogTitle>
              <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'}}>
                <Camera size={20} color="var(--primary)" />
                Extract Goals from Image
              </div>
            </DialogTitle>
            <DialogDescription>
              Upload an image of a schedule, whiteboard, document, or screenshot to extract actionable goals using AI.
            </DialogDescription>
          </DialogHeader>
          <VisionAIUploader
            mode="goals"
            onSaveGoals={handleVisionAiGoals}
            className={styles.visionAiUploader}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAiAnalysisOpen} onOpenChange={setAiAnalysisOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'}}>
                <Sparkles size={20} color="var(--primary)" />
                AI-Powered Goal Analysis
              </div>
            </DialogTitle>
            <DialogDescription>
              Here are some insights based on your current goals.
            </DialogDescription>
          </DialogHeader>
          <div className={styles.aiAnalysisContent}>
            {analyzeGoalsMutation.isPending ? (
              <p>Generating insights...</p>
            ) : analyzeGoalsMutation.error ? (
              <p className={styles.errorText}>
                Error: {analyzeGoalsMutation.error.message}
              </p>
            ) : (
              <p>{analyzeGoalsMutation.data?.analysis}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoalsPage;