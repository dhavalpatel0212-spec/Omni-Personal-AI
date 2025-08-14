import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logMood, getMoodData, getMoodHistory, getMoodInsights } from "../endpoints/mood.schema";

export const MOOD_QUERY_KEY = "mood";

export const useMoodData = () => {
  return useQuery({
    queryKey: [MOOD_QUERY_KEY, "data"],
    queryFn: getMoodData,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on abort errors (request cancellations)
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useMoodHistory = (days: number = 14) => {
  return useQuery({
    queryKey: [MOOD_QUERY_KEY, "history", days],
    queryFn: () => getMoodHistory({ days }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on abort errors (request cancellations)
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useMoodInsights = () => {
  return useQuery({
    queryKey: [MOOD_QUERY_KEY, "insights"],
    queryFn: getMoodInsights,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on abort errors (request cancellations)
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useLogMood = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logMood,
    retry: (failureCount, error) => {
      // Don't retry on abort errors (request cancellations)
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        return false;
      }
      // Retry up to 2 times for mutations (more conservative than queries)
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      // Invalidate all mood-related queries
      queryClient.invalidateQueries({ queryKey: [MOOD_QUERY_KEY] });
      // Also invalidate dashboard data since mood affects overall productivity insights
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};