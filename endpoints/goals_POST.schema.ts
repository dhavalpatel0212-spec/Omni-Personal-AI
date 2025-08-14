import { z } from "zod";
import { GoalPriorityArrayValues } from '../helpers/schema';
import type { Selectable } from "kysely";
import type { Goals } from '../helpers/schema';
import superjson from "superjson";

export const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional(),
  priority: z.enum(GoalPriorityArrayValues).optional(),
  dueDate: z.date().optional().nullable()
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Goals>;

export const postGoals = async (
body: InputType,
init?: RequestInit)
: Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/goals`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};