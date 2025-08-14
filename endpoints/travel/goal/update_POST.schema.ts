import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { TravelGoals } from '../../../helpers/schema';
import { TravelGoalPriorityArrayValues } from '../../../helpers/schema';
import superjson from 'superjson';

export const schema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  destination: z.string().min(1, 'Destination is required').optional(),
  description: z.string().optional().nullable(),
  budget: z.number().positive('Budget must be a positive number').optional(),
  targetDate: z.date({ coerce: true }).optional(),
  travelers: z.number().int().min(1, 'There must be at least one traveler').optional(),
  priority: z.enum(TravelGoalPriorityArrayValues).optional(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = Selectable<TravelGoals>;

export const postTravelGoalUpdate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/travel/goal/update`, {
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
    throw new Error(errorObject.error || 'Failed to update travel goal');
  }
  return superjson.parse<OutputType>(await result.text());
};