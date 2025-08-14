import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getTravelGoals,
  InputType as GetTravelGoalsInput,
} from "../endpoints/travel/goals_GET.schema";
import {
  postTravelGoals,
  InputType as CreateTravelGoalInput,
} from "../endpoints/travel/goals_POST.schema";
import {
  postTravelGoalUpdate,
  InputType as UpdateTravelGoalInput,
} from "../endpoints/travel/goal/update_POST.schema";
import {
  postTravelGoalDelete,
  InputType as DeleteTravelGoalInput,
} from "../endpoints/travel/goal/delete_POST.schema";
import {
  postTravelSearchFlights,
  InputType as SearchFlightsInput,
  OutputType as SearchFlightsOutput,
} from "../endpoints/travel/search/flights_POST.schema";
import {
  postTravelSearchHotels,
  InputType as SearchHotelsInput,
  OutputType as SearchHotelsOutput,
} from "../endpoints/travel/search/hotels_POST.schema";
import {
  postTravelSearchPackages,
  InputType as SearchPackagesInput,
  OutputType as SearchPackagesOutput,
} from "../endpoints/travel/search/packages_POST.schema";

export const TRAVEL_GOALS_QUERY_KEY = "travelGoals";

/**
 * Query hook for fetching a user's travel goals.
 * @param filters - Sorting options for the travel goals.
 */
export const useGetTravelGoals = (filters: GetTravelGoalsInput) => {
  return useQuery({
    queryKey: [TRAVEL_GOALS_QUERY_KEY, filters],
    queryFn: () => getTravelGoals(filters),
    placeholderData: (prev) => prev,
  });
};

/**
 * Mutation hook for creating a new travel goal.
 */
export const useCreateTravelGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newGoal: CreateTravelGoalInput) => postTravelGoals(newGoal),
    onSuccess: () => {
      toast.success("Travel goal created successfully!");
      queryClient.invalidateQueries({ queryKey: [TRAVEL_GOALS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(`Failed to create travel goal: ${error.message}`);
    },
  });
};

/**
 * Mutation hook for updating an existing travel goal.
 */
export const useUpdateTravelGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedGoal: UpdateTravelGoalInput) =>
      postTravelGoalUpdate(updatedGoal),
    onSuccess: () => {
      toast.success("Travel goal updated successfully!");
      queryClient.invalidateQueries({ queryKey: [TRAVEL_GOALS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(`Failed to update travel goal: ${error.message}`);
    },
  });
};

/**
 * Mutation hook for deleting a travel goal.
 */
export const useDeleteTravelGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: DeleteTravelGoalInput) => postTravelGoalDelete(vars),
    onSuccess: () => {
      toast.success("Travel goal deleted successfully!");
      queryClient.invalidateQueries({ queryKey: [TRAVEL_GOALS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(`Failed to delete travel goal: ${error.message}`);
    },
  });
};

/**
 * Mutation hook for searching flights.
 * This is a mutation because it's a user-initiated action, not for fetching persistent state.
 */
export const useSearchFlights = () => {
  return useMutation<SearchFlightsOutput, Error, SearchFlightsInput>({
    mutationFn: (searchInput: SearchFlightsInput) =>
      postTravelSearchFlights(searchInput),
    onError: (error) => {
      toast.error(`Flight search failed: ${error.message}`);
    },
  });
};

/**
 * Mutation hook for searching hotels.
 */
export const useSearchHotels = () => {
  return useMutation<SearchHotelsOutput, Error, SearchHotelsInput>({
    mutationFn: (searchInput: SearchHotelsInput) =>
      postTravelSearchHotels(searchInput),
    onError: (error) => {
      toast.error(`Hotel search failed: ${error.message}`);
    },
  });
};

/**
 * Mutation hook for searching travel packages.
 */
export const useSearchPackages = () => {
  return useMutation<SearchPackagesOutput, Error, SearchPackagesInput>({
    mutationFn: (searchInput: SearchPackagesInput) =>
      postTravelSearchPackages(searchInput),
    onError: (error) => {
      toast.error(`Package search failed: ${error.message}`);
    },
  });
};