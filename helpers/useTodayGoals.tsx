import { useQuery } from '@tanstack/react-query';
import { getGoalsToday } from '../endpoints/goals/today_GET.schema';

export const USE_TODAY_GOALS_QUERY_KEY = ['goals', 'today'] as const;

export const useTodayGoals = () => {
  return useQuery({
    queryKey: USE_TODAY_GOALS_QUERY_KEY,
    queryFn: () => getGoalsToday(),
  });
};