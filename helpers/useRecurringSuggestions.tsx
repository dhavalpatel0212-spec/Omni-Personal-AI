import { useQuery } from "@tanstack/react-query";
import { getRecurringSuggestionsGET, OutputType } from "../endpoints/shopping/recurring_suggestions_GET.schema";

export const RECURRING_SUGGESTIONS_QUERY_KEY = ["shopping", "recurringSuggestions"] as const;

export const useRecurringSuggestions = () => {
  return useQuery<OutputType, Error>({
    queryKey: RECURRING_SUGGESTIONS_QUERY_KEY,
    queryFn: () => getRecurringSuggestionsGET(),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false, // Suggestions don't need to be ultra-fresh
  });
};