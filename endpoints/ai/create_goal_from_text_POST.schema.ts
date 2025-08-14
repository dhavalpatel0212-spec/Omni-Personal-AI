import { z } from "zod";
import { GoalPriorityArrayValues } from "../../helpers/schema";
import superjson from "superjson";

export const schema = z.object({
  text: z.string().min(3, "Please provide a more detailed goal description."),
});

export type InputType = z.infer<typeof schema>;

export const OutputSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  priority: z.enum(GoalPriorityArrayValues).nullable(),
  dueDate: z.date().nullable(),
});

export type OutputType = z.infer<typeof OutputSchema>;

export const postAiCreateGoalFromText = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/ai/create_goal_from_text`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || "Unknown error occurred");
  }
  return superjson.parse<OutputType>(await result.text());
};