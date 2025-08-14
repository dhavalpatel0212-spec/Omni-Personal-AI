import { z } from "zod";
import { ActionPriorityArrayValues } from '../../helpers/schema';
import type { Selectable } from "kysely";
import type { StandaloneActions } from '../../helpers/schema';
import superjson from "superjson";

export const schema = z.object({
  actionId: z.number().int().positive(),
  title: z.string().min(1, "Title cannot be empty").max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  isCompleted: z.boolean().optional(),
  priority: z.enum(ActionPriorityArrayValues).optional().nullable(),
  dueDate: z.date().optional().nullable()
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<StandaloneActions>;

export const postActionUpdate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/action/update`, {
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