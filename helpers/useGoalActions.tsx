import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGoalActions,
  InputType as GetInput,
  OutputType as GetOutput,
  GoalActionType,
} from "../endpoints/goal/actions_GET.schema";
import {
  postGoalActions,
  InputType as PostInput,
} from "../endpoints/goal/actions_POST.schema";
import {
  postGoalActionUpdate,
  InputType as UpdateInput,
} from "../endpoints/goal/action/update_POST.schema";
import { toast } from "sonner";
import { USE_TODAY_ACTIONS_QUERY_KEY } from "./useTodayActions";
import type { ActionForToday } from "../endpoints/actions/today_GET.schema";

export const goalActionsQueryKey = (goalId: number) => ["goals", goalId, "actions"];

/**
 * Fetches the actions for a specific goal.
 * @param goalId The ID of the goal.
 * @param options Optional query options.
 */
export const useGetGoalActions = (goalId: number, { enabled = true } = {}) => {
  return useQuery<GetOutput, Error>({
    queryKey: goalActionsQueryKey(goalId),
    queryFn: () => getGoalActions({ goalId }),
    enabled: !!goalId && enabled,
  });
};

/**
 * Provides a mutation for adding a new action to a goal.
 * Handles optimistic updates and invalidates the query on success.
 */
export const useAddGoalAction = () => {
  const queryClient = useQueryClient();

  return useMutation<GoalActionType, Error, PostInput, { previousActions?: GetOutput; queryKey: (string | number)[] }>({
    mutationFn: postGoalActions,
    onMutate: async (newAction) => {
      const queryKey = goalActionsQueryKey(newAction.goalId);
      await queryClient.cancelQueries({ queryKey });

      const previousActions = queryClient.getQueryData<GetOutput>(queryKey);

      const optimisticAction: GoalActionType = {
        id: -Math.random(), // Temporary ID
        ...newAction,
        description: newAction.description ?? null,
        dueDate: newAction.dueDate ? new Date(newAction.dueDate) : null,
        priority: newAction.priority ?? null,
        isCompleted: false,
        createdAt: new Date(),
      };

      queryClient.setQueryData<GetOutput>(queryKey, (old = []) => [
        ...old,
        optimisticAction,
      ]);

      return { previousActions, queryKey };
    },
    onError: (err, newAction, context) => {
      if (context?.previousActions) {
        queryClient.setQueryData(context.queryKey, context.previousActions);
      }
      toast.error(`Failed to add action: ${err.message}`);
    },
    onSettled: (data, error, variables) => {
      if (variables?.goalId) {
        queryClient.invalidateQueries({ queryKey: goalActionsQueryKey(variables.goalId) });
      }
    },
  });
};

/**
 * Provides a mutation for updating an existing goal action.
 * Handles optimistic updates and invalidates the query on success.
 */
export const useUpdateGoalAction = (goalId: number) => {
  const queryClient = useQueryClient();

  return useMutation<GoalActionType, Error, UpdateInput, { 
    previousActions?: GetOutput; 
    previousTodayActions?: ActionForToday[];
    queryKey: (string | number)[];
  }>({
    mutationFn: postGoalActionUpdate,
    onMutate: async (updatedAction) => {
      const queryKey = goalActionsQueryKey(goalId);
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: USE_TODAY_ACTIONS_QUERY_KEY });

      const previousActions = queryClient.getQueryData<GetOutput>(queryKey);
      const previousTodayActions = queryClient.getQueryData<{ actions: ActionForToday[] }>(USE_TODAY_ACTIONS_QUERY_KEY);

      // Update goal-specific cache
      queryClient.setQueryData<GetOutput>(queryKey, (old = []) =>
        old.map((action) =>
          action.id === updatedAction.actionId
            ? { 
                ...action, 
                ...updatedAction,
                dueDate: updatedAction.dueDate !== undefined 
                  ? (updatedAction.dueDate ? new Date(updatedAction.dueDate) : null)
                  : action.dueDate,
                id: action.id, // Keep the original id, not actionId
              }
            : action
        )
      );

      // Update today actions cache
      queryClient.setQueryData<{ actions: ActionForToday[] }>(USE_TODAY_ACTIONS_QUERY_KEY, (old) => {
        if (!old?.actions) return old;
        
        return {
          actions: old.actions.map((action) =>
            action.id === updatedAction.actionId
              ? { 
                  ...action, 
                  ...updatedAction,
                  dueDate: updatedAction.dueDate !== undefined 
                    ? (updatedAction.dueDate ? new Date(updatedAction.dueDate) : null)
                    : action.dueDate,
                  id: action.id, // Keep the original id, not actionId
                }
              : action
          )
        };
      });

      return { 
        previousActions, 
        previousTodayActions: previousTodayActions?.actions,
        queryKey 
      };
    },
    onError: (err, newAction, context) => {
      if (context?.previousActions) {
        queryClient.setQueryData(context.queryKey, context.previousActions);
      }
      if (context?.previousTodayActions) {
        queryClient.setQueryData(USE_TODAY_ACTIONS_QUERY_KEY, { actions: context.previousTodayActions });
      }
      toast.error(`Failed to update action: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: goalActionsQueryKey(goalId) });
      queryClient.invalidateQueries({ queryKey: USE_TODAY_ACTIONS_QUERY_KEY });
    },
  });
};