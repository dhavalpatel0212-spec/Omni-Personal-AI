import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { TravelGoals } from '../../helpers/schema';
import superjson from 'superjson';

export const TravelGoalSortBy = z.enum(['createdAt', 'targetDate', 'priority', 'destination']);
export type TravelGoalSortBy = z.infer<typeof TravelGoalSortBy>;

export const SortOrder = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrder>;

export const schema = z.object({
  sortBy: TravelGoalSortBy.optional().default('createdAt'),
  sortOrder: SortOrder.optional().default('desc'),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = {
  travelGoals: Selectable<TravelGoals>[];
};

export const getTravelGoals = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const queryParams = new URLSearchParams();
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

  const result = await fetch(`/_api/travel/goals?${queryParams.toString()}`, {
    method: 'GET',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || 'Failed to fetch travel goals');
  }
  return superjson.parse<OutputType>(await result.text());
};