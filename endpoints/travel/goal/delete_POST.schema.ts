import { z } from 'zod';
import superjson from 'superjson';

export const schema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { success: boolean };

export const postTravelGoalDelete = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/travel/goal/delete`, {
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
    throw new Error(errorObject.error || 'Failed to delete travel goal');
  }
  return superjson.parse<OutputType>(await result.text());
};