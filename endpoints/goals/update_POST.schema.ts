import { z } from "zod";
import { GoalStatusArrayValues, GoalPriorityArrayValues } from '../../helpers/schema';
import type { Selectable } from "kysely";
import type { Goals } from '../../helpers/schema';
import superjson from "superjson";

export const schema = z.object({
  goalId: z.number(),
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().optional().nullable(),
  status: z.enum(GoalStatusArrayValues).optional(),
  priority: z.enum(GoalPriorityArrayValues).optional(),
  progress: z.number().min(0).max(100).optional(),
  dueDate: z.date().optional().nullable()
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Goals>;

export const postGoalsUpdate = async (
body: InputType,
init?: RequestInit)
: Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/goals/update`, {
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