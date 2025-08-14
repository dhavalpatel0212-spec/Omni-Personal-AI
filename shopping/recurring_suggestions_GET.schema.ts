import { z } from "zod";
import superjson from 'superjson';

// No input schema needed, user is derived from session
export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type SuggestedItem = {
  name: string;
  category: string | null;
  lastPurchasedAt: Date;
  // The calculated average number of days between purchases
  purchaseIntervalDays: number;
  // A score from 0 to 1 indicating the confidence in this suggestion
  confidenceScore: number;
  // A brief explanation of why this item is being suggested
  reason: string;
};

export type OutputType = {
  suggestions: SuggestedItem[];
};

export const getRecurringSuggestionsGET = async (body: z.infer<typeof schema> = {}, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/shopping/recurring_suggestions`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text()) as unknown;
    const errorMessage = typeof errorObject === 'object' && errorObject !== null && 'error' in errorObject && typeof errorObject.error === 'string' 
      ? errorObject.error 
      : "Failed to fetch recurring suggestions";
    throw new Error(errorMessage);
  }
  return superjson.parse<OutputType>(await result.text());
};