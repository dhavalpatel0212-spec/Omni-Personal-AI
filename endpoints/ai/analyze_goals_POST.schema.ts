import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  analysis: string;
};

export const postAiAnalyzeGoals = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/ai/analyze_goals`, {
    method: "POST",
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