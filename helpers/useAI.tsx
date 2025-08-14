import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAiPerformanceMetrics } from "../endpoints/ai/performance_metrics_GET.schema";
import { postAiAnalyzeGoals } from "../endpoints/ai/analyze_goals_POST.schema";
import { postAiGoalRecommendations } from "../endpoints/ai/goal_recommendations_POST.schema";
import { postAiCreateGoalFromText } from "../endpoints/ai/create_goal_from_text_POST.schema";

export const AI_PERFORMANCE_METRICS_QUERY_KEY = ["ai", "performance_metrics"] as const;
export const AI_ANALYZE_GOALS_QUERY_KEY = ["ai", "analyze_goals"] as const;
export const AI_GOAL_RECOMMENDATIONS_QUERY_KEY = ["ai", "goal_recommendations"] as const;
export const AI_CREATE_GOAL_FROM_TEXT_QUERY_KEY = ["ai", "create_goal_from_text"] as const;

export type AIOperationResult<T = any> = {
  data: T;
  modelInfo?: {
    model: string;
    confidence?: number;
    reason?: string;
  };
  error?: string;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

/**
 * A React Query hook to fetch AI performance metrics.
 * This is used by the AIModelRouterDemo component to display analytics.
 */
export const useAIPerformanceMetrics = () => {
  return useQuery({
    queryKey: AI_PERFORMANCE_METRICS_QUERY_KEY,
    queryFn: () => getAiPerformanceMetrics(),
    // It's analytics data, so we can have it stale for a bit.
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * A React Query hook to analyze all user goals using AI.
 */
export const useAnalyzeGoals = () => {
  return useMutation({
    mutationFn: () => postAiAnalyzeGoals(),
    mutationKey: AI_ANALYZE_GOALS_QUERY_KEY,
  });
};

/**
 * A React Query hook to get AI recommendations for a specific goal.
 */
export const useAIGoalRecommendations = () => {
  return useMutation({
    mutationFn: (params: { goalId: number }) => postAiGoalRecommendations(params),
    mutationKey: AI_GOAL_RECOMMENDATIONS_QUERY_KEY,
  });
};

/**
 * A React Query hook to create a goal from natural language text using AI.
 */
export const useCreateGoalFromText = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { text: string }) => postAiCreateGoalFromText(params),
    mutationKey: AI_CREATE_GOAL_FROM_TEXT_QUERY_KEY,
    onSuccess: () => {
      // Invalidate goals queries when a new goal is created
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};