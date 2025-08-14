import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { TravelGoals, TravelGoalPriority } from '../../helpers/schema';
import { TravelGoalPriorityArrayValues } from '../../helpers/schema';
import superjson from 'superjson';

export const schema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  description: z.string().optional(),
  budget: z.number().positive('Budget must be a positive number'),
  targetDate: z.date({ coerce: true }),
  travelers: z.number().int().min(1, 'There must be at least one traveler'),
  priority: z.enum(TravelGoalPriorityArrayValues),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<TravelGoals>;

export const postTravelGoals = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/travel/goals`, {
    method: 'POST',
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || 'Failed to create travel goal');
  }
  return superjson.parse<OutputType>(await result.text());
};