import { z } from "zod";
import { ActionPriorityArrayValues } from '../helpers/schema';
import type { Selectable } from "kysely";
import type { StandaloneActions } from '../helpers/schema';
import superjson from "superjson";

export const ActionSortBy = z.enum(["createdAt", "dueDate", "priority", "title"]);
export type ActionSortBy = z.infer<typeof ActionSortBy>;

export const SortOrder = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrder>;

export const ActionStatus = z.enum(["completed", "pending"]);
export type ActionStatus = z.infer<typeof ActionStatus>;

export const schema = z.object({
  status: ActionStatus.optional(),
  priority: z.enum(ActionPriorityArrayValues).optional(),
  sortBy: ActionSortBy.optional().default("createdAt"),
  sortOrder: SortOrder.optional().default("desc")
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  actions: Selectable<StandaloneActions>[];
};

export const getActions = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);
  if (params.priority) queryParams.set("priority", params.priority);
  if (params.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

  const result = await fetch(`/_api/actions?${queryParams.toString()}`, {
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