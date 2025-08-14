import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { GoalActions } from "../../helpers/schema";

export const schema = z.object({
  goalId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;

export type GoalActionType = {
  id: Selectable<GoalActions>["id"];
  title: Selectable<GoalActions>["title"];
  description: Selectable<GoalActions>["description"];
  isCompleted: boolean;
  createdAt: Selectable<GoalActions>["createdAt"];
  dueDate: Selectable<GoalActions>["dueDate"];
  priority: Selectable<GoalActions>["priority"];
};

export type OutputType = GoalActionType[];

export const getGoalActions = async (
  params: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const queryParams = new URLSearchParams({
    goalId: params.goalId.toString(),
  });

  const result = await fetch(`/_api/goal/actions?${queryParams.toString()}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error || "Failed to fetch goal actions");
  }

  return superjson.parse<OutputType>(await result.text());
};