import { z } from "zod";
import superjson from "superjson";

// Log mood input schema
export const logMoodSchema = z.object({
  moodValue: z.number().min(1).max(5),
  emoji: z.string(),
  notes: z.string().nullable().optional(),
});

export type LogMoodInput = z.infer<typeof logMoodSchema>;

// Mood entry type
export type MoodEntry = {
  id: string;
  moodValue: number;
  emoji: string;
  notes: string | null;
  loggedAt: string;
};

// Get mood data output
export type MoodDataOutput = {
  todaysMood: MoodEntry | null;
  currentStreak: number;
  weeklyAverage: number;
};

// Get mood history input
export const getMoodHistorySchema = z.object({
  days: z.number().min(1).max(365).default(14),
});

export type GetMoodHistoryInput = z.infer<typeof getMoodHistorySchema>;

// Mood insight type
export type MoodInsight = {
  type: 'correlation' | 'trend' | 'pattern';
  category: string;
  message: string;
  suggestion?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
};

// API functions
export const logMood = async (
  body: LogMoodInput,
  init?: RequestInit
): Promise<{ success: boolean; message: string }> => {
  const result = await fetch(`/_api/mood`, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse(await result.text());
};

export const getMoodData = async (
  init?: RequestInit
): Promise<MoodDataOutput> => {
  const result = await fetch(`/_api/mood/data`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse(await result.text());
};

export const getMoodHistory = async (
  body: GetMoodHistoryInput,
  init?: RequestInit
): Promise<MoodEntry[]> => {
  const searchParams = new URLSearchParams({ days: body.days.toString() });
  const result = await fetch(`/_api/mood/history?${searchParams}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse(await result.text());
};

export const getMoodInsights = async (
  init?: RequestInit
): Promise<MoodInsight[]> => {
  const result = await fetch(`/_api/mood/insights`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error: string };
    throw new Error(errorObject.error);
  }
  return superjson.parse(await result.text());
};