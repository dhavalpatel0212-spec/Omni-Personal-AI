import { z } from "zod";
import superjson from "superjson";
import { GoalActionType } from "./actions_GET.schema";
import { ActionPriorityArrayValues } from "../../helpers/schema";

export const schema = z.object({
  goalId: z.number().int().positive(),
  title: z.string().min(1, "Title is required."),
  description: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(ActionPriorityArrayValues).optional().nullable(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = GoalActionType;

export const postGoalActions = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/goal/actions`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error || "Failed to create goal action");
  }

  return superjson.parse<OutputType>(await result.text());
};