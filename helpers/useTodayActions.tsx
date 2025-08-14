import { useQuery } from '@tanstack/react-query';
import { getActionsToday } from '../endpoints/actions/today_GET.schema';

export const USE_TODAY_ACTIONS_QUERY_KEY = ['actions', 'today'] as const;

export const useTodayActions = () => {
  return useQuery({
    queryKey: USE_TODAY_ACTIONS_QUERY_KEY,
    queryFn: () => getActionsToday(),
  });
};