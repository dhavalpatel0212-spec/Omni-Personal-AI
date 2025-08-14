import { z } from "zod";
import superjson from 'superjson';
import type { Selectable } from 'kysely';
import type { GoalActions } from '../../helpers/schema';

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type ActionForToday = Selectable<GoalActions> & {
  goalTitle: string;
};

export type OutputType = {
  actions: ActionForToday[];
};

export const getActionsToday = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/actions/today`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || "Failed to fetch today's actions");
  }
  return superjson.parse<OutputType>(await result.text());
};