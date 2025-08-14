import { z } from "zod";
import superjson from "superjson";

// No input is needed from the client, the server will get the user's data
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  positiveObservations: string[];
  improvementSuggestions: string[];
};

export const postAiMood_insights = async (
  body?: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`/_api/ai/mood_insights`, {
    method: "POST",
    body: superjson.stringify(body ?? {}),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as { error?: string };
    throw new Error(errorObject.error || "Failed to generate AI mood insights.");
  }
  return superjson.parse<OutputType>(await result.text());
};