import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getActions,
  InputType as GetStandaloneActionsInput,
  OutputType as GetStandaloneActionsOutput,
} from "../endpoints/actions_GET.schema";
import {
  postActions,
  InputType as CreateStandaloneActionInput,
  OutputType as CreateStandaloneActionOutput,
} from "../endpoints/actions_POST.schema";
import {
  postActionUpdate,
  InputType as UpdateStandaloneActionInput,
} from "../endpoints/action/update_POST.schema";
import { USE_TODAY_ACTIONS_QUERY_KEY } from "./useTodayActions";
import type { Selectable } from "kysely";
import type { StandaloneActions } from "./schema";

export const STANDALONE_ACTIONS_QUERY_KEY = "standaloneActions";

export const standaloneActionsQueryKey = (filters?: GetStandaloneActionsInput) => {
  if (!filters) {
    return [STANDALONE_ACTIONS_QUERY_KEY];
  }
  // Create a stable query key from filter values
  return [
    STANDALONE_ACTIONS_QUERY_KEY,
    filters.status,
    filters.priority,
    filters.sortBy,
    filters.sortOrder,
  ].filter(v => v !== undefined);
};

/**
 * Hook to fetch standalone actions with filtering and sorting.
 * @param filters - Optional filters for status, priority, sorting.
 */
export const useGetStandaloneActions = (filters?: GetStandaloneActionsInput) => {
  const filtersWithDefaults: GetStandaloneActionsInput = {
    sortBy: "createdAt",
    sortOrder: "desc",
    ...filters,
  };

  return useQuery({
    queryKey: standaloneActionsQueryKey(filtersWithDefaults),
    queryFn: () => getActions(filtersWithDefaults),
    placeholderData: (prev) => prev,
  });
};

/**
 * Hook to create a new standalone action with optimistic updates.
 */
export const useCreateStandaloneAction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateStandaloneActionOutput,
    Error,
    CreateStandaloneActionInput,
    { previousActions?: GetStandaloneActionsOutput }
  >({
    mutationFn: (newAction) => postActions(newAction),
    onMutate: async (newAction) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [STANDALONE_ACTIONS_QUERY_KEY] });

      // Snapshot the previous value
      const previousActions = queryClient.getQueryData<GetStandaloneActionsOutput>([STANDALONE_ACTIONS_QUERY_KEY]);

      // Optimistically update to the new value
      queryClient.setQueryData<GetStandaloneActionsOutput>(
        [STANDALONE_ACTIONS_QUERY_KEY],
        (old) => {
                    const optimisticAction: Selectable<StandaloneActions> = {
            id: -Math.random(), // temporary negative ID
            userId: 0, // placeholder, will be set by backend
            createdAt: new Date(),
            updatedAt: new Date(),
            isCompleted: false,
            title: newAction.title,
            description: newAction.description ?? null,
            dueDate: newAction.dueDate ? new Date(newAction.dueDate) : null,
            priority: newAction.priority ?? null,
          };
          return { actions: [optimisticAction, ...(old?.actions ?? [])] };
        }
      );

      return { previousActions };
    },
    onError: (err, newAction, context) => {
      if (context?.previousActions) {
        queryClient.setQueryData([STANDALONE_ACTIONS_QUERY_KEY], context.previousActions);
      }
      toast.error(`Failed to create action: ${err.message}`);
    },
    onSuccess: () => {
      toast.success("Action created successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [STANDALONE_ACTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: USE_TODAY_ACTIONS_QUERY_KEY });
    },
  });
};

/**
 * Hook to update a standalone action with optimistic updates.
 */
export const useUpdateStandaloneAction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Selectable<StandaloneActions>,
    Error,
    UpdateStandaloneActionInput,
    { previousActions?: GetStandaloneActionsOutput }
  >({
    mutationFn: (updatedAction) => postActionUpdate(updatedAction),
    onMutate: async (updatedAction) => {
      await queryClient.cancelQueries({ queryKey: [STANDALONE_ACTIONS_QUERY_KEY] });

      const previousActions = queryClient.getQueryData<GetStandaloneActionsOutput>([STANDALONE_ACTIONS_QUERY_KEY]);

      queryClient.setQueryData<GetStandaloneActionsOutput>(
        [STANDALONE_ACTIONS_QUERY_KEY],
        (old) => {
          if (!old) return { actions: [] };
          return {
            actions: old.actions.map((action) =>
              action.id === updatedAction.actionId
                ? { ...action, ...updatedAction }
                : action
            ),
          };
        }
      );

      return { previousActions };
    },
    onError: (err, updatedAction, context) => {
      if (context?.previousActions) {
        queryClient.setQueryData([STANDALONE_ACTIONS_QUERY_KEY], context.previousActions);
      }
      toast.error(`Failed to update action: ${err.message}`);
    },
    onSuccess: () => {
      toast.success("Action updated successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [STANDALONE_ACTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: USE_TODAY_ACTIONS_QUERY_KEY });
    },
  });
};