import { z } from "zod";
import superjson from "superjson";
import { GoalActionType } from "../actions_GET.schema";
import { ActionPriorityArrayValues } from "../../../helpers/schema";

export const schema = z.object({
  actionId: z.number().int().positive(),
  title: z.string().min(1, "Title cannot be empty.").optional(),
  description: z.string().nullable().optional(),
  isCompleted: z.boolean().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  priority: z.enum(ActionPriorityArrayValues).nullable().optional(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = GoalActionType;

export const postGoalActionUpdate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/goal/action/update`, {
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
    throw new Error(errorObject.error || "Failed to update goal action");
  }

  return superjson.parse<OutputType>(await result.text());
};