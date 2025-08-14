import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGoals,
  InputType as GetGoalsInput,
} from "../endpoints/goals_GET.schema";
import {
  postGoals,
  InputType as CreateGoalInput,
} from "../endpoints/goals_POST.schema";
import {
  postGoalsUpdate,
  InputType as UpdateGoalInput,
} from "../endpoints/goals/update_POST.schema";
import { toast } from "sonner";

export const GOALS_QUERY_KEY = "goals";

// Stable query key builder functions
export const goalsQueryKey = (filters?: GetGoalsInput) => {
  if (!filters) {
    return [GOALS_QUERY_KEY];
  }
  
  // Extract primitive values from filters to create stable query key
  const primitiveFilters = [
    GOALS_QUERY_KEY,
    filters.status,
    filters.priority,
    filters.sortBy,
    filters.sortOrder,
  ].filter(value => value !== undefined);
  
  return primitiveFilters;
};

export const useGoals = (filters?: GetGoalsInput) => {
  // Ensure required fields have default values
  const filtersWithDefaults: GetGoalsInput = {
    sortBy: "createdAt",
    sortOrder: "desc",
    ...filters,
  };

  return useQuery({
    queryKey: goalsQueryKey(filtersWithDefaults),
    queryFn: () => getGoals(filtersWithDefaults),
    placeholderData: (prev) => prev,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newGoal: CreateGoalInput) => postGoals(newGoal),
    onSuccess: () => {
      toast.success("Goal created successfully!");
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
      // Invalidate dashboard data as well, since it includes goal summaries
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast.error(`Failed to create goal: ${error.message}`);
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedGoal: UpdateGoalInput) => postGoalsUpdate(updatedGoal),
    onSuccess: () => {
      toast.success("Goal updated successfully!");
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      toast.error(`Failed to update goal: ${error.message}`);
    },
  });
};