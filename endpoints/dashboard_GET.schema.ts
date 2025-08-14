import { z } from "zod";
import type { Selectable } from "kysely";
import type { Goals, GoalProgress } from '../helpers/schema';
import superjson from "superjson";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type GoalSummary = {
  completed: number;
  inProgress: number;
  notStarted: number;
  paused: number;
  total: number;
};

export type RecentActivity = Selectable<GoalProgress> & {
  goalTitle: string;
};

export type ProductivityStats = {
  overallProgress: number;
  goalsCompleted: number;
  goalsInProgress: number;
};

export type OutputType = {
  goalSummary: GoalSummary;
  recentActivities: RecentActivity[];
  productivityStats: ProductivityStats;
};

export const getDashboard = async (
init?: RequestInit)
: Promise<OutputType> => {
  const result = await fetch(`/_api/dashboard`, {
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