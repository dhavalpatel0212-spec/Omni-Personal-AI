import { z } from "zod";
import { GoalStatusArrayValues, GoalPriorityArrayValues } from '../helpers/schema';
import type { Selectable } from "kysely";
import type { Goals } from '../helpers/schema';
import superjson from "superjson";

export const GoalSortBy = z.enum(["createdAt", "dueDate", "priority", "title"]);
export type GoalSortBy = z.infer<typeof GoalSortBy>;

export const SortOrder = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrder>;

export const schema = z.object({
  status: z.enum(GoalStatusArrayValues).optional(),
  priority: z.enum(GoalPriorityArrayValues).optional(),
  sortBy: GoalSortBy.optional().default("createdAt"),
  sortOrder: SortOrder.optional().default("desc")
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  goals: Selectable<Goals>[];
};

export const getGoals = async (
params: InputType,
init?: RequestInit)
: Promise<OutputType> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);
  if (params.priority) queryParams.set("priority", params.priority);
  if (params.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

  const result = await fetch(`/_api/goals?${queryParams.toString()}`, {
    method: "GET",
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